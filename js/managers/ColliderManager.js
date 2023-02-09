import Movement from '../core/movement'
import Box_Collider from '../collider/Box_Collider'
import Circle_Collider from '../collider/Circle_Collider';
import Polygon_Collider from '../collider/Polygon_Collider'
import Sprite from '../core/sprite'
/**
 * create by 18tech
 */
export default class ColliderManager {
    constructor() {
        throw new Error('This is a static class');
    }


    static _colliders = [];
    static _colliderGrid = [];
    static _characterGrid = [];
    static _sectorSize = Movement.tileSize;
    static _needsRefresh = true;
    static container;
    static containerDict = {};
    static visible = Movement.showColliders;
    // static visible = true;

    static init() {
        ColliderManager.container = new Sprite();
        ColliderManager.container.alpha = 0.3;
    }

    static clear() {
        this._colliders = [];
        this._colliderGrid = [];
        this._characterGrid = [];
        this.container.removeChildren();
        this.containerDict = {};
    };

    static refresh() {
        this.clear();
        this._colliderGrid = new Array(this._mapWidth);
        for (var x = 0; x < this._colliderGrid.length; x++) {
            this._colliderGrid[x] = [];
            for (var y = 0; y < this._mapHeight; y++) {
                this._colliderGrid[x].push([]);
            }
        }
        this._characterGrid = new Array(this._mapWidth);
        for (var x = 0; x < this._characterGrid.length; x++) {
            this._characterGrid[x] = [];
            for (var y = 0; y < this._mapHeight; y++) {
                this._characterGrid[x].push([]);
            }
        }
        this._needsRefresh = false;
    };

    static addCollider(collider, duration, ignoreGrid) {
        if (!GameGlobal.$dataMap) return;
        var i = this._colliders.indexOf(collider);
        if (i === -1) {
            this._colliders.push(collider);
            if (duration > 0 || duration === -1) {
                this.draw(collider, duration);
            }
        }
        if (!ignoreGrid) {
            this.updateGrid(collider);
        }
    };

    static addCharacter(character, duration) {
        if (!GameGlobal.$dataMap) return;
        var i = this._colliders.indexOf(character);
        if (i === -1) {
            this._colliders.push(character);
            if (duration > 0 || duration === -1) {
                this.draw(character.collider('bounds'), duration);
            }
        }
        this.updateGrid(character);
    };

    static remove(collider) {
        var i = this._colliders.indexOf(collider);
        if (i < 0) return;
        this.removeFromGrid(collider);
        if (!collider._colliders) collider.kill = true;
        this._colliders.splice(i, 1);
    };

    static removeSprite(sprite) {
        this.container.removeChild(sprite);
        delete this.containerDict[sprite._collider.id];
    };

    static updateGrid(collider, prevGrid) {
        if (this._needsRefresh) return;
        var currGrid;
        var grid;
        if (collider._colliders) {
            grid = this._characterGrid;
            currGrid = collider.collider('bounds').sectorEdge();
        } else {
            grid = this._colliderGrid;
            currGrid = collider.sectorEdge();
        }
        // TODO make this into 1 single 2d loop
        var x, y;
        if (prevGrid) {
            if (currGrid.x1 == prevGrid.x1 && currGrid.y1 === prevGrid.y1 &&
                currGrid.x2 == prevGrid.x2 && currGrid.y2 === prevGrid.y2) {
                return;
            }
            for (x = prevGrid.x1; x <= prevGrid.x2; x++) {
                for (y = prevGrid.y1; y <= prevGrid.y2; y++) {
                    if (!grid[x] || !grid[x][y]) continue;
                    var i = grid[x][y].indexOf(collider);
                    if (i !== -1) {
                        grid[x][y].splice(i, 1);
                    }
                }
            }
        }
        for (x = currGrid.x1; x <= currGrid.x2; x++) {
            for (y = currGrid.y1; y <= currGrid.y2; y++) {
                if (!grid[x] || !grid[x][y]) continue;
                grid[x][y].push(collider);
            }
        }
    };

    static removeFromGrid(collider) {
        var grid;
        var edge;
        if (collider._colliders) { // Is a character obj
            grid = this._characterGrid;
            edge = collider.collider('bounds').sectorEdge();
        } else { // is a collider
            grid = this._colliderGrid;
            edge = collider.sectorEdge();
        }
        for (var x = edge.x1; x <= edge.x2; x++) {
            for (var y = edge.y1; y <= edge.y2; y++) {
                if (!grid[x] || !grid[x][y]) continue;
                var i = grid[x][y].indexOf(collider);
                if (i !== -1) {
                    grid[x][y].splice(i, 1);
                }
            }
        }
    };

