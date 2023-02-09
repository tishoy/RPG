import Window_BattleStatus from './Window_BattleStatus';
export default class Window_BattleActor extends Window_BattleStatus {
    constructor(x, y) {
        super();
        this.initialize(x, y);
    }

    initialize(x, y) {
        super.initialize(x, y);
        this.x = x;
        this.y = y;
        this.openness = 255;
        this.hide();
    }

    show() {
        this.select(0);
        super.show();
    }

    hide() {
        super.hide();
        GameGlobal.$gameParty.select(null);
    }

    select(index) {
        super.select(index);
        GameGlobal.$gameParty.select(this.actor());
    }

    actor() {
        return GameGlobal.$gameParty.members()[this.index()];
    }
}