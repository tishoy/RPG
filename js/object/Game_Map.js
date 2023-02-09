import Game_Interpreter from './Game_Interpreter'
import Game_Event from './Game_Event'
import Game_CommonEvent from './Game_CommonEvent'
import ImageManager from '../managers/ImageManager'
import Graphics from '../core/graphics'
import AudioManager from '../managers/AudioManager'
import ABSManager from '../managers/ABSManager'
import ColliderManager from '../managers/ColliderManager'
import Game_Loot from './Game_Loot'
import Movement from '../core/movement'
import Box_Collider from '../collider/Box_Collider'
import E8ABS from '../18ext/E8ABS'
import Pathfind from '../18ext/Pathfind'
import LightManager from '../managers/LightManager'
/**
 * create by 18tech
 * 2019-2020
 */
export default class Game_Map {
    constructor() {
        this.initialize()
    }

    initialize() {

        this._interpreter = new Game_Interpreter();
        this._mapId = 0;
        this._tilesetId = 0;
        this._events = [];
        this._commonEvents = [];
        this._vehicles = [];
        this._displayX = 0;
        this._displayY = 0;
        this._nameDisplay = true;
        this._scrollDirection = 2;
        this._scrollRest = 0;
        this._scrollSpeed = 4;
        this._parallaxName = '';
        this._parallaxZero = false;
        this._parallaxLoopX = false;
        this._parallaxLoopY = false;
        this._parallaxSx = 0;
        this._parallaxSy = 0;
        this._parallaxX = 0;
        this._parallaxY = 0;
        this._battleback1Name = null;
        this._battleback2Name = null;
    }

    setup(mapId) {
        if (!GameGlobal.$dataMap) {
            throw new Error('The map data is not available');
        }
        ColliderManager._mapWidth = this.width();
        ColliderManager._mapHeight = this.height();
        ColliderManager.refresh();
        this._mapId = mapId;
        this._tilesetId = GameGlobal.$dataMap.tilesetId;
        this._displayX = 0;
        this._displayY = 0;
        this.refereshVehicles();
        this.setupEvents();
        this.setupScroll();
        this.setupParallax();
        this.setupBattleback();
        this._needsRefresh = false;
        this.reloadColliders();
        if (mapId !== ABSManager._mapId) {
            ABSManager.clear();
        }

        this.setupMinimap();
    }

    setupMinimap() {
        this._minimapEnabled = true;
        // this._minimapEnabled = !GameGlobal.$dataMap.meta.NoMinimap;
    };

    isMinimapEnabled() {
        return this._minimapEnabled;
    }

    refreshMinimapCache() {
        GameGlobal.$gameTemp.clearMinimapPassageCache();
    }

    isEventRunning() {
        return this._interpreter.isRunning() || this.isAnyEventStarting();
    }

    tileWidth() {
        return Movement.tileSize;
    }

    tileHeight() {
        return Movement.tileSize;
    }

    mapId() {
        return this._mapId;
    }


    tilesetId() {
        return this._tilesetId;
    }

    displayX() {
        return this._displayX;
    }

    displayY() {
        return this._displayY;
    }

    parallaxName() {
        return this._parallaxName;
    }

    battleback1Name() {
        return this._battleback1Name;
    }

    battleback2Name() {
        return this._battleback2Name;
    }

    requestRefresh(mapId) {
        this._needsRefresh = true;
    }

    isNameDisplayEnabled() {
        return this._nameDisplay;
    }

    disableNameDisplay() {
        this._nameDisplay = false;
    }

    enableNameDisplay() {
        this._nameDisplay = true;
    }

    refereshVehicles() {
        this._vehicles.forEach(function (vehicle) {
            vehicle.refresh();
        });
    }

    vehicles() {
        return this._vehicles;
    }

    vehicle(type) {
        if (type === 0 || type === 'boat') {
            return this.boat();
        } else if (type === 1 || type === 'ship') {
            return this.ship();
        } else if (type === 2 || type === 'airship') {
            return this.airship();
        } else {
            return null;
        }
    }

    boat() {
        return this._vehicles[0];
    }

    ship() {
        return this._vehicles[1];
    }

    airship() {
        return this._vehicles[2];
    }

