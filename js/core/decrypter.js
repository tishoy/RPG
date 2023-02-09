import ImageManager from "../managers/ImageManager";
import Bitmap from '../core/bitmap'
/**
 * create by 18tech
 * 2019年11月21日
 * 解密工具
 */
export default class Decrypter {
    constructor() {
        throw new Error('This is a static class');
    }


    static hasEncryptedImages = false;
    static hasEncryptedAudio = false;
    static _requestImgFile = [];
    static _headerlength = 16;
    static _xhrOk = 400;
    static _encryptionKey = "";
    static _ignoreList = [
       ImageManager.server_url + "img/system/Window.png"
    ];
    static SIGNATURE = "5250474d56000000";
    static VER = "000301";
    static REMAIN = "0000000000";

    static checkImgIgnore(url) {
        for (var cnt = 0; cnt < this._ignoreList.length; cnt++) {
            if (url === this._ignoreList[cnt]) return true;
        }
        return false;
    }

    static decryptImg(url, bitmap) {
        url = this.extToEncryptExt(url);

        var requestFile = new XMLHttpRequest();
        requestFile.open("GET", url);
        requestFile.responseType = "arraybuffer";
        requestFile.send();

        requestFile.onload = () => {
            if (this.status < _xhrOk) {
                var arrayBuffer = decryptArrayBuffer(requestFile.response);
                bitmap._image.src = createBlobUrl(arrayBuffer);
                bitmap._image.addEventListener('load', bitmap._loadListener = Bitmap._onLoad.bind(bitmap));
                bitmap._image.addEventListener('error', bitmap._errorListener = bitmap._loader || Bitmap._onError.bind(bitmap));
            }
        }

        requestFile.onerror = () => {
            if (bitmap._loader) {
                bitmap._loader();
            } else {
                bitmap._onError();
            }
        }
    }

    static decryptHTML5Audio(url, bgm, pos) {
        var requestFile = new XMLHttpRequest();
        requestFile.open("GET", url);
        requestFile.responseType = "arraybuffer";
        requestFile.send();

        requestFile.onload = () => {
            if (this.status < _xhrOk) {
                var arrayBuffer = decryptArrayBuffer(requestFile.response);
                var url = createBlobUrl(arrayBuffer);
                AudioManager.createDecryptBuffer(url, bgm, pos);
            }
        }
    }

    static cutArrayHeader(arrayBuffer, length) {
        return arrayBuffer.slice(length);
    }

    static decryptArrayBuffer(arrayBuffer) {
        if (!arrayBuffer) return null;
        var header = new Uint8Array(arrayBuffer, 0, this._headerlength);

        var i;
        var ref = this.SIGNATURE + this.VER + this.REMAIN;
        var refBytes = new Uint8Array(16);
        for (i = 0; i < this._headerlength; i++) {
            refBytes[i] = parseInt("0x" + ref.substr(i * 2, 2), 16);
        }
        for (i = 0; i < this._headerlength; i++) {
            if (header[i] !== refBytes[i]) {
                throw new Error("Header is wrong");
            }
        }

        arrayBuffer = this.cutArrayHeader(arrayBuffer, _headerlength);
        var view = new DataView(arrayBuffer);
        this.readEncryptionkey();
        if (arrayBuffer) {
            var byteArray = new Uint8Array(arrayBuffer);
            for (i = 0; i < this._headerlength; i++) {
                byteArray[i] = byteArray[i] ^ parseInt(_encryptionKey[i], 16);
                view.setUint8(i, byteArray[i]);
            }
        }

        return arrayBuffer;
    }

    static createBlobUrl(arrayBuffer) {
        var blob = new Blob([arrayBuffer]);
        return window.URL.createObjectURL(blob);
    }

    static extToEncryptExt(url) {
        var ext = url.split('.').pop();
        var encryptedExt = ext;

        if (ext === "ogg") encryptedExt = ".rpgmvo";
        else if (ext === "m4a") encryptedExt = ".rpgmvm";
        else if (ext === "png") encryptedExt = ".rpgmvp";
        else encryptedExt = ext;

        return url.slice(0, url.lastIndexOf(ext) - 1) + encryptedExt;
    }

    static readEncryptionkey() {
        this._encryptionKey = GameGlobal.$dataSystem.encryptionKey.split(/(.{2})/).filter(Boolean);
    }

}