import Scene_Base from './Scene_Base'
import SoundManager from '../managers/SoundManager'
import DataManager from '../managers/DataManager'
import SceneManager from '../managers/SceneManager'
import Window_TitleCommand from '../windows/Window_TitleCommand'
import ImageManager from '../managers/ImageManager'
import Sprite from '../core/sprite'
import Scene_Map from '../scenes/Scene_Map'
import Scene_Title from '../scenes/Scene_Title'
import Graphics from '../core/graphics'
/**
 * create by 18tech
 */
export default class Scene_Splash extends Scene_Base {

    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        super.initialize(this);
        this._mvSplash = null;
        this._customSplash = null;
        this._mvWaitTime = 160;
        this._customWaitTime = 160;
        this._mvFadeOut = false;
        this._mvFadeIn = false;
        this._customFadeOut = false;
        this._customFadeIn = false;
    }

    create() {
        super.create();
        this.createSplashes();
    }

    start() {
        super.start();
        SceneManager.clearStack();
        if (this._mvSplash != null) {
            this.centerSprite(this._mvSplash);
        }
        if (this._customSplash != null) {
            this.centerSprite(this._customSplash);
        }
    }

    update() {
        if (!this._mvFadeIn) {
            this.startFadeIn(120, false);
            this._mvFadeIn = true;
        } else {
            if (this._mvWaitTime > 0 && this._mvFadeOut == false) {
                this._mvWaitTime--;
            } else {
                if (this._mvFadeOut == false) {
                    this._mvFadeOut = true;
                    this.startFadeOut(120, false);
                }
            }
        }

        // if (ShowCustom) {
        if (this._mvFadeOut == true) {
            if (!this._customFadeIn && this._fadeDuration == 0) {
                this._customSplash.opacity = 255;
                this._customWaitTime = 160;
                this.startFadeIn(120, false);
                this._customFadeIn = true;
            } else {
                if (this._customWaitTime > 0 && this._customFadeOut == false) {
                    this._customWaitTime--;
                } else {
                    if (this._customFadeOut == false) {
                        this._customFadeOut = true;
                        this.startFadeOut(120, false);
                    }
                }
            }
        }

        if (this._mvFadeOut == true) {
            this.gotoTitleOrTest();
        }

        super.update(this);
    }

    createSplashes() {
        this._mvSplash = new Sprite(ImageManager.loadSystem("MadeWithMv"));
        this.addChild(this._mvSplash);
    }

    centerSprite(sprite) {
        sprite.x = Graphics.width / 2;
        sprite.y = Graphics.height / 2;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
    }

    gotoTitleOrTest() {
        super.start();
        SoundManager.preloadImportantSounds();

        this.checkPlayerLocation();
        DataManager.setupNewGame();

        SceneManager.goto(Scene_Title);
        Window_TitleCommand.initCommandPosition();
        // 直接进入游戏
        // SceneManager.goto(Scene_Map);
    }

    checkPlayerLocation() {
        if (GameGlobal.$dataSystem.startMapId === 0) {
            throw new Error('Player\'s starting position is not set');
        }
    }
}