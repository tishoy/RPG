import Utils from '../core/utils'
import Decrypter from '../core/decrypter'
import Graphics from '../core/graphics'
import Audio from '../core/audio';
/**
 * create by 18tech
 */
export default class AudioManager {

    constructor() {
        throw new Error('This is a static class');
    }

    static _masterVolume = 1;   // (min: 0, max: 1)
    static _bgmVolume = 100;
    static _bgsVolume = 100;
    static _meVolume = 100;
    static _seVolume = 100;
    static _currentBgm = null;
    static _currentBgs = null;
    static _bgmBuffer = null;
    static _bgsBuffer = null;
    static _meBuffer = null;
    static _seBuffers = [];
    static _staticBuffers = [];
    static _replayFadeTime = 0.5;
    static _path = "";
    // static _path = 'https://static.tishoy.com/audio/';
    static _blobUrl = null;

    get masterVolume() {
        return this._masterVolume;
    }

    set masterVolume(value) {
        this._masterVolume = value;
        Audio.setMasterVolume(this._masterVolume);
        Graphics.setVideoVolume(this._masterVolume);
    }

    get bgmVolume() {
        return this._bgmVolume;
    }

    set bgmVolume(value) {
        this._bgmVolume = value;
        this.updateBgmParameters(this._currentBgm);
    }

    get bgsVolume() {
        return this._bgsVolume;
    }
    set bgsVolume(value) {
        this._bgsVolume = value;
        this.updateBgsParameters(this._currentBgs);
    }

    get meVolume() {
        return this._meVolume;
    }
    set meVolume(value) {
        this._meVolume = value;
        this.updateMeParameters(this._currentMe);
    }

    get seVolume() {
        return this._seVolume;
    }
    set seVolume(value) {
        this._seVolume = value;
    }

    static playBgm(bgm, pos) {
        if (AudioManager.isCurrentBgm(bgm)) {
            AudioManager.updateBgmParameters(bgm);
        } else {
            AudioManager.stopBgm();
            if (bgm.name) {
                if (Decrypter.hasEncryptedAudio && this.shouldUseHtml5Audio()) {
                    AudioManager.playEncryptedBgm(bgm, pos);
                }
                else {
                    AudioManager._bgmBuffer = AudioManager.createBuffer('bgm', bgm.name);
                    AudioManager.updateBgmParameters(bgm);
                    if (!AudioManager._meBuffer) {
                        AudioManager._bgmBuffer.play(true, pos || 0);
                    }
                }
            }
        }
        AudioManager.updateCurrentBgm(bgm, pos);
    }

    static playEncryptedBgm(bgm, pos) {
        var ext = this.audioFileExt();
        var url = AudioManager._path + 'bgm/' + encodeURIComponent(bgm.name) + ext;
        url = Decrypter.extToEncryptExt(url);
        Decrypter.decryptHTML5Audio(url, bgm, pos);
    }

    static createDecryptBuffer(url, bgm, pos) {
        this._blobUrl = url;
        this._bgmBuffer = this.createBuffer('bgm', bgm.name);
        this.updateBgmParameters(bgm);
        if (!this._meBuffer) {
            this._bgmBuffer.play(true, pos || 0);
        }
        this.updateCurrentBgm(bgm, pos);
    }

    static replayBgm(bgm) {
        if (AudioManager.isCurrentBgm(bgm)) {
            AudioManager.updateBgmParameters(bgm);
        } else {
            AudioManager.playBgm(bgm, bgm.pos);
            if (AudioManager._bgmBuffer) {
                AudioManager._bgmBuffer.fadeIn(this._replayFadeTime);
            }
        }
    }

    static isCurrentBgm(bgm) {
        return (this._currentBgm && this._bgmBuffer &&
            this._currentBgm.name === bgm.name);
    }

    static updateBgmParameters(bgm) {
        this.updateBufferParameters(this._bgmBuffer, this._bgmVolume, bgm);
    }

