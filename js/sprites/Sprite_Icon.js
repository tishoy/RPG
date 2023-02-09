import Sprite from '../core/sprite'
export default class Sprite_Icon extends Sprite {
    constructor(index, sheet, w, h) {
        super();
        this.initialize(index, sheet, w, h);
    }

    initialize(index, sheet, w, h) {
        super.initialize();
        this._iconIndex = index;
        this._iconSheet = sheet || 'IconSet';
        this._iconW = w || 32;
        this._iconH = h || 32;
        this._realX = this.x;
        this._realY = this.y;
        this._isFixed = false;
        this.setBitmap();
    }

    setBitmap() {
        this.bitmap = ImageManager.loadSystem(this._iconSheet);
        var pw = this._iconW;
        var ph = this._iconH;
        var sx = this._iconIndex % 16 * pw;
        var sy = Math.floor(this._iconIndex / 16) * ph;
        this.setFrame(sx, sy, pw, ph);
    };

    update() {
        super.update();
        if (this._isFixed) this.updatePosition();
    };

    updatePosition() {
        this.x = this._realX;
        this.x -= GameGlobal.$gameMap.displayX() * Movement.tileSize;
        this.y = this._realY;
        this.y -= GameGlobal.$gameMap.displayY() * Movement.tileSize;
    };

    move(x, y) {
        super.move(x, y);
        this._realX = x;
        this._realY = y;
        this.updatePosition();
    };
}