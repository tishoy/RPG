import Window_Selectable from './Window_Selectable'
export default class Window_DebugEdit extends Window_Selectable {


    constructor(x, y, width) {
        super(x, y, width, 0);
        this.initialize();
    }

    initialize() {
        var height = this.fittingHeight(10);
        super.height(x, y, this.width, height)
        this._mode = 'switch';
        this._topId = 1;
        this.refresh();
    }

    maxItems() {
        return 10;
    }

    refresh() {
        this.contents.clear();
        this.drawAllItems();
    }

    drawItem(index) {
        var dataId = this._topId + index;
        var idText = dataId.padZero(4) + ':';
        var idWidth = this.textWidth(idText);
        var statusWidth = this.textWidth('-00000000');
        var name = this.itemName(dataId);
        var status = this.itemStatus(dataId);
        var rect = this.itemRectForText(index);
        this.resetTextColor();
        this.drawText(idText, rect.x, rect.y, rect.width);
        rect.x += idWidth;
        rect.width -= idWidth + statusWidth;
        this.drawText(name, rect.x, rect.y, rect.width);
        this.drawText(status, rect.x + rect.width, rect.y, statusWidth, 'right');
    }

    itemName(dataId) {
        if (this._mode === 'switch') {
            return GameGlobal.$dataSystem.switches[dataId];
        } else {
            return GameGlobal.$dataSystem.variables[dataId];
        }
    }

    itemStatus(dataId) {
        if (this._mode === 'switch') {
            return GameGlobal.$gameSwitches.value(dataId) ? '[ON]' : '[OFF]';
        } else {
            return String(GameGlobal.$gameVariables.value(dataId));
        }
    }

    setMode(mode) {
        if (this._mode !== mode) {
            this._mode = mode;
            this.refresh();
        }
    }

    setTopId(id) {
        if (this._topId !== id) {
            this._topId = id;
            this.refresh();
        }
    }

    currentId() {
        return this._topId + this.index();
    }

    update() {
        super.update();
        if (this.active) {
            if (this._mode === 'switch') {
                this.updateSwitch();
            } else {
                this.updateVariable();
            }
        }
    }

    updateSwitch() {
        if (Input.isRepeated('ok')) {
            var switchId = this.currentId();
            SoundManager.playCursor();
            GameGlobal.$gameSwitches.setValue(switchId, !GameGlobal.$gameSwitches.value(switchId));
            this.redrawCurrentItem();
        }
    }

    updateVariable() {
        var variableId = this.currentId();
        var value = GameGlobal.$gameVariables.value(variableId);
        if (typeof value === 'number') {
            if (Input.isRepeated('right')) {
                value++;
            }
            if (Input.isRepeated('left')) {
                value--;
            }
            if (Input.isRepeated('pagedown')) {
                value += 10;
            }
            if (Input.isRepeated('pageup')) {
                value -= 10;
            }
            if (GameGlobal.$gameVariables.value(variableId) !== value) {
                GameGlobal.$gameVariables.setValue(variableId, value);
                SoundManager.playCursor();
                this.redrawCurrentItem();
            }
        }
    }
}