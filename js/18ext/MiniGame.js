/**
 * 各平台接口
 */
// 打包时候更换平台
export default class MiniGame {
    static _systemInfo = null;
    constructor() {

    }

    static getCanvas() {
        return wx.createCanvas();
    }

    static createImage() {
        return wx.createImage();
    }

    static getSystemInfoSync() {
        this._systemInfo = wx.getSystemInfoSync();
        this._screenWidth = this._systemInfo.screenWidth;
        this._screenHeight = this._systemInfo.screenHeight;
        // return this._systemInfo;
    }

    static get screenWidth() {
        if (this._systemInfo === null) {
            console.log("111");
            this.getSystemInfoSync();
        }
        return this._screenWidth;
    }

    static get screenHeight() {
        if (this._systemInfo === null) {
            this.getSystemInfoSync();
        }
        return this._screenHeight;
    }

    // 声音
    static createAudioContext() {
        return wx.createInnerAudioContext();
    }
}