import { initCube } from './cube.js';
import { AudioController } from './audio.js';

// --- Configuration ---
const TERMINAL_TEXTS = [
    "TRANSMISSION: 0421",
    "ENCRYPTED CONNECTION ESTABLISHED",
    "SUBJECT: ABANDONED MUSE",
    "STATUS: WATCHING"
];

// --- Utilities ---
const randomChar = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*";
    return chars[Math.floor(Math.random() * chars.length)];
};

// --- Glitch Text Effect ---
class GlitchText {
    constructor(el) {
        this.el = el;
        this.originalText = el.getAttribute('data-text') || el.innerText;
        this.isHovering = false;
        
        el.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.scramble();
        });
        
        el.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.el.innerText = this.originalText;
        });
    }

    scramble() {
        if (!this.isHovering) return;
        
        let iteration = 0;
        const interval = setInterval(() => {
            this.el.innerText = this.originalText
                .split("")
                .map((letter, index) => {
                    if (index < iteration) return this.originalText[index];
                    return randomChar();
                })
                .join("");
            
            if (iteration >= this.originalText.length) { 
                clearInterval(interval);
            }
            
            iteration += 1 / 3;
        }, 30);
    }
}

// --- Typewriter Effect ---
function startTypewriter() {
    const el = document.getElementById('typewriter');
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let txt = '';
    
    function type() {
        const current = textIndex % TERMINAL_TEXTS.length;
        const fullTxt = TERMINAL_TEXTS[current];
        
        if (isDeleting) {
            txt = fullTxt.substring(0, txt.length - 1);
        } else {
            txt = fullTxt.substring(0, txt.length + 1);
        }
        
        el.innerHTML = txt;
        
        let typeSpeed = 100;
        
        if (isDeleting) { typeSpeed /= 2; }
        
        if (!isDeleting && txt === fullTxt) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && txt === '') {
            isDeleting = false;
            textIndex++;
            typeSpeed = 500;
        }
        
        setTimeout(type, typeSpeed);
    }
    
    type();
}

// --- Loading Sequence ---
function handleLoader() {
    const loader = document.getElementById('loader');
    const progressFill = document.querySelector('.progress-fill');
    let width = 0;
    
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 500);
            }, 500);
        } else {
            width += Math.random() * 10;
            if (width > 100) width = 100;
            progressFill.style.width = width + '%';
        }
    }, 200);
}

// --- Terminal Easter Egg ---
function initTerminal() {
    const input = document.getElementById('terminal-input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.toLowerCase().trim();
            if (cmd === 'help') {
                alert("COMMANDS: 'help', 'clear', 'whoami', 'muse'");
            } else if (cmd === 'whoami') {
                alert("USER: GUEST\nACCESS: RESTRICTED");
            } else if (cmd === 'muse') {
                alert("THE MUSE HAS ABANDONED YOU.");
            } else {
                console.log(`Command not found: ${cmd}`);
            }
            input.value = '';
        }
    });
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize 3D
    initCube('canvas-container');

    // 2. Initialize Audio
    const audio = new AudioController();

    // 3. Glitch Effects
    document.querySelectorAll('.glitch-hover').forEach(el => new GlitchText(el));
    document.querySelectorAll('.glitch-header').forEach(el => new GlitchText(el));

    // 4. Typewriter
    startTypewriter();

    // 5. Terminal
    initTerminal();

    // 6. Loader
    handleLoader();

    // 7. Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 8. Decrypt Button Scroll
    const decryptBtn = document.getElementById('decrypt-btn');
    if (decryptBtn) {
        decryptBtn.addEventListener('click', () => {
            document.querySelector('#manifesto').scrollIntoView({ behavior: 'smooth' });
        });
    }
});