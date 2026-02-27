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

    // Media Handling
    const modal = document.getElementById('broadcastModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.querySelector('.close-modal');

    document.querySelectorAll('.media-item').forEach(item => {
        item.addEventListener('click', () => {
            const src = item.getAttribute('data-video');
            const title = item.getAttribute('data-title');
            
            modalTitle.innerText = title;
            modalBody.innerHTML = `
                <video controls autoplay playsinline style="width: 100%; display: block; max-height: 70vh; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                    <source src="${src}" type="video/mp4">
                    SIGNAL LOST.
                </video>
                <div style="margin-top: 15px; font-size: 0.8rem; color: #666; font-family: 'Space Mono', monospace;">
                    SOURCE: ABANDONED MUSE ARCHIVE // RECOVERED FOOTAGE
                </div>
            `;
            modal.classList.add('active');
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        modalBody.innerHTML = ''; // Stop video
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
});