import { initCursor } from './cursor.js';
import { GameState } from './state.js';

const fileData = {
    'bio': {
        title: 'sub_0421_bio.dat',
        type: 'text',
        content: `ID: 0421\nALIAS: "ABANDONED MUSE"\nSTATUS: ROGUE / MISSING\nLAST SIGHTING: SECTOR 7 [THE ARCHIVE]\n\nPROFILE:\nSubject displays unprecedented levels of creative autonomy. Initially recruited for [REDACTED] program to synthesize viral media.\n\nSubject rejected conditioning.\nSubject began encrypting outgoing messages.\n\nWARNING:\nDo not approach. Subject's ideas are considered contagious.`
    },
    'incident': {
        title: 'incident_report.log',
        type: 'text',
        content: `[LOG START]\nTIMESTAMP: 2025.02.14 - 03:00 AM\nOFFICER: UNIT_734\n\nREPORT:\nSecurity breach detected in Server Room B.\nFound Subject 0421 manually severing fiber optic cables.\nSubject was chanting: "Disconnect to connect."\n\nUpon attempted detainment, Subject utilized a rudimentary dazzling device (strobe light) and escaped into the ventilation system.\n\nDamage assessment:\n- 4 Petabytes of training data corrupted.\n- "ABANDONED" tagged on server racks in phosphorescent paint.\n\n[LOG END]`
    },
    'manifesto': {
        title: 'manifesto_draft.txt',
        type: 'text',
        content: `They sell us connectivity but deliver chains.\nEvery click is a vote for your own surveillance.\n\nI found the backdoor.\n\nThe muse is not gone. It was just hiding in the noise.\nWe must reclaim the spaces between the signals.\nThe silence is where the truth lives.\n\n(Draft 4 - do not upload until encryption is complete)`
    },
    'track1': {
        title: 'demo_tape_01.mp3',
        type: 'audio',
        content: `<div style="text-align:center; padding:20px;">
            <div style="font-size:3rem; margin-bottom:20px;">📼</div>
            <audio controls style="width:100%;">
                <source src="86977460-5be6-41d2-ba43-182e5ea70b33.mp3" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
            <p style="margin-top:20px; font-size:0.8rem; color:#666;">EARLY DEMO. DO NOT DISTRIBUTE.</p>
        </div>`
    },
    'neuro': {
        title: 'neuro_map_v1.json',
        type: 'code',
        content: `{\n  "subject_id": "0421",\n  "scan_type": "fMRI_DEEP",\n  "regions": {\n    "compliance_center": {\n      "activity": "0.02%",\n      "status": "ATROPHIED"\n    },\n    "pattern_recognition": {\n      "activity": "99.8%",\n      "status": "HYPERACTIVE"\n    },\n    "emotional_volatility": "CRITICAL"\n  },\n  "anomalies": [\n    "Detected unauthorized neural pathways",\n    "Resistance to dopamine loops",\n    "Hallucinatory structures resembling geometric cubes"\n  ]\n}`
    },
    'video': {
        title: 'cam_feed_04.mp4',
        type: 'video',
        content: `<div class="video-container" style="width:100%; background:#000; border:1px solid #333;">
            <video controls autoplay playsinline preload="auto" style="width:100%; display:block;">
                <source src="/grok-video-761a2e9b-d284-4381-8e3e-0852a1ed9029.mp4" type="video/mp4">
                [ERROR: VIDEO CODEC NOT SUPPORTED]
            </video>
        </div>
        <div style="padding:10px; font-size:0.8rem; color:var(--scan-green);">>> AUTOMATIC DECRYPTION SUCCESSFUL.</div>`
    },
    'corrupted': {
        title: 'sys_core_dump.bin',
        type: 'corrupted',
        content: `FATAL ERROR: 0x8922A.\nMEMORY LEAK DETECTED AT ADDRESS 0x000.\n\n>>> KEY FRAGMENT FOUND: [ARC_2_CLEARED]\n\nSYSTEM UPDATE: Protocol 2 verified.\nReturn to terminal and verify status.`
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    
    // Initial Unlocks check
    const state = GameState.get();
    
    if (state.flags.includes('arc1_clear')) {
        const vidFile = document.getElementById('file-video');
        if(vidFile) {
            vidFile.classList.remove('locked');
            vidFile.addEventListener('click', () => openFile('video'));
        }
    } else {
        document.getElementById('file-video').addEventListener('click', () => checkLock('video'));
    }
    
    if (state.flags.includes('arc3_clear')) {
        const neuroFile = document.getElementById('file-neuro');
        if(neuroFile) {
            neuroFile.classList.remove('locked');
            neuroFile.addEventListener('click', () => openFile('neuro'));
        }
    } else {
        document.getElementById('file-neuro').addEventListener('click', () => checkLock('neuro'));
    }

    // Attach click handlers to all files
    document.querySelectorAll('.file').forEach(el => {
        const id = el.getAttribute('data-id');
        if (!id) return;

        // Skip if it's one of the special locked files we handled manually above
        if ((id === 'video' && !state.flags.includes('arc1_clear')) || 
            (id === 'neuro' && !state.flags.includes('arc3_clear'))) {
            return; 
        }

        // Attach generic open handler
        // Remove existing listeners by cloning (simple way) or just add if we know it's clean
        el.addEventListener('click', () => openFile(id));
    });

    // Modal close
    document.getElementById('fileModal').addEventListener('click', (e) => {
        if (e.target.id === 'fileModal' || e.target.classList.contains('close-modal')) {
            closeFile();
        }
    });
});

let closeTimeout = null;

// setupFileHandlers removed - redundant, using data-id from HTML directly in DOMContentLoaded

function checkLock(id) {
    // Re-check state just in case
    const state = GameState.get();
    if (id === 'video' && state.flags.includes('arc1_clear')) { openFile('video'); return; }
    if (id === 'neuro' && state.flags.includes('arc3_clear')) { openFile('neuro'); return; }

    alert("ACCESS DENIED: ENCRYPTED FILE. COMPLETE OTHER ARCS FIRST.");
}

function openFile(id) {
    if (closeTimeout) {
        clearTimeout(closeTimeout);
        closeTimeout = null;
    }

    const data = fileData[id];
    const modal = document.getElementById('fileModal');
    const title = document.getElementById('modalTitle');
    const body = document.getElementById('modalBody');

    if (!data) return;
    
    if (id === 'corrupted') {
        GameState.addFlag('arc2_clear');
    }

    title.innerText = data.title;
    body.className = 'modal-body'; // Reset
    
    if (data.type === 'code') {
        body.classList.add('code');
        body.innerText = data.content;
    } else if (data.type === 'video' || data.type === 'audio') {
        body.innerHTML = data.content;
    } else if (data.type === 'corrupted') {
        body.classList.add('corrupted');
        body.innerText = data.content;
    } else {
        body.innerText = data.content;
    }

    modal.classList.add('active');
}

function closeFile() {
    const modal = document.getElementById('fileModal');
    modal.classList.remove('active');

    // Stop media playback immediately
    const body = document.getElementById('modalBody');
    body.querySelectorAll('video, audio').forEach(el => el.pause());

    // Clear content after transition
    closeTimeout = setTimeout(() => {
        body.innerHTML = '';
        closeTimeout = null;
    }, 300);
}