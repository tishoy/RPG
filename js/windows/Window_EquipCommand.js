import Window_HorzCommand from './Window_HorzCommand'
export default class Window_EquipCommand extends Window_HorzCommand {

    constructor(x, y, width) {
        super(x, y);
        this._windowWidth = width;
        super.initialize();
    }

    windowWidth() {
        return this._windowWidth;
    }

    maxCols() {
        return 3;
    }

    makeCommandList() {
        this.addCommand(TextManager.equip2, 'equip');
        this.addCommand(TextManager.optimize, 'optimize');
        this.addCommand(TextManager.clear, 'clear');
    }
}