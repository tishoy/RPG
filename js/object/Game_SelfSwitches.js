
/**
 * create by 18tech
 */
export default class Game_SelfSwitches {
    constructor() {


        this.initialize()
    }

    initialize() {
        this.clear();
    }

    clear() {
        this._data = {}
    }

    value(key) {
        return !!this._data[key];
    }

    setValue(key, value) {
        if (value) {
            this._data[key] = true;
        } else {
            delete this._data[key];
        }
        this.onChange();
    }

    onChange() {
        GameGlobal.$gameMap.requestRefresh();
    }
}