import Utils from './utils'
import SceneManager from '../managers/SceneManager'
import * as PIXI from '../libs/pixi';
import MiniGame from '../18ext/MiniGame'
/**
 * create by 18tech
 * 绘图
 * RPGMaker Graphics
 */
export default class Graphics {
    instance = null

    _cssFontLoading = false;
    //  _cssFontLoading = document.fonts && document.fonts.ready;
    _fontLoaded = null;
    _videoVolume = 1;


    _renderer = null;

    static initialize(width, height, type) {
        this._width = width;
        this._height = height;

        this._rendererType = type || "canvas";
        this._boxWidth = this._width;
        this._boxHeight = this._height;

        this._scale = 1;
        this._realScale = 1;

        this._errorShowed = false;
        this._errorPrinter = null;
        this._canvas = null;
        this._video = null;
        this._videoUnlocked = false;
        this._videoLoading = false;
        this._renderer = null;
        this._skipCount = 0;
        this._maxSkip = 3;
        this._rendered = false;
        this._fpsMeterToggled = false;
        this._stretchEnabled = this._defaultStretchMode();

        this._canUseDifferenceBlend = true;
        this._canUseSaturationBlend = true;
        this._hiddenCanvas = null;

        this._updateRealScale();
        this._createAllElements();
        this._disableTextSelection();
    }


    static _setupCssFontLoading() {
        if (this._cssFontLoading) {
            document.fonts.ready.then(function (fonts) {
                _fontLoaded = fonts;
            }).catch(function (error) {
                SceneManager.onError(error);
            });
        }
    }

    static canUseCssFontLoading() {
        return false;
        // return !!this._cssFontLoading;
    }

    /**
     * The total frame count of the game screen.
     *
     * @
     * @property frameCount
     * @type Number
     */
    static frameCount = 0;

    /**
     * The alias of PIXI.blendModes.NORMAL.
     *
     * @
     * @property BLEND_NORMAL
     * @type Number
     * @final
     */
    static BLEND_NORMAL = 0;

    /**
     * The alias of PIXI.blendModes.ADD.
     *
     * @
     * @property BLEND_ADD
     * @type Number
     * @final
     */
    static BLEND_ADD = 1;

    /**
     * The alias of PIXI.blendModes.MULTIPLY.
     *
     * @
     * @property BLEND_MULTIPLY
     * @type Number
     * @final
     */
    static BLEND_MULTIPLY = 2;

    /**
     * The alias of PIXI.blendModes.SCREEN.
     *
     * @
     * @property BLEND_SCREEN
     * @type Number
     * @final
     */
    static BLEND_SCREEN = 3;

    /**
     * Marks the beginning of each frame for FPSMeter.
     *
     * @
     * @method tickStart
     */
    static tickStart() {
        if (this._fpsMeter) {
            this._fpsMeter.tickStart();
        }
    }

    /**
     * Marks the end of each frame for FPSMeter.
     *
     * @
     * @method tickEnd
     */
    static tickEnd() {
        if (this._fpsMeter && this._rendered) {
            this._fpsMeter.tick();
        }
    }

    /**
     * Renders the stage to the game screen.
     *
     * @static
     * @method render
     * @param {Stage} stage The stage object to be rendered
     */
    static render(stage) {
        if (this._skipCount === 0) {
            var startTime = Date.now();
            if (stage) {
                Graphics._renderer.render(stage);
                if (this._renderer.gl && this._renderer.gl.flush) {
                    this._renderer.gl.flush();
                }
            }
            var endTime = Date.now();
            var elapsed = endTime - startTime;
            this._skipCount = Math.min(Math.floor(elapsed / 15), this._maxSkip);
            this._rendered = true;
        } else {
            this._skipCount--;
            this._rendered = false;
        }
        this.frameCount++;
    }

    /**
     * Checks whether the renderer type is WebGL.
     *
     * @
     * @method isWebGL
     * @return {Boolean} True if the renderer type is WebGL
     */
    static isWebGL() {
        return this._renderer && this._renderer.type === PIXI.RENDERER_TYPE.WEBGL;
    }

    /**
     * Checks whether the current browser supports WebGL.
     *
     * @
     * @method hasWebGL
     * @return {Boolean} True if the current browser supports WebGL.
     */
    static hasWebGL() {
        return true;
    }

    /**
     * Checks whether the canvas blend mode 'difference' is supported.
     *
     * @
     * @method canUseDifferenceBlend
     * @return {Boolean} True if the canvas blend mode 'difference' is supported
     */
    static canUseDifferenceBlend() {
        return this._canUseDifferenceBlend;
    }

