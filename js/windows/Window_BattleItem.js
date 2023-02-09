import Window_ItemList from './Window_ItemList';
export default class Window_BattleItem extends Window_ItemList {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.initialize(x, y, width, height);
    }

    initialize(x, y, width, height) {
        super.initialize(x, y, width, height);
        this.hide();
    }

    includes(item) {
        return GameGlobal.$gameParty.canUse(item);
    }

    show() {
        this.selectLast();
        this.showHelpWindow();
        super.show();
    }

    hide() {
        this.hideHelpWindow();
        super.hide()
    }
}