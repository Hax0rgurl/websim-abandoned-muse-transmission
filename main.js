// === GAME STATE MANAGEMENT ===
const GameState = {
    get() {
        return JSON.parse(localStorage.getItem('AM_ARG_STATE')) || {
            visits: 0,
            flags: [],
            unlocked: [],
            history: []
        };
    },
    save(state) {
        localStorage.setItem('AM_ARG_STATE', JSON.stringify(state));
    },
    update(fn) {
        const state = this.get();
        fn(state);
        this.save(state);
        this.dispatch(state);
    },
    dispatch(state) {
        window.dispatchEvent(new CustomEvent('gamestate_updated', { detail: state }));
    },
    hasFlag(flag) {
        return this.get().flags.includes(flag);
    },
    addFlag(flag) {
        this.update(s => {
            if (!s.flags.includes(flag)) s.flags.push(flag);
        });
    }
};

// React to State on Load
const currentState = GameState.get();
if (currentState.visits > 2) {
    const heroTitle = document.querySelector('.glitch-title');
    if(heroTitle) heroTitle.setAttribute('data-text', 'DO NOT TRUST');
    
    if (Math.random() > 0.7) {
        document.querySelector('.tagline').innerText = "THEY ARE WATCHING YOU";
    }
}

// === AUDIO SYSTEM ===
const audioToggle = document.getElementById('audio-toggle');
let audioCtx = null;
let droneBuffer = null;
let droneSource = null;
let heartbeatTimer = null;
let isPlaying = false;

async function initAudio() {
    // 1. Init Context
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }

    // 2. Load Buffer (Once)
    if (!droneBuffer) {
        try {
            audioToggle.innerText = "[ LOADING... ]";
            const response = await fetch('/drone.mp3');
            const arrayBuffer = await response.arrayBuffer();
            droneBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error("Audio Load Error:", e);
            audioToggle.innerText = "[ ERROR ]";
            return;
        }
    }

    if (isPlaying) return; // Already playing

    // 3. Start Drone
    const source = audioCtx.createBufferSource();
    source.buffer = droneBuffer;
    source.loop = true;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.4; 
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start(0);
    droneSource = source;

    // 4. Start Heartbeat (if high visits)
    if (GameState.get().visits > 3) {
        startHeartbeat();
    }

    isPlaying = true;
    audioToggle.innerText = "[ AUDIO: ACTIVE ]";
    audioToggle.style.color = "var(--scan-green)";
    audioToggle.style.borderColor = "var(--scan-green)";
}

function startHeartbeat() {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 50;
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();

    function beat() {
        if (!isPlaying) {
            try { osc.stop(); } catch(e){}
            return;
        }
        
        const time = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.5, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        
        gain.gain.setValueAtTime(0, time + 0.4);
        gain.gain.linearRampToValueAtTime(0.4, time + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.7);

        heartbeatTimer = setTimeout(beat, 1200);
    }
    beat();
}

function stopAudio() {
    if (droneSource) {
        try { droneSource.stop(); } catch(e) {}
        droneSource = null;
    }
    if (heartbeatTimer) {
        clearTimeout(heartbeatTimer);
        heartbeatTimer = null;
    }
    isPlaying = false;
    audioToggle.innerText = "[ AUDIO: OFF ]";
    audioToggle.style.color = "";
    audioToggle.style.borderColor = "";
}

if (audioToggle) {
    audioToggle.addEventListener('click', () => {
        if (isPlaying) {
            stopAudio();
        } else {
            initAudio();
        }
    });
}


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
const terminalOverlay = document.getElementById('terminal-overlay');
const terminalInput = document.getElementById('terminal-input');
const terminalOutput = document.getElementById('terminal-output');

