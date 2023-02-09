/**
 * 
 */
import Sprite_Base from './Sprite_Base'
import Bitmap from '../core/Bitmap'
import ImageManager from '../managers/ImageManager'
import Window_Base from '../Window_Base'
import * as PIXI from '../libs/pixi'
export default class Sprite_SkillInfo extends Sprite_Base {
    constructor(skillId) {
        super();
        this.initialize(skillId);
    }

    initialize(skillId) {
        super.initialize();
        this.width = 200;
        this.height = 250;
        this.y = -this.height;
        this._skillId = skillId;
        this._skill = GameGlobal.$dataSkills[skillId];
        this.drawInfo();
    }


    set(skillId) {
        if (this._skillId === skillId) return;
        this._skillId = skillId;
        this._skill = GameGlobal.$dataSkills[skillId];
        this.drawInfo();
    };

    createBackground() {
        this.bitmap = new Bitmap(this.width, this.height);
        this.bitmap.fillAll('rgba(0, 0, 0, 0.8)');
    };

    drawInfo() {
        this.createBackground();
        if (!this._skill) return;
        this._realHeight = 4;
        // Draw the details
        this.drawName(0, 0);
        this.drawIcon(2, 36);
        this.drawAbsSettings(40, 36);
        this.drawDescription(4, this._realHeight);
        this.drawLine(this._realHeight + 2);
        this.drawData(4, this._realHeight);
        // Resize to fit height
        this.height = this._realHeight + 4;
        this.y = -this.height;
    };

    drawName(x, y) {
        this.bitmap.fontSize = 28;
        this.bitmap.textColor = '#ffffa0';
        this.bitmap.drawText(this._skill.name, x, y, this.width, 36, 'center');
        this._realHeight = Math.max(y + 28, this._realHeight);
    };

    drawIcon(x, y) {
        var iconIndex = this._skill.iconIndex;
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.bitmap.blt(bitmap, sx, sy, pw, ph, x, y);
        this._realHeight = Math.max(y + 32, this._realHeight);
    };

    drawAbsSettings(x, y) {
        var abs = QABS.getSkillSettings(this._skill);
        var w = this.width - x - 4; // 4 is padding
        this.bitmap.fontSize = 14;
        var cooldown = abs.cooldown / 60;
        var range = abs.range;
        var mpCost = this._skill.mpCost;
        var tpCost = this._skill.tpCost;
        var i = 0;
        var l = 18; // line height
        if (cooldown !== 0) {
            this.bitmap.textColor = '#ffffa0';
            var w2 = this.bitmap.measureTextWidth(cooldown);
            this.bitmap.drawText('Cooldown: ', x - w2, y + l * i, w, l, 'right');
            this.bitmap.textColor = '#ffffff';
            this.bitmap.drawText(cooldown, x, y + l * i, w, l, 'right');
            i++;
        }
        if (range !== 0) {
            this.bitmap.textColor = '#ffffa0';
            var w2 = this.bitmap.measureTextWidth(range);
            this.bitmap.drawText('Range: ', x - w2, y + l * i, w, l, 'right');
            this.bitmap.textColor = '#ffffff';
            this.bitmap.drawText(range, x, y + l * i, w, l, 'right');
            i++;
        }
        if (mpCost !== 0) {
            this.bitmap.textColor = '#ffffa0';
            var w2 = this.bitmap.measureTextWidth(mpCost);
            this.bitmap.drawText(TextManager.mpA + ' Cost: ', x - w2, y + l * i, w, l, 'right');
            this.bitmap.textColor = '#ffffff';
            this.bitmap.drawText(mpCost, x, y + l * i, w, l, 'right');
            i++;
        }
        if (tpCost !== 0) {
            this.bitmap.textColor = '#ffffa0';
            var w2 = this.bitmap.measureTextWidth(tpCost);
            this.bitmap.drawText(TextManager.tpA + ' Cost: ', x - w2, y + l * i, w, l, 'right');
            this.bitmap.textColor = '#ffffff';
            this.bitmap.drawText(tpCost, x, y + l * i, w, l, 'right');
            i++;
        }
        this._realHeight = Math.max(y + (i * l), this._realHeight);
    };

    drawDescription(x, y) {
        this.bitmap.fontSize = 14;
        this.bitmap.textColor = '#ffffa0';
        this.bitmap.drawText('Desc:', x, y, this.width, 18, 'left');
        var desc = '         ' + this._skill.description;
        var settings = {
            fontName: 'GameFont',
            fontSize: 14,
            fill: '#ffffff',
            stroke: 'rgba(0, 0, 0, 0.5)',
            strokeThickness: 4,
            wordWrap: true,
            wordWrapWidth: this.width - 4,
            lineHeight: 18
        }
        this._desc = new PIXI.Text(desc, settings);
        this._desc.x = x;
        this._desc.y = y - 1;
        this.addChild(this._desc);
        this._realHeight = Math.max(y + this._desc.height, this._realHeight);
    };

    drawLine(y) {
        this.bitmap.fillRect(2, y, this.width - 4, 2, 'rgba(255, 255, 255, 0.8)');
        this._realHeight = Math.max(y + 4, this._realHeight);
    };

    /**
     * 释放技能后显示信息
     * @param {*} x 
     * @param {*} y 
     */
    drawData(x, y) {
        var w = this.width - x - 4; // 4 is padding
        this.bitmap.fontSize = 18;
        var formula = this._skill.damage.formula;
        formula = formula.replace(/b.(\w+)/g, '0');
        var a = GameGlobal.$gamePlayer.actor();
        var v = GameGlobal.$gameVariables._data;
        var dmg = eval(formula);
        var i = 0;
        var l = 18; // line height
        if (dmg !== 0 && this._skill.damage.type !== 0) {
            this.bitmap.textColor = '#ffffa0';
            var title;
            if (this._skill.damage.type === 1) {
                title = 'Damage: ';
            } else if (this._skill.damage.type === 2) {
                title = 'MP Damage: ';
            } else if (this._skill.damage.type === 3) {
                title = 'Recover: ';
            } else if (this._skill.damage.type === 4) {
                title = 'MP Recover: ';
            }
            this.bitmap.drawText(title, x, y + l * i, w, l, 'left');
            this.bitmap.textColor = '#ffffff';
            var w2 = this.bitmap.measureTextWidth(title);
            this.bitmap.drawText(dmg, x + w2, y + l * i, w, l, 'left');
            i++;
        }
        // Write the effects:
        this._realHeight = Math.max(y + (i * l), this._realHeight);
    };
}
