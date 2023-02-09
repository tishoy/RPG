import Window_Selectable from './Window_Selectable'
export default class Window_Command extends Window_Selectable {

    constructor(x, y) {
        super(x, y);
        if ( this.constructor === Window_Command) {
            this.initialize(x, y);
        }
    }

    initialize(x, y) {
        this.clearCommandList();
        this.makeCommandList();
        var width = this.windowWidth();
        var height = this.windowHeight();
        super.initialize(x, y, width, height);
        this.refresh();
        this.select(0);
        this.activate();
    }

    windowWidth() {
        return 240;
    }

    windowHeight() {
        let result = Math.ceil(this.maxItems() / this.maxCols());
        return this.fittingHeight(result);
    }

    numVisibleRows() {
        return Math.ceil(this.maxItems() / this.maxCols());
    }

    maxItems() {
        return this._list.length;
    }

    clearCommandList() {
        this._list = [];
    }

    makeCommandList() {
    }

    addCommand(name, symbol, enabled, ext) {
        if (enabled === undefined) {
            enabled = true;
        }
        if (ext === undefined) {
            ext = null;
        }
        this._list.push({ name: name, symbol: symbol, enabled: enabled, ext: ext });
    }

    commandName(index) {
        return this._list[index].name;
    }

    commandSymbol(index) {
        return this._list[index].symbol;
    }

    isCommandEnabled(index) {
        return this._list[index].enabled;
    }

    currentData() {
        return this.index() >= 0 ? this._list[this.index()] : null;
    }

    isCurrentItemEnabled() {
        return this.currentData() ? this.currentData().enabled : false;
    }

    currentSymbol() {
        return this.currentData() ? this.currentData().symbol : null;
    }

    currentExt() {
        return this.currentData() ? this.currentData().ext : null;
    }

    findSymbol(symbol) {
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].symbol === symbol) {
                return i;
            }
        }
        return -1;
    }

    selectSymbol(symbol) {
        var index = this.findSymbol(symbol);
        if (index >= 0) {
            this.select(index);
        } else {
            this.select(0);
        }
    }

    findExt(ext) {
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].ext === ext) {
                return i;
            }
        }
        return -1;
    }

    selectExt(ext) {
        var index = this.findExt(ext);
        if (index >= 0) {
            this.select(index);
        } else {
            this.select(0);
        }
    }

    drawItem(index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandSymbol(index), rect.x, rect.y, rect.width, align);
    }

    itemTextAlign() {
        return 'left';
    }

    isOkEnabled() {
        return true;
    }

    callOkHandler() {
        var symbol = this.currentSymbol();
        if (this.isHandled(symbol)) {
            this.callHandler(symbol);
        } else if (this.isHandled('ok')) {
            super.callOkHandler();
        } else {
            this.activate();
        }
    }

    refresh() {
        this.clearCommandList();
        this.makeCommandList();
        this.createContents();
        super.refresh();
    }
}