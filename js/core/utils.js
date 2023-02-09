/**
 * 
 */

/**
 * create by 18tech
 */
export default class Utils {



    constructor() {
        throw new Error('This is a static class');
    }
    static RPGMAKER_VERSION = "1.6.1";

    /**
     * Makes a CSS color string from RGB values.
     *
     * @static
     * @method rgbToCssColor
     * @param {Number} r The red value in the range (0, 255)
     * @param {Number} g The green value in the range (0, 255)
     * @param {Number} b The blue value in the range (0, 255)
     * @return {String} CSS color string
     */
    static rgbToCssColor(r, g, b) {
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    static _id = 1;

    static generateRuntimeId() {
        return Utils._id++;
    }

    static isSupportPassiveEvent() {
        if (typeof Utils._supportPassiveEvent === "boolean") {
            return Utils._supportPassiveEvent;
        }
        // test support passive event
        // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
        var passive = false;
        var options = Object.defineProperty({}, "passive", {
            get: function () { passive = true; }
        });
        window.addEventListener("test", null, options);
        Utils._supportPassiveEvent = passive;
        return passive;
    }

    static isOptionValid(name) {
        if (name === "noaudio") {
            return 1;
        }
        return 0;
    }

    static isNwjs() {
        return false;
    }

    static isMobileDevice() {
        return true;
    }

    static isMobileSafari() {
        return false
    }

    static canReadGameFiles() {
        return true;
    }

    static E8techLog(s) {
        if ("18log" + window.DEBUG) {
            console.log(s)
        } 
    }
}