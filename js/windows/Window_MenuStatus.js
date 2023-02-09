import Window_Selectable from './Window_Selectable'
export default class Window_MenuStatus extends Window_Selectable {

    constructor(x, y) {
        var width = Window_MenuStatus.windowWidth();
        var height = Window_MenuStatus.windowHeight();
        super(x, y, width, height);
        this._formationMode = false;
        this._pendingIndex = -1;
        this.refresh();
    }

    static windowWidth() {
        return Graphics.boxWidth - 240;
    }

    static windowHeight() {
        return Graphics.boxHeight;
    }

    maxItems() {
        return GameGlobal.$gameParty.size();
    }

    itemHeight() {
        var clientHeight = this.height - this.padding * 2;
        return Math.floor(clientHeight / this.numVisibleRows());
    }

    numVisibleRows() {
        return 4;
    }

    loadImages() {
        GameGlobal.$gameParty.members().forEach(function (actor) {
            ImageManager.reserveFace(actor.faceName());
        }, this);
    }

    drawItem(index) {
        this.drawItemBackground(index);
        this.drawItemImage(index);
        this.drawItemStatus(index);
    }

    drawItemBackground(index) {
        if (index === this._pendingIndex) {
            var rect = this.itemRect(index);
            var color = this.pendingColor();
            this.changePaintOpacity(false);
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
            this.changePaintOpacity(true);
        }
    }

    drawItemImage(index) {
        var actor = GameGlobal.$gameParty.members()[index];
        var rect = this.itemRect(index);
        this.changePaintOpacity(actor.isBattleMember());
        this.drawActorFace(actor, rect.x + 1, rect.y + 1, Window_Base._faceWidth, Window_Base._faceHeight);
        this.changePaintOpacity(true);
    }

    drawItemStatus(index) {
        var actor = GameGlobal.$gameParty.members()[index];
        var rect = this.itemRect(index);
        var x = rect.x + 162;
        var y = rect.y + rect.height / 2 - this.lineHeight() * 1.5;
        var width = rect.width - x - this.textPadding();
        this.drawActorSimpleStatus(actor, x, y, width);
    }

    processOk() {
        super.processOk();
        GameGlobal.$gameParty.setMenuActor(GameGlobal.$gameParty.members()[this.index()]);
    }

    isCurrentItemEnabled() {
        if (this._formationMode) {
            var actor = GameGlobal.$gameParty.members()[this.index()];
            return actor && actor.isFormationChangeOk();
        } else {
            return true;
        }
    }

    selectLast() {
        this.select(GameGlobal.$gameParty.menuActor().index() || 0);
    }

    formationMode() {
        return this._formationMode;
    }

    setFormationMode(formationMode) {
        this._formationMode = formationMode;
    }

    pendingIndex() {
        return this._pendingIndex;
    }

    setPendingIndex(index) {
        var lastPendingIndex = this._pendingIndex;
        this._pendingIndex = index;
        this.redrawItem(this._pendingIndex);
        this.redrawItem(lastPendingIndex);
    }
}