// ===== APLICACIÓN DE RIFAS - JAVASCRIPT =====
// Desarrollado con las mejores prácticas y arquitectura modular

const CONFIG = Object.freeze({
    MAX_WINNERS: 50,
    MAX_NUMBER_RANGE: 100_000,
    MAX_HISTORY_ITEMS: 10,
    NOTIFICATION_TIMEOUT_MS: 3000,
    WINNER_PAUSE_MS: 1500,
    WINNER_PAUSE_INSTANT_MS: 300,
});

class RaffleApp {
    constructor() {
        this.mode = 'names';
        this.participants = [];
        this.winners = [];
        this.history = [];
        this.stats = {
            totalParticipants: 0,
            totalWinners: 0,
            totalRaffles: 0
        };
        this.soundEnabled = true;
        this.theme = 'light';
        this.colorTheme = 'purple';
        this.animationSpeed = 'normal';
        this.excludePreviousWinners = false;
        this.previousWinnersToExclude = [];
        this.audioContext = null;
        this._previouslyFocused = null;
        
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateStats();
        this.applyTheme();
        this.applyColorTheme();
        this.renderHistory();
        this.registerServiceWorker();
    }
    
    // ===== SERVICE WORKER =====
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then((registration) => {
                        console.log('SW registrado:', registration.scope);
                        
                        // Verificar actualizaciones
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showUpdateBanner(registration);
                                }
                            });
                        });
                    })
                    .catch((error) => {
                        console.log('SW error:', error);
                    });
            });
        }
    }

    showUpdateBanner(registration) {
        const banner = document.createElement('div');
        banner.className = 'pwa-install-banner';
        banner.setAttribute('role', 'alert');
        banner.innerHTML = `
            <span><i class="fas fa-sync-alt" aria-hidden="true"></i> Nueva versión disponible.</span>
            <button type="button" id="updateNowBtn">Actualizar</button>
        `;
        document.body.appendChild(banner);
        banner.querySelector('#updateNowBtn').addEventListener('click', () => {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        });
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Mode selector
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.switchMode(e.target.value));
        });

        // Buttons
        document.getElementById('startRaffle').addEventListener('click', () => this.startRaffle());
        document.getElementById('loadSampleNames').addEventListener('click', () => this.loadSampleNames());
        document.getElementById('clearNames').addEventListener('click', () => this.clearNames());
        document.getElementById('clearHistory').addEventListener('click', () => this.clearHistory());
        document.getElementById('clearResults').addEventListener('click', () => this.clearResults());
        document.getElementById('resetStats').addEventListener('click', () => this.resetStats());
        document.getElementById('exportResults').addEventListener('click', () => this.exportResults());
        document.getElementById('shareResults').addEventListener('click', () => this.shareResults());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Sound toggle
        document.getElementById('soundEnabled').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Close modal when clicking outside
        document.getElementById('winnerModal').addEventListener('click', (e) => {
            if (e.target.id === 'winnerModal') {
                this.closeModal();
            }
        });

        // Real-time participant counting (debounced for performance)
        const debouncedCount = this.debounce(() => this.updateParticipantCount(), 150);
        document.getElementById('nameInput').addEventListener('input', debouncedCount);
        document.getElementById('startNumber').addEventListener('input', debouncedCount);
        document.getElementById('endNumber').addEventListener('input', debouncedCount);
        
        // Update range counter initially
        this.updateRangeCounter();
        
        // Import/Export CSV
        const importBtn = document.getElementById('importCSV');
        const exportListBtn = document.getElementById('exportListCSV');
        const fileInput = document.getElementById('csvFileInput');
        
        if (importBtn) {
            importBtn.addEventListener('click', () => fileInput?.click());
        }
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.importFromCSV(e));
        }
        if (exportListBtn) {
            exportListBtn.addEventListener('click', () => this.exportListToCSV());
        }
        
        // Animation speed
        const speedSelector = document.getElementById('animationSpeed');
        if (speedSelector) {
            speedSelector.value = this.animationSpeed;
            speedSelector.addEventListener('change', (e) => {
                this.animationSpeed = e.target.value;
                this.saveToLocalStorage();
            });
        }
        
        // Color theme
        const colorThemeSelector = document.getElementById('colorTheme');
        if (colorThemeSelector) {
            colorThemeSelector.value = this.colorTheme;
            colorThemeSelector.addEventListener('change', (e) => {
                this.colorTheme = e.target.value;
                this.applyColorTheme();
                this.saveToLocalStorage();
            });
        }
        
        // Exclude previous winners
        const excludeCheckbox = document.getElementById('excludePreviousWinners');
        if (excludeCheckbox) {
            excludeCheckbox.addEventListener('change', (e) => {
                this.excludePreviousWinners = e.target.checked;
            });
        }
        
        // Clear previous winners button
        const clearExcludedBtn = document.getElementById('clearExcludedWinners');
        if (clearExcludedBtn) {
            clearExcludedBtn.addEventListener('click', () => this.clearPreviousWinners());
        }
        
        // Update exclude counter on init
        this.updateExcludeCounter();
    }
    
    updateRangeCounter() {
        const start = parseInt(document.getElementById('startNumber').value) || 0;
        const end = parseInt(document.getElementById('endNumber').value) || 0;
        const rangeCounter = document.getElementById('currentRangeCount');
        if (rangeCounter) {
            const count = Math.max(0, end - start + 1);
            rangeCounter.textContent = count.toLocaleString();
        }
    }
    
    // ===== COLOR THEMES =====
    applyColorTheme() {
        const themes = {
            purple: {
                primary: '#6366f1',
                primaryDark: '#4f46e5',
                secondary: '#8b5cf6',
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            blue: {
                primary: '#3b82f6',
                primaryDark: '#2563eb',
                secondary: '#60a5fa',
                gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            },
            green: {
                primary: '#10b981',
                primaryDark: '#059669',
                secondary: '#34d399',
                gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)'
            },
            red: {
                primary: '#ef4444',
                primaryDark: '#dc2626',
                secondary: '#f87171',
                gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
            },
            orange: {
                primary: '#f59e0b',
                primaryDark: '#d97706',
                secondary: '#fbbf24',
                gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)'
            },
            pink: {
                primary: '#ec4899',
                primaryDark: '#db2777',
                secondary: '#f472b6',
                gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
            },
            teal: {
                primary: '#14b8a6',
                primaryDark: '#0d9488',
                secondary: '#2dd4bf',
                gradient: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)'
            }
        };
        
        const theme = themes[this.colorTheme] || themes.purple;
        const root = document.documentElement;
        
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--primary-dark', theme.primaryDark);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--gradient-primary', theme.gradient);
        
        // Update meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.content = theme.primary;
        }
    }
    
    // ===== IMPORT/EXPORT CSV =====
    importFromCSV(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                const lines = content.split(/\r?\n/);
                const participants = [];
                
                lines.forEach(line => {
                    // Split by comma, semicolon, or tab
                    const cells = line.split(/[,;\t]/);
                    cells.forEach(cell => {
                        const trimmed = cell.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                        if (trimmed.length > 0) {
                            participants.push(trimmed);
                        }
                    });
                });
                
                if (participants.length > 0) {
                    const nameInput = document.getElementById('nameInput');
                    const currentValue = nameInput.value.trim();
                    
                    if (currentValue.length > 0) {
                        const append = await this.showConfirm(
                            `Ya hay participantes en la lista.\n\n¿Deseas agregar los ${participants.length} nuevos participantes a la lista existente?`,
                            'Agregar', 'Reemplazar'
                        );
                        if (append) {
                            nameInput.value = currentValue + '\n' + participants.join('\n');
                        } else {
                            nameInput.value = participants.join('\n');
                        }
                    } else {
                        nameInput.value = participants.join('\n');
                    }
                    
                    this.updateParticipantCount();
                    this.showNotification(`${participants.length} participantes importados correctamente`, 'success');
                } else {
                    this.showNotification('No se encontraron participantes en el archivo', 'error');
                }
            } catch (error) {
                this.showNotification('Error al leer el archivo CSV', 'error');
                console.error('Error importing CSV:', error);
            }
        };
        
        reader.onerror = () => {
            this.showNotification('Error al leer el archivo', 'error');
        };
        
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
    
    exportListToCSV() {
        const participants = this.getParticipants();
        
        if (participants.length === 0) {
            this.showNotification('No hay participantes para exportar', 'error');
            return;
        }
        
        // Create CSV content with header
        const csvContent = 'Participante\n' + participants.map(p => `"${p}"`).join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' }); // BOM for Excel
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `participantes_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification(`${participants.length} participantes exportados a CSV`, 'success');
    }
    
    // ===== ANIMATION SPEED =====
    getAnimationDuration() {
        const speeds = {
            fast: 1000,
            normal: 2000,
            slow: 3500,
            instant: 100
        };
        return speeds[this.animationSpeed] || speeds.normal;
    }

    // ===== MODE SWITCHING =====
    switchMode(mode) {
        this.mode = mode;
        
        const namesSection = document.getElementById('namesSection');
        const numbersSection = document.getElementById('numbersSection');
        
        if (mode === 'names') {
            namesSection.classList.remove('hidden');
            numbersSection.classList.add('hidden');
        } else {
            namesSection.classList.add('hidden');
            numbersSection.classList.remove('hidden');
            this.updateRangeCounter();
        }
        
        this.updateParticipantCount();
    }

    // ===== PARTICIPANT MANAGEMENT =====
    
    // Sanitize HTML to prevent XSS attacks
    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    getParticipants() {
        if (this.mode === 'names') {
            const input = document.getElementById('nameInput').value.trim();
            if (!input) return [];
            
            // Split by lines or commas, clean up and sanitize
            const participants = input
                .split(/[\n,]+/)
                .map(name => this.sanitizeHTML(name.trim()))
                .filter(name => name.length > 0);
            
            return participants;
        } else {
            const start = parseInt(document.getElementById('startNumber').value);
            const end = parseInt(document.getElementById('endNumber').value);
            
            if (isNaN(start) || isNaN(end) || start > end) return [];
            
            // Limit range to prevent browser freeze
            if ((end - start + 1) > CONFIG.MAX_NUMBER_RANGE) {
                this.showNotification(`El rango máximo permitido es ${CONFIG.MAX_NUMBER_RANGE.toLocaleString()} números`, 'error');
                return [];
            }
            
            const numbers = [];
            for (let i = start; i <= end; i++) {
                numbers.push(i.toString());
            }
            return numbers;
        }
    }

    updateParticipantCount() {
        const count = this.getParticipantCount();
        
        // Update stats panel
        document.getElementById('totalParticipants').textContent = count;
        
        // Update inline counter based on mode
        if (this.mode === 'names') {
            const nameCounter = document.getElementById('currentParticipantCount');
            if (nameCounter) {
                nameCounter.textContent = count;
            }
        } else {
            const rangeCounter = document.getElementById('currentRangeCount');
            if (rangeCounter) {
                rangeCounter.textContent = count.toLocaleString();
            }
        }
        
        // Update max winners validation hint
        const winnerInput = document.getElementById('winnerCount');
        if (winnerInput && !document.getElementById('allowRepeat').checked) {
            winnerInput.max = Math.min(count, CONFIG.MAX_WINNERS);
        }
    }

    loadSampleNames() {
        const sampleNames = [
            'Juan Pérez',
            'María García',
            'Pedro López',
            'Ana Martínez',
            'Carlos Rodríguez',
            'Laura Fernández',
            'José González',
            'Carmen Sánchez',
            'Miguel Ruiz',
            'Isabel Díaz',
            'Francisco Moreno',
            'Rosa Jiménez',
            'Antonio Álvarez',
            'Dolores Romero',
            'Manuel Torres'
        ];
        
        document.getElementById('nameInput').value = sampleNames.join('\n');
        this.updateParticipantCount();
        this.showNotification('Ejemplo cargado correctamente', 'success');
    }

    clearNames() {
        document.getElementById('nameInput').value = '';
        this.updateParticipantCount();
        this.showNotification('Lista limpiada', 'info');
    }
    
    // Check for duplicate participants and return info
    checkDuplicates(participants) {
        const seen = new Map();
        const duplicates = [];
        
        participants.forEach((name, index) => {
            const normalizedName = name.toLowerCase().trim();
            if (seen.has(normalizedName)) {
                if (!duplicates.includes(name)) {
                    duplicates.push(name);
                }
            } else {
                seen.set(normalizedName, index);
            }
        });
        
        return duplicates;
    }

    // ===== RAFFLE LOGIC =====
    async startRaffle() {
        const participants = this.getParticipants();
        const winnerCount = parseInt(document.getElementById('winnerCount').value);
        const allowRepeat = document.getElementById('allowRepeat').checked;

        // Validations
        if (participants.length === 0) {
            if (this.mode === 'names') {
                this.showNotification('Por favor, ingresa participantes', 'error');
            } else {
                this.showNotification('Por favor, define un rango de números válido (desde debe ser menor o igual a hasta)', 'error');
            }
            return;
        }

        if (winnerCount < 1 || isNaN(winnerCount)) {
            this.showNotification('Debe haber al menos 1 ganador', 'error');
            return;
        }

        // Limit winners to prevent performance issues
        if (winnerCount > CONFIG.MAX_WINNERS) {
            this.showNotification(`El máximo de ganadores permitido es ${CONFIG.MAX_WINNERS}`, 'error');
            return;
        }

        if (!allowRepeat && winnerCount > participants.length) {
            this.showNotification(`No hay suficientes participantes (${participants.length}) para ${winnerCount} ganadores únicos`, 'error');
            return;
        }
        
        // Warn about duplicates in names mode (only if not allowing repeats)
        if (this.mode === 'names' && !allowRepeat) {
            const duplicates = this.checkDuplicates(participants);
            if (duplicates.length > 0) {
                const proceed = await this.showConfirm(
                    `Se detectaron nombres duplicados: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}\n\n¿Deseas continuar de todas formas? Los duplicados tendrán más probabilidad de ganar.`
                );
                if (!proceed) return;
            }
        }

        // Clear previous winners
        this.winners = [];
        document.getElementById('winnersList').innerHTML = '';

        // Disable button during raffle
        const raffleButton = document.getElementById('startRaffle');
        raffleButton.disabled = true;

        // Announce start to screen readers
        const statusEl = document.getElementById('raffleStatus');
        if (statusEl) statusEl.textContent = 'Sorteo en progreso…';

        // Animate raffle
        await this.animateRaffle(participants, winnerCount, allowRepeat);

        // Re-enable button
        raffleButton.disabled = false;

        // Announce result to screen readers
        if (statusEl) {
            statusEl.textContent = `Sorteo finalizado. Ganadores: ${this.winners.join(', ')}.`;
        }

        // Save to history
        this.saveToHistory();

        // Update stats
        this.stats.totalRaffles++;
        this.updateStats();
        this.saveToLocalStorage();

        // Enable export/share buttons
        document.getElementById('exportResults').disabled = false;
        document.getElementById('shareResults').disabled = false;
    }

    async animateRaffle(participants, winnerCount, allowRepeat) {
        const drumContent = document.getElementById('drumContent');
        let availableParticipants = [...participants];
        
        // Exclude previous winners if option is enabled
        if (this.excludePreviousWinners && this.previousWinnersToExclude.length > 0) {
            const excludeSet = new Set(this.previousWinnersToExclude.map(w => w.toLowerCase()));
            const originalCount = availableParticipants.length;
            availableParticipants = availableParticipants.filter(p => !excludeSet.has(p.toLowerCase()));
            
            const excluded = originalCount - availableParticipants.length;
            if (excluded > 0) {
                this.showNotification(`${excluded} ganadores anteriores excluidos del sorteo`, 'info');
            }
            
            if (availableParticipants.length === 0) {
                this.showNotification('No quedan participantes después de excluir ganadores anteriores', 'error');
                return;
            }
            
            if (!allowRepeat && winnerCount > availableParticipants.length) {
                this.showNotification(`No hay suficientes participantes (${availableParticipants.length}) después de excluir ganadores`, 'error');
                return;
            }
        }

        for (let i = 0; i < winnerCount; i++) {
            // Spinning animation
            drumContent.innerHTML = '<i class="fas fa-spinner" aria-hidden="true"></i><p>Sorteando...</p>';
            drumContent.classList.add('spinning');
            
            if (this.soundEnabled) {
                this.playSound('spin');
            }

            // Random animation with configurable speed
            const animationDuration = this.getAnimationDuration();
            const intervalSpeed = 50;
            const iterations = Math.max(2, animationDuration / intervalSpeed);
            
            for (let j = 0; j < iterations; j++) {
                const randomIndex = Math.floor(Math.random() * availableParticipants.length);
                drumContent.innerHTML = `<p class="drum-winner">${availableParticipants[randomIndex]}</p>`;
                await this.sleep(intervalSpeed);
            }

            // Select winner using cryptographically secure RNG
            const winnerIndex = this.getSecureRandom(availableParticipants.length);
            const winner = availableParticipants[winnerIndex];

            // Remove from available if not allowing repeats
            if (!allowRepeat) {
                availableParticipants.splice(winnerIndex, 1);
            }

            // Stop spinning
            drumContent.classList.remove('spinning');
            
            // Show winner
            drumContent.innerHTML = `<p class="drum-winner">🎉 ${winner} 🎉</p>`;
            
            if (this.soundEnabled) {
                this.playSound('win');
            }

            // Add to winners list
            this.winners.push(winner);
            this.previousWinnersToExclude.push(winner); // Track for future exclusion
            this.addWinnerToList(winner, i + 1);

            // Show modal for first winner
            if (i === 0) {
                this.showWinnerModal(winner);
            }

            // Wait before next winner (scaled with animation speed)
            if (i < winnerCount - 1) {
                const waitTime = this.animationSpeed === 'instant' ? CONFIG.WINNER_PAUSE_INSTANT_MS : CONFIG.WINNER_PAUSE_MS;
                await this.sleep(waitTime);
            }
        }

        this.stats.totalWinners += this.winners.length;
        
        // Show clear results button
        document.getElementById('clearResults').style.display = 'inline-flex';
    }

    addWinnerToList(winner, position) {
        const winnersList = document.getElementById('winnersList');
        
        const winnerItem = document.createElement('div');
        winnerItem.className = 'winner-item';
        winnerItem.innerHTML = `
            <div class="winner-info">
                <div class="winner-number">${position}</div>
                <div class="winner-name">${winner}</div>
            </div>
            <div class="winner-icon">
                <i class="fas fa-trophy"></i>
            </div>
        `;
        
        winnersList.appendChild(winnerItem);
    }

    showWinnerModal(winner) {
        const modal = document.getElementById('winnerModal');
        const winnerDisplay = document.getElementById('winnerDisplay');
        
        winnerDisplay.textContent = winner;
        modal.classList.add('show');
        
        // Save focused element and trap focus inside modal
        this._previouslyFocused = document.activeElement;
        const closeBtn = document.getElementById('closeModal');
        closeBtn.focus();
        
        modal.addEventListener('keydown', this._trapFocus);
        
        this.createConfetti();
    }

    _trapFocus = (e) => {
        if (e.key !== 'Tab') return;
        const modal = document.getElementById('winnerModal');
        const focusable = Array.from(modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.disabled);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    };

    closeModal() {
        const modal = document.getElementById('winnerModal');
        modal.classList.remove('show');
        modal.removeEventListener('keydown', this._trapFocus);
        // Return focus to the element that triggered the modal
        if (this._previouslyFocused) {
            this._previouslyFocused.focus();
            this._previouslyFocused = null;
        }
    }

    async clearResults() {
        const confirmed = await this.showConfirm('¿Estás seguro de que deseas limpiar los resultados actuales?');
        if (confirmed) {
            // Clear winners array
            this.winners = [];
            
            // Clear winners list display
            const winnersList = document.getElementById('winnersList');
            winnersList.innerHTML = '';
            
            // Reset drum content
            const drumContent = document.getElementById('drumContent');
            drumContent.innerHTML = '<i class="fas fa-ticket-alt"></i><p>Presiona "Iniciar Sorteo" para comenzar</p>';
            
            // Hide clear results button
            document.getElementById('clearResults').style.display = 'none';
            
            // Disable export/share buttons
            document.getElementById('exportResults').disabled = true;
            document.getElementById('shareResults').disabled = true;
            
            this.showNotification('Resultados limpiados', 'info');
        }
    }

    // ===== CONFETTI EFFECT =====
    createConfetti() {
        const confettiContainer = document.querySelector('.confetti');
        confettiContainer.innerHTML = '';
        
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#54a0ff'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = Math.random() * 100 + '%';
            confetti.style.opacity = Math.random();
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animation = `confettiFall ${2 + Math.random() * 3}s ease-out forwards`;
            
            confettiContainer.appendChild(confetti);
        }
    }

    // ===== HISTORY MANAGEMENT =====
    saveToHistory() {
        const historyItem = {
            id: Date.now(),
            date: new Date().toLocaleString('es-ES'),
            mode: this.mode,
            participants: this.getParticipants().length,
            winners: [...this.winners]
        };
        
        this.history.unshift(historyItem);
        
        // Keep only last N items
        if (this.history.length > CONFIG.MAX_HISTORY_ITEMS) {
            this.history = this.history.slice(0, CONFIG.MAX_HISTORY_ITEMS);
        }
        
        this.renderHistory();
        this.saveToLocalStorage();
    }

    renderHistory() {
        const historyList = document.getElementById('historyList');
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p class="empty-state">No hay sorteos realizados aún</p>';
            return;
        }
        
        historyList.innerHTML = '';
        
        this.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span><i class="fas fa-calendar"></i> ${item.date}</span>
                    <span class="history-item-time">${item.mode === 'names' ? 'Nombres' : 'Números'}</span>
                </div>
                <div class="history-item-winners">
                    <strong>Ganadores (${item.winners.length}):</strong> ${item.winners.join(', ')}
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    async clearHistory() {
        const confirmed = await this.showConfirm('¿Estás seguro de que deseas limpiar el historial?');
        if (confirmed) {
            this.history = [];
            this.renderHistory();
            this.saveToLocalStorage();
            this.showNotification('Historial limpiado', 'info');
        }
    }

    // ===== EXPORT & SHARE =====
    exportResults() {
        if (this.winners.length === 0) {
            this.showNotification('No hay resultados para exportar', 'error');
            return;
        }

        const data = {
            fecha: new Date().toLocaleString('es-ES'),
            modo: this.mode === 'names' ? 'Nombres' : 'Números',
            participantes: this.getParticipants().length,
            ganadores: this.winners
        };

        const text = `
