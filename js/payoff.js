import { initCursor } from './cursor.js';
import { GameState } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    GameState.addFlag('game_complete');
});