    /**
     * Checks whether the canvas blend mode 'saturation' is supported.
     *
     * @
     * @method canUseSaturationBlend
     * @return {Boolean} True if the canvas blend mode 'saturation' is supported
     */
    static canUseSaturationBlend() {
        return this._canUseSaturationBlend;
    }

    /**
     * Sets the source of the "Now Loading" image.
     *
     * @
     * @method setLoadingImage
     */
    static setLoadingImage(src) {
        // this._loadingImage = new Image();
        // this._loadingImage = wx.createImage();
        // this._loadingImage.src = src;
    }

    /**
     * Initializes the counter for displaying the "Now Loading" image.
     *
     * @
     * @method startLoading
     */
    static startLoading() {
        this._loadingCount = 0;
    }

    static updateLoading() {
        this._loadingCount++;
    }

    static endLoading() {
        // console.log(this._loadingCount);
    }

    /**
     * Displays the error text to the screen.
     *
     * @
     * @method printError
     * @param {String} name The name of the error
     * @param {String} message The message of the error
     */
    static printError(name, message) {
        console.log(name, message);
    }

    /**
     * Loads a font file.
     *
     * @
     * @method loadFont
     * @param {String} name The face name of the font
     * @param {String} url The url of the font file
     */
    static loadFont(name, url) {
        //暂时不需要font
        return;
        var style = document.createElement('style');
        var head = document.getElementsByTagName('head');
        var rule = '@font-face { font-family: "' + name + '"; src: url("' + url + '"); }';
        style.type = 'text/css';
        head.item(0).appendChild(style);
        style.sheet.insertRule(rule, 0);
        this._createFontLoader(name);
    }

    /**
     * Checks whether the font file is loaded.
     *
     * @
     * @method isFontLoaded
     * @param {String} name The face name of the font
     * @return {Boolean} True if the font file is loaded
     */
    static isFontLoaded(name) {
        //加载字体
        wx.loadFont('40px ' + name + ', sans-serif');
        return true;
        if (_cssFontLoading) {
            if (_fontLoaded) {
                return _fontLoaded.check('10px "' + name + '"');
            }

            return false;
        } else {
            if (!this._hiddenCanvas) {
                this._hiddenCanvas = wx.createCanvas();
            }
            var context = this._hiddenCanvas.getContext('2d');
            var text = 'abcdefghijklmnopqrstuvwxyz';
            var width1, width2;
            context.font = '40px ' + name + ', sans-serif';
            width1 = context.measureText(text).width;
            context.font = '40px sans-serif';
            width2 = context.measureText(text).width;
            return width1 !== width2;
        }
    }

    /**
     * Starts playback of a video.
     *
     * @
     * @method playVideo
     * @param {String} src
     */
    static playVideo(src) {
        this._videoLoader = ResourceHandler.createLoader(null, this._playVideo.bind(Graphics, src), this._onVideoError.bind(Graphics));
        this._playVideo(src);
    }

    /**
     * @
     * @method _playVideo
     * @param {String} src
     * @private
     */
    static _playVideo(src) {
        this._video.src = src;
        this._video.onloadeddata = this._onVideoLoad.bind(Graphics);
        this._video.onerror = this._videoLoader;
        this._video.onended = this._onVideoEnd.bind(Graphics);
        this._video.load();
        this._videoLoading = true;
    }

    /**
     * Checks whether the video is playing.
     *
     * @
     * @method isVideoPlaying
     * @return {Boolean} True if the video is playing
     */
    static isVideoPlaying() {
        return this._videoLoading || this._isVideoVisible();
    }

    /**
     * Checks whether the browser can play the specified video type.
     *
     * @
     * @method canPlayVideoType
     * @param {String} type The video type to test support for
     * @return {Boolean} True if the browser can play the specified video type
     */
    static canPlayVideoType(type) {
        return this._video && this._video.canPlayType(type);
    }

    /**
     * Sets volume of a video.
     *
     * @
     * @method setVideoVolume
     * @param {Number} value
     */
    static setVideoVolume(value) {
        this._videoVolume = value;
        if (this._video) {
            this._video.volume = this._videoVolume;
        }
    }

    /**
     * Converts an x coordinate on the page to the corresponding
     * x coordinate on the canvas area.
     *
     * @
     * @method pageToCanvasX
     * @param {Number} x The x coordinate on the page to be converted
     * @return {Number} The x coordinate on the canvas area
     */
    static pageToCanvasX(x) {
        if (this._canvas) {
            var left = this._canvas.offsetLeft;
            return Math.round((x - left) / this._realScale);
        } else {
            return 0;
        }
    }

