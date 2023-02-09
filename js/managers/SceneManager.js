import Utils from "../core/utils"
import Graphics from '../core/graphics'
import AudioManager from './AudioManager'
import Input from '../core/input'
import TouchInput from '../core/touchInput'
import PluginManager from './PluginManager'
import ImageManager from './ImageManager'
import Bitmap from '../core/bitmap'
import MiniGame from "../18ext/MiniGame"
/**
 * create by 18tech
 * 2019年11月21日
 * 场景管理器
 */
export default class SceneManager {
    constructor() {
        throw new Error('This is a static class');
    }

    /*
     * Gets the current time in ms without on iOS Safari.
     * @private
     */
    static _getTimeInMsWithoutMobileSafari = function () {
        return performance.now();
    }

    static _scene = null;
    static _nextScene = null;
    static _stack = [];
    static _stopped = false;
    static _sceneStarted = false;
    static _exiting = false;
    static _previousClass = null;
    static _backgroundBitmap = null;

    //设置屏幕宽高
    //微信小游戏中与手机显示不同
    // static _screenWidth = wx.getSystemInfoSync().screenWidth;
    // static _screenHeight = wx.getSystemInfoSync().screenHeight;
    // static _boxWidth = wx.getSystemInfoSync().screenWidth;
    // static _boxHeight = wx.getSystemInfoSync().screenHeight;
    // static _screenWidth = canvas.width;
    // static _screenHeight = canvas.height;
    // static _boxWidth = canvas.width;
    // static _boxHeight = canvas.height;
    static _deltaTime = 1.0 / 60.0;
    static _accumulator = 0.0;

    static run = function (sceneClass) {
        try {
            this.initialize();
            this.goto(sceneClass);
            this.requestUpdate();
        } catch (e) {
            this.catchException(e);
        }
    }

    static initialize = function () {
        SceneManager.initGraphics();
        SceneManager.checkFileAccess();
        SceneManager.initAudio();
        SceneManager.initInput();
        SceneManager.checkPluginErrors();
        SceneManager.setupErrorHandlers();
    }

    static initGraphics = function () {
        var type = this.preferableRendererType();
        Graphics.initialize(MiniGame.screenWidth, MiniGame.screenHeight, type);
        Graphics.boxWidth = MiniGame.screenWidth;
        Graphics.boxHeight = MiniGame.screenHeight;
        Graphics.setLoadingImage(ImageManager.server_url + 'img/system/Loading.png');
        if (Utils.isOptionValid('showfps')) {
            Graphics.showFps();
        }
        if (type === 'webgl') {
            this.checkWebGL();
        }
    }

    static preferableRendererType = function () {
        return "webgl";
    }

    static shouldUseCanvasRenderer = function () {
        return Utils.isMobileDevice();
    }

    static checkWebGL = function () {
        if (!Graphics.hasWebGL()) {
            throw new Error('Your browser does not support WebGL.');
        }
    }

    static checkFileAccess = function () {
        if (!Utils.canReadGameFiles()) {
            throw new Error('Your browser does not allow to read local files.');
        }
    }

    static initAudio = function () {
        return;
    }

    static initInput = function () {
        Input.initialize();
        TouchInput.initialize();
    }

    static checkPluginErrors = function () {
        PluginManager.checkErrors();
    }

    static setupErrorHandlers = function () {
        window.addEventListener('error', this.onError.bind(this));
        // document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    static requestUpdate = function () {
        if (!this._stopped) {
            requestAnimationFrame(this.update.bind(this));
        }
    }

    static update = function () {
        try {
            this.tickStart();
            if (Utils.isMobileSafari()) {
                this.updateInputData();
            }
            this.updateManagers();
            this.updateMain();
            this.tickEnd();
        } catch (e) {
            this.catchException(e);
        }
    }

    static terminate = function () {
        window.close();
    }

    static onError = function (e) {
        console.error(e.message);
        console.error(e.filename, e.lineno);
        try {
            this.stop();
            Graphics.printError('Error', e.message);
            AudioManager.stopAll();
        } catch (e2) {
        }
    }

    static onKeyDown = function (event) {
        if (!event.ctrlKey && !event.altKey) {
            switch (event.keyCode) {
                case 116:   // F5
                    if (Utils.isNwjs()) {
                        location.reload();
                    }
                    break;
                case 119:   // F8
                    if (Utils.isNwjs() && Utils.isOptionValid('test')) {
                        require('nw.gui').Window.get().showDevTools();
                    }
                    break;
            }
        }
    }

