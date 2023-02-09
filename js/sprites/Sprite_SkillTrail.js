import Movement from '../core/movement'
import TilingSprite from '../core/tilingSprite'
/**
 * create by e8tech
 */
export default class Sprite_SkillTrail extends TilingSprite {
    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        this._realX = this.x;
        this._realY = this.y;
    }

    update() {
        super.update();
        this.updatePosition();
    };

    updatePosition() {
        this.x = this._realX;
        this.x -= GameGlobal.$gameMap.displayX() * Movement.tileSize;
        this.y = this._realY;
        this.y -= GameGlobal.$gameMap.displayY() * Movement.tileSize;
    };

    move(x, y, width, height) {
        super.move(x, y, width, height);
        this._realX = x;
        this._realY = y;
        this.updatePosition();
    };
}