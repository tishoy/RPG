import Decrypter from '../core/decrypter'
import Scene_Boot from '../scenes/Scene_Boot'
import Game_Temp from '../object/Game_Temp'
import Game_System from '../object/Game_System'
import Game_Screen from '../object/Game_Screen'
import Game_Timer from '../object/Game_Timer'
import Game_Message from '../object/Game_Message'
import Game_Switches from '../object/Game_Switches'
import Game_Variables from '../object/Game_Variables'
import Game_SelfSwitches from '../object/Game_SelfSwitches'
import Game_Actors from '../object/Game_Actors'
import Game_Party from '../object/Game_Party'
import Game_Troop from '../object/Game_Troop'
import Game_Map from '../object/Game_Map'
import Game_Player from '../object/Game_Player'
import Utils from '../core/utils'
import Graphics from '../core/graphics'
import StorageManager from './StorageManager'
import ResourceHandler from '../core/resourceHandler'
import ImageManager from '../managers/ImageManager'
class DataManager {

    static _globalId = 'RPGMV';
    static _errorUrl = null;
    static md5 = "data/";

    // static server_url = "";//GameGlobal.localRes ? "" : "https://static.tishoy.com/";
    // static server_url = "https://static.tishoy.com/";
    static server_url = "";

    static _databaseFiles = [
        { name: '$dataActors', src: 'Actors.json' },
        { name: '$dataClasses', src: 'Classes.json' },
        { name: '$dataSkills', src: 'Skills.json' },
        { name: '$dataItems', src: 'Items.json' },
        { name: '$dataWeapons', src: 'Weapons.json' },
        { name: '$dataArmors', src: 'Armors.json' },
        { name: '$dataEnemies', src: 'Enemies.json' },
        // { name: '$dataTroops', src: 'Troops.json' },
        { name: '$dataStates', src: 'States.json' },
        { name: '$dataAnimations', src: 'Animations.json' },
        { name: '$dataTilesets', src: 'Tilesets.json' },
        { name: '$dataCommonEvents', src: 'CommonEvents.json' },
        { name: '$dataSystem', src: 'System.json' },
        { name: '$dataMapInfos', src: 'MapInfos.json' },
        { name: '$qSprite', src: 'QSprite.json' }
    ];

    static loadLocal() {
        for (var i = 0; i < DataManager._databaseFiles.length; i++) {
            var name = DataManager._databaseFiles[i].name;
            var src = DataManager._databaseFiles[i].src;
            DataManager.loadDataFile(name, src);
        }
    }

    static loadDatabase() {
        var xhr = new XMLHttpRequest();
        // var url = "http://192.168.0.148:1337/parse/functions/map_get_url";
        // var url = 'data/' + src;
        xhr.open('POST', this.server_url);
        xhr.overrideMimeType('application/json');
        // xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Parse-Application-Id', 'LSZyuY4qI72nUjYA9nK0YPjBCclcDE4lYrv7TVB5');
        xhr.onload = () => {
            DataManager.md5 = JSON.parse(xhr.responseText).result.worldmap + "/";
            console.log(DataManager.md5);
            // var test = this.isBattleTest() || this.isEventTest();
            // var prefix = test ? 'Test_' : '';
            for (var i = 0; i < DataManager._databaseFiles.length; i++) {
                var name = DataManager._databaseFiles[i].name;
                var src = DataManager._databaseFiles[i].src;
                DataManager.loadDataFile(name, src);
            }
        }
        xhr.onerror = this._mapLoader || function () {
            DataManager._errorUrl = DataManager._errorUrl || url;
        }
        xhr.send();
    }

