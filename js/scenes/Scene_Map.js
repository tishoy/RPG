import Scene_Base from './Scene_Base'
import Scene_Title from './Scene_Title'
import Spriteset_Map from '../sprites/Spriteset_Map'
import DataManager from '../managers/DataManager'
import Window_MapName from '../windows/Window_MapName'
import Window_Message from '../windows/Window_Message'
import Window_ScrollText from '../windows/Window_ScrollText'
import SceneManager from '../managers/SceneManager'
import ImageManager from '../managers/ImageManager'
import TouchInput from '../core/touchInput'
import Input from '../core/input'
import Scene_Gameover from './Scene_Gameover'
import Scene_Load from './Scene_Load'
import AudioManager from '../managers/AudioManager'
import SoundManager from '../managers/SoundManager'
import Window_MenuCommand from '../windows/Window_MenuCommand'
import Scene_Menu from './Scene_Menu'
import Sprite_Joystick from '../sprites/Sprite_Joystick'
import Sprite_Button from '../sprites/Sprite_Button'
import Graphics from '../core/graphics'
import ColliderManager from '../managers/ColliderManager'
import Movement from '../core/movement'
var TWEEN = require('../18ext/Tween')

export default class Scene_Map extends Scene_Base {
    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        super.initialize();
        this._waitCount = 0;
        this._encounterEffectDuration = 0;
        this._mapLoaded = false;
        this._touchCount = 0;
        GameGlobal.$gameSystem.preloadAllSkills();
    }

    create() {
        super.create();
        this._transfer = GameGlobal.$gamePlayer.isTransferring();
        var mapId = this._transfer ? GameGlobal.$gamePlayer.newMapId() : GameGlobal.$gameMap.mapId();
        DataManager.loadMapData(mapId);
    }

    isReady() {
        if (!this._mapLoaded && DataManager.isMapLoaded()) {
            this.onMapLoaded();
            this._mapLoaded = true;
        }
        return this._mapLoaded && super.isReady();
    }

    onMapLoaded() {
        if (this._transfer) {
            GameGlobal.$gamePlayer.performTransfer();
        }
        this.createDisplayObjects();
    }

    start() {
        super.start();
        SceneManager.clearStack();
        this._mapNameWindow.open();
        if (this._transfer) {
            this.fadeInForTransfer();

            GameGlobal.$gameMap.autoplay();
        } else if (this.needsFadeIn()) {
            this.startFadeIn(this.fadeSpeed(), false);
        }
        this.menuCalling = false;
    }

    update() {
        if (TouchInput.isMoved()) {
            this.updateMouseInsideWindow();
        }
        this.touchInSkills();
        // if (!this.touchInSkills()) {

        // }
        this.updateJoystick();
        this.updateDestination();
        this.updateMainMultiply();
        if (this.isSceneChangeOk()) {
            this.updateScene();
        }
        this.updateWaitCount();
        TWEEN.update();
        super.update();
    }

    updateMouseInsideWindow() {
        var inside = false;
        var windows = this._windowLayer.children;
        for (var i = 0; i < windows.length; i++) {
            if (windows[i].visible && windows[i].isOpen() && windows[i].isMouseInside()) {
                inside = true;
                break;
            }
        }
        TouchInput.insideWindow = inside;
    };

    updateMainMultiply() {
        this.updateMain();
        if (this.isFastForward()) {
            this.updateMain();
        }
    }

    updateMain() {
        var active = this.isActive();
        GameGlobal.$gameMap.update(active);
        GameGlobal.$gamePlayer.update(active);
        GameGlobal.$gameTimer.update(active);
        GameGlobal.$gameScreen.update();
        if (GameGlobal.$gameTemp.isPlaytest()) {
            ColliderManager.toggle();
        }
        ColliderManager.update();
    }

    isFastForward() {
        return (GameGlobal.$gameMap.isEventRunning() && !SceneManager.isSceneChanging() &&
            (Input.isLongPressed('ok') || TouchInput.isLongPressed()));
    }

    stop() {
        super.stop();
        GameGlobal.$gamePlayer.straighten();
        this._mapNameWindow.close();
        if (this.needsSlowFadeOut()) {
            this.startFadeOut(this.slowFadeSpeed(), false);
        } else if (SceneManager.isNextScene(Scene_Map)) {
            this.fadeOutForTransfer();
        }
    }

    isBusy() {
        return ((this._messageWindow && this._messageWindow.isClosing()) ||
            this._waitCount > 0 || this._encounterEffectDuration > 0 ||
            super.isBusy())
    }

    terminate() {
        super.terminate();
        this._spriteset.update();
        this._mapNameWindow.hide();
        SceneManager.snapForBackground();

        if (SceneManager.isNextScene(Scene_Map)) {
            ImageManager.clearRequest();
        }

        GameGlobal.$gameScreen.clearZoom();

        this.removeChild(this._fadeSprite);
        this.removeChild(this._mapNameWindow);
        this.removeChild(this._windowLayer);
        this.removeChild(this._spriteset);
    }

    needsFadeIn() {
        return SceneManager.isPreviousScene(Scene_Load);
    }

    needsSlowFadeOut() {
        return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover));
    }

    updateWaitCount() {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        }
        return false;
    }

    updateJoystick() {
        this.processJoystickTouch();
    }

    touchInSkills() {
        if (this._attack.isButtonTouched()) {
            if (TouchInput.isLongPressed()) {
                this._touchingSkill = 1;
                return false;
            } else if (TouchInput.isTriggered()) {
                this._touchingSkill = 1;
                return true;
            } else if (TouchInput.isReleased()) {
                GameGlobal.$gamePlayer.useSkill(7);
                this._touchingSkill = 0;
                this._skillRelease = true;
                return false;
            }
        }
        if (this._combatOne.isButtonTouched()) {
            if (TouchInput.isLongPressed()) {
                this._touchingSkill = 2;
                return false;
            } else if (TouchInput.isTriggered()) {
                this._touchingSkill = 2;
                return true;
            } else if (TouchInput.isReleased()) {
                GameGlobal.$gamePlayer.useSkill(22);
                this._skillRelease = true;
                this._touchingSkill = 0;
                return false;
            }
        }
        if (this._combatTwo.isButtonTouched()) {
            if (TouchInput.isLongPressed()) {
                this._touchingSkill = 3;
                return false;
            } else if (TouchInput.isTriggered()) {
                this._touchingSkill = 3;
                return true;
            } else if (TouchInput.isReleased()) {
                GameGlobal.$gamePlayer.useSkill(21);
                this._touchingSkill = 0;
                return false;
            }
        }
        if (this._combatThree.isButtonTouched()) {
            if (TouchInput.isLongPressed()) {
                this._touchingSkill = 4;
                return false;
            } else if (TouchInput.isTriggered()) {
                this._touchingSkill = 4;
                return true;
            } else if (TouchInput.isReleased()) {
                GameGlobal.$gamePlayer.useSkill(20);
                this._touchingSkill = 0;
                return false;
            }
        }
        if (this._auxiliary1.isButtonTouched()) {
            if (TouchInput.isLongPressed()) {
                this._touchingSkill = 5;
                return false;
            } else if (TouchInput.isTriggered()) {
                this._touchingSkill = 5;
                return true;
            } else if (TouchInput.isReleased()) {
                GameGlobal.$gamePlayer.useSkill(19);
                this._touchingSkill = 0;
                return false;
            }
        }
        if (this._auxiliary2.isButtonTouched()) {
            if (TouchInput.isLongPressed()) {
                this._touchingSkill = 6;
                return false;
            } else if (TouchInput.isTriggered()) {
                this._touchingSkill = 6;
                return true;
            } else if (TouchInput.isReleased()) {
                GameGlobal.$gamePlayer.useSkill(17);
                this._touchingSkill = 0;
                return false;
            }
        }
        this._touchingSkill = 0;

        this._skillRelease = false;
        return false;
    }

    processJoystickTouch() {
        if (this._joystick.isActive()) {
            if (TouchInput.isTriggered()) {
                if (!this._joystick.touching && !this.touchInSkills()) {
                    this._joystick.setPosition(TouchInput.x, TouchInput.y);
                    this._joystick.touchBegin();
                    this.addChild(this._joystick._gamepad);
                    this.addChild(this._joystick);
                }
            }
            if (this._joystick.touching) {
                if ((TouchInput.isMoved() || TouchInput.isLongPressed())) {
                    var movement = this._joystick.touchMove();
                    // if (movement.distance > 200) {
                    //     // 超过400距离视为move失败
                    //     GameGlobal.$gameTemp.clearDestination();
                    //     this._joystick.touchEnd();
                    //     this.removeChild(this._joystick._gamepad);
                    //     this.removeChild(this._joystick);
                    // }
                    if (movement.x == 0 && movement.y == 0) {
                        return;
                    }
                
                    var x = movement.x + GameGlobal.$gamePlayer._px;
                    var y = movement.y + GameGlobal.$gamePlayer._py;
                    if (!GameGlobal.$gameMap.offGrid()) {
                        var ox = x % Movement.tileSize;
                        var oy = y % Movement.tileSize;
                        x += Movement.tileSize / 2 - ox;
                        y += Movement.tileSize / 2 - oy;
                    }
                    GameGlobal.$gameTemp.setPixelDestination(x, y);
                } else if (TouchInput.isReleased() && !this._skillRelease) {
                    GameGlobal.$gameTemp.clearDestination();
                    this._joystick.touchEnd();
                    this.removeChild(this._joystick._gamepad);
                    this.removeChild(this._joystick);
                }
            } else {
                GameGlobal.$gameTemp.clearDestination();
                    this._joystick.touchEnd();
                    this.removeChild(this._joystick._gamepad);
                    this.removeChild(this._joystick); 
            }
        }
    }

    updateDestination() {
        if (this._joystick._touching) {

        } else if (this.isMapTouchOk()) {
            // this.processMapTouch();
        } else {
            GameGlobal.$gameTemp.clearDestination();
            this._touchCount = 0;
        }
        if (!this.isMapTouchOk()) {
            GameGlobal.$gamePlayer.clearMouseMove();
        }
    }

    isMapTouchOk() {
        // return false;
        return this.isActive() && GameGlobal.$gamePlayer.canMove();
    }

    processMapTouch() {
        if (TouchInput.isTriggered() || this._touchCount > 0) {
            if (TouchInput.isPressed()) {
                if (this._touchCount === 0 || this._touchCount >= 20) {
                    var x = GameGlobal.$gameMap.canvasToMapPX(TouchInput.x);
                    var y = GameGlobal.$gameMap.canvasToMapPY(TouchInput.y);
                    if (!GameGlobal.$gameMap.offGrid()) {
                        var ox = x % Movement.tileSize;
                        var oy = y % Movement.tileSize;
                        x += Movement.tileSize / 2 - ox;
                        y += Movement.tileSize / 2 - oy;
                    }
                    GameGlobal.$gameTemp.setPixelDestination(x, y);
                }
                this._touchCount++;
            } else {
                this._touchCount = 0;
            }
        }
        // if (TouchInput.isTriggered() || this._touchCount > 0) {
        //     if (TouchInput.isPressed()) {
        //         if (this._touchCount === 0 || this._touchCount >= 15) {
        //             var x = GameGlobal.$gameMap.canvasToMapX(TouchInput.x);
        //             var y = GameGlobal.$gameMap.canvasToMapY(TouchInput.y);
        //             GameGlobal.$gameTemp.setDestination(x, y);
        //         }
        //         this._touchCount++;
        //     } else {
        //         this._touchCount = 0;
        //     }
        // }
    }

    isSceneChangeOk() {
        return this.isActive() && !GameGlobal.$gameMessage.isBusy();
    }

    updateScene() {
        this.checkGameover();
        if (!SceneManager.isSceneChanging()) {
            this.updateTransferPlayer();
        }
        if (!SceneManager.isSceneChanging()) {
            this.updateEncounter();
        }
        if (!SceneManager.isSceneChanging()) {
            this.updateCallMenu();
        }
    }

    createDisplayObjects() {
        this.createSpriteset();
        this.createMapNameWindow();
        this.createWindowLayer();
        this.createAllWindows();
        this.createJoystick();
        this.createControlButtons();
    }

    createControlButtons() {
        this._attack = new Sprite_Button();
        this._attack.x = Graphics.width - 150;
        this._attack.y = Graphics.height - 150;
        var bitmap1 = ImageManager.loadSystem("GamePad");
        this._attack.bitmap = bitmap1;
        this.addChild(this._attack);

        this._combatOne = new Sprite_Button();
        this._combatOne.x = Graphics.width - 250;
        this._combatOne.y = Graphics.height - 100;
        var bitmap2 = ImageManager.loadSystem("Joystick");
        this._combatOne.bitmap = bitmap2;
        this.addChild(this._combatOne);

        this._combatTwo = new Sprite_Button();
        this._combatTwo.x = Graphics.width - 200;
        this._combatTwo.y = Graphics.height - 200;
        var bitmap3 = ImageManager.loadSystem("Joystick");
        this._combatTwo.bitmap = bitmap3;
        this.addChild(this._combatTwo);

        this._combatThree = new Sprite_Button();
        this._combatThree.x = Graphics.width - 100;
        this._combatThree.y = Graphics.height - 250;
        var bitmap4 = ImageManager.loadSystem("Joystick");
        this._combatThree.bitmap = bitmap4;
        this.addChild(this._combatThree);

        this._auxiliary1 = new Sprite_Button();
        this._auxiliary1.x = Graphics.width - 350;
        this._auxiliary1.y = Graphics.height - 100;
        var bitmap5 = ImageManager.loadSystem("Joystick");
        this._auxiliary1.bitmap = bitmap5;
        this.addChild(this._auxiliary1);

        this._auxiliary2 = new Sprite_Button();
        this._auxiliary2.x = Graphics.width - 450;
        this._auxiliary2.y = Graphics.height - 100;
        var bitmap6 = ImageManager.loadSystem("Joystick");

        this._auxiliary2.bitmap = bitmap6;
        this.addChild(this._auxiliary2);
        this._touchingSkill = 0;
    }

    createJoystick() {
        this._joystick = new Sprite_Joystick();
    }

    createSpriteset() {
        this._spriteset = new Spriteset_Map();
        this.addChild(this._spriteset);
    }

    createAllWindows() {
        this.createMessageWindow();
        this.createScrollTextWindow();
    }

    createMapNameWindow() {
        this._mapNameWindow = new Window_MapName();
        this.addChild(this._mapNameWindow);
    }

    createMessageWindow() {
        this._messageWindow = new Window_Message();
        this.addWindow(this._messageWindow);
        this._messageWindow.subWindows().forEach((window) => {
            this.addWindow(window);
        }, this);
    }

    createScrollTextWindow() {
        this._scrollTextWindow = new Window_ScrollText();
        this.addWindow(this._scrollTextWindow);
    }

    updateTransferPlayer() {
        if (GameGlobal.$gamePlayer.isTransferring()) {
            SceneManager.goto(Scene_Map);
        }
    }

    updateEncounter() {
        if (GameGlobal.$gamePlayer.executeEncounter()) {
        }
    }

    updateCallMenu() {
        if (this.isMenuEnabled()) {
            if (this.isMenuCalled()) {
                this.menuCalling = true;
            }
            if (this.menuCalling && !GameGlobal.$gamePlayer.startedMoving()) {
                this.callMenu();
            }
        } else {
            this.menuCalling = false;
        }
        // if (this.isMenuEnabled()) {
        //     if (this.isMenuCalled()) {
        //         this.menuCalling = true;
        //     }
        //     if (this.menuCalling && !GameGlobal.$gamePlayer.isMoving()) {
        //         this.callMenu();
        //     }
        // } else {
        //     this.menuCalling = false;
        // }
    }

    isMenuEnabled() {
        return GameGlobal.$gameSystem.isMenuEnabled() && !GameGlobal.$gameMap.isEventRunning();
    }

    isMenuCalled() {
        if (GameGlobal.$gameSystem.anyAbsMouse2()) return Input.isTriggered('menu');
        return Input.isTriggered('menu') || TouchInput.isCancelled();
    }

    callMenu() {
        SoundManager.playOk();
        SceneManager.push(Scene_Menu);
        Window_MenuCommand.initCommandPosition();
        GameGlobal.$gameTemp.clearDestination();
        this._mapNameWindow.hide();
        this._waitCount = 2;
    }

    fadeInForTransfer() {
        var fadeType = GameGlobal.$gamePlayer.fadeType();
        switch (fadeType) {
            case 0: case 1:
                this.startFadeIn(this.fadeSpeed(), fadeType === 1);
                break;
        }
    }

    fadeOutForTransfer() {
        var fadeType = GameGlobal.$gamePlayer.fadeType();
        switch (fadeType) {
            case 0: case 1:
                this.startFadeOut(this.fadeSpeed(), fadeType === 1);
                break;
        }
    }

    stopAudioOnBattleStart() {
        if (!AudioManager.isCurrentBgm(GameGlobal.$gameSystem.battleBgm())) {
            AudioManager.stopBgm();
        }
        AudioManager.stopBgs();
        AudioManager.stopMe();
        AudioManager.stopSe();
    }

    startEncounterEffect() {
        this._spriteset.hideCharacters();
        this._encounterEffectDuration = this.encounterEffectSpeed();
    }

    updateEncounterEffect() {
        if (this._encounterEffectDuration > 0) {
            this._encounterEffectDuration--;
            var speed = this.encounterEffectSpeed();
            var n = speed - this._encounterEffectDuration;
            var p = n / speed;
            var q = ((p - 1) * 20 * p + 5) * p + 1;
            var zoomX = GameGlobal.$gamePlayer.screenX();
            var zoomY = GameGlobal.$gamePlayer.screenY() - 24;
            if (n === 2) {
                GameGlobal.$gameScreen.setZoom(zoomX, zoomY, 1);
                this.snapForBattleBackground();
                this.startFlashForEncounter(speed / 2);
            }
            GameGlobal.$gameScreen.setZoom(zoomX, zoomY, q);
            if (n === Math.floor(speed / 6)) {
                this.startFlashForEncounter(speed / 2);
            }
            if (n === Math.floor(speed / 2)) {
                // BattleManager.playBattleBgm();
                this.startFadeOut(this.fadeSpeed());
            }
        }
    }

    snapForBattleBackground() {
        this._windowLayer.visible = false;
        SceneManager.snapForBackground();
        this._windowLayer.visible = true;
    }

    startFlashForEncounter(duration) {
        var color = [255, 255, 255, 255];
        GameGlobal.$gameScreen.startFlash(color, duration);
    }

    encounterEffectSpeed() {
        return 60;
    }
}