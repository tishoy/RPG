import Sprite_Base from './Sprite_Base';
import ABSManager from '../managers/ABSManager'
import Movement from '../core/movement'

/**
 * create by 18tech
 * 地图动画
 */
export default class Sprite_MapAnimation extends Sprite_Base {
    constructor(animation) {
        super();
        this.initialize(animation);
    }

    initialize(animation) {
        super.initialize();
        this.z = 8;
        this._realX = this.x;
        this._realY = this.y;
        this._animation = animation;
        this._hasStarted = false;
    }


    update() {
        super.update();
        this.updatePosition();
        if (!this._hasStarted && this.parent) {
            this.startAnimation(this._animation, false, 0);
            this._hasStarted = true;
        }
        if (this._hasStarted && !this.isAnimationPlaying()) {
            ABSManager.removeAnimation(this);
        }
    };

    updatePosition() {
        this.x = this._realX;
        this.x -= GameGlobal.$gameMap.displayX() * Movement.tileSize;
        this.y = this._realY;
        this.y -= GameGlobal.$gameMap.displayY() * Movement.tileSize;
    };

    move(x, y) {
        super.move(x, y);
        this._realX = x;
        this._realY = y;
        this.updatePosition();
    };
}