    /**
     * Converts a y coordinate on the page to the corresponding
     * y coordinate on the canvas area.
     *
     * @
     * @method pageToCanvasY
     * @param {Number} y The y coordinate on the page to be converted
     * @return {Number} The y coordinate on the canvas area
     */
    static pageToCanvasY(y) {
        if (this._canvas) {
            var top = this._canvas.offsetTop;
            return Math.round((y - top) / this._realScale);
        } else {
            return 0;
        }
    }

    /**
     * Checks whether the specified point is inside the game canvas area.
     *
     * @
     * @method isInsideCanvas
     * @param {Number} x The x coordinate on the canvas area
     * @param {Number} y The y coordinate on the canvas area
     * @return {Boolean} True if the specified point is inside the game canvas area
     */
    static isInsideCanvas(x, y) {
        return (x >= 0 && x < this._width && y >= 0 && y < this._height);
    }

    /**
     * Calls pixi.js garbage collector
     */
    static callGC() {
        if (isWebGL()) {
            _renderer.textureGC.run();
        }
    }


    /**
     * The width of the game screen.
     *
     * @
     * @property width
     * @type Number
     */
    static get width() {
        return Graphics._width;
    }

    static set width(value) {
        if (Graphics._width != value) {
            Graphics._width = value;
            Graphics._updateAllElements();
        }
    }

    /**
     * The height of the game screen.
     *
     * @
     * @property height
     * @type Number
     */
    static get height() {
        return this._height;
    }
    static set height(value) {
        if (Graphics._height !== value) {
            Graphics._height = value;
            Graphics._updateAllElements();
        }
    }

    /**
     * The width of the window display area.
     *
     * @
     * @property boxWidth
     * @type Number
     */
    static get boxWidth() {
        return this._boxWidth;
    }
    static set boxWidth(value) {
        this._boxWidth = value;
    }

    /**
     * The height of the window display area.
     *
     * @
     * @property boxHeight
     * @type Number
     */
    static get boxHeight() {
        return this._boxHeight;
    }
    static set boxHeight(value) {
        this._boxHeight = value;
    }

    /**
     * The zoom scale of the game screen.
     *
     * @
     * @property scale
     * @type Number
     */
    get scale() {
        return this._scale;
    }
    set scale(value) {
        if (this._scale !== value) {
            this._scale = value;
            this._updateAllElements();
        }
    }

    /**
     * @
     * @method _createAllElements
     * @private
     */
    static _createAllElements() {
        // this._createErrorPrinter();
        this._createCanvas();
        // this._createVideo();
        // this._createUpperCanvas();
        this._createRenderer();
        // this._createFPSMeter();
        // this._createModeBox();
        // this._createGameFontLoader();
    }

    /**
     * @
     * @method _updateAllElements
     * @private
     */
    static _updateAllElements() {
        // this._updateRealScale();
        // this._updateErrorPrinter();
        this._updateCanvas();
        // this._updateVideo();
        // this._updateUpperCanvas();
        this._updateRenderer();
        // this._paintUpperCanvas();
    }

    /**
     * @
     * @method _updateRealScale
     * @private
     */
    static _updateRealScale() {
        if (this._stretchEnabled) {
            var h = MiniGame.screenWidth / this._width;
            var v = MiniGame.screenHeight / this._height;
            if (h >= 1 && h - 0.01 <= 1) h = 1;
            if (v >= 1 && v - 0.01 <= 1) v = 1;
            this._realScale = Math.min(h, v);
        } else {
            this._realScale = this._scale;
        }
    }

    /**
     * @
     * @method _makeErrorHtml
     * @param {String} name
     * @param {String} message
     * @return {String}
     * @private
     */
    static _makeErrorHtml(name, message) {
        return ('<font color="yellow"><b>' + name + '</b></font><br>' +
            '<font color="white">' + message + '</font><br>');
    }

    /**
     * @
     * @method _defaultStretchMode
     * @private
     */
    static _defaultStretchMode() {
        return Utils.isNwjs() || Utils.isMobileDevice();
    }

    /**
     * @
     * @method _createCanvas
     * @private
     */
    static _createCanvas() {
        this._canvas = canvas;
        this._canvas.id = 'GameCanvas';
        this._updateCanvas();
    }

    /**
     * @
     * @method _updateCanvas
     * @private
     */
    static _updateCanvas() {
        this._canvas.width = this._width;
        this._canvas.height = this._height;
    }

