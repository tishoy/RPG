import Sprite from '../core/sprite'
import Rectangle from '../core/rectangle'
import TouchInput from '../core/touchInput'
/**
 * 按钮
 */
export default class Sprite_Button extends Sprite {
    constructor() {
        super();
        this.initialize();
    }


    initialize() {
        super.initialize();
        this._touching = false;
        this._coldFrame = null;
        this._hotFrame = null;
        this._clickHandler = null;
    }

    update() {
        super.update();
        this.updateFrame();
        this.processTouch();
    }

    updateFrame() {
        var frame;
        if (this._touching) {
            frame = this._hotFrame;
        } else {
            frame = this._coldFrame;
        }
        if (frame) {
            this.setFrame(frame.x, frame.y, frame.width, frame.height);
        }
    }

    setColdFrame(x, y, width, height) {
        this._coldFrame = new Rectangle(x, y, width, height);
    }

    setHotFrame(x, y, width, height) {
        this._hotFrame = new Rectangle(x, y, width, height);
    }

    setClickHandler(method) {
        this._clickHandler = method;
    }

    callClickHandler() {
        if (this._clickHandler) {
            this._clickHandler();
        }
    }

    processTouch() {
        if (this.isActive()) {
            if (TouchInput.isTriggered() && this.isButtonTouched()) {
                this._touching = true;
            }
            if (this._touching) {
                if (TouchInput.isReleased() || !this.isButtonTouched()) {
                    this._touching = false;
                    if (TouchInput.isReleased()) {
                        this.callClickHandler();
                    }
                }
            }
        } else {
            this._touching = false;
        }
    }

    isActive() {
        var node = this;
        while (node) {
            if (!node.visible) {
                return false;
            }
            node = node.parent;
        }
        return true;
    }

    isButtonTouched() {
        var x = this.canvasToLocalX(TouchInput.x);
        var y = this.canvasToLocalY(TouchInput.y);
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
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