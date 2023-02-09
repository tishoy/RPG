import Scene_Base from './Scene_Base'
import DataManager from '../managers/DataManager'
import ConfigManager from '../managers/ConfigManager'
import ImageManager from '../managers/ImageManager'
import SoundManager from '../managers/SoundManager'
import SceneManager from '../managers/SceneManager'
import Scene_Title from './Scene_Title'
import Scene_Map from './Scene_Map'
import Graphics from '../core/graphics'
import Window_TitleCommand from '../windows/Window_TitleCommand'
import Scene_Splash from './Scene_Splash'
class Scene_Boot extends Scene_Base {

    _startDate;

    constructor() {
        super();
        this._startDate = Date.now();
    }

    create() {
        super.create();
        if (GameGlobal.loadData) {
            DataManager.loadLocal();
        } else {
            DataManager.loadDatabase();
        }
        ConfigManager.load();
        this.loadSystemWindowImage();
    }

    loadSystemWindowImage() {
        ImageManager.reserveSystem('Window');
    }

    static loadSystemImages() {
        ImageManager.reserveSystem('IconSet');
        ImageManager.reserveSystem('Balloon');
        ImageManager.reserveSystem('Shadow1');
        ImageManager.reserveSystem('Shadow2');
        ImageManager.reserveSystem('Damage');
        ImageManager.reserveSystem('States');
        ImageManager.reserveSystem('Weapons1');
        ImageManager.reserveSystem('Weapons2');
        ImageManager.reserveSystem('Weapons3');
        ImageManager.reserveSystem('ButtonSet');
    }

    isReady() {
        if (super.isReady()) {
            return DataManager.isDatabaseLoaded() && this.isGameFontLoaded();
        } else {
            return false;
        }
    }

    isGameFontLoaded() {
        return true;
        if (Graphics.isFontLoaded('GameFont')) {
            return true;
        } else if (!Graphics.canUseCssFontLoading()) {
            var elapsed = Date.now() - this._startDate;
            if (elapsed >= 60000) {
                throw new Error('Failed to load GameFont');
            }
        }
    }

    start() {
        super.start();
        SoundManager.preloadImportantSounds();
        SceneManager.goto(Scene_Splash);
        return;
    }

    checkPlayerLocation() {
        if (GameGlobal.$dataSystem.startMapId === 0) {
            throw new Error('Player\'s starting position is not set');
        }
    }
}

export default Scene_Boot;
