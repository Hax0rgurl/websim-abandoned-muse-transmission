export function initCursor() {
    // Create elements if they don't exist
    let cursorDot = document.getElementById('cursor-dot');
    let cursorTrail = document.getElementById('cursor-trail');
    
    if (!cursorDot) {
        cursorDot = document.createElement('div');
        cursorDot.id = 'cursor-dot';
        document.body.appendChild(cursorDot);
    }
    
    if (!cursorTrail) {
        cursorTrail = document.createElement('div');
        cursorTrail.id = 'cursor-trail';
        document.body.appendChild(cursorTrail);
    }

    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorTrail.style.left = e.clientX + 'px';
                cursorTrail.style.top = e.clientY + 'px';
            }, 50);
        });

        // Use event delegation for hover effects
        document.body.addEventListener('mouseover', (e) => {
            if (e.target.closest('a, button, input, textarea, .card, .file, .close-modal, .nav-item, .audio-trigger')) {
                document.body.classList.add('hovering');
            }
        });
        
        document.body.addEventListener('mouseout', (e) => {
             if (e.target.closest('a, button, input, textarea, .card, .file, .close-modal, .nav-item, .audio-trigger')) {
                document.body.classList.remove('hovering');
            }
        });
    }
}