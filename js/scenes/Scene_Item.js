import Scene_Equip from './Scene_Equip'
export default class Scene_Item extends Scene_Equip {
    constructor() {
        super();
    }

    create() {
        super.create();
        this.createHelpWindow();
        this.createCategoryWindow();
        this.createItemWindow();
        this.createActorWindow();
    }

    createCategoryWindow() {
        this._categoryWindow = new Window_ItemCategory();
        this._categoryWindow.setHelpWindow(this._helpWindow);
        this._categoryWindow.y = this._helpWindow.height;
        this._categoryWindow.setHandler('ok', this.onCategoryOk.bind(this));
        this._categoryWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._categoryWindow);
    }

    createItemWindow() {
        var wy = this._categoryWindow.y + this._categoryWindow.height;
        var wh = Graphics.boxHeight - wy;
        this._itemWindow = new Window_ItemList(0, wy, Graphics.boxWidth, wh);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok', this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
        this.addWindow(this._itemWindow);
        this._categoryWindow.setItemWindow(this._itemWindow);
    }

    user() {
        var members = GameGlobal.$gameParty.movableMembers();
        var bestActor = members[0];
        var bestPha = 0;
        for (var i = 0; i < members.length; i++) {
            if (members[i].pha > bestPha) {
                bestPha = members[i].pha;
                bestActor = members[i];
            }
        }
        return bestActor;
    }

    onCategoryOk() {
        this._itemWindow.activate();
        this._itemWindow.selectLast();
    }

    onItemOk() {
        GameGlobal.$gameParty.setLastItem(this.item());
        this.determineItem();
    }

    onItemCancel() {
        this._itemWindow.deselect();
        this._categoryWindow.activate();
    }

    playSeForItem() {
        SoundManager.playUseItem();
    }

    useItem() {
        super.useItem();
        this._itemWindow.redrawCurrentItem();
    }
}