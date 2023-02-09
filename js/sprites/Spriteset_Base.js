import ScreenSprite from '../core/screenSprite';
import Sprite from '../core/sprite';
import ToneFilter from '../core/toneFilter';
import Graphics from '../core/graphics'
import ToneSprite from '../core/toneSprite'
import Sprite_Picture from './Sprite_Picture'
import Sprite_Timer from './Sprite_Timer'
import Rectangle from '../core/rectangle'
export default class Spriteset_Base extends Sprite {

    constructor() {
        super();
        this.initialize();
    }
    
    initialize() {
        super.initialize();
        this.setFrame(0, 0, Graphics.width, Graphics.height);
        this._tone = [0, 0, 0, 0];
        this.opaque = true;
        this.createLowerLayer();
        this.createToneChanger();
        this.createUpperLayer();
        this.update();
    }

    createLowerLayer() {
        this.createBaseSprite();
    }

    createUpperLayer() {
        this.createPictures();
        this.createTimer();
        this.createScreenSprites();
    }

    update() {
        super.update();
        this.updateScreenSprites();
        this.updateToneChanger();
        this.updatePosition();
    }

    createBaseSprite() {
        this._baseSprite = new Sprite();
        this._baseSprite.setFrame(0, 0, this.width, this.height);
        this._blackScreen = new ScreenSprite();
        this._blackScreen.opacity = 255;
        this.addChild(this._baseSprite);
        this._baseSprite.addChild(this._blackScreen);
    }

    createToneChanger() {
        if (Graphics.isWebGL()) {
            this.createWebGLToneChanger();
        } else {
            this.createCanvasToneChanger();
        }
    }

    createWebGLToneChanger() {
        var margin = 48;
        var width = Graphics.width + margin * 2;
        var height = Graphics.height + margin * 2;
        this._toneFilter = new ToneFilter();
        this._baseSprite.filters = [this._toneFilter];
        this._baseSprite.filterArea = new Rectangle(-margin, -margin, width, height);
    }

    createCanvasToneChanger() {
        this._toneSprite = new ToneSprite();
        this.addChild(this._toneSprite);
    }

    createPictures() {
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight;
        var x = (Graphics.width - width) / 2;
        var y = (Graphics.height - height) / 2;
        this._pictureContainer = new Sprite();
        this._pictureContainer.setFrame(x, y, width, height);
        for (var i = 1; i <= GameGlobal.$gameScreen.maxPictures(); i++) {
            this._pictureContainer.addChild(new Sprite_Picture(i));
        }
        this.addChild(this._pictureContainer);
    }

    createTimer() {
        this._timerSprite = new Sprite_Timer();
        this.addChild(this._timerSprite);
    }

    createScreenSprites() {
        this._flashSprite = new ScreenSprite();
        this._fadeSprite = new ScreenSprite();
        this.addChild(this._flashSprite);
        this.addChild(this._fadeSprite);
    }

    updateScreenSprites() {
        var color = GameGlobal.$gameScreen.flashColor();
        this._flashSprite.setColor(color[0], color[1], color[2]);
        this._flashSprite.opacity = color[3];
        this._fadeSprite.opacity = 255 - GameGlobal.$gameScreen.brightness();
    }

    updateToneChanger() {
        var tone = GameGlobal.$gameScreen.tone();
        if (!this._tone.equals(tone)) {
            this._tone = tone.clone();
            if (Graphics.isWebGL()) {
                this.updateWebGLToneChanger();
            } else {
                this.updateCanvasToneChanger();
            }
        }
    }

    updateWebGLToneChanger() {
        var tone = this._tone;
        this._toneFilter.reset();
        this._toneFilter.adjustTone(tone[0], tone[1], tone[2]);
        this._toneFilter.adjustSaturation(-tone[3]);
    }

    updateCanvasToneChanger() {
        var tone = this._tone;
        this._toneSprite.setTone(tone[0], tone[1], tone[2], tone[3]);
    }

    updatePosition() {
        var screen = GameGlobal.$gameScreen;
        var scale = screen.zoomScale();
        this.scale.x = scale;
        this.scale.y = scale;
        this.x = Math.round(-screen.zoomX() * (scale - 1));
        this.y = Math.round(-screen.zoomY() * (scale - 1));
        this.x += Math.round(screen.shake());
    }
}