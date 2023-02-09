import Sprite_Base from './Sprite_Base'
import * as PIXI from "../libs/pixi"
import Point from '../core/point'
import Sprite from '../core/sprite';
import Bitmap from '../core/bitmap';
import ShaderTilemap from '../core/shaderTilemap';
import Tilemap from '../core/tilemap';
import Sprite_MinimapPassage from './Sprite_MinimapPassage'
import Sprite_MinimapIcon from './Sprite_MinimapIcon'
import Minimap from '../18ext/MiniMap'
import Game_MinimapPassageCache from '../object/Game_MinimapPassageCache'
import ImageManager from '../managers/ImageManager'
import Spriteset_Map from './Spriteset_Map'
import SceneManager from '../managers/SceneManager';
import Graphics from '../core/graphics'



export default class Sprite_Minimap extends Sprite_Base {
    constructor() {
        super();
        this.initialize();
    }

    parseRect(str) {
        var rectReg = /([-]?\d+),\s*([-]?\d+),\s*([-]?\d+),\s*([-]?\d+)/;
        var rect = new PIXI.Rectangle(524, 32, 260, 200);
        var match = rectReg.exec(str);
        if (match) {
            rect.x = Number(match[1]);
            rect.y = Number(match[2]);
            rect.width = Number(match[3]);
            rect.height = Number(match[4]);
        }

        return rect;
    };

    mapRect;
    gridSize = 5;
    blinkTime = 180;
    foregroundColor = "rgba(255, 255, 255, 0.8)"
    backgroundColor = "rgba(255, 255, 255, 0.5)"
    playerIconImage = 'MinimapPlayerIcon';
    objectIconImage = 'MinimapObjectIcon';
    displayTileImage = true;
    maskStyle = 1
    maskRadius = 24;

    initialize() {
        super.initialize();
        this.mapRect = this.parseRect("120, 20, 150, 150");
        var rect = this.mapRect;
        this._gridNumber = {
            x: Math.floor((rect.width + this.gridSize - 1) / this.gridSize),
            y: Math.floor((rect.height + this.gridSize - 1) / this.gridSize),
        };
        this._drawGridNumber = { x: this._gridNumber.x + 2, y: this._gridNumber.y + 2 };
        this._drawRange = { begin: new PIXI.Point(0, 0), end: new PIXI.Point(0, 0) };

        this._lastPosition = new Point(GameGlobal.$gamePlayer.x, GameGlobal.$gamePlayer.y);
        this._scrollDiff = new Point();

        this.createSubSprites();

        this._baseOpacity = 120;
        this.setColorTone([-64, -64, 128, 64]);

        this.move(rect.x, rect.y);
    }

    createSubSprites() {
        this._bitmapSize = {
            width: (this._gridNumber.x + 2) * this.gridSize,
            height: (this._gridNumber.y + 2) * this.gridSize
        };

        this.createBaseSprite();
        this.createPassageSprite();
        // this.createObjectSprites();
        this.createPlayerSprite();
    };

    createBaseSprite() {
        var rect = this.mapRect;

        this._baseSprite = new Sprite();
        this._baseSprite.bitmap = new Bitmap(rect.width, rect.height);
        this._baseSprite.bitmap.fillAll(this.backgroundColor);

        this.addChild(this._baseSprite);

        if (this.displayTileImage) {
            // this._tilemap = Graphics.isWebGL() ?
            //     new ShaderTilemap() :
            //     new Tilemap();
            this._tilemap = new Tilemap();

            // 軽量化のためにタイルのアニメーションを切る
            this._tilemap.update = null;

            this.addChild(this._tilemap);
        }

        this.applyMask(rect);
    };

    applyMask(rect) {
        this._maskGraphic = new PIXI.Graphics();
        this._maskGraphic.beginFill(0x000000);

        switch (this.maskStyle) {
            case Minimap.maskStyles.ellipse:
                this._maskGraphic.drawEllipse(rect.width / 2, rect.height / 2, rect.width / 2, rect.height / 2);
                break;

            case Minimap.maskStyles.roundedRect:
                this._maskGraphic.drawRoundedRect(0, 0, rect.width, rect.height, 64);
                break;

            case Minimap.maskStyles.hex1:
            case Minimap.maskStyles.hex2:
                this.fillRegularPolygon(
                    this._maskGraphic,
                    rect.width / 2,
                    rect.height / 2,
                    rect.width / 2,
                    rect.height / 2,
                    (this.maskStyle === Minimap.maskStyles.hex1) ? 0 : (Math.PI / 2),
                    6);
                break;

            default:
                this._maskGraphic.drawRect(0, 0, rect.width, rect.height);
                break;
        }

        this._maskGraphic.endFill();

        this.addChild(this._maskGraphic);
        this.mask = this._maskGraphic;
    };

