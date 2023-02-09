import Sprite from '../core/sprite'
import ImageManager from '../managers/ImageManager'
/**
 * 摇杆手柄
 */
export default class Sprite_GamePad extends Sprite {
    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        this.bitmap = ImageManager.loadSystem("GamePad");
        super.initialize(this.bitmap);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        this._object = null;
    }

    update() {
        super.update();
    }

    updateVisibility() {
        this.visible = true;
    }


    canvasToLocalX(x) {
        var node = this;
        while (node) {
            x -= node.x;
            node = node.parent;
        }
        return x;
    }

    canvasToLocalY(y) {
        var node = this;
        while (node) {
            y -= node.y;
            node = node.parent;
        }
        return y;
    }
}