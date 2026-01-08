let audioCtx = null;
let droneNode = null;
let droneGain = null;
let trackNode = null;
let isSystemActive = false;
let isTrackPlaying = false;

export async function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
    }
    return audioCtx;
}

export async function toggleSystemAudio(btnElement, statusLabel) {
    await initAudioContext();
    
    if (isSystemActive) {
        stopDrone();
        stopTrack(statusLabel);
        isSystemActive = false;
        
        if(btnElement) {
            btnElement.innerText = "[ AUDIO: OFF ]";
            btnElement.style.color = "";
            btnElement.style.borderColor = "";
        }
        if(statusLabel) statusLabel.style.opacity = 0;
    } else {
        playDrone();
        isSystemActive = true;
        
        if(btnElement) {
            btnElement.innerText = "[ AUDIO: ACTIVE ]";
            btnElement.style.color = "var(--scan-green)";
            btnElement.style.borderColor = "var(--scan-green)";
        }
    }
    return isSystemActive;
}

async function playDrone() {
    if (droneNode) return;
    try {
        const response = await fetch('/drone.mp3');
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        
        const gain = audioCtx.createGain();
        gain.gain.value = isTrackPlaying ? 0.1 : 0.4;
        
        source.connect(gain);
        gain.connect(audioCtx.destination);
        source.start(0);
        
        droneNode = source;
        droneGain = gain;
    } catch (e) { console.error("Drone error", e); }
}

function stopDrone() {
    if (droneNode) {
        try { droneNode.stop(); } catch(e){}
        droneNode = null;
        droneGain = null;
    }
}

export async function playTrack(src, title, statusLabel) {
    if (!isSystemActive) {
        await initAudioContext();
        isSystemActive = true; 
        playDrone();
        // Note: UI might be out of sync if we don't pass button el, but acceptable for this scope
        const btn = document.getElementById('audio-toggle');
        if(btn) {
            btn.innerText = "[ AUDIO: ACTIVE ]";
            btn.style.color = "var(--scan-green)";
            btn.style.borderColor = "var(--scan-green)";
        }
    }

    if (trackNode && !trackNode.paused && trackNode.currentSrc.includes(src)) {
        stopTrack(statusLabel);
        if (droneGain) droneGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 1);
        return;
    }

    stopTrack(statusLabel);

    const audio = new Audio(src);
    audio.crossOrigin = "anonymous";
    audio.loop = false;
    
    const source = audioCtx.createMediaElementSource(audio);
    const gain = audioCtx.createGain();
    gain.gain.value = 0.8;
    
    source.connect(gain);
    gain.connect(audioCtx.destination);
    
    audio.play().then(() => {
        isTrackPlaying = true;
        trackNode = audio;
        
        if(statusLabel) {
            statusLabel.innerText = "PLAYING: " + title;
            statusLabel.style.opacity = 1;
        }
        if (droneGain) {
            droneGain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.5);
        }
    }).catch(e => console.error("Track play error", e));

    audio.onended = () => {
        isTrackPlaying = false;
        if(statusLabel) statusLabel.style.opacity = 0;
        if (droneGain) droneGain.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 2);
        document.querySelectorAll('.video-item, .audio-trigger').forEach(el => el.classList.remove('playing'));
    };
}

export function stopTrack(statusLabel) {
    if (trackNode) {
        trackNode.pause();
        trackNode = null;
    }
    isTrackPlaying = false;
    if(statusLabel) statusLabel.style.opacity = 0;
    document.querySelectorAll('.video-item, .audio-trigger').forEach(el => el.classList.remove('playing'));
}