    setupEvents() {
        LightManager.Tint("set", "#333333")
        LightManager.light(["radius", 300])
        LightManager.SetScriptActive(true);
        this._events = [];
        for (var i = 0; i < GameGlobal.$dataMap.events.length; i++) {
            if (GameGlobal.$dataMap.events[i]) {
                this._events[i] = new Game_Event(this._mapId, i);
            }
        }
        this._commonEvents = this.parallelCommonEvents().map(function (commonEvent) {
            return new Game_CommonEvent(commonEvent.id);
        });
        this.refreshTileEvents();
    }

    events() {
        return this._events.filter(function (event) {
            return !!event;
        });
    }

    event(eventId) {
        return this._events[eventId];
    }

    eraseEvent(eventId) {
        this._events[eventId].erase();
    }

    parallelCommonEvents() {
        return GameGlobal.$dataCommonEvents.filter(function (commonEvent) {
            return commonEvent && commonEvent.trigger === 2;
        });
    }

    setupScroll() {
        this._scrollDirection = 2;
        this._scrollRest = 0;
        this._scrollSpeed = 4;
    }

    setupParallax() {
        this._parallaxName = GameGlobal.$dataMap.parallaxName || '';
        this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName);
        this._parallaxLoopX = GameGlobal.$dataMap.parallaxLoopX;
        this._parallaxLoopY = GameGlobal.$dataMap.parallaxLoopY;
        this._parallaxSx = GameGlobal.$dataMap.parallaxSx;
        this._parallaxSy = GameGlobal.$dataMap.parallaxSy;
        this._parallaxX = 0;
        this._parallaxY = 0;
    }

    setupBattleback() {
        if (GameGlobal.$dataMap.specifyBattleback) {
            this._battleback1Name = GameGlobal.$dataMap.battleback1Name;
            this._battleback2Name = GameGlobal.$dataMap.battleback2Name;
        } else {
            this._battleback1Name = null;
            this._battleback2Name = null;
        }
    }

    setDisplayPos(x, y) {
        if (this.isLoopHorizontal()) {
            this._displayX = x.mod(this.width());
            this._parallaxX = x;
        } else {
            var endX = this.width() - this.screenTileX();
            this._displayX = endX < 0 ? endX / 2 : x.clamp(0, endX);
            this._parallaxX = this._displayX;
        }
        if (this.isLoopVertical()) {
            this._displayY = y.mod(this.height());
            this._parallaxY = y;
        } else {
            var endY = this.height() - this.screenTileY();
            this._displayY = endY < 0 ? endY / 2 : y.clamp(0, endY);
            this._parallaxY = this._displayY;
        }
    }

    parallaxOx() {
        if (this._parallaxZero) {
            return this._parallaxX * this.tileWidth();
        } else if (this._parallaxLoopX) {
            return this._parallaxX * this.tileWidth() / 2;
        } else {
            return 0;
        }
    }

    parallaxOy() {
        if (this._parallaxZero) {
            return this._parallaxY * this.tileHeight();
        } else if (this._parallaxLoopY) {
            return this._parallaxY * this.tileHeight() / 2;
        } else {
            return 0;
        }
    }

    tileset() {
        return GameGlobal.$dataTilesets[this._tilesetId];
    }

    tilesetFlags() {
        var tileset = this.tileset();
        if (tileset) {
            return tileset.flags;
        } else {
            return [];
        }
    }

    displayName() {
        return GameGlobal.$dataMap.displayName;
    }

    width() {
        return GameGlobal.$dataMap.width;
    }

    height() {
        return GameGlobal.$dataMap.height;
    }

    data() {
        return GameGlobal.$dataMap.data;
    }

    isLoopHorizontal() {
        return GameGlobal.$dataMap.scrollType === 2 || GameGlobal.$dataMap.scrollType === 3;
    }

    isLoopVertical() {
        return GameGlobal.$dataMap.scrollType === 1 || GameGlobal.$dataMap.scrollType === 3;
    }

    isDashDisabled() {
        return GameGlobal.$dataMap.disableDashing;
    }

    encounterList() {
        return GameGlobal.$dataMap.encounterList;
    }

    encounterStep() {
        return GameGlobal.$dataMap.encounterStep;
    }

    isOverworld() {
        return this.tileset() && this.tileset().mode === 0;
    }

    screenTileX() {
        return Graphics.width / this.tileWidth();
    }

    screenTileY() {
        return Graphics.height / this.tileHeight();
    }

    adjustX(x) {
        if (this.isLoopHorizontal() && x < this._displayX -
            (this.width() - this.screenTileX()) / 2) {
            return x - this._displayX + GameGlobal.$dataMap.width;
        } else {
            return x - this._displayX;
        }
    }

    adjustY(y) {
        if (this.isLoopVertical() && y < this._displayY -
            (this.height() - this.screenTileY()) / 2) {
            return y - this._displayY + GameGlobal.$dataMap.height;
        } else {
            return y - this._displayY;
        }
    }

    roundX(x) {
        return this.isLoopHorizontal() ? x.mod(this.width()) : x;
    }

    roundY(y) {
        return this.isLoopVertical() ? y.mod(this.height()) : y;
    }

    xWithDirection(x, d) {
        return x + (d === 6 ? 1 : d === 4 ? -1 : 0);
    }

    yWithDirection(y, d) {
        return y + (d === 2 ? 1 : d === 8 ? -1 : 0);
    }

    roundXWithDirection(x, d) {
        return this.roundX(x + (d === 6 ? 1 : d === 4 ? -1 : 0));
    }

    roundYWithDirection(y, d) {
        return this.roundY(y + (d === 2 ? 1 : d === 8 ? -1 : 0));
    }

    deltaX(x1, x2) {
        var result = x1 - x2;
        if (this.isLoopHorizontal() && Math.abs(result) > this.width() / 2) {
            if (result < 0) {
                result += this.width();
            } else {
                result -= this.width();
            }
        }
        return result;
    }

    deltaY(y1, y2) {
        var result = y1 - y2;
        if (this.isLoopVertical() && Math.abs(result) > this.height() / 2) {
            if (result < 0) {
                result += this.height();
            } else {
                result -= this.height();
            }
        }
        return result;
    }

    distance(x1, y1, x2, y2) {
        return Math.abs(this.deltaX(x1, x2)) + Math.abs(this.deltaY(y1, y2));
    }

    canvasToMapX(x) {
        var tileWidth = this.tileWidth();
        var originX = this._displayX * tileWidth;
        var mapX = Math.floor((originX + x) / tileWidth);
        return this.roundX(mapX);
    }

    canvasToMapY(y) {
        var tileHeight = this.tileHeight();
        var originY = this._displayY * tileHeight;
        var mapY = Math.floor((originY + y) / tileHeight);
        return this.roundY(mapY);
    }

    autoplay() {
        if (GameGlobal.$dataMap.autoplayBgm) {
            if (GameGlobal.$gamePlayer.isInVehicle()) {
                GameGlobal.$gameSystem.saveWalkingBgm2();
            } else {
                AudioManager.playBgm(GameGlobal.$dataMap.bgm);
            }
        }
        if (GameGlobal.$dataMap.autoplayBgs) {
            AudioManager.playBgs(GameGlobal.$dataMap.bgs);
        }
    }

    refreshIfNeeded() {
        if (this._needsRefresh) {
            this.refresh();
        }
        if (ColliderManager._needsRefresh) {
            ColliderManager._mapWidth = this.width();
            ColliderManager._mapHeight = this.height();
            ColliderManager.refresh();
            this.reloadColliders();
        }
    }

    refresh() {
        this.events().forEach(function (event) {
            event.refresh();
        });
        this._commonEvents.forEach(function (event) {
            event.refresh();
        });
        this.refreshTileEvents();
        this._needsRefresh = false;
    }

    refreshTileEvents() {
        this.tileEvents = this.events().filter(function (event) {
            return event.isTile();
        });
    }

    eventsXy(x, y) {
        return this.events().filter(function (event) {
            return event.pos(x, y);
        });
    }

    eventsXyNt(x, y) {
        return this.events().filter(function (event) {
            return event.posNt(x, y);
        });
    }

    tileEventsXy(x, y) {
        return this.tileEvents.filter(function (event) {
            return event.posNt(x, y);
        });
    }

    eventIdXy(x, y) {
        var list = this.eventsXy(x, y);
        return list.length === 0 ? 0 : list[0].eventId();
    }

    scrollDown(distance) {
        if (this.isLoopVertical()) {
            this._displayY += distance;
            this._displayY %= GameGlobal.$dataMap.height;
            if (this._parallaxLoopY) {
                this._parallaxY += distance;
            }
        } else if (this.height() >= this.screenTileY()) {
            var lastY = this._displayY;
            this._displayY = Math.min(this._displayY + distance,
                this.height() - this.screenTileY());
            this._parallaxY += this._displayY - lastY;
        }
    }

    scrollLeft(distance) {
        if (this.isLoopHorizontal()) {
            this._displayX += GameGlobal.$dataMap.width - distance;
            this._displayX %= GameGlobal.$dataMap.width;
            if (this._parallaxLoopX) {
                this._parallaxX -= distance;
            }
        } else if (this.width() >= this.screenTileX()) {
            var lastX = this._displayX;
            this._displayX = Math.max(this._displayX - distance, 0);
            this._parallaxX += this._displayX - lastX;
        }
    }

    scrollRight(distance) {
        if (this.isLoopHorizontal()) {
            this._displayX += distance;
            this._displayX %= GameGlobal.$dataMap.width;
            if (this._parallaxLoopX) {
                this._parallaxX += distance;
            }
        } else if (this.width() >= this.screenTileX()) {
            var lastX = this._displayX;
            this._displayX = Math.min(this._displayX + distance,
                this.width() - this.screenTileX());
            this._parallaxX += this._displayX - lastX;
        }
    }

    scrollUp(distance) {
        if (this.isLoopVertical()) {
            this._displayY += GameGlobal.$dataMap.height - distance;
            this._displayY %= GameGlobal.$dataMap.height;
            if (this._parallaxLoopY) {
                this._parallaxY -= distance;
            }
        } else if (this.height() >= this.screenTileY()) {
            var lastY = this._displayY;
            this._displayY = Math.max(this._displayY - distance, 0);
            this._parallaxY += this._displayY - lastY;
        }
    }

    isValid(x, y) {
        return x >= 0 && x < this.width() && y >= 0 && y < this.height();
    }

    checkPassage(x, y, bit) {
        var flags = this.tilesetFlags();
        var tiles = this.allTiles(x, y);
        for (var i = 0; i < tiles.length; i++) {
            var flag = flags[tiles[i]];
            if ((flag & 0x10) !== 0)  // [*] No effect on passage
                continue;
            if ((flag & bit) === 0) { // [o] Passable
                return true;
            }
            if ((flag & bit) === bit) // [x] Impassable
                return false;
        }
        console.log("false");
        return false;
    }

    tileId(x, y, z) {
        var width = GameGlobal.$dataMap.width;
        var height = GameGlobal.$dataMap.height;
        return GameGlobal.$dataMap.data[(z * height + y) * width + x] || 0;
    }

    layeredTiles(x, y) {
        var tiles = [];
        for (var i = 0; i < 4; i++) {
            tiles.push(this.tileId(x, y, 3 - i));
        }
        return tiles;
    }

    allTiles(x, y) {
        var tiles = this.tileEventsXy(x, y).map(function (event) {
            return event.tileId();
        });
        return tiles.concat(this.layeredTiles(x, y));
    }

    autotileType(x, y, z) {
        var tileId = this.tileId(x, y, z);
        return tileId >= 2048 ? Math.floor((tileId - 2048) / 48) : -1;
    }

    isPassable(x, y, d) {
        return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f);
    }

    isBoatPassable(x, y) {
        return this.checkPassage(x, y, 0x0200);
    }

    isShipPassable(x, y) {
        return this.checkPassage(x, y, 0x0400);
    }

    isAirshipLandOk(x, y) {
        return this.checkPassage(x, y, 0x0800) && this.checkPassage(x, y, 0x0f);
    }

    checkLayeredTilesFlags(x, y, bit) {
        var flags = this.tilesetFlags();
        return this.layeredTiles(x, y).some(function (tileId) {
            return (flags[tileId] & bit) !== 0;
        });
    }

    isLadder(x, y) {
        return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x20);
    }

    isBush(x, y) {
        return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x40);
    }

    isCounter(x, y) {
        return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x80);
    }

    isDamageFloor(x, y) {
        return this.isValid(x, y) && this.checkLayeredTilesFlags(x, y, 0x100);
    }

    terrainTag(x, y) {
        if (this.isValid(x, y)) {
            var flags = this.tilesetFlags();
            var tiles = this.layeredTiles(x, y);
            for (var i = 0; i < tiles.length; i++) {
                var tag = flags[tiles[i]] >> 12;
                if (tag > 0) {
                    return tag;
                }
            }
        }
        return 0;
    }

    regionId(x, y) {
        return this.isValid(x, y) ? this.tileId(x, y, 5) : 0;
    }

    startScroll(direction, distance, speed) {
        this._scrollDirection = direction;
        this._scrollRest = distance;
        this._scrollSpeed = speed;
    }

    isScrolling() {
        return this._scrollRest > 0;
    }

    update(sceneActive) {
        this.refreshIfNeeded();
        if (sceneActive) {
            this.updateInterpreter();
        }
        this.updateScroll();
        this.updateEvents();
        this.updateVehicles();
        this.updateParallax();
        if (E8ABS._needsUncompress) {
            this.uncompressBattlers();
            E8ABS._needsUncompress = false;
        }
        if (Pathfind._needsUncompress) {
            this.uncompressPathfinders();
            Pathfind._needsUncompress = false;
        }
    }

    updateScroll() {
        if (this.isScrolling()) {
            var lastX = this._displayX;
            var lastY = this._displayY;
            this.doScroll(this._scrollDirection, this.scrollDistance());
            if (this._displayX === lastX && this._displayY === lastY) {
                this._scrollRest = 0;
            } else {
                this._scrollRest -= this.scrollDistance();
            }
        }
    }

    scrollDistance() {
        return Math.pow(2, this._scrollSpeed) / 256;
    }

    doScroll(direction, distance) {
        switch (direction) {
            case 2:
                this.scrollDown(distance);
                break;
            case 4:
                this.scrollLeft(distance);
                break;
            case 6:
                this.scrollRight(distance);
                break;
            case 8:
                this.scrollUp(distance);
                break;
        }
    }

    updateEvents() {
        this.events().forEach(function (event) {
            event.update();
        });
        this._commonEvents.forEach(function (event) {
            event.update();
        });
    }

    updateVehicles() {
        this._vehicles.forEach(function (vehicle) {
            vehicle.update();
        });
    }

    updateParallax() {
        if (this._parallaxLoopX) {
            this._parallaxX += this._parallaxSx / this.tileWidth() / 2;
        }
        if (this._parallaxLoopY) {
            this._parallaxY += this._parallaxSy / this.tileHeight() / 2;
        }
    }

    changeTileset(tilesetId) {
        this._tilesetId = tilesetId;
        this.refresh();
    }

    changeBattleback(battleback1Name, battleback2Name) {
        this._battleback1Name = battleback1Name;
        this._battleback2Name = battleback2Name;
    }

    changeParallax(name, loopX, loopY, sx, sy) {
        this._parallaxName = name;
        this._parallaxZero = ImageManager.isZeroParallax(this._parallaxName);
        if (this._parallaxLoopX && !loopX) {
            this._parallaxX = 0;
        }
        if (this._parallaxLoopY && !loopY) {
            this._parallaxY = 0;
        }
        this._parallaxLoopX = loopX;
        this._parallaxLoopY = loopY;
        this._parallaxSx = sx;
        this._parallaxSy = sy;
    }

    updateInterpreter() {
        for (; ;) {
            this._interpreter.update();
            if (this._interpreter.isRunning()) {
                return;
            }
            if (this._interpreter.eventId() > 0) {
                this.unlockEvent(this._interpreter.eventId());
                this._interpreter.clear();
            }
            if (!this.setupStartingEvent()) {
                return;
            }
        }
    }

    unlockEvent(eventId) {
        if (this._events[eventId]) {
            this._events[eventId].unlock();
        }
    }

    setupStartingEvent() {
        this.refreshIfNeeded();
        if (this._interpreter.setupReservedCommonEvent()) {
            return true;
        }
        if (this.setupStartingMapEvent()) {
            return true;
        }
        if (this.setupAutorunCommonEvent()) {
            return true;
        }
        return false;
    }

    setupStartingMapEvent() {
        var events = this.events();
        for (var i = 0; i < events.length; i++) {
            var event = events[i];
            if (event.isStarting()) {
                event.clearStartingFlag();
                this._interpreter.setup(event.list(), event.eventId());
                return true;
            }
        }
        return false;
    }

    setupAutorunCommonEvent() {
        for (var i = 0; i < GameGlobal.$dataCommonEvents.length; i++) {
            var event = GameGlobal.$dataCommonEvents[i];
            if (event && event.trigger === 1 && GameGlobal.$gameSwitches.value(event.switchId)) {
                this._interpreter.setup(event.list);
                return true;
            }
        }
        return false;
    }

    isAnyEventStarting() {
        return this.events().some(function (event) {
            return event.isStarting();
        });
    }

    //abs
    compressBattlers() {
        for (var i = 0; i < this.events().length; i++) {
            if (this.events()[i]._battler) {
                var oldRespawn = this.events()[i]._respawn;
                this.events()[i].clearABS();
                this.events()[i]._battler = null;
                this.events()[i]._respawn = oldRespawn;
            }
            if (this.events()[i].GetConstructorType() === "Game_Loot") {
                ABSManager.removePicture(this.events()[i]._itemIcon);
                ABSManager.removeEvent(this.events()[i]);
            }
        }
        GameGlobal.$gamePlayer.clearABS();
        ABSManager.clear();
    }

    uncompressBattlers() {
        var wasDead = false;
        var oldRespawn;
        for (var i = 0; i < this.events().length; i++) {
            if (this.events()[i]._respawn >= 0) {
                wasDead = true;
                oldRespawn = this.events()[i]._respawn;
            }
            this.events()[i].setupBattler();
            if (wasDead) {
                this.events()[i].clearABS();
                this.events()[i]._battler = null;
                this.events()[i]._respawn = oldRespawn;
            }
        }
        // ABS TODO
        // TODO setup player?
    };

    // Movement
    flagAt(x, y) {
        var x = x || GameGlobal.$gamePlayer.x;
        var y = y || GameGlobal.$gamePlayer.y;
        var flags = this.tilesetFlags();
        var tiles = this.allTiles(x, y);
        for (var i = 0; i < tiles.length; i++) {
            var flag = flags[tiles[i]];
            console.log('layer', i, ':', flag);
            if (flag & 0x20) console.log('layer', i, 'is ladder');
            if (flag & 0x40) console.log('layer', i, 'is bush');
            if (flag & 0x80) console.log('layer', i, 'is counter');
            if (flag & 0x100) console.log('layer', i, 'is damage');
        }
    };

    gridSize() {
        if (GameGlobal.$dataMap && GameGlobal.$dataMap.meta.grid !== undefined) {
            return Number(GameGlobal.$dataMap.meta.grid) || Movement.grid;
        }
        return Movement.grid;
    };

    offGrid() {
        if (GameGlobal.$dataMap && GameGlobal.$dataMap.meta.offGrid !== undefined) {
            return GameGlobal.$dataMap.meta.offGrid === 'true';
        }
        return Movement.offGrid;
    };

    midPass() {
        if (GameGlobal.$dataMap && GameGlobal.$dataMap.meta.midPass !== undefined) {
            return GameGlobal.$dataMap.meta.midPass === 'true';
        }
        return Movement.midPass;
    };

    reloadColliders() {
        this.reloadTileMap();
        var events = this.events();
        var i, j;
        for (i = 0, j = events.length; i < j; i++) {
            events[i].reloadColliders();
        }
        var vehicles = this._vehicles;
        for (i = 0, j = vehicles.length; i < j; i++) {
            vehicles[i].reloadColliders();
        }
        GameGlobal.$gamePlayer.reloadColliders();
        var followers = GameGlobal.$gamePlayer.followers()._data;
        for (i = 0, j = followers.length; i < j; i++) {
            followers[i].reloadColliders();
        }
    };

    clearColliders() {
        var events = this.events();
        var i, j;
        for (i = 0, j = events.length; i < j; i++) {
            events[i].removeColliders();
        }
        var vehicles = this._vehicles;
        for (i = 0, j = vehicles.length; i < j; i++) {
            vehicles[i].removeColliders();
        }
        GameGlobal.$gamePlayer.removeColliders();
        var followers = GameGlobal.$gamePlayer.followers()._data;
        for (i = 0, j = followers.length; i < j; i++) {
            followers[i].removeColliders();
        }
    };

    reloadTileMap() {
        this.setupMapColliders();
        // collider map is also loaded here
        // collision map is also loaded here
    };

    setupMapColliders() {
        this._tileCounter = 0;
        for (var x = 0; x < this.width(); x++) {
            for (var y = 0; y < this.height(); y++) {
                var flags = this.tilesetFlags();
                var tiles = this.allTiles(x, y);
                var id = x + y * this.width();
                for (var i = tiles.length - 1; i >= 0; i--) {
                    var flag = flags[tiles[i]];
                    if (flag === 16) continue;
                    var data = this.getMapCollider(x, y, flag);
                    if (!data) continue;
                    if (data[0].constructor === Array) {
                        for (var j = 0; j < data.length; j++) {
                            this.makeTileCollider(x, y, flag, data[j], j);
                        }
                    } else {
                        this.makeTileCollider(x, y, flag, data, 0);
                    }
                }
            }
        }
    };

    getMapCollider(x, y, flag) {
        var realFlag = flag;
        if (flag >> 12 > 0) {
            flag = flag.toString(2);
            flag = flag.slice(flag.length - 12, flag.length);
            flag = parseInt(flag, 2);
        }
        var boxData;
        if (Movement.regionColliders[this.regionId(x, y)]) {
            var regionData = Movement.regionColliders[this.regionId(x, y)];
            boxData = [];
            for (var i = 0; i < regionData.length; i++) {
                boxData[i] = [
                    regionData[i].width || 0,
                    regionData[i].height || 0,
                    regionData[i].ox || 0,
                    regionData[i].oy || 0,
                    regionData[i].tag || regionData[i].note || '',
                    regionData[i].type || 'box'
                ]
            }
            flag = 0;
        } else {
            boxData = Movement.tileBoxes[flag];
        }
        if (!boxData) {
            if (flag & 0x20 || flag & 0x40 || flag & 0x80 || flag & 0x100) {
                boxData = [this.tileWidth(), this.tileHeight(), 0, 0];
            } else {
                return null;
            }
        }
        return boxData;
    };

    makeTileCollider(x, y, flag, boxData, index) {
        // boxData is array [width, height, ox, oy, note, type]
        var x1 = x * this.tileWidth();
        var y1 = y * this.tileHeight();
        var ox = boxData[2] || 0;
        var oy = boxData[3] || 0;
        var w = boxData[0];
        var h = boxData[1];
        if (w === 0 || h === 0) return;
        var type = boxData[5] || 'box';
        var newBox;
        if (type === 'circle') {
            newBox = new Circle_Collider(w, h, ox, oy);
        } else if (type === 'box') {
            newBox = new Box_Collider(w, h, ox, oy);
        } else {
            return;
        }
        newBox.isTile = true;
        newBox.note = boxData[4] || '';
        newBox.flag = flag;
        newBox.terrain = flag >> 12;
        newBox.regionId = this.regionId(x, y);
        newBox.isWater1 = flag >> 12 === Movement.water1Tag || /<water1>/i.test(newBox.note);
        newBox.isWater2 = flag >> 12 === Movement.water2Tag || /<water2>/i.test(newBox.note);
        newBox.isLadder = (flag & 0x20) || /<ladder>/i.test(newBox.note);
        newBox.isBush = (flag & 0x40) || /<bush>/i.test(newBox.note);
        newBox.isCounter = (flag & 0x80) || /<counter>/i.test(newBox.note);
        newBox.isDamage = (flag & 0x100) || /<damage>/i.test(newBox.note);
        newBox.moveTo(x1, y1);
        var vx = x * this.height() * this.width();
        var vy = y * this.height();
        var vz = index;
        newBox.location = vx + vy + vz;
        if (newBox.isWater2) {
            newBox.color = Movement.water2.toLowerCase();
        } else if (newBox.isWater1) {
            newBox.color = Movement.water1.toLowerCase();
        } else if (newBox.isLadder || newBox.isBush || newBox.isDamage) {
            newBox.color = '#ffffff';
        } else {
            newBox.color = Movement.collision.toLowerCase();
        }
        ColliderManager.addCollider(newBox, -1);
        return newBox;
    };

    adjustPX(x) {
        return this.adjustX(x / Movement.tileSize) * Movement.tileSize;
    };

    adjustPY(y) {
        return this.adjustY(y / Movement.tileSize) * Movement.tileSize;
    };

    roundPX(x) {
        return this.isLoopHorizontal() ? x.mod(this.width() * Movement.tileSize) : x;
    };

    roundPY(y) {
        return this.isLoopVertical() ? y.mod(this.height() * Movement.tileSize) : y;
    };

    pxWithDirection(x, d, dist) {
        return x + (d === 6 ? dist : d === 4 ? -dist : 0);
    };

    pyWithDirection(y, d, dist) {
        return y + (d === 2 ? dist : d === 8 ? -dist : 0);
    };

    roundPXWithDirection(x, d, dist) {
        return this.roundPX(x + (d === 6 ? dist : d === 4 ? -dist : 0));
    };

    roundPYWithDirection(y, d, dist) {
        return this.roundPY(y + (d === 2 ? dist : d === 8 ? -dist : 0));
    };

    deltaPX(x1, x2) {
        var result = x1 - x2;
        if (this.isLoopHorizontal() && Math.abs(result) > (this.width() * Movement.tileSize) / 2) {
            if (result < 0) {
                result += this.width() * Movement.tileSize;
            } else {
                result -= this.width() * Movement.tileSize;
            }
        }
        return result;
    };

    deltaPY(y1, y2) {
        var result = y1 - y2;
        if (this.isLoopVertical() && Math.abs(result) > (this.height() * Movement.tileSize) / 2) {
            if (result < 0) {
                result += this.height() * Movement.tileSize;
            } else {
                result -= this.height() * Movement.tileSize;
            }
        }
        return result;
    };

    canvasToMapPX(x) {
        var tileWidth = this.tileWidth();
        var originX = this.displayX() * tileWidth;
        return this.roundPX(originX + x);
    };

    canvasToMapPY(y) {
        var tileHeight = this.tileHeight();
        var originY = this.displayY() * tileHeight;
        return this.roundPY(originY + y);
    };

    globalLock(charas, mode, level) {
        charas = charas || [];
        mode = mode === undefined ? 0 : mode;
        level = level === undefined ? 1 : level;
        if (mode === 0) {
            GameGlobal.$gamePlayer._globalLocked = !charas.contains(GameGlobal.$gamePlayer) ? level : 0;
            var events = this.events();
            for (var i = 0; i < events.length; i++) {
                if (charas.contains(events[i])) continue;
                events[i]._globalLocked = level;
            }
        } else {
            for (var i = 0; i < charas.length; i++) {
                if (charas[i]) {
                    charas[i]._globalLocked = level;
                }
            }
        }
    };

    // // kept for backwars compatibility
    globalUnlock(charas) {
        this.globalLock(charas, 0, 0);
    };

    // Pathfind

    compressPathfinders() {
        for (var i = 0; i < this.events().length; i++) {
            var event = this.events()[i];
            if (event._pathfind) {
                event._compressedPathfind = event._pathfind.compress();
                event.clearPathfind();
            }
        }
        if (GameGlobal.$gamePlayer._pathfind) {
            GameGlobal.$gamePlayer._compressedPathfind = GameGlobal.$gamePlayer._pathfind.compress();
            GameGlobal.$gamePlayer.clearPathfind();
        }
    };

    uncompressPathfinders() {
        for (var i = 0; i < this.events().length; i++) {
            var event = this.events()[i];
            if (event._compressedPathfind) {
                var old = event._compressedPathfind;
                event.initPathfind(old.x, old.y, old.options);
                delete event._compressedPathfind;
            }
        }
        if (GameGlobal.$gamePlayer._compressedPathfind) {
            var old = $gamePlayer._compressedPathfind;
            GameGlobal.$gamePlayer.initPathfind(old.x, old.y, old.options);
            delete $gamePlayer._compressedPathfind;
        }
    };
}