    static loadDataFile(name, src) {
        var xhr = new XMLHttpRequest();
        if (name === "$qSprite" || name === "$dataMap" || name === "$dataClasses") {
            var url = this.md5 + src;
        } else {
            var url = DataManager.server_url + this.md5 + src;
        }
        // var url = 'data/' + src;
        xhr.open('GET', url);
        xhr.overrideMimeType('application/json');
        xhr.onload = () => {
            if (xhr.status < 400) {
                GameGlobal[name] = JSON.parse(xhr.responseText);
                if (name == "$qSprite") {
                    console.log(GameGlobal[name]);
                }
                DataManager.onLoad(GameGlobal[name]);
            }
        }
        xhr.onerror = this._mapLoader || function () {
            DataManager._errorUrl = DataManager._errorUrl || url;
        }
        GameGlobal[name] = null;
        xhr.send();
    }

    static isDatabaseLoaded() {
        this.checkError();
        for (var i = 0; i < this._databaseFiles.length; i++) {
            if (!GameGlobal[this._databaseFiles[i].name]) {
                return false;
            }
        }
        return true;
    }

    static loadMapData(mapId) {
        console.log(mapId);
        if (mapId > 0) {
            var filename = 'Map%1.json'.format(mapId.padZero(3));
            this._mapLoader = ResourceHandler.createLoader(this.md5 + filename, this.loadDataFile.bind(this, '$dataMap', filename));
            this.loadDataFile('$dataMap', filename);
        } else {
            this.makeEmptyMap();
        }
    }

    static makeEmptyMap() {
        GameGlobal.$dataMap = {}
        GameGlobal.$dataMap.data = [];
        GameGlobal.$dataMap.events = [];
        GameGlobal.$dataMap.width = 100;
        GameGlobal.$dataMap.height = 100;
        GameGlobal.$dataMap.scrollType = 3;
    }

    static isMapLoaded() {
        this.checkError();
        return !!GameGlobal.$dataMap;
    }

    static reading = null;
    static onLoad(object) {
        DataManager.reading = object;
        var array;
        if (object === GameGlobal.$dataMap) {
            this.extractMetadata(object);
            array = object.events;
        } else {
            array = object;
        }
        if (Array.isArray(array)) {
            for (var i = 0; i < array.length; i++) {
                var data = array[i];
                if (data && data.note !== undefined) {
                    this.extractMetadata(data);
                }
            }
        }
        if (object === GameGlobal.$dataSystem) {
            Decrypter.hasEncryptedImages = !!object.hasEncryptedImages;
            Decrypter.hasEncryptedAudio = !!object.hasEncryptedAudio;
            Scene_Boot.loadSystemImages();
        }
        DataManager.reading = null;
    }

    static extractMetadata(data) {
        var re = /<([^<>:]+)(:?)([^>]*)>/g;
        data.meta = {}
        for (; ;) {
            var match = re.exec(data.note);
            if (match) {
                if (match[2] === ':') {
                    data.meta[match[1]] = match[3];
                } else {
                    data.meta[match[1]] = true;
                }
            } else {
                break;
            }
        }
        var blockRegex = /<([^<>:\/]+)>([\s\S]*?)<\/\1>/g;
        data.meta = Object.assign({}, data.meta);
        while (true) {
            var match = blockRegex.exec(data.note);
            if (match) {
                data.meta[match[1]] = match[2];
            } else {
                break;
            }
        }
        this.extractQData(data, DataManager.reading);
    }

    static extractQData(data, object) {
        // to be aliased by plugins
    };

    static checkError() {
        if (this._errorUrl) {
            throw new Error('Failed to load: ' + this._errorUrl);
        }
    }

    static isBattleTest() {
        return 0;
    }

    static isEventTest() {
        return 0;
    }

    static isSkill(item) {
        return item && GameGlobal.$dataSkills.contains(item);
    }

    static isItem(item) {
        return item && GameGlobal.$dataItems.contains(item);
    }

    static isWeapon(item) {
        return item && GameGlobal.$dataWeapons.contains(item);
    }

    static isArmor(item) {
        return item && GameGlobal.$dataArmors.contains(item);
    }

