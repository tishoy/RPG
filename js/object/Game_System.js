import AudioManager from '../managers/AudioManager'
import E8ABS from '../18ext/E8ABS';
import ABSManager from '../managers/ABSManager'
import ColliderManager from '../managers/ColliderManager'
/**
 * create by 18tech
 */
export default class Game_System {
    constructor() {
        this.initialize();
    }


    initialize() {
        this._saveEnabled = true;
        this._menuEnabled = false;  //E8关闭了菜单
        this._encounterEnabled = true;
        this._formationEnabled = true;
        this._battleCount = 0;
        this._winCount = 0;
        this._escapeCount = 0;
        this._saveCount = 0;
        this._versionId = 0;
        this._framesOnSave = 0;
        this._bgmOnSave = null;
        this._bgsOnSave = null;
        this._windowTone = null;
        this._battleBgm = null;
        this._victoryMe = null;
        this._defeatMe = null;
        this._savedBgm = null;
        this._walkingBgm = null;

        //ABS
        this._absKeys = E8ABS.getDefaultSkillKeys();
        this._absClassKeys = {};
        this._absWeaponKeys = {};
        this._absOverrideKeys = {};
        this._absEnabled = true;
        this._disabledEnemies = {};
        this.checkAbsMouse();
    }

    isJapanese() {
        return GameGlobal.$dataSystem.locale.match(/^ja/);
    }

    isChinese() {
        return GameGlobal.$dataSystem.locale.match(/^zh/);
    }

    isKorean() {
        return GameGlobal.$dataSystem.locale.match(/^ko/);
    }

    isCJK() {
        return GameGlobal.$dataSystem.locale.match(/^(ja|zh|ko)/);
    }

    isRussian() {
        return GameGlobal.$dataSystem.locale.match(/^ru/);
    }

    isSideView() {
        return GameGlobal.$dataSystem.optSideView;
    }

    isSaveEnabled() {
        return this._saveEnabled;
    }

    disableSave() {
        this._saveEnabled = false;
    }

    enableSave() {
        this._saveEnabled = true;
    }

    isMenuEnabled() {
        return this._menuEnabled;
    }

    disableMenu() {
        this._menuEnabled = false;
    }

    enableMenu() {
        this._menuEnabled = true;
    }

    isEncounterEnabled() {
        return this._encounterEnabled;
    }

    disableEncounter() {
        this._encounterEnabled = false;
    }

    enableEncounter() {
        this._encounterEnabled = true;
    }

    isFormationEnabled() {
        return this._formationEnabled;
    }

    disableFormation() {
        this._formationEnabled = false;
    }

    enableFormation() {
        this._formationEnabled = true;
    }

    battleCount() {
        return this._battleCount;
    }

    winCount() {
        return this._winCount;
    }

    escapeCount() {
        return this._escapeCount;
    }

    saveCount() {
        return this._saveCount;
    }

    versionId() {
        return this._versionId;
    }

    windowTone() {
        return this._windowTone || GameGlobal.$dataSystem.windowTone;
    }

    setWindowTone(value) {
        this._windowTone = value;
    }

    battleBgm() {
        return this._battleBgm || GameGlobal.$dataSystem.battleBgm;
    }

    setBattleBgm(value) {
        this._battleBgm = value;
    }

    victoryMe() {
        return this._victoryMe || GameGlobal.$dataSystem.victoryMe;
    }

    setVictoryMe(value) {
        this._victoryMe = value;
    }

    defeatMe() {
        return this._defeatMe || GameGlobal.$dataSystem.defeatMe;
    }

    setDefeatMe(value) {
        this._defeatMe = value;
    }

    onBattleStart() {
        this._battleCount++;
    }

    onBattleWin() {
        this._winCount++;
    }

    onBattleEscape() {
        this._escapeCount++;
    }

    onBeforeSave() {
        this._saveCount++;
        this._versionId = GameGlobal.$dataSystem.versionId;
        this._framesOnSave = Graphics.frameCount;
        this._bgmOnSave = AudioManager.saveBgm();
        this._bgsOnSave = AudioManager.saveBgs();

        GameGlobal.$gameMap.clearColliders();
        ColliderManager._needsRefresh = true;
    }

    onAfterLoad() {
        Graphics.frameCount = this._framesOnSave;
        AudioManager.playBgm(this._bgmOnSave);
        AudioManager.playBgs(this._bgsOnSave);
        ColliderManager._needsRefresh = true;
    }

    playtime() {
        return Math.floor(Graphics.frameCount / 60);
    }

    playtimeText() {
        var hour = Math.floor(this.playtime() / 60 / 60);
        var min = Math.floor(this.playtime() / 60) % 60;
        var sec = this.playtime() % 60;
        return hour.padZero(2) + ':' + min.padZero(2) + ':' + sec.padZero(2);
    }

    saveBgm() {
        this._savedBgm = AudioManager.saveBgm();
    }

    replayBgm() {
        if (this._savedBgm) {
            AudioManager.replayBgm(this._savedBgm);
        }
    }