    static updateCurrentBgm(bgm, pos) {
        this._currentBgm = {
            name: bgm.name,
            volume: bgm.volume,
            pitch: bgm.pitch,
            pan: bgm.pan,
            pos: pos
        }
    }

    static stopBgm() {
        if (AudioManager._bgmBuffer) {
            AudioManager._bgmBuffer.stop();
            AudioManager._bgmBuffer = null;
            AudioManager._currentBgm = null;
        }
    }

    static fadeOutBgm(duration) {
        if (this._bgmBuffer && this._currentBgm) {
            // this._bgmBuffer.fadeOut(duration);
            this._currentBgm = null;
        }
    }

    static fadeInBgm(duration) {
        if (this._bgmBuffer && this._currentBgm) {
            // this._bgmBuffer.fadeIn(duration);
        }
    }

    static playBgs(bgs, pos) {
        if (AudioManager.isCurrentBgs(bgs)) {
            AudioManager.updateBgsParameters(bgs);
        } else {
            AudioManager.stopBgs();
            if (bgs.name) {
                AudioManager._bgsBuffer = this.createBuffer('bgs', bgs.name);
                AudioManager.updateBgsParameters(bgs);
                AudioManager._bgsBuffer.play(true, pos || 0);
            }
        }
        this.updateCurrentBgs(bgs, pos);
    }

    static replayBgs(bgs) {
        if (this.isCurrentBgs(bgs)) {
            this.updateBgsParameters(bgs);
        } else {
            this.playBgs(bgs, bgs.pos);
            if (this._bgsBuffer) {
                this._bgsBuffer.fadeIn(this._replayFadeTime);
            }
        }
    }

    static isCurrentBgs(bgs) {
        return (this._currentBgs && this._bgsBuffer &&
            this._currentBgs.name === bgs.name);
    }

    static updateBgsParameters(bgs) {
        this.updateBufferParameters(this._bgsBuffer, this._bgsVolume, bgs);
    }

    static updateCurrentBgs(bgs, pos) {
        this._currentBgs = {
            name: bgs.name,
            volume: bgs.volume,
            pitch: bgs.pitch,
            pan: bgs.pan,
            pos: pos
        }
    }

    static stopBgs() {
        if (this._bgsBuffer) {
            this._bgsBuffer.stop();
            this._bgsBuffer = null;
            this._currentBgs = null;
        }
    }

    static fadeOutBgs(duration) {
        if (this._bgsBuffer && this._currentBgs) {
            this._bgsBuffer.fadeOut(duration);
            this._currentBgs = null;
        }
    }

    static fadeInBgs(duration) {
        if (this._bgsBuffer && this._currentBgs) {
            this._bgsBuffer.fadeIn(duration);
        }
    }

    static playMe(me) {
        this.stopMe();
        if (me.name) {
            if (this._bgmBuffer && this._currentBgm) {
                this._currentBgm.pos = this._bgmBuffer.seek();
                this._bgmBuffer.stop();
            }
            this._meBuffer = this.createBuffer('me', me.name);
            this.updateMeParameters(me);
            this._meBuffer.play(false);
            this._meBuffer.addStopListener(this.stopMe.bind(this));
        }
    }

    static updateMeParameters(me) {
        this.updateBufferParameters(this._meBuffer, this._meVolume, me);
    }

    static fadeOutMe(duration) {
        if (this._meBuffer) {
            this._meBuffer.fadeOut(duration);
        }
    }

    static stopMe() {
        if (this._meBuffer) {
            this._meBuffer.stop();
            this._meBuffer = null;
            if (this._bgmBuffer && this._currentBgm && !this._bgmBuffer.isPlaying()) {
                this._bgmBuffer.play(true, this._currentBgm.pos);
                this._bgmBuffer.fadeIn(this._replayFadeTime);
            }
        }
    }

    static playSe(se) {
        if (se.name) {
            this._seBuffers = this._seBuffers.filter(function (audio) {
                return audio.isPlaying();
            });
            var buffer = this.createBuffer('se', se.name);
            this.updateSeParameters(buffer, se);
            buffer.play(false);
            this._seBuffers.push(buffer);
        }
    }

