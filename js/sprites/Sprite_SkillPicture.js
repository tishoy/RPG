import Sprite from '../core/sprite'
import Movement from '../core/movement'
export default class Sprite_SkillPicture extends Sprite {
    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        super.initialize();
        this._maxFrames = 1;
        this._speed = 0;
        this._isAnimated = false;
        this._tick = 0;
        this._frameI = 0;
        this._lastFrameI = null;
        this._realX = this.x;
        this._realY = this.y;
    }

    setupAnim(frames, speed) {
        this._isAnimated = true;
        this._maxFrames = frames;
        this._speed = speed;
    };

    update() {
        super.update();
        this.updatePosition();
        if (this._isAnimated) this.updateAnimation();
        this.updateFrame();
    };

    updatePosition() {
        this.x = this._realX;
        this.x -= GameGlobal.$gameMap.displayX() * Movement.tileSize;
        this.y = this._realY;
        this.y -= GameGlobal.$gameMap.displayY() * Movement.tileSize;
    };

    updateAnimation() {
        if (this._tick % this._speed === 0) {
            this._frameI = (this._frameI + 1) % this._maxFrames;
        }
        this._tick = (this._tick + 1) % this._speed;
    };

    updateFrame() {
        if (this._lastFrameI !== null) {
            if (this._lastFrameI === this._frameI) return;
        }
        var i = this._frameI;
        var pw = this.bitmap.width / this._maxFrames;
        var ph = this.bitmap.height;
        var sx = i * pw;
        this.setFrame(sx, 0, pw, ph);
        this._lastFrameI = i;
    };

    move(x, y) {
        super.move(x, y);
        this._realX = x;
        this._realY = y;
        this.updatePosition();
    };
}