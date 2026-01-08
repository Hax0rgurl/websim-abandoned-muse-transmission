import { initCursor } from './cursor.js';
import { GameState } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    initCursor();

    const input = document.getElementById('decoder');
    const success = document.getElementById('success');
    const msgBlock = document.getElementById('msg-block');
    const title = document.getElementById('title');
    
    // Check prev state
    if (GameState.hasFlag('arc1_clear')) {
         input.style.display = 'none';
         title.innerText = "SIGNAL DECRYPTED";
         msgBlock.innerHTML = "<p>MESSAGE: WAKE UP.</p><p>THEY ARE WATCHING THE EXITS.</p>";
         success.style.display = 'block';
    }

    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            if (input.value.toUpperCase() === 'MUSE') {
                // Update State
                GameState.addFlag('arc1_clear');
                
                // UI Feedback
                input.style.display = 'none';
                success.style.display = 'block';
                title.innerText = "DECRYPTING...";
                
                setTimeout(() => {
                    title.innerText = "SIGNAL DECRYPTED";
                    msgBlock.innerHTML = "<p>MESSAGE: WAKE UP.</p><p>THEY ARE WATCHING THE EXITS.</p>";
                }, 1500);
            } else {
                input.style.borderColor = "red";
                input.classList.add('shake');
                setTimeout(() => input.classList.remove('shake'), 500);
            }
        }
    });
});