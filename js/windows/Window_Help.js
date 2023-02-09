import Window_Base from './Window_Base';
import Graphics from '../core/graphics';
export default class Window_Help extends Window_Base {
    constructor(numLines) {
        super(0, 0);
        this.initialize(numLines);
    }

    initialize(numLines) {
        var width = Graphics.boxWidth;
        var height = this.fittingHeight(numLines || 2);
        super.initialize(0, 0, width, height);
        this._text = '';
    }

    setText(text) {
        if (this._text !== text) {
            this._text = text;
            this.refresh();
        }
    }

    clear() {
        this.setText('');
    }

    setItem(item) {
        this.setText(item ? item.description : '');
    }

    refresh() {
        this.contents.clear();
        this.drawTextEx(this._text, this.textPadding(), 0);
    }
}