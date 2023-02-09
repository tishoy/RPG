import Scene_MenuBase from './Scene_MenuBase';
import Window_NameEdit from '../windows/Window_NameEdit';
import Window_NameInput from '../windows/Window_NameInput'
export default class Scene_Name extends Scene_MenuBase {
    constructor() {
        super();
    }

    prepare(actorId, maxLength) {
        this._actorId = actorId;
        this._maxLength = maxLength;
    }

    create() {
        super.create();
        this._actor = GameGlobal.$gameActors.actor(this._actorId);
        this.createEditWindow();
        this.createInputWindow();
    }

    start() {
        super.start();
        this._editWindow.refresh();
    }

    createEditWindow() {
        this._editWindow = new Window_NameEdit(this._actor, this._maxLength);
        this.addWindow(this._editWindow);
    }

    createInputWindow() {
        this._inputWindow = new Window_NameInput(this._editWindow);
        this._inputWindow.setHandler('ok', this.onInputOk.bind(this));
        this.addWindow(this._inputWindow);
    }

    onInputOk() {
        this._actor.setName(this._editWindow.name());
        this.popScene();
    }
}