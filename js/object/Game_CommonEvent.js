import Game_Interpreter from './Game_Interpreter'

/**
 * create by 18tech
 */
export default class Game_CommonEvent {

    constructor(commonEventId) {
        this._commonEventId = commonEventId;
        this.refresh();
    }

    event() {
        return GameGlobal.$dataCommonEvents[this._commonEventId];
    }

    list() {
        return this.event().list;
    }

    refresh() {
        if (this.isActive()) {
            if (!this._interpreter) {
                this._interpreter = new Game_Interpreter();
            }
        } else {
            this._interpreter = null;
        }
    }


    isActive() {
        var event = this.event();
        return event.trigger === 2 && GameGlobal.$gameSwitches.value(event.switchId);
    }

    update() {
        if (this._interpreter) {
            if (!this._interpreter.isRunning()) {
                this._interpreter.setup(this.list());
            }
            this._interpreter.update();
        }

    }
}