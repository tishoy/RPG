import Game_Action from '../object/Game_Action'
import Scene_MenuBase from './Scene_MenuBase'
export default class Scene_ItemBase extends Scene_MenuBase {
    constructor() {
        super();
    }

    create() {
        super.create();
    }

    createActorWindow() {
        this._actorWindow = new Window_MenuActor();
        this._actorWindow.setHandler('ok', this.onActorOk.bind(this));
        this._actorWindow.setHandler('cancel', this.onActorCancel.bind(this));
        this.addWindow(this._actorWindow);
    }

    item() {
        return this._itemWindow.item();
    }

    user() {
        return null;
    }

    isCursorLeft() {
        return this._itemWindow.index() % 2 === 0;
    }

    showSubWindow(window) {
        window.x = this.isCursorLeft() ? Graphics.boxWidth - window.width : 0;
        window.show();
        window.activate();
    }

    hideSubWindow(window) {
        window.hide();
        window.deactivate();
        this.activateItemWindow();
    }

    onActorOk() {
        if (this.canUse()) {
            this.useItem();
        } else {
            SoundManager.playBuzzer();
        }
    }

    onActorCancel() {
        this.hideSubWindow(this._actorWindow);
    }

    determineItem() {
        var action = new Game_Action(this.user());
        var item = this.item();
        action.setItemObject(item);
        if (action.isForFriend()) {
            this.showSubWindow(this._actorWindow);
            this._actorWindow.selectForItem(this.item());
        } else {
            this.useItem();
            this.activateItemWindow();
        }
    }

    useItem() {
        this.playSeForItem();
        this.user().useItem(this.item());
        this.applyItem();
        this.checkCommonEvent();
        this.checkGameover();
        this._actorWindow.refresh();
    }

    activateItemWindow() {
        this._itemWindow.refresh();
        this._itemWindow.activate();
    }

    itemTargetActors() {
        var action = new Game_Action(this.user());
        action.setItemObject(this.item());
        if (!action.isForFriend()) {
            return [];
        } else if (action.isForAll()) {
            return GameGlobal.$gameParty.members();
        } else {
            return [$gameParty.members()[this._actorWindow.index()]];
        }
    }

    canUse() {
        return this.user().canUse(this.item()) && this.isItemEffectsValid();
    }

    isItemEffectsValid() {
        var action = new Game_Action(this.user());
        action.setItemObject(this.item());
        return this.itemTargetActors().some(function (target) {
            return action.testApply(target);
        }, this);
    }

    applyItem() {
        var action = new Game_Action(this.user());
        action.setItemObject(this.item());
        this.itemTargetActors().forEach(function (target) {
            for (var i = 0; i < action.numRepeats(); i++) {
                action.apply(target);
            }
        }, this);
        action.applyGlobal();
    }

    checkCommonEvent() {
        if (GameGlobal.$gameTemp.isCommonEventReserved()) {
            SceneManager.goto(Scene_Map);
        }
    }
}