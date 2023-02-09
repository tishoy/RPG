
import Window_HorzCommand from '../windows/Window_HorzCommand'
import TextManager from '../managers/TextManager'
export default class Window_ShopCommand extends Window_HorzCommand {

    constructor(width, purchaseOnly) {
        super(0, 0);
        this._windowWidth = width;
        this._purchaseOnly = purchaseOnly;
        this.initialize();
    }

    initialize() {
        super.initialize();
    }

    windowWidth() {
        return this._windowWidth;
    }

    maxCols() {
        return 3;
    }

    makeCommandList() {
        this.addCommand(TextManager.buy, 'buy');
        this.addCommand(TextManager.sell, 'sell', !this._purchaseOnly);
        this.addCommand(TextManager.cancel, 'cancel');
    }
}
