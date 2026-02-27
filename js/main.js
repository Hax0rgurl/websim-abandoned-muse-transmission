import { GameState, initVisits } from './state.js';
import { initCursor } from './cursor.js';
import { toggleSystemAudio, playTrack } from './audio.js';
import { TextScramble } from './fx.js';

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    // 1. Init Cursor
    initCursor();

    // 2. Init Game State & Visits
    const state = initVisits(); // Increments visit count
    
    // 3. Conditional High Paranoia Mode
    if (state.visits > 5) {
        document.documentElement.style.setProperty('--glitch-red', '#ff0000');
        document.documentElement.classList.add('high-paranoia');
    }
    if (state.visits > 2) {
        const heroTitle = document.querySelector('.glitch-title');
        if(heroTitle) heroTitle.setAttribute('data-text', 'TRUST THE SIGNAL');
        if (Math.random() > 0.7) {
            const tagline = document.querySelector('.tagline');
            if(tagline) tagline.innerText = "THEY ARE WATCHING YOU";
        }
    }

    // 4. Init Audio UI
    const audioToggle = document.getElementById('audio-toggle');
    const nowPlayingLabel = document.getElementById('now-playing');
    
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            toggleSystemAudio(audioToggle, nowPlayingLabel);
        });
    }

    // 5. Init Audio Triggers on page
    document.querySelectorAll('.audio-trigger').forEach(el => {
        el.addEventListener('click', (e) => {
            const trigger = e.target.closest('.audio-trigger');
            const src = trigger.getAttribute('data-src');
            const title = trigger.getAttribute('data-title');
            
            // Visual Toggle handled in audio.js generally, but we invoke playTrack
            const isPlayingThis = trigger.classList.contains('playing');
            // Reset all others visually first (audio.js handles state, but class helper here)
            document.querySelectorAll('.audio-trigger').forEach(i => i.classList.remove('playing'));
            
            if (!isPlayingThis) {
                trigger.classList.add('playing');
            }
            playTrack(src, title, nowPlayingLabel);
        });
    });

    // 6. Text Scramble Effects
    document.querySelectorAll('[data-text]').forEach(el => {
        const fx = new TextScramble(el);
        el.addEventListener('mouseenter', () => {
            fx.setText(el.getAttribute('data-text'));
        });
    });

    // 7. Loading Sequence (Main Page Only)
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.add('loading-complete');
                const title = document.querySelector('.glitch-title');
                if(title) {
                    const fx = new TextScramble(title);
                    fx.setText('ABANDONED MUSE');
                }
            }, 2500);
        });
    }

    // 8. Setup Terminal
    setupTerminal();

    // 9. Buttons & Interactive
    setupInteractions();
});


function setupTerminal() {
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    
    if (!terminalOverlay || !terminalInput) return;

    // Glitch Trigger
    const glitchTrigger = document.getElementById('hero-glitch-trigger');
    if(glitchTrigger) {
        glitchTrigger.addEventListener('click', () => {
            terminalOverlay.classList.add('active');
            terminalOutput.innerHTML += `<div style="color:var(--glitch-red)">> ANOMALY DETECTED. MANUAL OVERRIDE ENGAGED.</div>`;
            setTimeout(() => terminalInput.focus(), 100);
        });
    }

    // Keydown toggle
    document.addEventListener('keydown', (e) => {
        if (e.key === '`') {
            terminalOverlay.classList.toggle('active');
            if (terminalOverlay.classList.contains('active')) {
                setTimeout(() => terminalInput.focus(), 100);
            }
        }
    });

    // Terminal Logic
    terminalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.value.toLowerCase().trim();
            handleTerminalCommand(cmd, terminalOutput, terminalInput);
        }
    });
}