╔════════════════════════════════════════╗
║     RESULTADOS DEL SORTEO              ║
╚════════════════════════════════════════╝

📅 Fecha: ${data.fecha}
📋 Modo: ${data.modo}
👥 Participantes: ${data.participantes}

🏆 GANADORES:
${data.ganadores.map((winner, i) => `${i + 1}. ${winner}`).join('\n')}

─────────────────────────────────────────
Generado por Generador de Rifas Profesional
        `;

        // Create and download file
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sorteo_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showNotification('Resultados exportados correctamente', 'success');
    }

    async shareResults() {
        if (this.winners.length === 0) {
            this.showNotification('No hay resultados para compartir', 'error');
            return;
        }

        const text = `🎉 Resultados del Sorteo:\n\n🏆 Ganadores:\n${this.winners.map((winner, i) => `${i + 1}. ${winner}`).join('\n')}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Resultados del Sorteo',
                    text: text
                });
                this.showNotification('Compartido exitosamente', 'success');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    this.copyToClipboard(text);
                }
            }
        } else {
            this.copyToClipboard(text);
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text)
                .then(() => this.showNotification('Resultados copiados al portapapeles', 'success'))
                .catch(() => this.showNotification('No se pudo copiar al portapapeles', 'error'));
        } else {
            this.showNotification('Tu navegador no soporta el portapapeles automático', 'error');
        }
    }

    // ===== THEME =====
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveToLocalStorage();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const icon = document.querySelector('#themeToggle i');
        
        if (this.theme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }

    // ===== STATS =====
    updateStats() {
        document.getElementById('totalParticipants').textContent = this.getParticipantCount();
        document.getElementById('totalWinners').textContent = this.stats.totalWinners;
        document.getElementById('totalRaffles').textContent = this.stats.totalRaffles;
    }

    async resetStats() {
        const confirmed = await this.showConfirm('¿Estás seguro de que deseas resetear todas las estadísticas? Esta acción no se puede deshacer.');
        if (confirmed) {
            // Reset stats
            this.stats = {
                totalParticipants: 0,
                totalWinners: 0,
                totalRaffles: 0
            };
            
            // Clear history
            this.history = [];
            
            // Clear current results
            this.winners = [];
            
            // Update display
            this.updateStats();
            this.renderHistory();
            
            // Clear winners list
            const winnersList = document.getElementById('winnersList');
            winnersList.innerHTML = '';
            
            // Reset drum content
            const drumContent = document.getElementById('drumContent');
            drumContent.innerHTML = '<i class="fas fa-ticket-alt"></i><p>Presiona "Iniciar Sorteo" para comenzar</p>';
            
            // Hide clear results button
            document.getElementById('clearResults').style.display = 'none';
            
            // Disable export/share buttons
            document.getElementById('exportResults').disabled = true;
            document.getElementById('shareResults').disabled = true;
            
            // Save changes
            this.saveToLocalStorage();
            
            this.showNotification('Estadísticas reseteadas correctamente', 'success');
        }
    }

    // ===== NOTIFICATIONS =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle', warning: 'exclamation-triangle' };
        notification.innerHTML = `<i class="fas fa-${icons[type] || icons.info}" aria-hidden="true"></i><span>${message}</span>`;
        notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
        notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, CONFIG.NOTIFICATION_TIMEOUT_MS);
    }

    // ===== SOUND EFFECTS =====
    playSound(type) {
        // Reuse a single AudioContext to avoid browser limits
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        const audioContext = this.audioContext;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        if (type === 'spin') {
            oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'win') {
            // Victory sound
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.1, audioContext.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.2);
                osc.start(audioContext.currentTime + i * 0.1);
                osc.stop(audioContext.currentTime + i * 0.1 + 0.2);
            });
        }
    }

    // ===== LOCAL STORAGE =====
    saveToLocalStorage() {
        const data = {
            theme: this.theme,
            colorTheme: this.colorTheme,
            animationSpeed: this.animationSpeed,
            history: this.history,
            stats: this.stats,
            previousWinnersToExclude: this.previousWinnersToExclude
        };
        try {
            localStorage.setItem('raffleApp', JSON.stringify(data));
        } catch (e) {
            console.warn('Error guardando en localStorage:', e);
        }
    }

    loadFromLocalStorage() {
        try {
            const data = localStorage.getItem('raffleApp');
            if (data) {
                const parsed = JSON.parse(data);
                this.theme = parsed.theme || 'light';
                this.colorTheme = parsed.colorTheme || 'purple';
                this.animationSpeed = parsed.animationSpeed || 'normal';
                this.history = Array.isArray(parsed.history) ? parsed.history : [];
                this.stats = parsed.stats || { totalParticipants: 0, totalWinners: 0, totalRaffles: 0 };
                this.previousWinnersToExclude = Array.isArray(parsed.previousWinnersToExclude) ? parsed.previousWinnersToExclude : [];
            }
        } catch (e) {
            console.warn('Datos de localStorage corruptos, reseteando.', e);
            localStorage.removeItem('raffleApp');
        }
    }
    
    // Clear previous winners for exclusion
    async clearPreviousWinners() {
        const confirmed = await this.showConfirm('¿Estás seguro de que deseas limpiar la lista de ganadores anteriores? Esto permitirá que vuelvan a participar en sorteos futuros.');
        if (confirmed) {
            this.previousWinnersToExclude = [];
            this.saveToLocalStorage();
            this.showNotification('Lista de ganadores anteriores limpiada', 'success');
            this.updateExcludeCounter();
        }
    }
    
    updateExcludeCounter() {
        const counter = document.getElementById('excludedWinnersCount');
        if (counter) {
            counter.textContent = this.previousWinnersToExclude.length;
        }
    }

    // ===== ACCESSIBLE CONFIRM DIALOG =====
    showConfirm(message, okLabel = 'Aceptar', cancelLabel = 'Cancelar') {
        return new Promise(resolve => {
            const modal = document.getElementById('confirmModal');
            const msgEl = document.getElementById('confirmMessage');
            const okBtn = document.getElementById('confirmOk');
            const cancelBtn = document.getElementById('confirmCancel');

            msgEl.textContent = message;
            okBtn.textContent = okLabel;
            cancelBtn.textContent = cancelLabel;

            modal.classList.add('show');
            okBtn.focus();

            const cleanup = (result) => {
                modal.classList.remove('show');
                okBtn.removeEventListener('click', onOk);
                cancelBtn.removeEventListener('click', onCancel);
                document.removeEventListener('keydown', onKey);
                resolve(result);
            };

            const onOk = () => cleanup(true);
            const onCancel = () => cleanup(false);
            const onKey = (e) => {
                if (e.key === 'Escape') cleanup(false);
            };

            okBtn.addEventListener('click', onOk);
            cancelBtn.addEventListener('click', onCancel);
            document.addEventListener('keydown', onKey);
        });
    }

    // ===== UTILITIES =====
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** Cryptographically secure random integer in [0, max) */
    getSecureRandom(max) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        // Reject values that would introduce modulo bias
        const limit = (2 ** 32) - ((2 ** 32) % max);
        let value = array[0];
        while (value >= limit) {
            crypto.getRandomValues(array);
            value = array[0];
        }
        return value % max;
    }

    /** Returns participant count without materializing a large array */
    getParticipantCount() {
        if (this.mode === 'names') {
            const input = document.getElementById('nameInput').value.trim();
            if (!input) return 0;
            return input.split(/[\n,]+/).filter(name => name.trim().length > 0).length;
        } else {
            const start = parseInt(document.getElementById('startNumber').value);
            const end = parseInt(document.getElementById('endNumber').value);
            if (isNaN(start) || isNaN(end) || start > end) return 0;
            const count = end - start + 1;
            return count > CONFIG.MAX_NUMBER_RANGE ? 0 : count;
        }
    }

    debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.raffleApp = new RaffleApp();
});
