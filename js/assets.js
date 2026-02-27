import { initCursor } from './cursor.js';

document.addEventListener('DOMContentLoaded', () => {
    initCursor();

    // Clipboard Functionality
    const buttons = document.querySelectorAll('.copy-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-clipboard-text');
            
            navigator.clipboard.writeText(text).then(() => {
                const originalText = btn.innerText;
                
                // Visual Feedback
                btn.innerText = "COPIED TO CLIPBOARD";
                btn.style.backgroundColor = "var(--scan-green)";
                btn.style.color = "#000";
                
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = "";
                    btn.style.color = "";
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                btn.innerText = "ERROR_COPY_FAILED";
                btn.style.borderColor = "red";
                btn.style.color = "red";
            });
        });
    });
});