    static updateSeParameters(buffer, se) {
        this.updateBufferParameters(buffer, this._seVolume, se);
    }

    static stopSe() {
        this._seBuffers.forEach(function (buffer) {
            buffer.stop();
        });
        this._seBuffers = [];
    }

    static playStaticSe(se) {
        if (se.name) {
            this.loadStaticSe(se);
            for (var i = 0; i < this._staticBuffers.length; i++) {
                var buffer = this._staticBuffers[i];
                if (buffer._reservedSeName === se.name) {
                    buffer.stop();
                    this.updateSeParameters(buffer, se);
                    buffer.play(false);
                    break;
                }
            }
        }
    }

    static loadStaticSe(se) {
        if (se.name && !this.isStaticSe(se)) {
            var buffer = this.createBuffer('se', se.name);
            buffer._reservedSeName = se.name;
            this._staticBuffers.push(buffer);
            if (this.shouldUseHtml5Audio()) {
                Html5Audio.setStaticSe(buffer._url);
            }
        }
    }

    static isStaticSe(se) {
        for (var i = 0; i < this._staticBuffers.length; i++) {
            var buffer = this._staticBuffers[i];
            if (buffer._reservedSeName === se.name) {
                return true;
            }
        }
        return false;
    }

    static stopAll() {
        this.stopMe();
        this.stopBgm();
        this.stopBgs();
        this.stopSe();
    }

    static saveBgm() {
        if (this._currentBgm) {
            var bgm = this._currentBgm;
            return {
                name: bgm.name,
                volume: bgm.volume,
                pitch: bgm.pitch,
                pan: bgm.pan,
                pos: this._bgmBuffer ? this._bgmBuffer.seek() : 0
            }
        } else {
            return this.makeEmptyAudioObject();
        }
    }

    static saveBgs() {
        if (this._currentBgs) {
            var bgs = this._currentBgs;
            return {
                name: bgs.name,
                volume: bgs.volume,
                pitch: bgs.pitch,
                pan: bgs.pan,
                pos: this._bgsBuffer ? this._bgsBuffer.seek() : 0
            }
        } else {
            return this.makeEmptyAudioObject();
        }
    }

    static makeEmptyAudioObject() {
        return { name: '', volume: 0, pitch: 0 }
    }

    static createBuffer(folder, name) {
        var ext = AudioManager.audioFileExt();
        var url = AudioManager._path + folder + '/' + encodeURIComponent(name) + ext;
        // if (AudioManager.shouldUseHtml5Audio() && folder === 'bgm') {
        //     if (this._blobUrl) Html5Audio.setup(this._blobUrl);
        //     else Html5Audio.setup(url);
        //     return Html5Audio;
        // } else {
        return new Audio(url);
        // }
    }

    static updateBufferParameters(buffer, configVolume, audio) {
        if (buffer && audio) {
            buffer.volume = configVolume * (audio.volume || 0) / 10000;
            buffer.pitch = (audio.pitch || 0) / 100;
            buffer.pan = (audio.pan || 0) / 100;
        }
    }

    static audioFileExt() {
        // if (WXAudio.canPlayOgg() && !Utils.isMobileDevice()) {
        return '.ogg';
        // } else {
        //     return '.m4a';
        // }
    }

    static shouldUseHtml5Audio() {
        return false;
    }

    static checkErrors() {
        this.checkWebAudioError(this._bgmBuffer);
        this.checkWebAudioError(this._bgsBuffer);
        this.checkWebAudioError(this._meBuffer);
        this._seBuffers.forEach(function (buffer) {
            this.checkWebAudioError(buffer);
        }.bind(this));
        this._staticBuffers.forEach(function (buffer) {
            this.checkWebAudioError(buffer);
        }.bind(this));
    }

    static checkWebAudioError(webAudio) {
        if (webAudio && webAudio.isError()) {
            throw new Error('Failed to load: ' + webAudio.url);
        }
    }
}