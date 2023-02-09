
import Sprite_Collider from './Sprite_Collider'

export default class Sprite_SkillCollider extends Sprite_Collider {
    constructor(collider) {
        super();
        this.initialize(collider)
    }

    initialize(collider) {
        super.initialize(collider, -1);
        this.z = 2;
        this.alpha = 0.4;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this._frameCount = 0;
    };

    update() {
        super.update();
        this.updateAnimation();
    };

    updateAnimation() {
        this._frameCount++;
        if (this._frameCount > 30) {
            this.alpha += 0.2 / 30;
            this.scale.x += 0.1 / 30;
            this.scale.y = this.scale.x;
            if (this._frameCount === 60) this._frameCount = 0;
        } else {
            this.alpha -= 0.2 / 30;
            this.scale.x -= 0.1 / 30;
            this.scale.y = this.scale.x;
        }
    };
}