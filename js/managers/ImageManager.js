import CacheMap from '../core/cacheMap'
import ImageCache from '../core/imageCache'
import RequestQueue from '../core/requestQueue'
import Utils from '../core/utils'
import Bitmap from '../core/bitmap'
/**
 * create by 18tech
 */
export default class ImageManager {

    static server_url = "";
    // static server_url = GameGlobal.localRes ? "" : "https://static.tishoy.com/";
    // static server_url = "https://static.tishoy.com/";

    constructor() {
        throw new Error('This is a static class');
    }

    static cache = new CacheMap(ImageManager);

    static _imageCache = new ImageCache();
    static _requestQueue = new RequestQueue();
    static _systemReservationId = Utils.generateRuntimeId();

    static _generateCacheKey = function (path, hue) {
        return path + ':' + hue;
    }

    static loadAnimation = function (filename, hue) {
        return this.loadBitmap('img/animations/', filename, hue, true);
    }

    static loadBattleback1 = function (filename, hue) {
        return this.loadBitmap('img/battlebacks1/', filename, hue, true);
    }

    static loadBattleback2 = function (filename, hue) {
        return this.loadBitmap('img/battlebacks2/', filename, hue, true);
    }

    static loadEnemy = function (filename, hue) {
        return this.loadBitmap('img/enemies/', filename, hue, true);
    }

    static loadCharacter = function (filename, hue) {
        return this.loadBitmap('img/characters/', filename, hue, false);
    }

    static loadFace = function (filename, hue) {
        return this.loadBitmap('img/faces/', filename, hue, true);
    }

    static loadParallax = function (filename, hue) {
        return this.loadBitmap('img/parallaxes/', filename, hue, true);
    }

    static loadPicture = function (filename, hue) {
        return this.loadBitmap('img/pictures/', filename, hue, true);
    }

    static loadSvActor = function (filename, hue) {
        return this.loadBitmap('img/sv_actors/', filename, hue, false);
    }

    static loadSvEnemy = function (filename, hue) {
        return this.loadBitmap('img/sv_enemies/', filename, hue, true);
    }

    static loadSystem = function (filename, hue) {
        return this.loadBitmap('img/system/', filename, hue, false);
    }

    static loadTileset = function (filename, hue) {
        return this.loadBitmap('img/tilesets/', filename, hue, false);
    }

    static loadTitle1 = function (filename, hue) {
        return this.loadBitmap('img/titles1/', filename, hue, true);
    }

    static loadTitle2 = function (filename, hue) {
        return this.loadBitmap('img/titles2/', filename, hue, true);
    }

    static loadBitmap = function (folder, filename, hue, smooth) {
        if (filename) {
            var path = ImageManager.server_url + folder + encodeURIComponent(filename) + '.png';
            var bitmap = this.loadNormalBitmap(path, hue || 0);
            bitmap.smooth = smooth;
            return bitmap;
        } else {
            return this.loadEmptyBitmap();
        }
    }

    static loadEmptyBitmap = function () {
        var empty = ImageManager._imageCache.get('empty');
        if (!empty) {
            empty = new Bitmap();
            ImageManager._imageCache.add('empty', empty);
            ImageManager._imageCache.reserve('empty', empty, this._systemReservationId);
        }
        return empty;
    }

    static loadNormalBitmap = function (path, hue) {
        var key = ImageManager._generateCacheKey(path, hue);
        var bitmap = ImageManager._imageCache.get(key);
        if (!bitmap) {
            bitmap = Bitmap.load(decodeURIComponent(path));
            bitmap.addLoadListener(function () {
                bitmap.rotateHue(hue);
            });
            ImageManager._imageCache.add(key, bitmap);
        } else if (!bitmap.isReady()) {
            bitmap.decode();
        }

        return bitmap;
    }

    static clear = function () {
        ImageManager._imageCache = new ImageCache();
    }

    static isReady = function () {
        return ImageManager._imageCache.isReady();
    }

    static isObjectCharacter = function (filename) {
        var sign = filename.match(/^[\!\$]+/);
        return sign && sign[0].contains('!');
    }

    static isBigCharacter = function (filename) {
        var sign = filename.match(/^[\!\$]+/);
        return sign && sign[0].contains('$');
    }

    static isZeroParallax = function (filename) {
        return filename.charAt(0) === '!';
    }


