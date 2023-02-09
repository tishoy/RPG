
/**
 * create by 18tech
 */
export default class Game_Variables {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.clear();
    }

    clear() {
        this._data = [];
    }

    value(variableId) {
        return this._data[variableId] || 0;
    }

    setValue(variableId, value) {
        if (variableId > 0 && variableId < GameGlobal.$dataSystem.variables.length) {
            if (typeof value === 'number') {
                value = Math.floor(value);
            }
            this._data[variableId] = value;
            this.onChange();
        }
    }

    onChange() {
        GameGlobal.$gameMap.requestRefresh();
    }
}
