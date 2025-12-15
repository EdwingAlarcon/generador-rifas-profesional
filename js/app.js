// ===== APLICACIÓN DE RIFAS - JAVASCRIPT =====
// Desarrollado con las mejores prácticas y arquitectura modular

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
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.updateStats();
        this.applyTheme();
        this.renderHistory();
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

        // Real-time participant counting
        document.getElementById('nameInput').addEventListener('input', () => this.updateParticipantCount());
        document.getElementById('startNumber').addEventListener('input', () => this.updateParticipantCount());
        document.getElementById('endNumber').addEventListener('input', () => this.updateParticipantCount());
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
        }
        
        this.updateParticipantCount();
    }

    // ===== PARTICIPANT MANAGEMENT =====
    getParticipants() {
        if (this.mode === 'names') {
            const input = document.getElementById('nameInput').value.trim();
            if (!input) return [];
            
            // Split by lines or commas, clean up
            const participants = input
                .split(/[\n,]+/)
                .map(name => name.trim())
                .filter(name => name.length > 0);
            
            return participants;
        } else {
            const start = parseInt(document.getElementById('startNumber').value);
            const end = parseInt(document.getElementById('endNumber').value);
            
            if (isNaN(start) || isNaN(end) || start > end) return [];
            
            const numbers = [];
            for (let i = start; i <= end; i++) {
                numbers.push(i.toString());
            }
            return numbers;
        }
    }

    updateParticipantCount() {
        const participants = this.getParticipants();
        document.getElementById('totalParticipants').textContent = participants.length;
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

    // ===== RAFFLE LOGIC =====
    async startRaffle() {
        const participants = this.getParticipants();
        const winnerCount = parseInt(document.getElementById('winnerCount').value);
        const allowRepeat = document.getElementById('allowRepeat').checked;

        // Validations
        if (participants.length === 0) {
            this.showNotification('Por favor, ingresa participantes', 'error');
            return;
        }

        if (winnerCount < 1) {
            this.showNotification('Debe haber al menos 1 ganador', 'error');
            return;
        }

        if (!allowRepeat && winnerCount > participants.length) {
            this.showNotification('No hay suficientes participantes únicos', 'error');
            return;
        }

        // Clear previous winners
        this.winners = [];
        document.getElementById('winnersList').innerHTML = '';

        // Disable button during raffle
        const raffleButton = document.getElementById('startRaffle');
        raffleButton.disabled = true;

        // Animate raffle
        await this.animateRaffle(participants, winnerCount, allowRepeat);

        // Re-enable button
        raffleButton.disabled = false;

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

        for (let i = 0; i < winnerCount; i++) {
            // Spinning animation
            drumContent.innerHTML = '<i class="fas fa-spinner"></i><p>Sorteando...</p>';
            drumContent.classList.add('spinning');
            
            if (this.soundEnabled) {
                this.playSound('spin');
            }

            // Random animation
            const animationDuration = 2000;
            const intervalSpeed = 50;
            const iterations = animationDuration / intervalSpeed;
            
            for (let j = 0; j < iterations; j++) {
                const randomIndex = Math.floor(Math.random() * availableParticipants.length);
                drumContent.innerHTML = `<p class="drum-winner">${availableParticipants[randomIndex]}</p>`;
                await this.sleep(intervalSpeed);
            }

            // Select winner
            const winnerIndex = Math.floor(Math.random() * availableParticipants.length);
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
            this.addWinnerToList(winner, i + 1);

            // Show modal for first winner
            if (i === 0) {
                this.showWinnerModal(winner);
            }

            // Wait before next winner
            if (i < winnerCount - 1) {
                await this.sleep(1500);
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
        
        this.createConfetti();
    }

    closeModal() {
        document.getElementById('winnerModal').classList.remove('show');
    }

    clearResults() {
        if (confirm('¿Estás seguro de que deseas limpiar los resultados actuales?')) {
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
        
        // Keep only last 10 items
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
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

    clearHistory() {
        if (confirm('¿Estás seguro de que deseas limpiar el historial?')) {
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
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Resultados copiados al portapapeles', 'success');
            });
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showNotification('Resultados copiados al portapapeles', 'success');
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
        document.getElementById('totalParticipants').textContent = this.getParticipants().length;
        document.getElementById('totalWinners').textContent = this.stats.totalWinners;
        document.getElementById('totalRaffles').textContent = this.stats.totalRaffles;
    }

    resetStats() {
        if (confirm('¿Estás seguro de que deseas resetear todas las estadísticas? Esta acción no se puede deshacer.')) {
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
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== SOUND EFFECTS =====
    playSound(type) {
        // Web Audio API for simple sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
            history: this.history,
            stats: this.stats
        };
        localStorage.setItem('raffleApp', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('raffleApp');
        if (data) {
            const parsed = JSON.parse(data);
            this.theme = parsed.theme || 'light';
            this.history = parsed.history || [];
            this.stats = parsed.stats || { totalParticipants: 0, totalWinners: 0, totalRaffles: 0 };
        }
    }

    // ===== UTILITIES =====
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Add confetti animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.raffleApp = new RaffleApp();
});

// Service Worker for PWA (optional enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker not available, no problem
        });
    });
}
