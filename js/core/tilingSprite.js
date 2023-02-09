import * as PIXI from '../libs/pixi'
require("../libs/pixi-picture");
import Sprite from '../core/sprite'
import Rectangle from '../core/rectangle'
import Point from '../core/point'
/**
 * create by 18tech
 */
export default class TilingSprite extends PIXI.picture.PictureTilingSprite {
    constructor(bitmap) {
        var texture = new PIXI.Texture(new PIXI.BaseTexture());
        super(texture);
        PIXI.picture.PictureTilingSprite.call(this, texture);

        this._bitmap = null;
        this._width = 0;
        this._height = 0;
        this._frame = new Rectangle();
        this.spriteId = Sprite._counter++;
        /**
         * The origin point of the tiling sprite for scrolling.
         *
         * @property origin
         * @type Point
         */
        this.origin = new Point();

        this.bitmap = bitmap;
    }

    _renderCanvas_PIXI = PIXI.picture.PictureTilingSprite.prototype._renderCanvas;
    _renderWebGL_PIXI = PIXI.picture.PictureTilingSprite.prototype._renderWebGL;
    
    /**
     * @method _renderCanvas
     * @param {Object} renderer
     * @private
     */
    _renderCanvas(renderer) {
        if (this._bitmap) {
            this._bitmap.touch();
        }
        if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
            this._renderCanvas_PIXI(renderer);
        }
    }

    /**
     * @method _renderWebGL
     * @param {Object} renderer
     * @private
     */
    _renderWebGL(renderer) {
        if (this._bitmap) {
            this._bitmap.touch();
        }
        if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
            if (this._bitmap) {
                this._bitmap.checkDirty();
            }
            this._renderWebGL_PIXI(renderer);
        }
    }

    /**
     * The image for the tiling sprite.
     *
     * @property bitmap
     * @type Bitmap
     */
    get bitmap() {
        return this._bitmap;
    }
    set bitmap(value) {
        if (this._bitmap !== value) {
            this._bitmap = value;
            if (this._bitmap) {
                this._bitmap.addLoadListener(this._onBitmapLoad.bind(this));
            } else {
                this.texture.frame = Rectangle.emptyRectangle;
            }
        }
    }

    /**
     * The opacity of the tiling sprite (0 to 255).
     *
     * @property opacity
     * @type Number
     */
    get opacity() {
        return this.alpha * 255;
    }
    set opacity(value) {
        this.alpha = value.clamp(0, 255) / 255;
    }

    /**
     * Updates the tiling sprite for each frame.
     *
     * @method update
     */
    update() {
        this.children.forEach(function (child) {
            if (child.update) {
                child.update();
            }
        });
    }

    /**
     * Sets the x, y, width, and height all at once.
     *
     * @method move
     * @param {Number} x The x coordinate of the tiling sprite
     * @param {Number} y The y coordinate of the tiling sprite
     * @param {Number} width The width of the tiling sprite
     * @param {Number} height The height of the tiling sprite
     */
    move(x, y, width, height) {
        this.x = x || 0;
        this.y = y || 0;
        this._width = width || 0;
        this._height = height || 0;
    }

    /**
     * Specifies the region of the image that the tiling sprite will use.
     *
     * @method setFrame
     * @param {Number} x The x coordinate of the frame
     * @param {Number} y The y coordinate of the frame
     * @param {Number} width The width of the frame
     * @param {Number} height The height of the frame
     */
    setFrame(x, y, width, height) {
        this._frame.x = x;
        this._frame.y = y;
        this._frame.width = width;
        this._frame.height = height;
        this._refresh();
    }

    /**
     * @method updateTransform
     * @private
     */
    updateTransform() {
        this.tilePosition.x = Math.round(-this.origin.x);
        this.tilePosition.y = Math.round(-this.origin.y);
        this.updateTransformTS();
    }

    updateTransformTS = PIXI.picture.PictureTilingSprite.prototype.updateTransform;

    /**
     * @method _onBitmapLoad
     * @private
     */
    _onBitmapLoad() {
        this.texture.baseTexture = this._bitmap.baseTexture;
        this._refresh();
    }

    /**
     * @method _refresh
     * @private
     */
    _refresh() {
        var frame = this._frame.clone();
        if (frame.width === 0 && frame.height === 0 && this._bitmap) {
            frame.width = this._bitmap.width;
            frame.height = this._bitmap.height;
        }
        this.texture.frame = frame;
        this.texture._updateID++;
        this.tilingTexture = null;
    }


    _speedUpCustomBlendModes = Sprite.prototype._speedUpCustomBlendModes;

    /**
     * @method _renderWebGL
     * @param {Object} renderer
     * @private
     */
    _renderWebGL(renderer) {
        if (this._bitmap) {
            this._bitmap.touch();
            this._bitmap.checkDirty();
        }

        this._speedUpCustomBlendModes(renderer);

        this._renderWebGL_PIXI(renderer);
    }
}
