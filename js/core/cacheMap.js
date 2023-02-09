import CacheEntry from "./cacheEntry";
/**
 * create by 18tech
 * 2019年11月18日
 * 图片缓存映射
 * 启动后缓存所有资源～ 
 * 需要修改成 不同关卡的缓存方式
 * RPGMaker CacheMap
 */
export default class CacheMap {

    constructor(manager) {
        this.manager = manager;
        this._inner = {}
        this._lastRemovedEntries = {}
        this.updateTicks = 0;
        this.lastCheckTTL = 0;
        this.delayCheckTTL = 100.0;
        this.updateSeconds = Date.now();
    }

    checkTTL() {
        var cache = this._inner;
        var temp = this._lastRemovedEntries;
        if (!temp) {
            temp = [];
            this._lastRemovedEntries = temp;
        }
        for (var key in cache) {
            var entry = cache[key];
            if (!entry.isStillAlive()) {
                temp.push(entry);
            }
        }
        for (var i = 0; i < temp.length; i++) {
            temp[i].free(true);
        }
        temp.length = 0;
    }

    getItem() {
        var entry = this._inner[key];
        if (entry) {
            return entry.item;
        }
        return null;
    }

    clear() {
        var keys = Object.keys(this._inner);
        for (var i = 0; i < keys.length; i++) {
            this._inner[keys[i]].free();
        }
    }

    setItem() {
        return new CacheEntry(this, key, item).allocate();
    }

    update() {
        this.updateTicks += ticks;
        this.updateSeconds += delta;
        if (this.updateSeconds >= this.delayCheckTTL + this.lastCheckTTL) {
            this.lastCheckTTL = this.updateSeconds;
            this.checkTTL();
        }
    }
}