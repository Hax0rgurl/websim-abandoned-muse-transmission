export const GameState = {
    get() {
        return JSON.parse(localStorage.getItem('AM_ARG_STATE')) || {
            visits: 0,
            flags: [],
            unlocked: [],
            history: []
        };
    },
    save(state) {
        localStorage.setItem('AM_ARG_STATE', JSON.stringify(state));
    },
    update(fn) {
        const state = this.get();
        fn(state);
        this.save(state);
        this.dispatch(state);
    },
    dispatch(state) {
        window.dispatchEvent(new CustomEvent('gamestate_updated', { detail: state }));
    },
    hasFlag(flag) {
        return this.get().flags.includes(flag);
    },
    addFlag(flag) {
        this.update(s => {
            if (!s.flags.includes(flag)) s.flags.push(flag);
        });
    },
    init() {
        const state = this.get();
        // Only increment visits if on main page or once per session? 
        // For simplicity, let's just ensure structure exists.
        // We handle visit increment in main.js
        return state;
    }
};