import Minimap from '../18ext/MiniMap'

export default class Game_MinimapPassageCache {
    constructor(map, grid) {
        this.initialize(map, grid);
    };

    initialize(map, grid) {
        this._mapId = map.mapId();
        this._width = map.width();
        this._height = map.height();
        this._grid = grid;
        this._blockCount = {
            x: Math.floor((this._width + grid.x - 1) / grid.x),
            y: Math.floor((this._height + grid.y - 1) / grid.y)
        };

        // 各タイルの通行可否フラグ
        this._flags = new Array(this._width * this._height);

        // チェック済みブロックフラグ
        this._blockChecked = new Array(this._blockCount.x * this._blockCount.y);
    };

    /**
     * ブロック数の取得
     */
    getBlockCount() {
        return this._blockCount;
    };

    /**
     * ブロックチェック済み判定
     */
    isBlockChecked(bx, by) {
        return this._blockChecked[bx + by * this._blockCount.y];
    };

    /**
     * ブロックチェック済みフラグの設定
     */
    setBlockChecked(bx, by, checked) {
        this._blockChecked[bx + by * this._blockCount.y] = checked;
    };

    /**
     * 通行フラグの取得
     */
    getFlag(x, y) {
        if (GameGlobal.$gameMap.isLoopHorizontal()) {
            x = (x + this._width) % this._width;
        }
        else if (x < 0 || x >= this._width) {
            return 0;
        }

        if (GameGlobal.$gameMap.isLoopVertical()) {
            y = (y + this._height) % this._height;
        }
        else if (y < 0 || y >= this._height) {
            return 0;
        }

        return this._flags[x + y * this._width];
    };

    /**
     * 通行フラグの設定
     */
    setFlag(x, y, flag) {
        this._flags[x + y * this._width] = flag;
    };

    /**
     * 指定位置が通行可能か
     */
    isPassable(x, y) {
        return this.getFlag(x, y) !== 0;
    };

    /**
     * 指定方向への通行が可能か
     */
    isPassableDir(x, y, dir) {
        var flag = this.getFlag(x, y);
        switch (dir) {
            case 2: return (flag & Minimap.dirFlags.down) !== 0;
            case 4: return (flag & Minimap.dirFlags.left) !== 0;
            case 6: return (flag & Minimap.dirFlags.right) !== 0;
            case 8: return (flag & Minimap.dirFlags.up) !== 0;
            default: return false;
        }
    };
}

