import Window_Base from './Window_Base'
import DataManager from '../managers/DataManager'
import SoundManager from '../managers/SoundManager'
export default class Window_ShopStatus extends Window_Base {

    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.initialize(x, y, width, height);
    }

    initialize(x, y, width, height) {
        super.initialize(x, y, width, height)
        this._item = null;
        this._pageIndex = 0;
        this.refresh();
    }

    refresh() {
        this.contents.clear();
        if (this._item) {
            var x = this.textPadding();
            this.drawPossession(x, 0);
            if (this.isEquipItem()) {
                this.drawEquipInfo(x, this.lineHeight() * 2);
            }
        }
    }

    setItem(item) {
        this._item = item;
        this.refresh();
    }

    isEquipItem() {
        return DataManager.isWeapon(this._item) || DataManager.isArmor(this._item);
    }

    drawPossession(x, y) {
        var width = this.contents.width - this.textPadding() - x;
        var possessionWidth = this.textWidth('0000');
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.possession, x, y, width - possessionWidth);
        this.resetTextColor();
        this.drawText(GameGlobal.$gameParty.numItems(this._item), x, y, width, 'right');
    }

    drawEquipInfo(x, y) {
        var members = this.statusMembers();
        for (var i = 0; i < members.length; i++) {
            this.drawActorEquipInfo(x, y + this.lineHeight() * (i * 2.4), members[i]);
        }
    }

    statusMembers() {
        var start = this._pageIndex * this.pageSize();
        var end = start + this.pageSize();
        return GameGlobal.$gameParty.members().slice(start, end);
    }

    pageSize() {
        return 4;
    }

    maxPages() {
        return Math.floor((GameGlobal.$gameParty.size() + this.pageSize() - 1) / this.pageSize());
    }

    drawActorEquipInfo(x, y, actor) {
        var enabled = actor.canEquip(this._item);
        this.changePaintOpacity(enabled);
        this.resetTextColor();
        this.drawText(actor.name(), x, y, 168);
        var item1 = this.currentEquippedItem(actor, this._item.etypeId);
        if (enabled) {
            this.drawActorParamChange(x, y, actor, item1);
        }
        this.drawItemName(item1, x, y + this.lineHeight());
        this.changePaintOpacity(true);
    }

    drawActorParamChange(x, y, actor, item1) {
        var width = this.contents.width - this.textPadding() - x;
        var paramId = this.paramId();
        var change = this._item.params[paramId] - (item1 ? item1.params[paramId] : 0);
        this.changeTextColor(this.paramchangeTextColor(change));
        this.drawText((change > 0 ? '+' : '') + change, x, y, width, 'right');
    }

    paramId() {
        return DataManager.isWeapon(this._item) ? 2 : 3;
    }

    currentEquippedItem(actor, etypeId) {
        var list = [];
        var equips = actor.equips();
        var slots = actor.equipSlots();
        for (var i = 0; i < slots.length; i++) {
            if (slots[i] === etypeId) {
                list.push(equips[i]);
            }
        }
        var paramId = this.paramId();
        var worstParam = Number.MAX_VALUE;
        var worstItem = null;
        for (var j = 0; j < list.length; j++) {
            if (list[j] && list[j].params[paramId] < worstParam) {
                worstParam = list[j].params[paramId];
                worstItem = list[j];
            }
        }
        return worstItem;
    }

    update() {
        super.update();
        this.updatePage();
    }

    updatePage() {
        if (this.isPageChangeEnabled() && this.isPageChangeRequested()) {
            this.changePage();
        }
    }

    isPageChangeEnabled() {
        return this.visible && this.maxPages() >= 2;
    }

    isPageChangeRequested() {
        if (Input.isTriggered('shift')) {
            return true;
        }
        if (TouchInput.isTriggered() && this.isTouchedInsideFrame()) {
            return true;
        }
        return false;
    }

    isTouchedInsideFrame() {
        var x = this.canvasToLocalX(TouchInput.x);
        var y = this.canvasToLocalY(TouchInput.y);
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    }

    changePage() {
        this._pageIndex = (this._pageIndex + 1) % this.maxPages();
        this.refresh();
        SoundManager.playCursor();
    }
}