function handleTerminalCommand(cmd, output, input) {
    let response = '';
    let color = '#ccc';
    const state = GameState.get();

    switch(cmd) {
        case 'help':
            response = 'COMMANDS: status, decrypt, origin, list, whoami, clear, exit, clue';
            break;
        case 'clue':
            if (!state.flags.includes('arc1_clear')) response = 'HINT: The broadcast signal is Morse code. It spells a name.';
            else if (!state.flags.includes('arc2_clear')) response = 'HINT: In the Archive, sometimes the corrupt data holds the key. Check the "locked" or "broken" files.';
            else if (!state.flags.includes('arc3_clear')) response = 'HINT: The Psyche evaluation requires honesty. Or maybe just "nothing".';
            else response = 'HINT: You have the keys. Run DECRYPT.';
            break;
        case 'status':
            response = `SYSTEM: ${state.visits > 3 ? 'CRITICAL FAILURE' : 'STABLE'}<br>FLAGS: ${state.flags.length}<br>VISITS: ${state.visits}<br>THREAT: HIGH`;
            color = state.visits > 3 ? 'var(--glitch-red)' : 'var(--scan-green)';
            break;
        case 'list':
            response = `FILES:\n- manifesto_draft.txt [READ]\n- broadcast_log.dat [${state.flags.includes('arc1_clear') ? 'DECRYPTED' : 'ENCRYPTED'}]\n- subject_0421.pds [${state.flags.includes('arc3_clear') ? 'UNLOCKED' : 'LOCKED'}]`;
            break;
        case 'whoami': response = 'YOU ARE THE OBSERVER. OR MAYBE THE OBSERVED.'; break;
        case 'muse': response = 'WE ARE STILL HERE.'; color = 'var(--mkultra-pink)'; break;
        case 'decrypt':
            if (state.flags.includes('arc1_clear') && state.flags.includes('arc2_clear') && state.flags.includes('arc3_clear')) {
                response = 'DECRYPTION COMPLETE. ACCESSING SECURE SERVER...\n[ <a href="payoff.html" style="color:#fff; text-decoration:underline; cursor:pointer;">CLICK TO INITIALIZE FINAL TRANSMISSION</a> ]';
                color = 'var(--scan-green)';
            } else {
                let missing = [];
                if (!state.flags.includes('arc1_clear')) missing.push('BROADCAST');
                if (!state.flags.includes('arc2_clear')) missing.push('ARCHIVE');
                if (!state.flags.includes('arc3_clear')) missing.push('PSYCHE');
                response = `ACCESS DENIED. INSUFFICIENT DATA.\nMISSING KEYS: ${missing.join(', ')}`;
                color = 'var(--glitch-red)';
            }
            break;
        case 'origin': response = 'SUBJECT 0421. ABANDONED BY THE OPTIMIZATION BUREAU.'; break;
        case '0421': 
            response = 'THE SUBJECT HAS ESCAPED.'; 
            GameState.addFlag('code_0421_found'); 
            break;
        case 'clear': output.innerHTML = ''; input.value = ''; return;
        case 'exit': document.getElementById('terminal-overlay').classList.remove('active'); input.value = ''; return;
        default:
            if (cmd === 'wake up' || cmd === 'wakeup') {
                response = 'COMMAND ACCEPTED. BROADCAST NODE ACKNOWLEDGED.';
                GameState.addFlag('arc1_code_used');
                color = 'var(--scan-green)';
            } else {
                response = `COMMAND '${cmd}' NOT RECOGNIZED.`;
                color = 'var(--glitch-red)';
            }
    }
    
    output.innerHTML += `<div><span style="color:var(--scan-green)">user@muse:~$</span> ${cmd}</div>`;
    output.innerHTML += `<div style="color:${color}; margin-bottom:10px; white-space: pre-line;">${response}</div>`;
    input.value = '';
    const body = document.querySelector('.terminal-body');
    if(body) body.scrollTop = body.scrollHeight;
}

function setupInteractions() {
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "TRANSMITTING...";
            btn.style.backgroundColor = "var(--glitch-red)";
            setTimeout(() => {
                btn.innerText = "TRANSMISSION SENT";
                btn.style.backgroundColor = "var(--scan-green)";
                e.target.reset();
                setTimeout(() => { btn.innerText = originalText; btn.style.backgroundColor = ""; }, 3000);
            }, 2000);
        });
    }

    // Hero CTA
    const ctaBtn = document.querySelector('.cta-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            const originalText = ctaBtn.getAttribute('data-text');
            ctaBtn.innerText = "INITIALIZING...";
            let steps = 0;
            const glitchInterval = setInterval(() => {
                ctaBtn.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
                steps++;
                if(steps > 5) {
                    clearInterval(glitchInterval);
                    ctaBtn.style.transform = 'none';
                    document.getElementById('arcs').scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => { ctaBtn.innerText = originalText; }, 1000);
                }
            }, 50);
        });
    }

    // Cards & Access Buttons Interaction
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent double firing if clicking button specifically since event bubbles, 
            // but we want the whole card to act as the button.
            // If the user clicked the button, let's handle it, but if they clicked the card image, also handle it.
            
            // Find the button inside to get data
            const btn = card.querySelector('.access-btn');
            if (!btn) return;
            
            // Visual feedback on button even if card clicked
            const target = btn.getAttribute('data-target');
            const originalText = btn.innerText;
            
            if (btn.innerText === "DECRYPTING..." || btn.innerText === "ACCESS GRANTED") return;

            btn.innerText = "DECRYPTING...";
            btn.style.color = "var(--scan-green)";
            btn.style.borderColor = "var(--scan-green)";
            card.style.borderColor = "var(--scan-green)";
            
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
                setTimeout(() => { window.location.href = target; }, 500);
            }, 1000);
        });
    });

    // Hamburger
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
    }
}