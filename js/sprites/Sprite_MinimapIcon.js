import Sprite from '../core/sprite'
import ImageManager from '../managers/ImageManager'
import Game_Event from '../object/Game_Event'

export default class Sprite_MinimapIcon extends Sprite {


    constructor() {
        super();
        this.initialize();
    }

    gridSize = 5;
    blinkTime = 180;

    initialize() {
        this.bitmap = ImageManager.loadSystem("MinimapObjectIcon");
        super.initialize(this.bitmap);
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        this._object = null;
        this._lastIconIndex = -1;
        this._blinkDuration = 0;
    };

    /**
     * 表示準備ができているか
     */
    isReady() {
        return this.bitmap && this.bitmap.isReady();
    };

    /**
     * 追従するオブジェクトの取得
     */
    getObject() {
        return this._object;
    };

    /**
     * 追従するオブジェクトの設定
     */
    setObject(object) {
        this._object = object;
        if (object) {
            this.bitmap = ImageManager.loadSystem("MinimapObjectIcon");
            this.updateIconInfo();
        }

        this.refresh();
    };

    /**
     * 表示位置の更新
     *
     * @param {Point} begin      - ミニマップの表示開始座標
     * @param {Point} scrollDiff - 位置補正のためのマップスクロール量
     */
    updatePosition(begin, scrollDiff) {
        var x = (this._object.x - begin.x - 1) * this.gridSize;
        var y = (this._object.y - begin.y - 1) * this.gridSize;
        this.x = x - scrollDiff.x;
        this.y = y - scrollDiff.y;

        // if (KMS.imported['AreaEvent']) {
        //     // 表示サイズに応じた位置補正
        // this.x += this._iconSize * (this.scale.x - 1.0) / 2;
        // this.y += this._iconSize * (this.scale.y - 1.0) / 2;
        // }
    };

    /**
     * アイコン情報の更新
     */
    updateIconInfo() {
        if (!this.isReady()) {
            this._iconSize = null;
            this._iconColumns = null;
            return;
        }

        this._iconSize = Math.floor(this.bitmap.height / 3);
        this._iconColumns = Math.floor(this.bitmap.width / this._iconSize);
    };

    /**
     * リフレッシュ
     */
    refresh() {
        this._lastIconIndex = -1;
    };

    /**
     * オブジェクト更新
     */
    update() {
        super.update();

        this.updateImage();
        this.updateBlink();
    };

    /**
     * 表示する画像の更新
     */
    updateImage() {
        if (!this._object) {
            return;
        }

        if (!this._iconColumns) {
            this.updateIconInfo();
        }

        var iconIndex = this.getCurrentIconIndex();
        if (iconIndex >= 0) {
            if (iconIndex !== this._lastIconIndex || this._object.isMinimapAttributeDirty()) {
                this.setIconIndex(iconIndex);
            }
        }
        else {
            this._lastIconIndex = iconIndex;
            this.visible = false;
        }
    };

    /**
     * 現在のオブジェクトに対応するオブジェクトアイコン番号の取得
     */
    getCurrentIconIndex() {
        if (!(this._object && this.isReady())) {
            return -1;
        }
        return this.getCurrentIconIndexForEvent();
    };

    /**
     * 現在のイベントに対応するアイコン番号の取得
     */
    getCurrentIconIndexForEvent() {
        var obj = this._object;

        if (obj.isMinimapMove()) {
            return 0;
        }
        else if (obj.minimapPersonType() >= 0) {
            // person は 2 行目
            return this._iconColumns + obj.minimapPersonType();
        }
        else if (obj.minimapObjectType() >= 0) {
            // object は 3 行目
            return this._iconColumns * 2 + obj.minimapObjectType();
        }
        else {
            return -1;
        }
    };

    /**
     * 現在の乗り物に対応するアイコン番号の取得
     */
    getCurrentIconIndexForVehicle() {
        var obj = this._object;

        if (!obj.isInCurrentMap()) {
            return -1;
        }
        else if (obj.isBoat()) {
            return GameGlobal.$gamePlayer.isInBoat() ? -1 : 1;
        }
        else if (obj.isShip()) {
            return GameGlobal.$gamePlayer.isInShip() ? -1 : 2;
        }
        else if (obj.isAirship()) {
            return GameGlobal.$gamePlayer.isInAirship() ? -1 : 3;
        }
        else {
            // 不明な乗り物
            return -1;
        }
    };

    /**
     * オブジェクトアイコン番号の設定
     */
    setIconIndex(iconIndex) {
        this.setFrame(
            (iconIndex % this._iconColumns) * this._iconSize,
            Math.floor(iconIndex / this._iconColumns) * this._iconSize,
            this._iconSize,
            this._iconSize);
        this.updateDisplaySize();

        this._object.clearMinimapAttributeDirty();
        this._lastIconIndex = iconIndex;
        this.visible = true;
    };

    /**
     * オブジェクトアイコン表示サイズの更新
     */
    updateDisplaySize() {
        // if (!KMS.imported['AreaEvent'] ||
        if (!(this._object instanceof Game_Event)) {
            return;
        }

        var area = this._object.getEventTriggerArea();
        this.scale.x = area.width;
        this.scale.y = area.height;
    };

    /**
     * 明滅エフェクトの更新
     */
    updateBlink() {
        this._blinkDuration = (this._blinkDuration + 1) % this.blinkTime;

        var alpha = 128 * (Math.sin(this._blinkDuration * Math.PI * 2 / this.blinkTime) + 1);
        var color = [255, 255, 255, alpha];
        this.setBlendColor(color);
    };
}