    saveWalkingBgm() {
        this._walkingBgm = AudioManager.saveBgm();
    }

    replayWalkingBgm() {
        if (this._walkingBgm) {
            AudioManager.playBgm(this._walkingBgm);
        }
    }

    saveWalkingBgm2() {
        this._walkingBgm = GameGlobal.$dataMap.bgm;
    }

    setMinimapEnabled(enabled) {
        this._minimapEnabled = !!enabled;
    }

    isMinimapEnabled() {
        return this._minimapEnabled != null ? this._minimapEnabled : true;
    }

    //E8ABS
    disableEnemy(mapId, eventId) {
        if (!this._disabledEnemies[mapId]) {
            this._disabledEnemies[mapId] = [];
        }
        this._disabledEnemies[mapId][eventId] = true;
    }

    enableEnemy(mapId, eventId) {
        if (!this._disabledEnemies[mapId]) {
            this._disabledEnemies[mapId] = [];
        }
        this._disabledEnemies[mapId][eventId] = false;
    };

    isDisabled(mapId, eventId) {
        if (!this._disabledEnemies[mapId]) {
            return false;
        }
        return this._disabledEnemies[mapId][eventId] || !this._absEnabled;
    };

    loadClassABSKeys() {
        // if (!GameGlobal.$gameParty.leader()) return;
        // var playerClass = GameGlobal.$gameParty.leader().currentClass();
        // var classKeys = /<skillKeys>([\s\S]*)<\/skillKeys>/i.exec(playerClass.note);
        // if (classKeys && classKeys[1].trim() !== '') {
        //     this._absClassKeys = E8ABS.stringToSkillKeyObj(classKeys[1]);
        //     this.resetABSKeys();
        // }
    }

    resetABSKeys() {
        this._absKeys = E8ABS.getDefaultSkillKeys();
        for (var key in this._absKeys) {
            Object.assign(
                this._absKeys[key],
                this._absClassKeys[key] || {},
                this._absWeaponKeys[key] || {},
                this._absOverrideKeys[key] || {}
            );
        }
        this.preloadAllSkills();
        this.checkAbsMouse();
    };

    absKeys() {
        return this._absKeys;
    }

    changeABSOverrideSkill(skillNumber, skillId, forced) {
        var absKeys = this.absKeys();
        var override = this._absOverrideKeys;
        if (!absKeys[skillNumber]) return;
        if (!forced && !absKeys[skillNumber].rebind) return;
        if (!override[skillNumber]) {
            override[skillNumber] = {};
        }
        if (skillId !== null) {
            if (skillId > 0) {
                for (var key in absKeys) {
                    if (absKeys[key].skillId === skillId) {
                        if (!override[key]) {
                            override[key] = {};
                        }
                        override[key].skillId = null;
                    }
                }
            }
            override[skillNumber].skillId = skillId;
        } else {
            delete override[skillNumber].skillId;
        }
        this.resetABSKeys();
    };

    changeABSWeaponSkills(skillSet) {
        this._absWeaponKeys = skillSet;
        this.resetABSKeys();
    };

    changeABSSkillInput(skillNumber, input) {
        var absKeys = this.absKeys();
        var override = this._absOverrideKeys;
        if (!absKeys[skillNumber]) return;
        if (!override[skillNumber]) {
            override[skillNumber] = {};
        }
        for (var key in absKeys) {
            var i = absKeys[key].input.indexOf(input);
            if (i !== -1) {
                if (!override[key]) {
                    override[key] = {
                        input: absKeys[key].input.clone()
                    };
                }
                override[key].input.splice(i, 1);
                break;
            }
        }
        var i = /^\$/.test(input) ? 1 : 0;
        override[skillNumber].input[i] = input;
        this.checkAbsMouse();
    };

    preloadAllSkills() {
        var absKeys = this.absKeys();
        for (var key in absKeys) {
            var skill = GameGlobal.$dataSkills[absKeys[key].skillId];
            if (skill) ABSManager.preloadSkill(skill);
        }
    };

    anyAbsMouse() {
        return this._absMouse1;
    };

    anyAbsMouse2() {
        return this._absMouse2;
    };

    checkAbsMouse() {
        this._absMouse1 = false;
        this._absMouse2 = false;
        var keys = this.absKeys();
        for (var key in keys) {
            if (keys[key].input[0] === 'mouse1') {
                this._absMouse1 = false;
            }
            if (keys[key].input[0] === 'mouse2') {
                this._absMouse2 = true;
            }
        }
    };

    static Alias_Game_System_onBeforeSave = Game_System.prototype.onBeforeSave;
    onBeforeSave() {
        Alias_Game_System_onBeforeSave.call(this);
        GameGlobal.$gameMap.compressBattlers();
        E8ABS._needsUncompress = true;
    };

    static Alias_Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
    onAfterLoad() {
        Alias_Game_System_onAfterLoad.call(this);
        E8ABS._needsUncompress = true;
    };

}