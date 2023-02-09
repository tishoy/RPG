/**
 * 
 */
import Utils from './utils'
import Graphics from './graphics'

/**
 * create by 18tech
 */
export default class TouchInput {
    constructor() {
        throw new Error('This is a static class');
    }

    static insideWindow;

    /**
     * Initializes the touch system.
     *
     * @static
     * @method initialize
     */
    static initialize() {
        TouchInput.clear();
        TouchInput._setupEventHandlers();
    }

    /**
     * The wait time of the pseudo key repeat in frames.
     *
     * @static
     * @property keyRepeatWait
     * @type Number
     */
    static keyRepeatWait = 24;

    /**
     * The interval of the pseudo key repeat in frames.
     *
     * @static
     * @property keyRepeatInterval
     * @type Number
     */
    static keyRepeatInterval = 6;

    /**
     * Clears all the touch data.
     *
     * @static
     * @method clear
     */
    static clear() {
        TouchInput._mousePressed = false;
        TouchInput._screenPressed = false;
        TouchInput._pressedTime = 0;
        TouchInput._events = {}
        TouchInput._events.triggered = false;
        TouchInput._events.cancelled = false;
        TouchInput._events.moved = false;
        TouchInput._events.released = false;
        TouchInput._events.wheelX = 0;
        TouchInput._events.wheelY = 0;
        TouchInput._triggered = false;
        TouchInput._cancelled = false;
        TouchInput._moved = false;
        TouchInput._released = false;
        TouchInput._wheelX = 0;
        TouchInput._wheelY = 0;
        TouchInput._x = 0;
        TouchInput._y = 0;
        TouchInput._date = 0;
    }

    /**
     * Updates the touch data.
     *
     * @static
     * @method update
     */
    static update() {
        TouchInput._triggered = TouchInput._events.triggered;
        TouchInput._cancelled = TouchInput._events.cancelled;
        TouchInput._moved = TouchInput._events.moved;
        TouchInput._released = TouchInput._events.released;
        TouchInput._wheelX = TouchInput._events.wheelX;
        TouchInput._wheelY = TouchInput._events.wheelY;
        TouchInput._events.triggered = false;
        TouchInput._events.cancelled = false;
        TouchInput._events.moved = false;
        TouchInput._events.released = false;
        TouchInput._events.wheelX = 0;
        TouchInput._events.wheelY = 0;
        if (TouchInput.isPressed()) {
            TouchInput._pressedTime++;
        }
    }

    /**
     * Checks whether the mouse button or touchscreen is currently pressed down.
     *
     * @static
     * @method isPressed
     * @return {Boolean} True if the mouse button or touchscreen is pressed
     */
    static isPressed() {
        return TouchInput._mousePressed || TouchInput._screenPressed;
    }

    /**
     * Checks whether the left mouse button or touchscreen is just pressed.
     *
     * @static
     * @method isTriggered
     * @return {Boolean} True if the mouse button or touchscreen is triggered
     */
    static isTriggered() {
        return TouchInput._triggered;
    }

    /**
     * Checks whether the left mouse button or touchscreen is just pressed
     * or a pseudo key repeat occurred.
     *
     * @static
     * @method isRepeated
     * @return {Boolean} True if the mouse button or touchscreen is repeated
     */
    static isRepeated() {
        return (TouchInput.isPressed() &&
            (TouchInput._triggered ||
                (TouchInput._pressedTime >= TouchInput.keyRepeatWait &&
                    TouchInput._pressedTime % TouchInput.keyRepeatInterval === 0)));
    }

    /**
     * Checks whether the left mouse button or touchscreen is kept depressed.
     *
     * @static
     * @method isLongPressed
     * @return {Boolean} True if the left mouse button or touchscreen is long-pressed
     */
    static isLongPressed() {
        return TouchInput.isPressed() && TouchInput._pressedTime >= TouchInput.keyRepeatWait;
    }

    /**
     * Checks whether the right mouse button is just pressed.
     *
     * @static
     * @method isCancelled
     * @return {Boolean} True if the right mouse button is just pressed
     */
    static isCancelled() {
        return TouchInput._cancelled;
    }

