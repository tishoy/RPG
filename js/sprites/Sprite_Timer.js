import Sprite from '../core/sprite';
import Bitmap from '../core/bitmap';
import Graphics from '../core/graphics'
export default class Sprite_Timer extends Sprite {

    constructor() {
       super();
        this._seconds = 0;
        this.createBitmap();
        this.update();
    }

    createBitmap() {
        this.bitmap = new Bitmap(96, 48);
        this.bitmap.fontSize = 32;
    }

    update() {
        super.update();
        this.updateBitmap();
        this.updatePosition();
        this.updateVisibility();
    }

    updateBitmap() {
        if (this._seconds !== GameGlobal.$gameTimer.seconds()) {
            this._seconds = GameGlobal.$gameTimer.seconds();
            this.redraw();
        }
    }

    redraw() {
        var text = this.timerText();
        var width = this.bitmap.width;
        var height = this.bitmap.height;
        this.bitmap.clear();
        this.bitmap.drawText(text, 0, 0, width, height, 'center');
    }

    timerText() {
        var min = Math.floor(this._seconds / 60) % 60;
        var sec = this._seconds % 60;
        return min.padZero(2) + ':' + sec.padZero(2);
    }

    updatePosition() {
        this.x = Graphics.width - this.bitmap.width;
        this.y = 0;
    }

    updateVisibility() {
        this.visible = GameGlobal.$gameTimer.isWorking();
    }
}