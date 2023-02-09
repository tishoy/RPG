import Game_Actor from './Game_Actor';
/**
 * create by 18tech
 */
export default class Game_Actors {
    constructor() {
        this._data = [];
    };

    actor(actorId) {
        if (GameGlobal.$dataActors[actorId]) {
            if (!this._data[actorId]) {
                this._data[actorId] = new Game_Actor(actorId);
            }
            return this._data[actorId];
        }
        return null;
    }
}