    /**
     * Checks whether the mouse or a finger on the touchscreen is moved.
     *
     * @static
     * @method isMoved
     * @return {Boolean} True if the mouse or a finger on the touchscreen is moved
     */
    static isMoved() {
        return TouchInput._moved;
    }

    /**
     * Checks whether the left mouse button or touchscreen is released.
     *
     * @static
     * @method isReleased
     * @return {Boolean} True if the mouse button or touchscreen is released
     */
    static isReleased() {
        return TouchInput._released;
    }

    /**
     * [read-only] The horizontal scroll amount.
     *
     * @static
     * @property wheelX
     * @type Number
     */
    static get wheelX() {
        return TouchInput._wheelX;
    }

    /**
     * [read-only] The vertical scroll amount.
     *
     * @static
     * @property wheelY
     * @type Number
     */
    static get wheelY() {
        return TouchInput._wheelY;
    }

    /**
     * [read-only] The x coordinate on the canvas area of the latest touch event.
     *
     * @static
     * @property x
     * @type Number
     */
    static get x() {
        return TouchInput._x;
    }

    /**
     * [read-only] The y coordinate on the canvas area of the latest touch event.
     *
     * @static
     * @property y
     * @type Number
     */
    static get y() {
        return TouchInput._y;
    }

    /**
     * [read-only] The time of the last input in milliseconds.
     *
     * @static
     * @property date
     * @type Number
     */
    static get date() {
        return TouchInput._date;
    }

    /**
     * @static
     * @method _setupEventHandlers
     * @private
     */
    static _setupEventHandlers() {
        var isSupportPassive = Utils.isSupportPassiveEvent();
        // canvas.addEventListener('touchstart', TouchInput.touchHandler)
        // document.addEventListener('mousedown', TouchInput._onMouseDown);
        // document.addEventListener('mousemove', TouchInput._onMouseMove);
        // document.addEventListener('mouseup', TouchInput._onMouseUp);
        // document.addEventListener('wheel', TouchInput._onWheel);
        canvas.addEventListener('touchstart', TouchInput._onTouchStart, isSupportPassive ? { passive: false } : false);
        canvas.addEventListener('touchmove', TouchInput._onTouchMove, isSupportPassive ? { passive: false } : false);
        canvas.addEventListener('touchend', TouchInput._onTouchEnd);
        canvas.addEventListener('touchcancel', TouchInput._onTouchCancel);
        // document.addEventListener('pointerdown', TouchInput._onPointerDown);
    }

    /**
     * @static
     * @method _onMouseDown
     * @param {MouseEvent} event
     * @private
     */
    static _onMouseDown(event) {
        if (event.button === 0) {
            TouchInput._onLeftButtonDown(event);
        } else if (event.button === 1) {
            TouchInput._onMiddleButtonDown(event);
        } else if (event.button === 2) {
            TouchInput._onRightButtonDown(event);
        }
    }

    /**
     * @static
     * @method _onLeftButtonDown
     * @param {MouseEvent} event
     * @private
     */
    static _onLeftButtonDown(event) {
        var x = Graphics.pageToCanvasX(event.pageX);
        var y = Graphics.pageToCanvasY(event.pageY);
        if (Graphics.isInsideCanvas(x, y)) {
            TouchInput._mousePressed = true;
            TouchInput._pressedTime = 0;
            TouchInput._onTrigger(x, y);
        }
    }

    /**
     * @static
     * @method _onMiddleButtonDown
     * @param {MouseEvent} event
     * @private
     */
    static _onMiddleButtonDown(event) {
    }

    /**
     * @static
     * @method _onRightButtonDown
     * @param {MouseEvent} event
     * @private
     */
    static _onRightButtonDown(event) {
        var x = Graphics.pageToCanvasX(event.pageX);
        var y = Graphics.pageToCanvasY(event.pageY);
        if (Graphics.isInsideCanvas(x, y)) {
            TouchInput._onCancel(x, y);
        }
    }

    /**
     * @static
     * @method _onMouseMove
     * @param {MouseEvent} event
     * @private
     */
    static _onMouseMove(event) {
        if (TouchInput._mousePressed) {
            var x = Graphics.pageToCanvasX(event.pageX);
            var y = Graphics.pageToCanvasY(event.pageY);
            TouchInput._onMove(x, y);
        }
    }

