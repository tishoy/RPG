import Sprite from '../core/sprite'
import Movement from '../core/movement'
import Graphics from '../core/graphics'
import * as PIXI from '../libs/pixi'
import ColliderManager from '../managers/ColliderManager'
/**
 * 碰撞体
 */
export default class Sprite_Collider extends Sprite {
  constructor(collider, duration) {
    super();
    this.initialize(collider, duration);
  }

  initialize(collider, duration) {
    console.log(collider);
    if (collider === undefined) {
      return;
    }
    super.initialize();
    this.z = 7;
    this._duration = duration || 0;
    this._cache = {};
    this.setupCollider(collider);
    this.checkChanges();
  }

  setCache() {
    this._cache = {
      color: this._collider.color,
      width: this._collider.width,
      height: this._collider.height,
      radian: this._collider._radian
    }
  }

  needsRedraw() {
    return this._cache.width !== this._collider.width ||
      this._cache.height !== this._collider.height ||
      this._cache.color !== this._collider.color ||
      this._cache.radian !== this._collider._radian
  };

  setupCollider(collider) {
    this._collider = collider;
    var isNew = false;
    if (!this._colliderSprite) {
      this._colliderSprite = new PIXI.Graphics();
      isNew = true;
    }
    this.drawCollider();
    if (isNew) {
      this.addChild(this._colliderSprite);
    }
  };

  drawCollider() {
    var collider = this._collider;
    this._colliderSprite.clear();
    var color = (collider.color || '#ff0000').replace('#', '');
    color = parseInt(color, 16);
    this._colliderSprite.beginFill(color);
    if (collider.isCircle()) {
      var radiusX = collider.radiusX;
      var radiusY = collider.radiusY;
      this._colliderSprite.drawEllipse(0, 0, radiusX, radiusY);
      this._colliderSprite.rotation = collider._radian;
    } else {
      this._colliderSprite.drawPolygon(collider._baseVertices);
    }
    this._colliderSprite.endFill();
  };

  update() {
    super.update();
    this.checkChanges();
    if (this._duration >= 0 || this._collider.kill) {
      this.updateDecay();
    }
  };

  checkChanges() {
    this.visible = !this._collider._isHidden;
    this.x = this._collider.x + this._collider.ox;
    this.x -= GameGlobal.$gameMap.displayX() * Movement.tileSize;
    this.y = this._collider.y + this._collider.oy;
    this.y -= GameGlobal.$gameMap.displayY() * Movement.tileSize;
    if (this.x < -this._collider.width || this.x > Graphics.width) {
      if (this.y < -this._collider.height || this.y > Graphics.height) {
        this.visible = false;
      }
    }
    this._colliderSprite.z = this.z;
    this._colliderSprite.visible = this.visible;
    if (this.needsRedraw()) {
      this.drawCollider();
      this.setCache();
    }
  };

  updateDecay() {
    this._duration--;
    if (this._duration <= 0 || this._collider.kill) {
      ColliderManager.removeSprite(this);
      this._collider = null;
    }
  };
}