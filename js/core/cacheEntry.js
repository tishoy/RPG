/**
 * create by 18tech
 * 2019年11月18日
 * 缓存入口
 * RPGMaker CacheEntry
 */
export default class CacheEntry {
    constructor(cache, key, item) {
        this.cache = cache;
        this.key = key;
        this.item = item;
        this.cached = false;
        this.touchTicks = 0;
        this.touchSeconds = 0;
        this.ttlTicks = 0;
        this.ttlSeconds = 0;
        this.freedByTTL = false;
    }

    free(byTTL) {
        this.freedByTTL = byTTL || false;
        if (this.cached) {
            this.cached = false;
            delete this.cache._inner[this.key];
        }
    }

    allocate() {
        if (!this.cached) {
            this.cache._inner[this.key] = this;
            this.cached = true;
        }
        this.touch();
        return this;
    }

    setTimeToLive(ticks, seconds) {
        this.ttlTicks = ticks || 0;
        this.ttlSeconds = seconds || 0;
        return this;
    }

    isStillAlive() {
        var cache = this.cache;
        return ((this.ttlTicks == 0) || (this.touchTicks + this.ttlTicks < cache.updateTicks )) &&
            ((this.ttlSeconds == 0) || (this.touchSeconds + this.ttlSeconds < cache.updateSeconds ));
    }

    touch() {
        var cache = this.cache;
        if (this.cached) {
            this.touchTicks = cache.updateTicks;
            this.touchSeconds = cache.updateSeconds;
        } else if (this.freedByTTL) {
            this.freedByTTL = false;
            if (!cache._inner[this.key]) {
                cache._inner[this.key] = this;
            }
        }
    }
}