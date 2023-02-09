import Window_HorzCommand from './Window_HorzCommand';
import TextManager from '../managers/TextManager'
import Graphics from '../core/graphics'
export default class Window_ItemCategory extends Window_HorzCommand {
    constructor() {
        super(0, 0);
        super.initialize();
    }

    windowWidth() {
        return Graphics.boxWidth;
    }

    maxCols() {
        return 4;
    }

    update() {
        super.update();
        if (this._itemWindow) {
            this._itemWindow.setCategory(this.currentSymbol());
        }
    }

    makeCommandList() {
        this.addCommand(TextManager.item, 'item');
        this.addCommand(TextManager.weapon, 'weapon');
        this.addCommand(TextManager.armor, 'armor');
        this.addCommand(TextManager.keyItem, 'keyItem');
    }

    setItemWindow(itemWindow) {
        this._itemWindow = itemWindow;
    }
}