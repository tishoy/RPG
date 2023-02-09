import Scene_MenuBase from './Scene_MenuBase';
import Window_Options from '../windows/Window_Options'
export default class Scene_Options extends Scene_MenuBase {

    constructor() {
        super();
    }

    create() {
        super.create();
        this.createOptionsWindow();
    }

    terminate() {
        super.terminate();
        ConfigManager.save();
    }

    createOptionsWindow() {
        this._optionsWindow = new Window_Options();
        this._optionsWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._optionsWindow);
    }
}
