import Sprite from '../core/sprite'
import ImageManager from '../managers/ImageManager'
import Sprite_GamePad from './Sprite_GamePad'
import Graphics from '../core/graphics'
import TouchInput from '../core/touchInput'
/**
 * 摇杆
 */
export default class Sprite_Joystick extends Sprite {
    constructor() {
        super();
        this.initialize();
    }

    _touching = false;

    JK_NONE = 0;
    JK_LEFT = 1;
    JK_RIGHT = 2;
    JK_UP = 3;
    JK_BOTTOM = 4;

    UNTOUCH_ALPHA = 0.2;
    TOUCH_ALPHA = 0.5;

    _start_x = 180;
    _start_y = Graphics.height - 110;
    _moveDistance = 0;
    _stickDirection = this.JK_NONE;

    initialize() {
        this.bitmap = ImageManager.loadSystem("Joystick");
        super.initialize(this.bitmap);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        this._object = null;

        this._gamepad = new Sprite_GamePad();

        // this.x = this._start_x;
        // this.y = this._start_y;

        this.setAlpha(this.UNTOUCH_ALPHA);
    }

    setPosition(x, y) {
        this._start_x = x;
        this._start_y = y;
        this._gamepad.x = x;
        this._gamepad.y = y;
    }

    setAlpha(value) {
        this._gamepad.alpha = 0.8;
        this.alpha = 1;
    }

    update() {
        super.update();
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

    get touching() {
        return this._touching;
    }

    set touching(value) {
        this._touching = value;
        // if (value) {
        //     this.setAlpha(this.TOUCH_ALPHA);
        // } else {
        //     this.setAlpha(this.UNTOUCH_ALPHA);
        // }
    }

    getDirectionByXY(dx, dy) {
        var tanAngle = dy / dx;
        if (dx > 0 && Math.abs(tanAngle) <= 1) {
            return this.JK_RIGHT;
        }
        else if (dx < 0 && Math.abs(tanAngle) <= 1)
            return this.JK_LEFT;
        else if (dy > 0 && Math.abs(tanAngle) > 1)
            return this.JK_UP;
        else if (dy < 0 && Math.abs(tanAngle) > 1)
            return this.JK_BOTTOM;
        else
            return this.JK_NONE;
    }

    stickMove(dx, dy, distance) {

        this._moveDistance = Math.min(distance, Math.min(this._gamepad.width / 2, this._gamepad.height / 2));
        
        var positionX = 0, positionY = 0
        if (dx != 0 || dy != 0) {
            var sin = dx / Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
            var cos = dy / Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

            positionX = sin * this._moveDistance;
            positionY = cos * this._moveDistance;
        }

        
        if (this._moveDistance < distance) {
            this.setPosition(TouchInput.x - positionX, TouchInput.y - positionY);
        }

        
        // this.x = this._start_x + positionX;
        // this.y = this._start_y + positionY;
        return { x: positionX, y: positionY, distance: this._moveDistance };
    }

    touchBegin() {
        this.touching = true;
        this.setPosition(TouchInput.x, TouchInput.y);
        this.x = TouchInput.x;
        this.y = TouchInput.y;
        var x = this._gamepad.canvasToLocalX(TouchInput.x);
        var y = this._gamepad.canvasToLocalY(TouchInput.y);
        this._direction = this.getDirectionByXY(x, y);
        // 如果位置发生变化
        // if () {

        // }
        if (this._direction != this._stickDirection) {
            this._stickDirection = this._direction;
            // 如果位置发生巨大变化
            // if () {

            // }
        }
        var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        // this._moveDistance = Math.min(distance, Math.min(this._gamepad.width / 2, this._gamepad.height / 2));
        this.stickMove(x, y, distance);

    }

    touchMove() {
        var x = this._gamepad.canvasToLocalX(TouchInput.x);
        var y = this._gamepad.canvasToLocalY(TouchInput.y);
        this._direction = this.getDirectionByXY(x, y);
        this.x = TouchInput.x;
        this.y = TouchInput.y;

        // 如果位置发生变化
        // if () {

        // }
        if (this._direction != this._stickDirection) {
            this._stickDirection = this._direction;
            // 如果位置发生巨大变化
            // if () {

            // }
        } else {

        }

        var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        // this._moveDistance = Math.min(distance, Math.min(this._gamepad.width / 2, this._gamepad.height / 2));

        return this.stickMove(x, y, distance);
    }

    touchEnd() {
        this.touching = false;
        if (this._stickDirection == this.JK_NONE) {
            return;
        }
        this._stickDirection = this.JK_NONE;
        // this._moveDistance = 0;
        this.stickMove(0, 0, 0);
    }

    isTouched() {
        var x = this.canvasToLocalX(TouchInput.x);
        var y = this.canvasToLocalY(TouchInput.y);
        return x >= -this.width / 2 && y >= -this.height / 2 && x < this.width / 2 && y < this.height / 2;
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