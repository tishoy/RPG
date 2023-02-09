import Window_Selectable from './Window_Selectable'
export default class Window_BattleEnemy extends Window_Selectable {
    constructor(x, y) {
        super(x, y, 0, 0);
        this.initialize(0, 0);
    }

    initialize(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        super.initialize(x, y, width, height)
        this._enemies = [];
        this.refresh();
        this.hide();
    }

    windowWidth() {
        return Graphics.boxWidth - 192;
    }

    windowHeight() {
        return this.fittingHeight(this.numVisibleRows());
    }

    numVisibleRows() {
        return 4;
    }

    maxCols() {
        return 2;
    }

    maxItems() {
        return this._enemies.length;
    }

    enemy() {
        return this._enemies[this.index()];
    }

    enemyIndex() {
        var enemy = this.enemy();
        return enemy ? enemy.index() : -1;
    }

    drawItem(index) {
        this.resetTextColor();
        var name = this._enemies[index].name();
        var rect = this.itemRectForText(index);
        this.drawText(name, rect.x, rect.y, rect.width);
    }

    show() {
        this.refresh();
        this.select(0);
        super.show();
    }

    hide() {
        super.hide();
        GameGlobal.$gameTroop.select(null);
    }

    refresh() {
        this._enemies = GameGlobal.$gameTroop.aliveMembers();
        super.refresh();
    }

    select(index) {
        super.select(index);
        GameGlobal.$gameTroop.select(this.enemy());
    }
}
