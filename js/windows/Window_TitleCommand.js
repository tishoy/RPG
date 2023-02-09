import Window_Command from './Window_Command';
import DataManager from '../managers/DataManager'
import TextManager from '../managers/TextManager'
import Graphics from '../core/graphics'

export default class Window_TitleCommand extends Window_Command {

    constructor() {
        super(0, 0);
        this.initialize();
    }

    initialize() {
        super.initialize(0, 0);
        this.updatePlacement();
        this.openness = 0;
        this.selectLast();
    }

    static _lastCommandSymbol = null;

    static initCommandPosition() {
        Window_TitleCommand._lastCommandSymbol = null;
    }

    windowWidth() {
        return 240;
    }

    updatePlacement() {
        this.x = (Graphics.boxWidth - this.width) / 2;
        this.y = Graphics.boxHeight - this.height ;
    }

    makeCommandList() {
        this.addCommand(TextManager.newGame, 'newGame');
        this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
        this.addCommand(TextManager.options, 'options');
    }

    isContinueEnabled() {
        return DataManager.isAnySavefileExists();
    }

    processOk() {
        Window_TitleCommand._lastCommandSymbol = this.currentSymbol();
        super.processOk();
    }

    selectLast() {
        if (Window_TitleCommand._lastCommandSymbol) {
            this.selectSymbol(Window_TitleCommand._lastCommandSymbol);
        } else if (this.isContinueEnabled()) {
            this.selectSymbol('continue');
        }
    }
}