import DataManager from '../managers/DataManager'
/**
 * create by 18tech
 */
export default class Game_Item {
    constructor() {
        this.initialize()
    }

    initialize(item) {
        this._dataClass = '';
        this._itemId = 0;
        if (item) {
            this.setObject(item);
        }
    }

    isSkill() {
        return this._dataClass === 'skill';
    }

    isItem() {
        return this._dataClass === 'item';
    }

    isUsableItem() {
        return this.isSkill() || this.isItem();
    }

    isWeapon() {
        return this._dataClass === 'weapon';
    }

    isArmor() {
        return this._dataClass === 'armor';
    }

    isEquipItem() {
        return this.isWeapon() || this.isArmor();
    }

    isNull() {
        return this._dataClass === '';
    }

    itemId() {
        return this._itemId;
    }

    object() {
        if (this.isSkill()) {
            return GameGlobal.$dataSkills[this._itemId];
        } else if (this.isItem()) {
            return GameGlobal.$dataItems[this._itemId];
        } else if (this.isWeapon()) {
            return GameGlobal.$dataWeapons[this._itemId];
        } else if (this.isArmor()) {
            return GameGlobal.$dataArmors[this._itemId];
        } else {
            return null;
        }
    }

    setObject(item) {
        if (DataManager.isSkill(item)) {
            this._dataClass = 'skill';
        } else if (DataManager.isItem(item)) {
            this._dataClass = 'item';
        } else if (DataManager.isWeapon(item)) {
            this._dataClass = 'weapon';
        } else if (DataManager.isArmor(item)) {
            this._dataClass = 'armor';
        } else {
            this._dataClass = '';
        }
        this._itemId = item ? item.id : 0;
    }

    setEquip(isWeapon, itemId) {
        this._dataClass = isWeapon ? 'weapon' : 'armor';
        this._itemId = itemId;
    }
}