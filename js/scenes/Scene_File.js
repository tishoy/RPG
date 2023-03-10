import Scene_MenuBase from './Scene_MenuBase'
import DataManager from '../managers/DataManager'
/**
 * create by 18tech
 */
export default class Scene_File extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
        DataManager.loadAllSavefileImages();
        this.createHelpWindow();
        this.createListWindow();
    }

    start() {
        super.start();
        this._listWindow.refresh();
    }

    savefileId() {
        return this._listWindow.index() + 1;
    }

    createHelpWindow() {
        this._helpWindow = new Window_Help(1);
        this._helpWindow.setText(this.helpWindowText());
        this.addWindow(this._helpWindow);
    }

    createListWindow() {
        var x = 0;
        var y = this._helpWindow.height;
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight - y;
        this._listWindow = new Window_SavefileList(x, y, width, height);
        this._listWindow.setHandler('ok', this.onSavefileOk.bind(this));
        this._listWindow.setHandler('cancel', this.popScene.bind(this));
        this._listWindow.select(this.firstSavefileIndex());
        this._listWindow.setTopRow(this.firstSavefileIndex() - 2);
        this._listWindow.setMode(this.mode());
        this._listWindow.refresh();
        this.addWindow(this._listWindow);
    }

    mode() {
        return null;
    }

    activateListWindow() {
        this._listWindow.activate();
    }

    helpWindowText() {
        return '';
    }

    firstSavefileIndex() {
        return 0;
    }

    onSavefileOk() {
    }
}