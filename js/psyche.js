import { initCursor } from './cursor.js';
import { GameState } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    
    const form = document.getElementById('psyche-form');
    const input = document.getElementById('answer');
    const response = document.getElementById('response');
    const question = document.getElementById('question');
    const circle = document.getElementById('eye-circle');
    
    // Ensure focus
    input.focus();

    let step = 0;
    const questions = [
        "WHAT DO YOU SEE?",
        "DO YOU FEEL WATCHED?",
        "IS THE CUBE REAL?",
        "WHO ARE YOU?"
    ];

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const val = input.value.toLowerCase().trim();
        if (!val) return;

        let reply = "...";
        
        if (step === 0) {
            if (val.includes('nothing') || val.includes('darkness')) {
                reply = "CORRECT. THERE IS NOTHING.";
            } else if (val.includes('eye') || val.includes('circle')) {
                reply = "LITERAL. DISAPPOINTING.";
            } else {
                reply = "LOGGED.";
            }
            step++;
        } else if (step === 1) {
            if (val === 'yes' || val === 'always') {
                reply = "GOOD. YOU SHOULD.";
                circle.style.borderColor = 'red';
            } else {
                reply = "LIE DETECTED.";
            }
            step++;
        } else if (step === 2) {
            if (val === 'no') {
                reply = "DENIAL IS SAFETY.";
            } else {
                reply = "THE CUBE IS A CONSTRUCT.";
            }
            step++;
        } else if (step === 3) {
            reply = "DATA SAVED. PROFILE: UNSTABLE.";
            
            // Unlock Arc 3
            GameState.addFlag('arc3_clear');
            
            question.style.color = "var(--glitch-red)";
            question.innerText = "TEST COMPLETE";
            input.style.display = 'none';
            setTimeout(() => {
                    response.innerText = "ARC 3 CLEARED. RETURN TO ORIGIN.";
                    response.style.color = "#fff";
            }, 1000);
            return;
        }

        response.innerText = reply;
        response.style.opacity = 1;
        input.value = '';
        
        setTimeout(() => {
            question.innerText = questions[step];
            response.style.opacity = 0.5;
        }, 1500);
    });
});