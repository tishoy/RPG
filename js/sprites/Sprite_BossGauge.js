import Sprite_Gauge from './Sprite_Gauge'
import Graphics from '../core/graphics'
/**
 * boss 血条
 */
export default class Sprite_BossGauge extends Sprite_Gauge {

    _BOSS_WIDTH = 480;
    _BOSS_HEIGHT = 16;

    _BOSS_FONT_FACE = "GameFont";
    _BOSS_FONT_SIZE = 18;
    _BOSS_TEXT_COLOR = "#ffffff";

    constructor() {
        super();
        this.initialize()
    }

    initialize() {
        super.initialize();
        this._width = this._BOSS_WIDTH;
        this._height = this._BOSS_HEIGHT;
        this.setupGauges();
        this._character = null;
        this._battler = null;
        this.anchor.x = 0.5;
        this.z = 8;
    };


    updatePosition() {
        this.x = Graphics.boxWidth / 2 + this._battler._bossHpBarOX;
        this.y = this._battler._bossHpBarOY;
    };

    showGauge() {
        return this._character.inCombat();
    };

    getFontSettings() {
        return {
            face: this._BOSS_FONT_FACE,
            size: this._BOSS_FONT_SIZE,
            color: this._BOSS_TEXT_COLOR
        }
    };

}