    static reserveAnimation = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/animations/', filename, hue, true, reservationId);
    }

    static reserveBattleback1 = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/battlebacks1/', filename, hue, true, reservationId);
    }

    static reserveBattleback2 = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/battlebacks2/', filename, hue, true, reservationId);
    }

    static reserveEnemy = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/enemies/', filename, hue, true, reservationId);
    }

    static reserveCharacter = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/characters/', filename, hue, false, reservationId);
    }

    static reserveFace = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/faces/', filename, hue, true, reservationId);
    }

    static reserveParallax = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/parallaxes/', filename, hue, true, reservationId);
    }

    static reservePicture = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/pictures/', filename, hue, true, reservationId);
    }

    static reserveSvActor = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/sv_actors/', filename, hue, false, reservationId);
    }

    static reserveSvEnemy = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/sv_enemies/', filename, hue, true, reservationId);
    }

    static reserveSystem = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/system/', filename, hue, false, reservationId || this._systemReservationId);
    }

    static reserveTileset = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/tilesets/', filename, hue, false, reservationId);
    }

    static reserveTitle1 = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/titles1/', filename, hue, true, reservationId);
    }

    static reserveTitle2 = function (filename, hue, reservationId) {
        return this.reserveBitmap('img/titles2/', filename, hue, true, reservationId);
    }

    static reserveBitmap = function (folder, filename, hue, smooth, reservationId) {
        if (filename) {
            var path = ImageManager.server_url + folder + encodeURIComponent(filename) + '.png';
            var bitmap = this.reserveNormalBitmap(path, hue || 0, reservationId || this._defaultReservationId);
            bitmap.smooth = smooth;
            return bitmap;
        } else {
            return this.loadEmptyBitmap();
        }
    }

    static reserveNormalBitmap = function (path, hue, reservationId) {
        var bitmap = this.loadNormalBitmap(path, hue);
        this._imageCache.reserve(this._generateCacheKey(path, hue), bitmap, reservationId);

        return bitmap;
    }

    static releaseReservation = function (reservationId) {
        this._imageCache.releaseReservation(reservationId);
    }

    static setDefaultReservationId = function (reservationId) {
        this._defaultReservationId = reservationId;
    }


    static requestAnimation = function (filename, hue) {
        return this.requestBitmap('img/animations/', filename, hue, true);
    }

    static requestBattleback1 = function (filename, hue) {
        return this.requestBitmap('img/battlebacks1/', filename, hue, true);
    }

    static requestBattleback2 = function (filename, hue) {
        return this.requestBitmap('img/battlebacks2/', filename, hue, true);
    }

    static requestEnemy = function (filename, hue) {
        return this.requestBitmap('img/enemies/', filename, hue, true);
    }

    static requestCharacter = function (filename, hue) {
        return this.requestBitmap('img/characters/', filename, hue, false);
    }

    static requestFace = function (filename, hue) {
        return this.requestBitmap('img/faces/', filename, hue, true);
    }

    static requestParallax = function (filename, hue) {
        return this.requestBitmap('img/parallaxes/', filename, hue, true);
    }

    static requestPicture = function (filename, hue) {
        return this.requestBitmap('img/pictures/', filename, hue, true);
    }

    static requestSvActor = function (filename, hue) {
        return this.requestBitmap('img/sv_actors/', filename, hue, false);
    }

    static requestSvEnemy = function (filename, hue) {
        return this.requestBitmap('img/sv_enemies/', filename, hue, true);
    }

    static requestSystem = function (filename, hue) {
        return this.requestBitmap('img/system/', filename, hue, false);
    }

    static requestTileset = function (filename, hue) {
        return this.requestBitmap('img/tilesets/', filename, hue, false);
    }

    static requestTitle1 = function (filename, hue) {
        return this.requestBitmap('img/titles1/', filename, hue, true);
    }

    static requestTitle2 = function (filename, hue) {
        return this.requestBitmap('img/titles2/', filename, hue, true);
    }

    static requestBitmap = function (folder, filename, hue, smooth) {
        if (filename) {
            var path = ImageManager.server_url + folder + encodeURIComponent(filename) + '.png';
            var bitmap = ImageManager.requestNormalBitmap(path, hue || 0);
            bitmap.smooth = smooth;
            return bitmap;
        } else {
            return this.loadEmptyBitmap();
        }
    }

    static requestNormalBitmap = function (path, hue) {
        var key = this._generateCacheKey(path, hue);
        var bitmap = this._imageCache.get(key);
        if (!bitmap) {
            bitmap = Bitmap.request(path);
            bitmap.addLoadListener(function () {
                bitmap.rotateHue(hue);
            });
            this._imageCache.add(key, bitmap);
            this._requestQueue.enqueue(key, bitmap);
        } else {
            this._requestQueue.raisePriority(key);
        }

        return bitmap;
    }

    static update = function () {
        this._requestQueue.update();
    }

    static clearRequest = function () {
        this._requestQueue.clear();
    }

}