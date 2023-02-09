import E8Plus from '../18ext/E8Plus'
export default class Game_CharacterAgro {
    constructor(charaId) {
        this.initialize(charaId);
    }

    agroTimer = 300;

    initialize(charaId) {
        this._charaId = charaId;
        this.clear();
    }


    clear() {
        this._agrod = 0;
        this._points = {};
        this._tick = {};
        this._total = 0;
        this._highest = null;
        this._recalcHighest = false;
    };

    has(charaId) {
        return !!this._points[charaId];
    };

    inCombat() {
        return this._agrod > 0 || this._total > 0;
    };

    character() {
        return E8Plus.getCharacter(this._charaId) || null;
    };

    highest() {
        if (this._recalcHighest) {
            this.calcHighest();
        }
        return this._highest;
    };

    add(charaId, amount) {
        this._points[charaId] = this._points[charaId] ? this._points[charaId] + amount : amount;
        this._tick[charaId] = Game_CharacterAgro.agroTimer;
        var points = this._points[charaId];
        this._total += amount;
        this._recalcHighest = true;
    };

    remove(charaId) {
        this._total -= this._points[charaId] || 0;
        delete this._points[charaId];
        delete this._tick[charaId];
        this._recalcHighest = true;
    };

    placeInCombat() {
        this._agro = Game_CharacterAgro.agroTimer;
    };

    calcHighest() {
        var highest = 0;
        var highestId = null;
        for (var charaId in this._points) {
            if (this._points[charaId] > highest) {
                highest = this._points[charaId];
                highestId = charaId;
            }
        }
        this._highest = highestId ? E8Plus.getCharacter(highestId) : null;
        this._recalcHighest = false;
    };

    update() {
        for (var charaId in this._tick) {
            this._tick[charaId] = this._tick[charaId] - 1;
            if (this._tick[charaId] === 0) {
                this.remove(charaId);
            }
        }
        if (this._agro > 0) this._agro--;
    };
}