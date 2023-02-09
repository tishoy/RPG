/**
 * create by 18tech
 */
export default class Game_Timer {
    constructor() {
        this.initialize();
    }


    initialize() {
        this._frames = 0;
        this._working = false;
    }

    update(sceneActive) {
        if (sceneActive && this._working && this._frames > 0) {
            this._frames--;
            if (this._frames === 0) {
                this.onExpire();
            }
        }
    }

    start(count) {
        this._frames = count;
        this._working = true;
    }

    stop() {
        this._working = false;
    }

    isWorking() {
        return this._working;
    }

    seconds() {
        return Math.floor(this._frames / 60);
    }

    onExpire() {
        // BattleManager.abort();
    }
}