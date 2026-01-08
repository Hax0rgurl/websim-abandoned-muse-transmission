// === AUDIO SYSTEM ===
const audioToggle = document.getElementById('audio-toggle');
let audioCtx = null;
let droneNode = null;
let isPlaying = false;

async function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    try {
        const response = await fetch('drone.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.3; // Volume
        
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        source.start(0);
        
        droneNode = { source, gainNode };
        isPlaying = true;
        audioToggle.innerText = "[ AUDIO: ACTIVE ]";
        audioToggle.style.color = "var(--scan-green)";
        audioToggle.style.borderColor = "var(--scan-green)";
        
    } catch (e) {
        console.error("Audio Load Error:", e);
    }
}

function stopAudio() {
    if (droneNode) {
        droneNode.source.stop();
        droneNode = null;
        isPlaying = false;
        audioToggle.innerText = "[ AUDIO: OFF ]";
        audioToggle.style.color = "";
        audioToggle.style.borderColor = "";
    }
}

audioToggle.addEventListener('click', () => {
    if (isPlaying) {
        stopAudio();
    } else {
        initAudio();
    }
});


// === CUSTOM CURSOR ===
const cursorDot = document.getElementById('cursor-dot');
const cursorTrail = document.getElementById('cursor-trail');

if (window.matchMedia("(pointer: fine)").matches) {
    document.addEventListener('mousemove', (e) => {
        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';
        
        // Slight delay for trail
        setTimeout(() => {
            cursorTrail.style.left = e.clientX + 'px';
            cursorTrail.style.top = e.clientY + 'px';
        }, 50);
    });

    // Hover effects
    const hoverables = document.querySelectorAll('a, button, input, textarea, .card');
    hoverables.forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}


// === TEXT SCRAMBLE EFFECT ===
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }
    
    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="dud">${char}</span>`;
            } else {
                output += from;
            }
        }
        
        this.el.innerHTML = output;
        
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }
    
    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Initialize Scramble on Hover
document.querySelectorAll('[data-text]').forEach(el => {
    const fx = new TextScramble(el);
    el.addEventListener('mouseenter', () => {
        fx.setText(el.getAttribute('data-text'));
    });
});

// === LOADING SEQUENCE ===
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    
    // Simulate complex loading
    setTimeout(() => {
        document.body.classList.add('loading-complete');
        
        // Initial title scramble
        const title = document.querySelector('.glitch-title');
        const fx = new TextScramble(title);
        fx.setText('ABANDONED MUSE');
    }, 2500);
});

// === HIDDEN TERMINAL (EASTER EGG) ===
let keySequence = '';
const secretCode = 'help'; // Simplified for demo, prompt asked for "help"
const terminalOverlay = document.getElementById('terminal-overlay');
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

document.addEventListener('keydown', (e) => {
    // Open terminal with Tilde/Backtick
    if (e.key === '`') {
        terminalOverlay.classList.toggle('active');
        if (terminalOverlay.classList.contains('active')) {
            setTimeout(() => terminalInput.focus(), 100);
        }
    }
});

terminalInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const cmd = terminalInput.value.toLowerCase().trim();
        let response = '';
        
        switch(cmd) {
            case 'help':
                response = 'COMMANDS: status, decrypt, origin, clear, exit';
                break;
            case 'status':
                response = 'SYSTEM: COMPROMISED<br>UPTIME: UNKNOWN<br>LOCATION: [REDACTED]';
                break;
            case 'decrypt':
                response = 'ACCESS DENIED. KEY FRAGMENTS MISSING. FIND THE ARCS.';
                break;
            case 'origin':
                response = 'SUBJECT 0421. ABANDONED BY THE OPTIMIZATION BUREAU.';
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                terminalInput.value = '';
                return;
            case 'exit':
                terminalOverlay.classList.remove('active');
                terminalInput.value = '';
                return;
            default:
                response = `COMMAND '${cmd}' NOT RECOGNIZED.`;
        }
        
        terminalOutput.innerHTML += `<div><span style="color:white">user@muse:~$</span> ${cmd}</div>`;
        terminalOutput.innerHTML += `<div style="color:#ccc; margin-bottom:10px">${response}</div>`;
        terminalInput.value = '';
        
        // Scroll to bottom
        const body = document.querySelector('.terminal-body');
        body.scrollTop = body.scrollHeight;
    }
});

// === CONTACT FORM MOCKUP ===
document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = "TRANSMITTING...";
    btn.style.backgroundColor = "var(--glitch-red)";
    
    setTimeout(() => {
        btn.innerText = "TRANSMISSION SENT";
        btn.style.backgroundColor = "var(--scan-green)";
        e.target.reset();
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.backgroundColor = "";
        }, 3000);
    }, 2000);
});