import Game_Event from './Game_Event'
import ABSManager from '../managers/ABSManager'
/**
 * create by 18tech
 * 
 */
export default class Game_Loot extends Game_Event {
    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        super.initialize();
        this.isLoot = true;
        this._decay = E8ABS.lootDecay;
        this._eventId = -1;
        this._gold = null;
        this._loot = null;
        this._noSprite = true;
        this.locate(x, y);
        ABSManager.addEvent(this);
        this.refresh();
    }

    event() {
        return {
            note: ''
        }
    };

    shiftY() {
        return 0;
    };

    setGold(value) {
        this._gold = value;
        this.setIcon(E8ABS.goldIcon);
    };

    setItem(item) {
        this._loot = item;
        this.setIcon(item.iconIndex);
    };

    setIcon(iconIndex) {
        this._iconIndex = iconIndex;
        this._itemIcon = new Sprite_Icon(iconIndex);
        this._itemIcon.move(this._px, this._py);
        this._itemIcon.z = 1;
        this._itemIcon._isFixed = true;
        ABSManager.addPicture(this._itemIcon);
    };

    page() {
        if (!this._lootPage) {
            this._lootPage = {
                conditions: {
                    actorId: 1, actorValid: false,
                    itemId: 1, itemValid: false,
                    selfSwitchCh: 'A', selfSwitchValid: false,
                    switch1Id: 1, switch1Valid: false,
                    switch2Id: 1, switch2Valid: false,
                    variable1Id: 1, variable1Valid: false, variableValue: 0
                },
                image: {
                    characterIndex: 0, characterName: '',
                    direction: 2, pattern: 1, tileId: 0
                },
                moveRoute: {
                    list: [{ code: 0, parameters: [] }],
                    repeat: false, skippable: false, wait: false
                },
                list: [],
                directionFix: false,
                moveFrequency: 4,
                moveSpeed: 3,
                moveType: 0,
                priorityType: 0,
                stepAnime: false,
                through: true,
                trigger: E8ABS.lootTrigger,
                walkAnime: true
            };
            this._lootPage.list = [];
            this._lootPage.list.push({
                code: 355,
                indent: 0,
                parameters: ['this.character().collectDrops();']
            });
            this._lootPage.list.push({
                code: 0,
                indent: 0,
                parameters: [0]
            });
        }
        return this._lootPage;
    };

    findProperPageIndex() {
        return 0;
    };

    collectDrops() {
        if (E8ABS.aoeLoot) {
            return this.aoeCollect();
        }
        if (this._loot) GameGlobal.$gameParty.gainItem(this._loot, 1);
        if (this._gold) GameGlobal.$gameParty.gainGold(this._gold);
        var string = this._gold ? String(this._gold) : this._loot.name;
        if (this._iconIndex) {
            string = '\\I[' + this._iconIndex + ']' + string;
        }
        ABSManager.startPopup('E8ABS-ITEM', {
            x: this.cx(), y: this.cy(),
            string: string
        });
        this.erase();
        ABSManager.removeEvent(this);
        ABSManager.removePicture(this._itemIcon);
    };

    aoeCollect() {
        var loot = ColliderManager.getCharactersNear(this.collider(), function (chara) {
            return chara.constructor === Game_Loot &&
                chara.collider().intersects(this.collider());
        }.bind(this));
        var x = this.cx();
        var y = this.cy();
        var totalLoot = [];
        var totalGold = 0;
        var i;
        for (i = 0; i < loot.length; i++) {
            if (loot[i]._loot) totalLoot.push(loot[i]._loot);
            if (loot[i]._gold) totalGold += loot[i]._gold;
            ABSManager.removeEvent(loot[i]);
            ABSManager.removePicture(loot[i]._itemIcon);
        }
        var display = {};
        for (i = 0; i < totalLoot.length; i++) {
            var item = totalLoot[i];
            GameGlobal.$gameParty.gainItem(item, 1);
            display[item.name] = display[item.name] || {};
            display[item.name].iconIndex = item.iconIndex;
            display[item.name].total = display[item.name].total + 1 || 1;
        }
        for (var name in display) {
            var iconIndex = display[name].iconIndex;
            var string = 'x' + display[name].total + ' ' + name;
            if (iconIndex) {
                string = '\\I[' + iconIndex + ']' + string;
            }
            ABSManager.startPopup('E8ABS-ITEM', {
                x: x, y: y,
                string: string
            });
            y += 22;
        }
        if (totalGold > 0) {
            GameGlobal.$gameParty.gainGold(totalGold);
            var string = String(totalGold);
            if (E8ABS.goldIcon) {
                string = '\\I[' + E8ABS.goldIcon + ']' + string;
            }
            ABSManager.startPopup('E8ABS-ITEM', {
                x: x, y: y,
                string: string
            });
        }
    };

    update() {
        if (this._decay <= 0) {
            this.erase();
            ABSManager.removeEvent(this);
            ABSManager.removePicture(this._itemIcon);
            return;
        }
        this._decay--;
    };

    defaultColliderConfig() {
        return 'box,48,48,-8,-8';
    };

    castsShadow() {
        return false;
    };

    GetConstructorType () {
        return "Game_Loot";
    }
}