    static getCharactersNear(collider, only) {
        var grid = collider.sectorEdge();
        var near = [];
        var checked = {};
        var isBreaking = false;
        var x, y, i;
        for (x = grid.x1; x <= grid.x2; x++) {
            for (y = grid.y1; y <= grid.y2; y++) {
                if (x < 0 || x >= this.sectorCols()) continue;
                if (y < 0 || y >= this.sectorRows()) continue;
                var charas = this._characterGrid[x][y];
                for (i = 0; i < charas.length; i++) {
                    if (checked[charas[i].charaId()]) {
                        continue;
                    }
                    checked[charas[i].charaId()] = true;
                    if (only) {
                        var value = only(charas[i]);
                        if (value === 'break') {
                            near.push(charas[i]);
                            isBreaking = true;
                            return near;
                        } else if (value === false) {
                            continue;
                        }
                    }
                    near.push(charas[i]);
                }
                if (isBreaking) break;
            }
            if (isBreaking) break;
        }
        return near;
    };

    static getCollidersNear(collider, only, debug) {
        var grid = collider.sectorEdge();
        var near = [];
        var checked = {};
        var isBreaking = false;
        var x, y, i;
        for (x = grid.x1; x <= grid.x2; x++) {
            for (y = grid.y1; y <= grid.y2; y++) {
                if (x < 0 || x >= this.sectorCols()) continue;
                if (y < 0 || y >= this.sectorRows()) continue;
                var colliders = this._colliderGrid[x][y];
                for (i = 0; i < colliders.length; i++) {
                    if (checked[colliders[i].id]) {
                        continue;
                    }
                    checked[colliders[i].id] = true;
                    if (only) {
                        var value = only(colliders[i]);
                        if (value === 'break') {
                            near.push(colliders[i]);
                            isBreaking = true;
                            break;
                        } else if (value === false) {
                            continue;
                        }
                    }
                    near.push(colliders[i]);
                }
                if (isBreaking) break;
            }
            if (isBreaking) break;
        }
        only = null;
        return near;
    };

    static getAllNear(collider, only) {
        var grid = collider.sectorEdge();
        var near = [];
        var checked = {};
        var x, y, i;
        for (x = grid.x1; x <= grid.x2; x++) {
            for (y = grid.y1; y <= grid.y2; y++) {
                if (x < 0 || x >= this.sectorCols()) continue;
                if (y < 0 || y >= this.sectorRows()) continue;
                var charas = this._characterGrid[x][y];
                var colliders = this._colliderGrid[x][y];
                for (i = 0; i < charas.length + colliders.length; i++) {
                    var type = i >= charas.length ? 'collider' : 'chara';
                    var obj;
                    if (type === 'chara') {
                        obj = charas[i];
                        if (checked[obj.charaId()]) {
                            continue;
                        }
                        checked[obj.charaId()] = true;
                    } else {
                        obj = colliders[i - charas.length];
                        if (checked[obj.id]) {
                            continue;
                        }
                        checked[obj.id] = true;
                    }
                    if (only) {
                        var value = only(type, obj);
                        if (value === 'break') {
                            near.push(obj);
                            return near;
                        } else if (value === false) {
                            continue;
                        }
                    }
                    near.push(obj);
                }
            }
        }
        return near;
    };

    static sectorCols() {
        return Math.floor(this._mapWidth * Movement.tileSize / this._sectorSize);
    };

    static sectorRows() {
        return Math.floor(this._mapHeight * Movement.tileSize / this._sectorSize);
    };

    static draw(collider, duration) {
        if (GameGlobal.$gameTemp.isPlaytest()) {
            if (this.containerDict[collider.id]) {
                this.containerDict[collider.id]._collider = collider;
                this.containerDict[collider.id]._collider.kill = false;
                this.containerDict[collider.id]._duration = duration;
                this.containerDict[collider.id].checkChanges();
                return;
            }
            collider.kill = false;
            console.log(collider);
            var sprite = new Sprite_Collider(collider, duration || -1);
            this.container.addChild(sprite);
            this.containerDict[collider.id] = sprite;
        }
    };

    static update() {
        if (this.visible) {
            this.show();
        } else {
            this.hide();
        }
    };

    static toggle() {
        this.visible = !this.visible;
    };

    static show() {
        this.container.visible = true;
    };

    static hide() {
        this.container.visible = false;
    };

    static convertToCollider(arr) {
        var type = arr[0].toLowerCase();
        if (type === 'preset') {
            var arr = Movement.presets[arr[1]];
            if (!arr) {
                alert("ERROR: Tried to use a collider preset that doesn't exist: ", type);
                return null;
            }
            type = arr[0].toLowerCase();
        }
        var w = arr[1] || 0;
        var h = arr[2] || 0;
        var ox = arr[3] || 0;
        var oy = arr[4] || 0;
        var collider;
        if (type === 'circle' || type === 'box') {
            if (type === 'circle') {
                collider = new Circle_Collider(w, h, ox, oy);
            } else {
                collider = new Box_Collider(w, h, ox, oy);
            }
        } else if (type === 'poly') {
            collider = new Polygon_Collider(arr.slice(1));
        } else {
            return null;
        }
        return collider;
    };

    static rayCast(origin, angle, dist, filter) {
        // Incomplete
        // need to finish the Polygon_Collider.prototype.lineIntersection function
        var ray = new Box_Collider(dist, 1, 0, 0, {
            pivot: new Point(0, 0.5),
            position: origin
        });
        //this.draw(ray, 600);
        return this.getAllNear(ray, filter);
    };
}