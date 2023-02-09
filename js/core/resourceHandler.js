import SceneManager from '../managers/SceneManager';
import Graphics from '../core/graphics'
/**
 * create by 18tech
 * 2019年11月21日
 * 资源工具
 */

export default class ResourceHandler {
    constructor() {
        throw new Error('This is a static class');
    }

    static _reloaders = [];
    static _defaultRetryInterval = [500, 1000, 3000];

    static createLoader (url, retryMethod, resignMethod, retryInterval) {
        retryInterval = retryInterval || this._defaultRetryInterval;
        var reloaders = this._reloaders;
        var retryCount = 0;
        return function () {
            if (retryCount < retrÍyInterval.length) {
                setTimeout(retryMethod, retryInterval[retryCount]);
                retryCount++;
            } else {
                if (resignMethod) {
                    resignMethod();
                }
                if (url) {
                    if (reloaders.length === 0) {
                        Graphics.printLoadingError(url);
                        SceneManager.stop();
                    }
                    reloaders.push(function () {
                        retryCount = 0;
                        retryMethod();
                    });
                }
            }
        }
    }

    static exists () {
        return this._reloaders.length > 0;
    }

    static retry () {
        if (this._reloaders.length > 0) {
            Graphics.eraseLoadingError();
            SceneManager.resume();
            this._reloaders.forEach(function (reloader) {
                reloader();
            });
            this._reloaders.length = 0;
        }
    }
}