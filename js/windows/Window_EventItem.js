import Window_ItemList from './Window_ItemList';
import Graphics from '../core/graphics'
export default class Window_EventItem extends Window_ItemList {

    constructor(messageWindow) {
        super();
        this.initialize(messageWindow);
    }

    initialize(messageWindow) {
        var width = Graphics.boxWidth;
        var height = this.windowHeight();
        super.initialize(0, 0, width, height);
        this._messageWindow = messageWindow;
        this.openness = 0;
        this.deactivate();
        this.setHandler('ok', this.onOk.bind(this));
        this.setHandler('cancel', this.onCancel.bind(this));
    }

    windowHeight() {
        return this.fittingHeight(this.numVisibleRows());
    }

    numVisibleRows() {
        return 4;
    }

    start() {
        this.refresh();
        this.updatePlacement();
        this.select(0);
        this.open();
        this.activate();
    }

    updatePlacement() {
        if (this._messageWindow.y >= Graphics.boxHeight / 2) {
            this.y = 0;
        } else {
            this.y = Graphics.boxHeight - this.height;
        }
    }

    includes(item) {
        var itypeId = GameGlobal.$gameMessage.itemChoiceItypeId();
        return DataManager.isItem(item) && item.itypeId === itypeId;
    }

    isEnabled(item) {
        return true;
    }

    onOk() {
        var item = this.item();
        var itemId = item ? item.id : 0;
        GameGlobal.$gameVariables.setValue(GameGlobal.$gameMessage.itemChoiceVariableId(), itemId);
        this._messageWindow.terminateMessage();
        this.close();
    }

    onCancel() {
        GameGlobal.$gameVariables.setValue(GameGlobal.$gameMessage.itemChoiceVariableId(), 0);
        this._messageWindow.terminateMessage();
        this.close();
    }
}