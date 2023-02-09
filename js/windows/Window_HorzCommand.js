import Window_Command from './Window_Command';
export default class Window_HorzCommand extends Window_Command {
    constructor(x, y) {
        super(x, y);
        this.initialize(x, y);
    }

    initialize(x, y) {
        super.initialize(x, y);
    }

    numVisibleRows() {
        return 1;
    }

    maxCols() {
        return 4;
    }

    itemTextAlign() {
        return 'center';
    }
}
