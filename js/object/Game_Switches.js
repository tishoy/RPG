/**
 * create by 18tech
 */
export default class Game_Switches {
    constructor() {
        this.initialize();
    }


    initialize() {
        this.clear();
    }

    clear() {
        this._data = [];
    }

    value(switchId) {
        return !!this._data[switchId];
    }

    setValue(switchId, value) {
        if (switchId > 0 && switchId < GameGlobal.$dataSystem.switches.length) {
            this._data[switchId] = value;
            this.onChange();
        }
    }

    onChange() {
        GameGlobal.$gameMap.requestRefresh();
    }
}