// Hidden trigger
const glitchTrigger = document.getElementById('hero-glitch-trigger');
if(glitchTrigger) {
    glitchTrigger.addEventListener('click', () => {
        terminalOverlay.classList.add('active');
        terminalOutput.innerHTML += `<div style="color:var(--glitch-red)">> ANOMALY DETECTED. MANUAL OVERRIDE ENGAGED.</div>`;
        setTimeout(() => terminalInput.focus(), 100);
    });
}

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
        let color = '#ccc';
        
        // State-aware commands
        const state = GameState.get();

        switch(cmd) {
            case 'help':
                response = 'COMMANDS: status, decrypt, origin, list, whoami, clear, exit';
                break;
            case 'status':
                response = `SYSTEM: ${state.visits > 3 ? 'CRITICAL FAILURE' : 'STABLE'}<br>
                            FLAGS: ${state.flags.length}<br>
                            VISITS: ${state.visits}<br>
                            THREAT: HIGH`;
                color = state.visits > 3 ? 'var(--glitch-red)' : 'var(--scan-green)';
                break;
            case 'list':
                response = `FILES:\n- manifesto_draft.txt [READ]\n- broadcast_log.dat [${state.flags.includes('arc1_clear') ? 'DECRYPTED' : 'ENCRYPTED'}]\n- subject_0421.pds [${state.flags.includes('arc3_clear') ? 'UNLOCKED' : 'LOCKED'}]`;
                break;
            case 'whoami':
                response = 'YOU ARE THE OBSERVER. OR MAYBE THE OBSERVED.';
                break;
            case 'muse':
                response = 'WE ARE STILL HERE.';
                color = 'var(--mkultra-pink)';
                break;
            case 'decrypt':
                if (state.flags.includes('arc1_clear') && state.flags.includes('arc2_clear') && state.flags.includes('arc3_clear')) {
                    response = 'DECRYPTION COMPLETE. FINAL TRANSMISSION UNLOCKED: <a href="#" style="color:#fff">THE_TRUTH.mp4</a> (FILE CORRUPTED)';
                } else {
                    response = 'ACCESS DENIED. INSUFFICIENT DATA. COMPLETE THE ARCS.';
                    color = 'var(--glitch-red)';
                }
                break;
            case 'origin':
                response = 'SUBJECT 0421. ABANDONED BY THE OPTIMIZATION BUREAU.';
                break;
            case '0421':
                response = 'THE SUBJECT HAS ESCAPED.';
                GameState.addFlag('code_0421_found');
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
                // Check if command is an unlock code from Arcs
                if (cmd === 'wake up' || cmd === 'wakeup') {
                    response = 'COMMAND ACCEPTED. BROADCAST NODE ACKNOWLEDGED.';
                    GameState.addFlag('arc1_code_used');
                    color = 'var(--scan-green)';
                } else {
                    response = `COMMAND '${cmd}' NOT RECOGNIZED.`;
                    color = 'var(--glitch-red)';
                }
        }
        
        terminalOutput.innerHTML += `<div><span style="color:var(--scan-green)">user@muse:~$</span> ${cmd}</div>`;
        terminalOutput.innerHTML += `<div style="color:${color}; margin-bottom:10px; white-space: pre-line;">${response}</div>`;
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

// === INTERACTIVE BUTTONS ===

// Hero CTA Button
const ctaBtn = document.querySelector('.cta-btn');
if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
        const originalText = ctaBtn.getAttribute('data-text');
        ctaBtn.innerText = "INITIALIZING...";
        
        // Glitch effect on button
        let steps = 0;
        const glitchInterval = setInterval(() => {
            ctaBtn.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
            steps++;
            if(steps > 5) {
                clearInterval(glitchInterval);
                ctaBtn.style.transform = 'none';
                // Scroll to Arcs
                document.getElementById('arcs').scrollIntoView({ behavior: 'smooth' });
                
                setTimeout(() => {
                    ctaBtn.innerText = originalText;
                }, 1000);
            }
        }, 50);
    });
}

// Access Buttons (Cards)
document.querySelectorAll('.access-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const btn = e.target;
        const target = btn.getAttribute('data-target');
        const originalText = btn.innerText;
        
        // Decryption simulation
        btn.innerText = "DECRYPTING...";
        btn.style.color = "var(--scan-green)";
        btn.style.borderColor = "var(--scan-green)";
        
        // Terminal feedback
        const terminalOutput = document.getElementById('terminal-output');
        if(terminalOutput) {
            terminalOutput.innerHTML += `<div style="color:var(--scan-green)">> INITIATING HANDSHAKE WITH ${target.toUpperCase()}...</div>`;
            const body = document.querySelector('.terminal-body');
            if(body) body.scrollTop = body.scrollHeight;
        }

        setTimeout(() => {
            btn.innerText = "ACCESS GRANTED";
            btn.style.backgroundColor = "var(--scan-green)";
            btn.style.color = "#000";
            
            setTimeout(() => {
                window.location.href = target;
            }, 500);
        }, 1000);
    });
});

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-item');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}