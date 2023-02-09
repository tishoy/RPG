import Scene_Base from './Scene_Base';
import Sprite from '../core/sprite';
import Window_Help from '../windows/Window_Help';
import SceneManager from '../managers/SceneManager';
export default class Scene_MenuBase extends Scene_Base {

    constructor() {
        super();
    }

    create() {
        super.create();
        this.createBackground();
        this.updateActor();
        this.createWindowLayer();
    }

    actor() {
        return this._actor;
    }

    updateActor() {
        this._actor = GameGlobal.$gameParty.menuActor();
    }

    createBackground() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
    }

    setBackgroundOpacity(opacity) {
        this._backgroundSprite.opacity = opacity;
    }

    createHelpWindow() {
        this._helpWindow = new Window_Help();
        this.addWindow(this._helpWindow);
    }

    nextActor() {
        GameGlobal.$gameParty.makeMenuActorNext();
        this.updateActor();
        this.onActorChange();
    }

    previousActor() {
        GameGlobal.$gameParty.makeMenuActorPrevious();
        this.updateActor();
        this.onActorChange();
    }

    onActorChange() {
    }
}