export class AudioController {
    constructor() {
        this.ctx = null;
        this.osc = null;
        this.gain = null;
        this.isPlaying = false;
        this.btn = document.getElementById('audio-toggle');
        
        if (this.btn) {
            this.btn.addEventListener('click', () => this.toggle());
        }
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        // Create oscillator (Low drone)
        this.osc = this.ctx.createOscillator();
        this.osc.type = 'sawtooth';
        this.osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

        // Filter (Muffle it)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, this.ctx.currentTime);

        // Gain (Volume)
        this.gain = this.ctx.createGain();
        this.gain.gain.setValueAtTime(0, this.ctx.currentTime);

        // Connect
        this.osc.connect(filter);
        filter.connect(this.gain);
        this.gain.connect(this.ctx.destination);
        
        this.osc.start();
    }

    toggle() {
        if (!this.ctx) this.init();

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            // Fade in
            this.gain.gain.setTargetAtTime(0.05, this.ctx.currentTime, 1);
            this.btn.textContent = "AUDIO: ONLINE";
            this.btn.style.borderColor = "var(--accent-red)";
            this.btn.style.color = "var(--accent-red)";
        } else {
            // Fade out
            this.gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
            this.btn.textContent = "AUDIO: OFF";
            this.btn.style.borderColor = "#333";
            this.btn.style.color = "#555";
        }
    }
}