    /**
     * @
     * @method _createVideo
     * @private
     */
    static _createVideo() {
        // this._video = document.createElement('video');
        // this._video.id = 'GameVideo';
        // this._video.style.opacity = 0;
        // this._video.setAttribute('playsinline', '');
        // this._video.volume = this._videoVolume;
        // this._updateVideo();
        // makeVideoPlayableInline(this._video);
        // document.body.appendChild(this._video);
    }

    /**
     * @
     * @method _updateVideo
     * @private
     */
    static _updateVideo() {
        this._video.width = this._width;
        this._video.height = this._height;
        this._video.style.zIndex = 2;
        // this._centerElement(this._video);
    }


    /**
     * @
     * @method _createRenderer
     * @private
     */
    static _createRenderer() {
        PIXI.dontSayHello = true;
        var width = this._width;
        var height = this._height;
        var options = { view: this._canvas }
        // try {
        if (GameGlobal.webgl) {
            switch (this._rendererType) {
                case 'canvas':
                    this._renderer = new PIXI.CanvasRenderer(width, height, options);
                    break;
                case 'webgl':
                    this._renderer = new PIXI.WebGLRenderer(width, height, options);
                    break;
                default:
                    this._renderer = new PIXI.WebGLRenderer(width, height, options);
                    break;
            }
        } else {
            this._renderer = new PIXI.CanvasRenderer(width, height, options);
        }
        if (this._renderer && this._renderer.textureGC)
            this._renderer.textureGC.maxIdle = 1;

        // } catch (e) {
        //     this._renderer = null;
        // }
    }

    /**
     * @
     * @method _updateRenderer
     * @private
     */
    static _updateRenderer() {
        if (this._renderer) {
            this._renderer.resize(this._width, this._height);
        }
    }



    /**
     * @
     * @method _createGameFontLoader
     * @private
     */
    _createGameFontLoader() {
        this._createFontLoader('GameFont');
    }

    /**
     * @
     * @method _createFontLoader
     * @param {String} name
     * @private
     */
    static _createFontLoader(name) {
        var div = document.createElement('div');
        var text = document.createTextNode('.');
        div.style.fontFamily = name;
        div.style.fontSize = '0px';
        div.style.color = 'transparent';
        div.style.position = 'absolute';
        div.style.margin = 'auto';
        div.style.top = '0px';
        div.style.left = '0px';
        div.style.width = '1px';
        div.style.height = '1px';
        div.appendChild(text);
        document.body.appendChild(div);
    }

    /**
     * @
     * @method _disableTextSelection
     * @private
     */
    static _disableTextSelection() {
        return;
    }

    /**
     * @
     * @method _onVideoLoad
     * @private
     */
    static _onVideoLoad() {
        this._video.play();
        this._updateVisibility(true);
        this._videoLoading = false;
    }

    /**
     * @
     * @method _onVideoError
     * @private
     */
    static _onVideoError() {
        this._updateVisibility(false);
        this._videoLoading = false;
    }

    /**
     * @
     * @method _onVideoEnd
     * @private
     */
    static _onVideoEnd() {
        this._updateVisibility(false);
    }

    /**
     * @
     * @method _updateVisibility
     * @param {Boolean} videoVisible
     * @private
     */
    static _updateVisibility(videoVisible) {
        this._video.style.opacity = videoVisible ? 1 : 0;
        this._canvas.style.opacity = videoVisible ? 0 : 1;
    }

    /**
     * @
     * @method _isVideoVisible
     * @return {Boolean}
     * @private
     */
    static _isVideoVisible() {
        return this._video.style.opacity > 0;
    }

    /**
     * @
     * @method _setupEventHandlers
     * @private
     */
    static _setupEventHandlers() {
        // window.addEventListener('resize', this._onWindowResize.bind(Graphics));
        // document.addEventListener('keydown', this._onKeyDown.bind(Graphics));
        // document.addEventListener('keydown', this._onTouchEnd.bind(Graphics));
        // document.addEventListener('mousedown', this._onTouchEnd.bind(Graphics));
        // document.addEventListener('touchend', this._onTouchEnd.bind(Graphics));
    }

    /**
     * @
     * @method _onTouchEnd
     * @param {TouchEvent} event
     * @private
     */
    static _onTouchEnd(event) {
        if (!this._videoUnlocked) {
            this._video.play();
            this._videoUnlocked = true;
        }
        if (this._isVideoVisible() && this._video.paused) {
            this._video.play();
        }
    }

    static get canvas() {
        return this._canvas;
    }
}