import Scene_MenuBase from './Scene_MenuBase';
import Window_Status from '../windows/Window_Status';
export default class Scene_Status extends Scene_MenuBase {

    constructor() {
       super();
    }

    create() {
        super.create();
        this._statusWindow = new Window_Status();
        this._statusWindow.setHandler('cancel', this.popScene.bind(this));
        this._statusWindow.setHandler('pagedown', this.nextActor.bind(this));
        this._statusWindow.setHandler('pageup', this.previousActor.bind(this));
        this._statusWindow.reserveFaceImages();
        this.addWindow(this._statusWindow);
    }

    start() {
        super.start();
        this.refreshActor();
    }

    refreshActor() {
        var actor = this.actor();
        this._statusWindow.setActor(actor);
    }

    onActorChange() {
        this.refreshActor();
        this._statusWindow.activate();
    }
}