import AudioManager from './AudioManager'
import DataManager from './DataManager';
/**
 * create by 18tech
 */
export default class SoundManager {

    static preloadImportantSounds = function () {
        this.loadSystemSound(0);
        this.loadSystemSound(1);
        this.loadSystemSound(2);
        this.loadSystemSound(3);
    }

    static loadSystemSound = function (n) {
        if (GameGlobal.$dataSystem) {
            AudioManager.loadStaticSe(GameGlobal.$dataSystem.sounds[n]);
        }
    }

    static playSystemSound = function (n) {
        if (GameGlobal.$dataSystem) {
            AudioManager.playStaticSe(GameGlobal.$dataSystem.sounds[n]);
        }
    }

    static playCursor = function () {
        this.playSystemSound(0);
    }

    static playOk = function () {
        this.playSystemSound(1);
    }

    static playCancel = function () {
        this.playSystemSound(2);
    }

    static playBuzzer = function () {
        this.playSystemSound(3);
    }

    static playEquip = function () {
        this.playSystemSound(4);
    }

    static playSave = function () {
        this.playSystemSound(5);
    }

    static playLoad = function () {
        this.playSystemSound(6);
    }

    static playBattleStart = function () {
        this.playSystemSound(7);
    }

    static playEscape = function () {
        this.playSystemSound(8);
    }

    static playEnemyAttack = function () {
        this.playSystemSound(9);
    }

    static playEnemyDamage = function () {
        this.playSystemSound(10);
    }

    static playEnemyCollapse = function () {
        this.playSystemSound(11);
    }

    static playBossCollapse1 = function () {
        this.playSystemSound(12);
    }

    static playBossCollapse2 = function () {
        this.playSystemSound(13);
    }

    static playActorDamage = function () {
        this.playSystemSound(14);
    }

    static playActorCollapse = function () {
        this.playSystemSound(15);
    }

    static playRecovery = function () {
        this.playSystemSound(16);
    }

    static playMiss = function () {
        this.playSystemSound(17);
    }

    static playEvasion = function () {
        this.playSystemSound(18);
    }

    static playMagicEvasion = function () {
        this.playSystemSound(19);
    }

    static playReflection = function () {
        this.playSystemSound(20);
    }

    static playShop = function () {
        this.playSystemSound(21);
    }

    static playUseItem = function () {
        this.playSystemSound(22);
    }

    static playUseSkill = function () {
        this.playSystemSound(23);
    }

}