    createPassageSprite() {
        this._passageSprite = new Sprite_MinimapPassage(this._bitmapSize.width, this._bitmapSize.height);

        this.updateScroll();
        this.addChild(this._passageSprite);
    };

    createObjectSprites() {
        this._objectSprites = [];

        var objects = GameGlobal.$gameMap.events().concat(GameGlobal.$gameMap.vehicles());
        objects.forEach((obj) => {
            var sprite = new Sprite_MinimapIcon();
            sprite.setObject(obj);
            this._objectSprites.push(sprite);
            this.addChild(sprite);
        }, this);
    };

    createPlayerSprite() {
        var rect = this.mapRect;

        this._playerSprite = new Sprite_MinimapIcon();
        this._playerSprite.bitmap = ImageManager.loadSystem(this.playerIconImage);
        this._playerSprite.x = rect.width / 2;
        this._playerSprite.y = rect.height / 2;

        this.addChild(this._playerSprite);
    };

    setWholeOpacity(baseOpacity) {
        this.opacity = this._baseOpacity * baseOpacity / 255;
    };

    move(x, y) {
        this.x = x;
        this.y = y;
    };

    isNeedUpdate() {
        return this.visible && this.opacity > 0;
    };

    update() {
        super.update();

        this.updateVisibility();

        if (GameGlobal.$gameTemp.minimapCacheRefreshFlag) {
            GameGlobal.$gameTemp.minimapCacheRefreshFlag = false;
            this.refreshPassageTable();
        }

        if (!this.isNeedUpdate()) {
            return;
        }

        this.updatePosition();
        this.updateTilemap();
        this.updatePassageSprite();
        // this.updateObjectSprites();
        this.updatePlayerSprite();
    };

    updateVisibility() {
        this.visible =
            GameGlobal.$gameSystem.isMinimapEnabled() &&
            GameGlobal.$gameMap.isMinimapEnabled();
    };

    updateDrawRange() {
        var range = {
            x: Math.floor(this._drawGridNumber.x / 2),
            y: Math.floor(this._drawGridNumber.y / 2)
        };
        this._drawRange.begin.x = GameGlobal.$gamePlayer.x - range.x;
        this._drawRange.begin.y = GameGlobal.$gamePlayer.y - range.y;
        this._drawRange.end.x = GameGlobal.$gamePlayer.x + range.x;
        this._drawRange.end.y = GameGlobal.$gamePlayer.y + range.y;
    };

    /**
     * タイルマップの表示領域を更新
     */
    updateTilemap() {
        if (!this._tilemap) {
            return;
        }

        this._tilemap.origin.x =
            (GameGlobal.$gamePlayer._realX - this._tileCount.x / 2.0 + 1.5) * GameGlobal.$gameMap.tileWidth();
        this._tilemap.origin.y =
            (GameGlobal.$gamePlayer._realY - this._tileCount.y / 2.0 + 1.5) * GameGlobal.$gameMap.tileHeight();
    };

    /**
     * 通行可能領域スプライトの更新
     */
    updatePassageSprite() {
        // TODO: 実装
    };

    /**
     * オブジェクトスプライトの更新
     */
    updateObjectSprites() {
        this._objectSprites.forEach(function (sprite) {
            var obj = sprite.getObject();
            if (!obj || !this.isInDrawRange(obj.x - 1, obj.y - 1)) {
                sprite.visible = false;
                return;
            }

            sprite.updatePosition(this._drawRange.begin, this._scrollDiff);
        }, this);
    };

    /**
     * 現在位置スプライトの更新
     */
    updatePlayerSprite() {
        // スプライトの向きを設定
        var angle;
        // if (KMS.imported['3DVehicle'] && GameGlobal.$gameMap.is3DMode()) {
        // angle = -GameGlobal.$gameMap.get3DPlayerAngle();
        // }
        // else {
        switch (GameGlobal.$gamePlayer.direction()) {
            case 2: angle = Math.PI; break;
            case 4: angle = Math.PI * 3 / 2; break;
            case 6: angle = Math.PI / 2; break;
            case 8: angle = 0; break;
            default: angle = 0; break;
        }
        // }
        this._playerSprite.rotation = angle;
    };

    /**
     * ミニマップの再構築
     */
    refresh() {
        this.updatePosition();
        this.refreshTilemap();
        this.refreshParameters();
        this.refreshMapImage();
    };