    static createGameObjects() {
        GameGlobal.$gameTemp = new Game_Temp();
        GameGlobal.$gameSystem = new Game_System();
        GameGlobal.$gameScreen = new Game_Screen();
        GameGlobal.$gameTimer = new Game_Timer();
        GameGlobal.$gameMessage = new Game_Message();
        GameGlobal.$gameSwitches = new Game_Switches();
        GameGlobal.$gameVariables = new Game_Variables();
        GameGlobal.$gameSelfSwitches = new Game_SelfSwitches();
        GameGlobal.$gameActors = new Game_Actors();
        GameGlobal.$gameParty = new Game_Party();
        GameGlobal.$gameTroop = new Game_Troop();
        GameGlobal.$gameMap = new Game_Map();
        GameGlobal.$gamePlayer = new Game_Player();
    }

    static setupNewGame() {
        this.createGameObjects();
        this.selectSavefileForNewGame();
        GameGlobal.$gameParty.setupStartingMembers();
        GameGlobal.$gamePlayer.reserveTransfer(GameGlobal.$dataSystem.startMapId,
            GameGlobal.$dataSystem.startX, GameGlobal.$dataSystem.startY);
        Graphics.frameCount = 0;
        // for (var i = 0; i < _PARAMS['Default Enabled Switches'].length; i++) {
        //     GameGlobal.$gameSwitches.setValue(_PARAMS['Default Enabled Switches'][i], true);
        // }
    }

    static loadGlobalInfo() {
        var json;
        try {
            json = StorageManager.load(0);
        } catch (e) {
            console.error(e);
            return [];
        }
        if (json) {
            var globalInfo = JSON.parse(json);
            for (var i = 1; i <= this.maxSavefiles(); i++) {
                if (!StorageManager.exists(i)) {
                    delete globalInfo[i];
                }
            }
            return globalInfo;
        } else {
            return [];
        }
    }

    static saveGlobalInfo(info) {
        StorageManager.save(0, JSON.stringify(info));
    }

    static isThisGameFile(savefileId) {
        var globalInfo = this.loadGlobalInfo();
        if (globalInfo && globalInfo[savefileId]) {
            var savefile = globalInfo[savefileId];
            return (savefile.globalId === this._globalId &&
                savefile.title === GameGlobal.$dataSystem.gameTitle);
        } else {
            return false;
        }
    }

    static isAnySavefileExists() {
        var globalInfo = this.loadGlobalInfo();
        if (globalInfo) {
            for (var i = 1; i < globalInfo.length; i++) {
                if (this.isThisGameFile(i)) {
                    return true;
                }
            }
        }
        return false;
    }

    static latestSavefileId() {
        var globalInfo = this.loadGlobalInfo();
        var savefileId = 1;
        var timestamp = 0;
        if (globalInfo) {
            for (var i = 1; i < globalInfo.length; i++) {
                if (this.isThisGameFile(i) && globalInfo[i].timestamp > timestamp) {
                    timestamp = globalInfo[i].timestamp;
                    savefileId = i;
                }
            }
        }
        return savefileId;
    }

    static loadAllSavefileImages() {
        var globalInfo = this.loadGlobalInfo();
        if (globalInfo) {
            for (var i = 1; i < globalInfo.length; i++) {
                if (this.isThisGameFile(i)) {
                    var info = globalInfo[i];
                    this.loadSavefileImages(info);
                }
            }
        }
    }

    static loadSavefileImages(info) {
        if (info.characters) {
            for (var i = 0; i < info.characters.length; i++) {
                ImageManager.reserveCharacter(info.characters[i][0]);
            }
        }
        if (info.faces) {
            for (var j = 0; j < info.faces.length; j++) {
                ImageManager.reserveFace(info.faces[j][0]);
            }
        }
    }

    static maxSavefiles() {
        return 20;
    }

    static saveGame(savefileId) {
        try {
            StorageManager.backup(savefileId);
            return this.saveGameWithoutRescue(savefileId);
        } catch (e) {
            console.error(e);
            try {
                StorageManager.remove(savefileId);
                StorageManager.restoreBackup(savefileId);
            } catch (e2) {
            }
            return false;
        }
    }

