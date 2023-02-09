import Window_Base from './Window_Base';
import TextManager from '../managers/TextManager'
export default class Window_Gold extends Window_Base {

    constructor(x, y) {
        super();
        this.initialize(x, y);
    }

    initialize(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        super.initialize(x, y, width, height);
        this.refresh();
    }

    windowWidth() {
        return 240;
    }

    windowHeight() {
        return this.fittingHeight(1);
    }

    refresh() {
        var x = this.textPadding();
        var width = this.contents.width - this.textPadding() * 2;
        this.contents.clear();
        this.drawCurrencyValue(this.value(), this.currencyUnit(), x, 0, width);
    }

    value() {
        return GameGlobal.$gameParty.gold();
    }

    currencyUnit() {
        return TextManager.currencyUnit;
    }

    open() {
        this.refresh();
        super.open();
    }
}