    /**
     * @static
     * @method _onMouseUp
     * @param {MouseEvent} event
     * @private
     */
    static _onMouseUp(event) {
        if (event.button === 0) {
            var x = Graphics.pageToCanvasX(event.pageX);
            var y = Graphics.pageToCanvasY(event.pageY);
            TouchInput._mousePressed = false;
            TouchInput._onRelease(x, y);
        }
    }

    /**
     * @static
     * @method _onWheel
     * @param {WheelEvent} event
     * @private
     */
    static _onWheel(event) {
        TouchInput._events.wheelX += event.deltaX;
        TouchInput._events.wheelY += event.deltaY;
        event.preventDefault();
    }

    /**
     * @static
     * @method _onTouchStart
     * @param {TouchEvent} event
     * @private
     */
    static _onTouchStart(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var x = Graphics.pageToCanvasX(touch.pageX);
            var y = Graphics.pageToCanvasY(touch.pageY);
            if (Graphics.isInsideCanvas(x, y)) {
                TouchInput._screenPressed = true;
                TouchInput._pressedTime = 0;
                if (event.touches.length >= 2) {
                    TouchInput._onCancel(x, y);
                } else {
                    TouchInput._onTrigger(x, y);
                }
                event.preventDefault();
            }
        }
        // if (window.cordova || window.navigator.standalone) {
        event.preventDefault();
        // }
    }

    /**
     * @static
     * @method _onTouchMove
     * @param {TouchEvent} event
     * @private
     */
    static _onTouchMove(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var x = Graphics.pageToCanvasX(touch.pageX);
            var y = Graphics.pageToCanvasY(touch.pageY);
            TouchInput._onMove(x, y);
        }
        event.preventDefault();
    }

    /**
     * @static
     * @method _onTouchEnd
     * @param {TouchEvent} event
     * @private
     */
    static _onTouchEnd(event) {
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            var x = Graphics.pageToCanvasX(touch.pageX);
            var y = Graphics.pageToCanvasY(touch.pageY);
            TouchInput._screenPressed = false;
            TouchInput._onRelease(x, y);
        }
        event.preventDefault();
    }

    /**
     * @static
     * @method _onTouchCancel
     * @param {TouchEvent} event
     * @private
     */
    static _onTouchCancel(event) {
        TouchInput._screenPressed = false;
        event.preventDefault();
    }

    /**
     * @static
     * @method _onPointerDown
     * @param {PointerEvent} event
     * @private
     */
    static _onPointerDown(event) {
        if (event.pointerType === 'touch' && !event.isPrimary) {
            var x = Graphics.pageToCanvasX(event.pageX);
            var y = Graphics.pageToCanvasY(event.pageY);
            if (Graphics.isInsideCanvas(x, y)) {
                // For Microsoft Edge
                TouchInput._onCancel(x, y);
                event.preventDefault();
            }
        }
    }

    /**
     * @static
     * @method _onTrigger
     * @param {Number} x
     * @param {Number} y
     * @private
     */
    static _onTrigger(x, y) {
        TouchInput._events.triggered = true;
        TouchInput._x = x;
        TouchInput._y = y;
        TouchInput._date = Date.now();
    }

    /**
     * @static
     * @method _onCancel
     * @param {Number} x
     * @param {Number} y
     * @private
     */
    static _onCancel(x, y) {
        TouchInput._events.cancelled = true;
        TouchInput._x = x;
        TouchInput._y = y;
    }

    /**
     * @static
     * @method _onMove
     * @param {Number} x
     * @param {Number} y
     * @private
     */
    static _onMove(x, y) {
        TouchInput._events.moved = true;
        TouchInput._x = x;
        TouchInput._y = y;
    }

    /**
     * @static
     * @method _onRelease
     * @param {Number} x
     * @param {Number} y
     * @private
     */
    static _onRelease(x, y) {
        TouchInput._events.released = true;
        TouchInput._x = x;
        TouchInput._y = y;
    }
}