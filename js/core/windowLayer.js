import * as PIXI from '../../js/libs/pixi'
import Graphics from './graphics'
import MiniGame from '../18ext/MiniGame'
/**
 * create by 18tech
 * 弹窗层
 */
export default class WindowLayer extends PIXI.Container {
    constructor() {
        super();
        // this.initialize.apply(this, arguments);
        this.initialize();
    }

    initialize() {
        // super.initialize();
        PIXI.Container.call(this);
        this._width = 0;
        this._height = 0;
        this._tempCanvas = null;
        this._translationMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

        this._windowMask = new PIXI.Graphics();
        this._windowMask.beginFill(0xffffff, 1);
        this._windowMask.drawRect(0, 0, 0, 0);
        this._windowMask.endFill();
        this._windowRect = this._windowMask.graphicsData[0].shape;

        this._renderSprite = null;
        this.filterArea = new PIXI.Rectangle();
        this.filters = [WindowLayer.voidFilter];

        //temporary fix for memory leak bug
        this.on('removed', this.onRemoveAsAChild);
    }

    onRemoveAsAChild() {
        this.removeChildren();
    }

    static voidFilter = new PIXI.filters.VoidFilter();

    /**
     * The width of the window layer in pixels.
     *
     * @property width
     * @type Number
     */
    get width() {
        return this._width;
    }
    set width(value) {
        this._width = value;
    }

    /**
     * The height of the window layer in pixels.
     *
     * @property height
     * @type Number
     */
    get height() {
        return this._height;
    }
    set height(value) {
        this._height = value;
    }

    /**
     * Sets the x, y, width, and height all at once.
     *
     * @method move
     * @param {Number} x The x coordinate of the window layer
     * @param {Number} y The y coordinate of the window layer
     * @param {Number} width The width of the window layer
     * @param {Number} height The height of the window layer
     */
    move(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * Updates the window layer for each frame.
     *
     * @method update
     */
    update() {
        this.children.forEach((child) => {
            if (child.update) {
                child.update();
            }
        });
    }

    /**
     * @method _renderCanvas
     * @param {Object} renderSession
     * @private
     */
    renderCanvas(renderer) {
        if (!this.visible || !this.renderable) {
            return;
        }

        if (!this._tempCanvas) {
            this._tempCanvas = MiniGame.getCanvas();
        }

        this._tempCanvas.width = Graphics.width;
        this._tempCanvas.height = Graphics.height;


        var realCanvasContext = renderer.context;
        var context = this._tempCanvas.getContext('2d');

        context.save();
        context.clearRect(0, 0, Graphics.width, Graphics.height);
        context.beginPath();
        context.rect(this.x, this.y, this.width, this.height);
        context.closePath();
        context.clip();

        renderer.context = context;

        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            if (child._isWindow && child.visible && child.openness > 0) {
                this._canvasClearWindowRect(renderer, child);
                context.save();
                child.renderCanvas(renderer);
                context.restore();
            }
        }

        context.restore();

        renderer.context = realCanvasContext;
        renderer.context.setTransform(1, 0, 0, 1, 0, 0);
        renderer.context.globalCompositeOperation = 'source-over';
        renderer.context.globalAlpha = 1;
        renderer.context.drawImage(this._tempCanvas, 0, 0);

        for (var j = 0; j < this.children.length; j++) {
            if (!this.children[j]._isWindow) {
                this.children[j].renderCanvas(renderer);
            }
        }
    }

    /**
     * @method _canvasClearWindowRect
     * @param {Object} renderSession
     * @param {Window} window
     * @private
     */
    _canvasClearWindowRect(renderSession, window) {
        var rx = this.x + window.x;
        var ry = this.y + window.y + window.height / 2 * (1 - window._openness / 255);
        var rw = window.width;
        var rh = window.height * window._openness / 255;
        renderSession.context.clearRect(rx, ry, rw, rh);
    }

    /**
     * @method _renderWebGL
     * @param {Object} renderSession
     * @private
     */
    renderWebGL(renderer) {
        if (!this.visible || !this.renderable) {
            return;
        }

        if (this.children.length == 0) {
            return;
        }

        renderer.flush();
        this.filterArea.copy(this);
        renderer.filterManager.pushFilter(this, this.filters);
        renderer.currentRenderer.start();

        var shift = new PIXI.Point();
        var rt = renderer._activeRenderTarget;
        var projectionMatrix = rt.projectionMatrix;
        shift.x = Math.round((projectionMatrix.tx + 1) / 2 * rt.sourceFrame.width);
        shift.y = Math.round((projectionMatrix.ty + 1) / 2 * rt.sourceFrame.height);

        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            if (child._isWindow && child.visible && child.openness > 0) {
                this._maskWindow(child, shift);
                renderer.maskManager.pushScissorMask(this, this._windowMask);
                renderer.clear();
                renderer.maskManager.popScissorMask();
                renderer.currentRenderer.start();
                child.renderWebGL(renderer);
                renderer.currentRenderer.flush();
            }
        }

        renderer.flush();
        renderer.filterManager.popFilter();
        renderer.maskManager.popScissorMask();

        for (var j = 0; j < this.children.length; j++) {
            if (!this.children[j]._isWindow) {
                this.children[j].renderWebGL(renderer);
            }
        }
    }

    /**
     * @method _maskWindow
     * @param {Window} window
     * @private
     */
    _maskWindow(maskedWindow, shift) {
        this._windowMask._currentBounds = null;
        this._windowMask.boundsDirty = true;
        var rect = this._windowRect;
        rect.x = this.x + shift.x + maskedWindow.x;
        rect.y = this.x + shift.y + maskedWindow.y + maskedWindow.height / 2 * (1 - maskedWindow._openness / 255);
        rect.width = maskedWindow.width;
        rect.height = maskedWindow.height * maskedWindow._openness / 255;
    }
}