    static loadGame(savefileId) {
        try {
            return this.loadGameWithoutRescue(savefileId);
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    static loadSavefileInfo(savefileId) {
        var globalInfo = this.loadGlobalInfo();
        return (globalInfo && globalInfo[savefileId]) ? globalInfo[savefileId] : null;
    }

    static lastAccessedSavefileId() {
        return this._lastAccessedId;
    }

    static saveGameWithoutRescue(savefileId) {
        var json = JsonEx.stringify(this.makeSaveContents());
        if (json.length >= 200000) {
            console.warn('Save data too big!');
        }
        StorageManager.save(savefileId, json);
        this._lastAccessedId = savefileId;
        var globalInfo = this.loadGlobalInfo() || [];
        globalInfo[savefileId] = this.makeSavefileInfo();
        this.saveGlobalInfo(globalInfo);
        return true;
    }

    static loadGameWithoutRescue(savefileId) {
        var globalInfo = this.loadGlobalInfo();
        if (this.isThisGameFile(savefileId)) {
            var json = StorageManager.load(savefileId);
            this.createGameObjects();
            this.extractSaveContents(JsonEx.parse(json));
            this._lastAccessedId = savefileId;
            return true;
        } else {
            return false;
        }
    }

    static selectSavefileForNewGame() {
        var globalInfo = this.loadGlobalInfo();
        this._lastAccessedId = 1;
        if (globalInfo) {
            var numSavefiles = Math.max(0, globalInfo.length - 1);
            if (numSavefiles < this.maxSavefiles()) {
                this._lastAccessedId = numSavefiles + 1;
            } else {
                var timestamp = Number.MAX_VALUE;
                for (var i = 1; i < globalInfo.length; i++) {
                    if (!globalInfo[i]) {
                        this._lastAccessedId = i;
                        break;
                    }
                    if (globalInfo[i].timestamp < timestamp) {
                        timestamp = globalInfo[i].timestamp;
                        this._lastAccessedId = i;
                    }
                }
            }
        }
    }

    static makeSavefileInfo() {
        var info = {}
        info.globalId = this._globalId;
        info.title = GameGlobal.$dataSystem.gameTitle;
        info.characters = GameGlobal.$gameParty.charactersForSavefile();
        info.faces = GameGlobal.$gameParty.facesForSavefile();
        info.playtime = GameGlobal.$gameSystem.playtimeText();
        info.timestamp = Date.now();
        return info;
    }

    static makeSaveContents() {
        // A save data does not contain GameGlobal.$gameTemp, GameGlobal.$gameMessage, and GameGlobal.$gameTroop.
        var contents = {}
        contents.system = GameGlobal.$gameSystem;
        contents.screen = GameGlobal.$gameScreen;
        contents.timer = GameGlobal.$gameTimer;
        contents.switches = GameGlobal.$gameSwitches;
        contents.variables = GameGlobal.$gameVariables;
        contents.selfSwitches = GameGlobal.$gameSelfSwitches;
        contents.actors = GameGlobal.$gameActors;
        contents.party = GameGlobal.$gameParty;
        contents.map = GameGlobal.$gameMap;
        contents.player = GameGlobal.$gamePlayer;
        return contents;
    }

    static extractSaveContents(contents) {
        GameGlobal.$gameSystem = contents.system;
        GameGlobal.$gameScreen = contents.screen;
        GameGlobal.$gameTimer = contents.timer;
        GameGlobal.$gameSwitches = contents.switches;
        GameGlobal.$gameVariables = contents.variables;
        GameGlobal.$gameSelfSwitches = contents.selfSwitches;
        GameGlobal.$gameActors = contents.actors;
        GameGlobal.$gameParty = contents.party;
        GameGlobal.$gameMap = contents.map;
        GameGlobal.$gamePlayer = contents.player;
    }


}

export default DataManager;