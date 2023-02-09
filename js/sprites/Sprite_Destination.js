import Sprite from '../core/sprite';
import Bitmap from '../core/bitmap';
import Graphics from '../core/graphics';
import Sprite_Joystick from './Sprite_Joystick';
import SceneManager from '../managers/SceneManager';
/**
 * 目标
 */
export default class Sprite_Destination extends Sprite {

    constructor() {
        super();
        this.createBitmap();
        this._frameCount = 0;
    }

    update() {
        super.update();
        if (GameGlobal.$gameTemp.isDestinationValid()) {
            this.updatePosition();
            this.updateAnimation();
            if (!SceneManager._scene._joystick.touching) {
                // this.visible = true;
            }
        } else {
            this._frameCount = 0;
            this.visible = false;
        }
    }

    createBitmap() {
        var tileWidth = GameGlobal.$gameMap.tileWidth();
        var tileHeight = GameGlobal.$gameMap.tileHeight();
        this.bitmap = new Bitmap(tileWidth, tileHeight);
        this.bitmap.fillAll('white');
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.blendMode = Graphics.BLEND_ADD;
    }

    updatePosition() {
        var tileWidth = GameGlobal.$gameMap.tileWidth();
        var tileHeight = GameGlobal.$gameMap.tileHeight();
        var x = GameGlobal.$gameTemp.destinationPX();
        var y = GameGlobal.$gameTemp.destinationPY();
        this.x = GameGlobal.$gameMap.adjustPX(x);
        this.y = GameGlobal.$gameMap.adjustPY(y);
        // var tileWidth = GameGlobal.$gameMap.tileWidth();
        // var tileHeight = GameGlobal.$gameMap.tileHeight();
        // var x = GameGlobal.$gameTemp.destinationX();
        // var y = GameGlobal.$gameTemp.destinationY();
        // this.x = (GameGlobal.$gameMap.adjustX(x) + 0.5) * tileWidth;
        // this.y = (GameGlobal.$gameMap.adjustY(y) + 0.5) * tileHeight;
    }

    updateAnimation() {
        this._frameCount++;
        this._frameCount %= 20;
        this.opacity = (20 - this._frameCount) * 6;
        this.scale.x = 1 + this._frameCount / 20;
        this.scale.y = this.scale.x;
    }
}