    /**
     * タイルマップの再構築
     */
    refreshTilemap() {
        if (!this._tilemap) {
            return;
        }

        var rect = this.mapRect;
        var baseSize = {
            width: Math.floor(rect.width * GameGlobal.$gameMap.tileWidth() / this.gridSize),
            height: Math.floor(rect.height * GameGlobal.$gameMap.tileHeight() / this.gridSize)
        };

        // タイルマップのパラメータを設定
        this._tilemap.tileWidth = GameGlobal.$gameMap.tileWidth();
        this._tilemap.tileHeight = GameGlobal.$gameMap.tileHeight();
        this._tilemap.width = baseSize.width;
        this._tilemap.height = baseSize.height;
        this._tilemap.setData(GameGlobal.$gameMap.width(), GameGlobal.$gameMap.height(), GameGlobal.$gameMap.data());
        this._tilemap.horizontalWrap = GameGlobal.$gameMap.isLoopHorizontal();
        this._tilemap.verticalWrap = GameGlobal.$gameMap.isLoopVertical();

        var scaleX = this.mapRect.width / this._tilemap.width;
        var scaleY = this.mapRect.height / this._tilemap.height;
        this._tilemap.scale.x = scaleX;
        this._tilemap.scale.y = scaleY;
        this._tilemap.x += this._tilemap._margin * scaleX;
        this._tilemap.y += this._tilemap._margin * scaleY;
        //this._tilemap.width += this._tilemap._margin * 2;
        //this._tilemap.height += this._tilemap._margin * 2;

        if (SceneManager._scene._spriteset) {
            SceneManager._scene._spriteset.loadTileset();
            (Graphics.isWebGL() ? ShaderTilemap : Tilemap).update();

        }


        this._tileCount = this._tilemap.getTileCount();

        // タイルマップを再描画するために update を呼ぶ

    };

    /**
     * ミニマップ用パラメータの再構築
     */
    refreshParameters() {
        this.updateDrawRange();
        this.refreshPassageTable();
    };

    /**
     * 通行フラグテーブルの更新
     */
    refreshPassageTable() {
        this._passageCache = this.getPassageTableCache();
    };

    /**
     * 現在のマップに対応する通行フラグキャッシュを取得
     */
    getPassageTableCache() {
        return new Game_MinimapPassageCache(GameGlobal.$gameMap, this._drawGridNumber);
    };

    /**
     * マップ画像の再構築
     */
    refreshMapImage() {
        this.drawMap();
    };

    /**
     * 指定した座標が含まれるブロックの通行フラグをスキャン
     */
    scanPassage(x, y) {
        var mapWidth = GameGlobal.$gameMap.width();
        var mapHeight = GameGlobal.$gameMap.height();
        if (GameGlobal.$gameMap.isLoopHorizontal()) {
            x = (x + mapWidth) % mapWidth;
        }
        if (GameGlobal.$gameMap.isLoopVertical()) {
            y = (y + mapHeight) % mapHeight;
        }

        var blocks = this._passageCache.getBlockCount();
        var bx = Math.floor(x / this._drawGridNumber.x);
        var by = Math.floor(y / this._drawGridNumber.y);

        if (bx < 0 || bx >= blocks.x || by < 0 || by >= blocks.y) {
            // マップ範囲外
            return;
        }

        if (this._passageCache.isBlockChecked(bx, by)) {
            // 探索済み
            return;
        }

        var range = {
            x: {
                begin: bx * this._drawGridNumber.x,
                end: (bx + 1) * this._drawGridNumber.x
            },
            y: {
                begin: by * this._drawGridNumber.y,
                end: (by + 1) * this._drawGridNumber.y
            }
        };

        // 探索範囲内の通行テーブルを生成
        for (var ty = range.y.begin; ty < range.y.end; ty++) {
            if (ty < 0 || ty >= mapHeight) {
                continue;
            }

            for (var tx = range.x.begin; tx < range.x.end; tx++) {
                if (tx < 0 || tx >= mapWidth) {
                    continue;
                }

                // 通行方向フラグの作成
                // (方向は 2, 4, 6, 8)
                var flag = 0;
                for (var i = 0; i < 4; i++) {
                    var dir = (i + 1) * 2;
                    if (GameGlobal.$gameMap.isPassable(tx, ty, dir)) {
                        flag |= 1 << (dir / 2 - 1);
                    }
                }
                this._passageCache.setFlag(tx, ty, flag);
            }
        }

        this._passageCache.setBlockChecked(bx, by, true);
    };

