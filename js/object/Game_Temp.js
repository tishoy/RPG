import Utils from '../core/utils'
import Minimap from '../18ext/MiniMap'
import TouchInput from '../core/touchInput'
/**
 * create by 18tech
 */
export default class Game_Temp {
    constructor() {
        this.initialize();
    }

    initialize() {
        this._isPlaytest = Utils.isOptionValid('test');
        this._commonEventId = 0;
        this._destinationX = null;
        this._destinationY = null;

        this._destinationPX = null;
        this._destinationPY = null;

        this._minimapPassageCache = [];
        this._minimapCacheRefreshFlag = false;
    }

    setPixelDestination(x, y) {
        this._destinationPX = x;
        this._destinationPY = y;
        var x1 = GameGlobal.$gameMap.roundX(Math.floor(x / GameGlobal.$gameMap.tileWidth()));
        var y1 = GameGlobal.$gameMap.roundY(Math.floor(y / GameGlobal.$gameMap.tileHeight()));
        this.setDestination(x1, y1);
    }

    destinationPX() {
        return this._destinationPX;
    }

    destinationPY() {
        return this._destinationPY;
    }

    isPlaytest() {
        return this._isPlaytest;
    }

    reserveCommonEvent(commonEventId) {
        this._commonEventId = commonEventId;
    }

    clearCommonEvent() {
        this._commonEventId = 0;
    }

    isCommonEventReserved() {
        return this._commonEventId > 0;
    }

    reservedCommonEvent() {
        return GameGlobal.$dataCommonEvents[this._commonEventId];
    }

    setDestination(x, y) {
        this._destinationX = x;
        this._destinationY = y;
    }

    clearDestination() {
        if (GameGlobal.$gamePlayer._movingWithMouse) return;
        this._destinationX = null;
        this._destinationY = null;
        this._destinationPX = null;
        this._destinationPY = null;

    }

    isDestinationValid() {
        return  !TouchInput.insideWindow
            && this._destinationX !== null;
    }

    destinationX() {
        return this._destinationX;
    }

    destinationY() {
        return this._destinationY;
    }

    get minimapCacheRefreshFlag() {
        return this._minimapCacheRefreshFlag;
    }

    set minimapCacheRefreshFlag(value) {
        this._minimapCacheRefreshFlag = value;
    }

    getMinimapPassageCache() {
        return null;
    }

    registerMinimapPassageCache(mapId, passage) {
        var newCache = [{ mapId: mapId, passage: passage }].concat(
            this._minimapPassageCache.filter(function (cache) {
                return cache.mapId !== mapId;
            }));

        this._minimapPassageCache = newCache.slice(0, Minimap.passageCacheCountMax);
    };

    getMinimapPassageCache(mapId) {
        for (var i = 0; i < this._minimapPassageCache.length; i++) {
            var tempCache = this._minimapPassageCache[i];
            if (tempCache.mapId !== mapId) {
                continue;
            }

            if (i > 0) {
                // 取得したキャッシュは先頭に移す
                this.registerMinimapPassageCache(mapId, tempCache);

            }
            return tempCache;
        }

        return null;
    };

    /**
     * 通行可否キャッシュをクリア
     */
    clearMinimapPassageCache(mapId) {
        this._minimapPassageCache = [];
        this._minimapCacheRefreshFlag = true;
    };

}