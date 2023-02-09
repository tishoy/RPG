import Sprite_Button from './Sprite_Button'
import E8ABS from '../18ext/E8ABS'
import Sprite from '../core/sprite'
import Bitmap from '../core/bitmap'
import Sprite_Icon from './Sprite_Icon'
export default class Sprite_SkillButton extends Sprite_Button() {
    constructor(key) {
        super();
        this.initialize(key);
    }

    initialize(key) {
        super.initialize();
        this._key = key;
        this._skillId = 0;
        this._skill = null;
        this._skillSettings = null;
        this._preferGamePad = false;
        this._count = 0;
        this.width = 34;
        this.height = 34;
        this.setup();
    }



    setSkillId(id) {
        this._skillId = id;
        this._skill = GameGlobal.$dataSkills[id] || null;
        this._skillSettings = this._skill ? E8ABS.getSkillSettings(this._skill) : null;
    };

    setup() {
        this.createFrame();
        this.createIcon();
        this.createOverlayFrame();
        this.createHover();
        this.createInput();
        this.createInfo();
        this.refresh();
    };

    createFrame() {
        // Black bg for the button
        this._spriteFrame = new Sprite();
        this._spriteFrame.bitmap = new Bitmap(34, 34);
        this._spriteFrame.bitmap.fillAll('#000000');
        this._spriteFrame.alpha = 0.3;
        this.addChild(this._spriteFrame);
    };

    createIcon() {
        this._spriteIcon = new Sprite_Icon(0);
        this.addChild(this._spriteIcon);
    };

    createOverlayFrame() {
        // Black bg used for cooldown
        this._spriteCooldown = new Sprite();
        this._spriteCooldown.bitmap = new Bitmap(34, 34);
        this._spriteCooldown.bitmap.fillAll('#000000');
        this._spriteCooldown.alpha = 0.5;
        this._spriteCooldown.height = 0;
        this._spriteCooldown.visible = false;
        this.addChild(this._spriteCooldown);
    };

    createHover() {
        // sprite when hovering over button
        this._spriteHoverFrame = new Sprite();
        this._spriteHoverFrame.bitmap = new Bitmap(34, 34);
        var color1 = 'rgba(255, 255, 255, 0.9)';
        var color2 = 'rgba(255, 255, 255, 0)';
        this._spriteHoverFrame.bitmap.gradientFillRect(0, 0, 8, 34, color1, color2);
        this._spriteHoverFrame.bitmap.gradientFillRect(26, 0, 8, 34, color2, color1);
        this._spriteHoverFrame.bitmap.gradientFillRect(0, 0, 34, 8, color1, color2, true);
        this._spriteHoverFrame.bitmap.gradientFillRect(0, 26, 34, 8, color2, color1, true);
        this._spriteHoverFrame.visible = false;
        this.addChild(this._spriteHoverFrame);
    };

    createInput() {
        this._spriteInput = new Sprite();
        this._spriteInput.bitmap = new Bitmap(34, 34);
        this._spriteInput.bitmap.fontSize = 14;
        this.addChild(this._spriteInput);
    };

    createInfo() {
        this._spriteInfo = new Sprite_SkillInfo();
        this._spriteInfo.visible = false;
        this.addChild(this._spriteInfo);
    };

    callClickHandler() {
        if (!this._skillId) {
            return;
        }
        GameGlobal.$gamePlayer.useSkill(this._skillId);
    };

    update() {
        super.update();
        if (!_SHOW_UNASSIGNED) {
            this.updateVisiblity();
        }
        if (!this.visible) {
            return;
        }
        if (this.needsRefresh()) {
            this.refresh();
        }
        if (this.isButtonTouched()) {
            this.updateHover();
        } else {
            this.updateOff();
        }
        this.updateCooldown();
    };

    updateVisiblity() {
        var id = $gameSystem.absKeys()[this._key].skillId;
        var oldVisible = this.visible;
        this.visible = !!id;
        if (oldVisible !== this.visible) {
            this.parent.requestPositionUpdate = true;
        }
    };

    updatePosition() {
        var key = Number(this._key) - 1;
        var prev = this.prev;
        while (prev) {
            if (!prev.visible) key--;
            prev = prev.prev;
        }
        this.x = key * 36;
    };

    updateHover() {
        QABSSkillbar.over = true;
        this._count++;
        var twoAmp = 1;
        var count = this._count * 0.02;
        var newAlpha = 0.9 - Math.abs(count % twoAmp - (twoAmp / 2));
        this._spriteHoverFrame.alpha = newAlpha;
        this._spriteHoverFrame.visible = true;
        this._spriteInfo.visible = true;
    };

    updateOff() {
        this._count = 0;
        this._spriteHoverFrame.visible = false;
        this._spriteInfo.visible = false;
    };

    updateCooldown() {
        if (!this._skillId) {
            return;
        }
        var cd = $gamePlayer._skillCooldowns[this._skillId];
        if (cd) {
            var newH = cd / this._skillSettings.cooldown;
            this._spriteCooldown.visible = true;
            this._spriteCooldown.height = 34 * newH;
        } else {
            this._spriteCooldown.visible = false;
            this._spriteCooldown.height = 0;
        }
    };

    needsRefresh() {
        if (QABSSkillbar.requestRefresh) {
            return this._skillId !== $gameSystem.absKeys()[this._key];
        }
        return false;
    };

    refresh() {
        var absKey = $gameSystem.absKeys()[this._key];
        this.setSkillId(absKey.skillId);
        this.refreshIcon();
        this.refreshInput();
        this.refreshInfo();
    };

    refreshIcon() {
        this._spriteIcon._iconIndex = this._skill ? this._skill.iconIndex : 0;
        this._spriteIcon.setBitmap();
        if (!this._skill || (!$gameParty.leader().isLearnedSkill(this._skill.id) &&
            !GameGlobal.$gameParty.leader().addedSkills().contains(this._skill.id))) {
            this._spriteIcon.alpha = 0.5;
        } else {
            this._spriteIcon.alpha = 1;
        }
    };

    refreshInput() {
        var absKey = $gameSystem.absKeys()[this._key];
        var input = absKey.input[0] || '';
        // if (Imported.QInput) {
        //     var inputs = absKey.input;
        //     for (var i = 0; i < inputs.length; i++) {
        //         var isGamepad = /^\$/.test(inputs[i]);
        //         if (Input.preferGamepad() && isGamepad) {
        //             input = inputs[i];
        //             break;
        //         } else if (!Input.preferGamepad() && !isGamepad) {
        //             input = inputs[i];
        //             break;
        //         }
        //     }
        // }
        input = input.replace('#', '');
        input = input.replace('$', '');
        input = input.replace('mouse', 'M');
        this._spriteInput.bitmap.clear();
        this._spriteInput.bitmap.drawText(input, 0, 8, 34, 34, 'center');
    };

    refreshInfo() {
        this._spriteInfo.set(this._skillId);
    };
}