    /**
     * プレイヤー周囲の通行フラグテーブルを更新
     */
    updateAroundPassageTable() {
        var gx = this._drawGridNumber.x;
        var gy = this._drawGridNumber.y;
        var dx = GameGlobal.$gamePlayer.x - Math.floor(gx / 2);
        var dy = GameGlobal.$gamePlayer.y - Math.floor(gy / 2);
        this.scanPassage(dx, dy);
        this.scanPassage(dx + gx, dy);
        this.scanPassage(dx, dy + gy);
        this.scanPassage(dx + gx, dy + gy);
    };

    /**
     * プレイヤー位置の更新
     */
    updatePosition() {
        this._scrollDiff.x = (GameGlobal.$gamePlayer._realX - GameGlobal.$gamePlayer.x) * this.gridSize;
        this._scrollDiff.y = (GameGlobal.$gamePlayer._realY - GameGlobal.$gamePlayer.y) * this.gridSize;
        this.updateScroll();
        if (this._lastPosition.x !== GameGlobal.$gamePlayer.x ||
            this._lastPosition.y !== GameGlobal.$gamePlayer.y) {
            this.updateDrawRange();
            this.drawMap();
            this._lastPosition.x = GameGlobal.$gamePlayer.x;
            this._lastPosition.y = GameGlobal.$gamePlayer.y;
        }
    };

    /**
     * スクロール処理
     */
    updateScroll() {
        var offset = {
            x: Math.floor((this.gridSize) * 1.5) + this._scrollDiff.x,
            y: Math.floor((this.gridSize) * 1.5) + this._scrollDiff.y
        };
        var rect = this.mapRect;
        this._passageSprite.setFrame(offset.x, offset.y, rect.width, rect.height);
    };

    /**
     * 描画範囲か判定
     */
    isInDrawRange(x, y) {
        var begin = this._drawRange.begin;
        var end = this._drawRange.end;

        var dx = x;
        if (GameGlobal.$gameMap.isLoopHorizontal()) {
            dx = (dx + GameGlobal.$gameMap.width()) % GameGlobal.$gameMap.width();
        }

        var dy = y;
        if (GameGlobal.$gameMap.isLoopVertical()) {
            dy = (dy + GameGlobal.$gameMap.height()) % GameGlobal.$gameMap.height();
        }

        return x >= begin.x && x <= end.x &&
            y >= begin.y && y <= end.y;
    };

    /**
     * マップの範囲内か判定
     */
    isInMapRange(x, y) {
        return x >= 0 && x < GameGlobal.$gameMap.width() &&
            y >= 0 && y < GameGlobal.$gameMap.height();
    };

    /**
     * マップ画像の描画
     */
    drawMap() {
        this.updateAroundPassageTable();

        var bitmap = this._passageSprite.bitmap;
        bitmap.clear();
        this.drawMapForeground(bitmap);
    };

    /**
     * 移動可能領域の描画
     */
    drawMapForeground(bitmap) {
        for (var y = this._drawRange.begin.y; y < this._drawRange.end.y; y++) {
            for (var x = this._drawRange.begin.x; x < this._drawRange.end.x; x++) {
                this.drawMapForegroundGrid(bitmap, x, y);
            }
        }
    };

    /**
     * 移動可能グリッドの描画
     */
    drawMapForegroundGrid(bitmap, x, y) {
        var passage = this._passageCache;
        if (!passage.isPassable(x, y)) {
            return;
        }

        var dx = (x - this._drawRange.begin.x) * this.gridSize;
        var dy = (y - this._drawRange.begin.y) * this.gridSize;
        var dw = this.gridSize;
        var dh = this.gridSize;

        if (!passage.isPassableDir(x, y, 2))  // 下方向移動不可
        {
            dh -= 1;
        }
        if (!passage.isPassableDir(x, y, 4))  // 左方向移動不可
        {
            dx += 1;
            dw -= 1;
        }
        if (!passage.isPassableDir(x, y, 6))  // 右方向移動不可
        {
            dw -= 1;
        }
        if (!passage.isPassableDir(x, y, 8))  // 上方向移動不可
        {
            dy += 1;
            dh -= 1;
        }
        bitmap.fillRect(dx, dy, dw, dh, this.foregroundColor);
    };

    fillRegularPolygon(graphics, x, y, width, height, startRad, vertexCount) {
        if (vertexCount < 1) {
            return;
        }

        var points = [];
        for (var i = 0; i < vertexCount; i++) {
            var angle = i * Math.PI * 2 / vertexCount - Math.PI / 2 + startRad;
            points.push(x + Math.cos(angle) * width);
            points.push(y + Math.sin(angle) * height);
        }

        graphics.drawPolygon(points);
    };
}