    static catchException = function (e) {
        if (e instanceof Error) {
            Graphics.printError(e.name, e.message);
            console.error(e.stack);
        } else {
            Graphics.printError('UnknownError', e);
        }
        AudioManager.stopAll();
        this.stop();
    }

    static tickStart = function () {
        Graphics.tickStart();
    }

    static tickEnd = function () {
        Graphics.tickEnd();
    }

    static updateInputData = function () {
        Input.update();
        TouchInput.update();
    }

    static updateMain = function () {
        
            var newTime = this._getTimeInMsWithoutMobileSafari();
            var fTime = (newTime - this._currentTime) / 1000;
            if (fTime > 0.25) fTime = 0.25;
            this._currentTime = newTime;
            this._accumulator += isNaN(fTime) ? 0 : fTime;
            while (this._accumulator >= this._deltaTime) {
                this.updateInputData();
                 this.changeScene();
                this.updateScene();
                this._accumulator -= this._deltaTime;
        }
        this.renderScene();
        this.requestUpdate();
    }

    static updateManagers = function () {
        ImageManager.update();
    }

    static changeScene = function () {
        if (this.isSceneChanging() && !this.isCurrentSceneBusy()) {
            if (this._scene) {
                this._scene.terminate();
                this._scene.detachReservation();
                this._previousClass = this._scene.constructor;
            }
            this._scene = this._nextScene;
            if (this._scene) {
                this._scene.attachReservation();
                this._scene.create();
                this._nextScene = null;
                this._sceneStarted = false;
                this.onSceneCreate();
            }
            if (this._exiting) {
                this.terminate();
            }
        }
    }

    static updateScene = function () {
        if (this._scene) {
            if (!this._sceneStarted && this._scene.isReady()) {
                this._scene.start();
                this._sceneStarted = true;
                this.onSceneStart();
            }
            if (this.isCurrentSceneStarted()) {
                this._scene.update();
            }
        }
    }

    static renderScene = function () {
        if (this.isCurrentSceneStarted()) {
            Graphics.render(this._scene);
        } else if (this._scene) {
            this.onSceneLoading();
        }
    }

    static onSceneCreate = function () {
        Graphics.startLoading();
    }

    static onSceneStart = function () {
        Graphics.endLoading();
    }

    static onSceneLoading = function () {
        Graphics.updateLoading();
    }

    static isSceneChanging = function () {
        return this._exiting || !!this._nextScene;
    }

    static isCurrentSceneBusy = function () {
        return this._scene && this._scene.isBusy();
    }

    static isCurrentSceneStarted = function () {
        return this._scene && this._sceneStarted;
    }

    static isNextScene = function (sceneClass) {
        return this._nextScene && this._nextScene.constructor === sceneClass;
    }

    static isPreviousScene = function (sceneClass) {
        return this._previousClass === sceneClass;
    }

    static goto = function (sceneClass) {
        if (sceneClass) {
            this._nextScene = new sceneClass();
        }
        if (this._scene) {
            this._scene.stop();
        }
    }

    static push = function (sceneClass) {
        this._stack.push(this._scene.constructor);
        this.goto(sceneClass);
    }

    static pop = function () {
        if (this._stack.length > 0) {
            this.goto(this._stack.pop());
        } else {
            this.exit();
        }
    }

    static exit = function () {
        this.goto(null);
        this._exiting = true;
    }

    static clearStack = function () {
        this._stack = [];
    }

    static stop = function () {
        this._stopped = true;
    }

    static prepareNextScene = function () {
        this._nextScene.prepare.apply(this._nextScene, arguments);
    }

    static snap() {
        return Bitmap.snap(this._scene);
    }

    static snapForBackground = function () {
        this._backgroundBitmap = SceneManager.snap();
        this._backgroundBitmap.blur();
    }

    static backgroundBitmap = function () {
        return this._backgroundBitmap;
    }

    static resume = function () {
        this._stopped = false;
        this.requestUpdate();
        if (!Utils.isMobileSafari()) {
            this._currentTime = this._getTimeInMsWithoutMobileSafari();
            this._accumulator = 0;
        }
    }
}