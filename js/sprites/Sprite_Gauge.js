import Sprite from '../core/sprite'
import Bitmap from '../core/bitmap'
import * as PIXI from '../libs/pixi'
/**
 * 血条
 */
export default class Sprite_Gauge extends Sprite {


    _BG_COLOR = parseInt("202040", 16);
    _INNER_COLOR = parseInt("ffffff", 16);
    _COLOR1 = "#e08040";
    _COLOR2 = "#f0c040";
    _WIDTH = 48;
    _HEIGHT = 4;

    _FONT_FACE = "GameFont";
    _FONT_SIZE = 14;
    _TEXT_COLOR = "#ffffff";

    constructor() {
        super()
        this.initialize();
    }

    initialize() {
        super.initialize();

        this._width = this._WIDTH;
        this._height = this._HEIGHT;
        this.setupGauges();
        this._character = null;
        this._battler = null;
        this.anchor.x = 0.5;
        this.z = 8;
    }

    setupGauges() {
        this.bitmap = new Bitmap(this._width, this._height);
        // Background
        this._background = new PIXI.Graphics();
        this._background.beginFill(this._BG_COLOR);
        this._background.drawRect(0, 0, this._width, this._height);
        this._background.endFill();
        this._background.x = -this._width / 2;
        this.addChild(this._background);
        // Between
        this._between = new PIXI.Graphics();
        this._between.beginFill(this._INNER_COLOR);
        this._between.drawRect(0, 0, this._width, this._height);
        this._between.endFill();
        this._between.x -= this._width / 2;
        this._currentW = this._width;
        this.addChild(this._between);
        // Top (Gradient)
        this._top = new Sprite();
        this._top.bitmap = new Bitmap(this._width, this._height);
        this._top.anchor.x = 0.5;
        this.addChild(this._top);
        // Name
        this._name = new Sprite();
        var font = this.getFontSettings();
        this._name.bitmap = new Bitmap(this._width, font.size + 4);
        this._name.bitmap.fontFace = font.face;
        this._name.bitmap.fontSize = font.size;
        this._name.bitmap.textColor = font.color;
        this._name.x = -this._width / 2;
        this._name.y = this._height - 1;
        this._name.anchor.y = 1;
        this.addChild(this._name);
    };

    getFontSettings() {
        return {
            face: this._FONT_FACE,
            size: this._FONT_SIZE,
            color: this._TEXT_COLOR
        }
    };

    setup(character, battler) {
        this._character = character;
        this._battler = battler;
        this.refresh();
    };

    refresh() {
        this.clear();
        if (!this._battler || !this.showGauge()) return;
        this.drawGauge();
        this.drawName();
        this._targetW = Math.floor(this._width * this._hpRate);
        this._speed = Math.abs(this._currentW - this._targetW) / 30;
    };

    drawGauge() {
        this._hpRate = this._battler.hpRate();
        var fillW = Math.floor(this._width * this._hpRate);
        this._top.bitmap.gradientFillRect(0, 0, fillW, this._height, this._COLOR1, this._COLOR2);
    };

    drawName() {
        var name = this._battler.enemy().name;
        var h = this._name.bitmap.height;
        this._name.bitmap.drawText(name, 2, 2, this._width, h);
    };

    showGauge() {
        return this._character.showGauge();
    };

    update() {
        super.update();
        if (!this._battler || !this.showGauge()) {
            return this.hideHud();
        } else {
            this.showHud();
        }
        this.updatePosition();
        if (this._hpRate !== this._battler.hpRate()) {
            this.refresh();
        }
        if (this._currentW !== this._targetW) {
            this.updateInbetween();
        }
    };

    updatePosition() {
        this.x = this._battler._hpBarOX;
        this.y = this._battler._hpBarOY;
    };

    updateInbetween() {
        if (this._currentW < this._targetW) {
            this._currentW = Math.min(this._currentW + this._speed, this._targetW);
        }
        if (this._currentW > this._targetW) {
            this._currentW = Math.max(this._currentW - this._speed, this._targetW);
        }
        this._between.width = this._currentW;
    };

    showHud() {
        if (!this.visible) {
            this.refresh();
            this.visible = true;
        }
    };

    hideHud() {
        if (this.visible) {
            this.clear();
            this.visible = false;
        }
    };

    clear() {
        this._top.bitmap.clear();
        this._name.bitmap.clear();
    };


}