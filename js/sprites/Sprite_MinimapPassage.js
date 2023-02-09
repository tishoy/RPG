import Sprite from '../core/sprite'
import Bitmap from '../core/bitmap'
export default class Sprite_MinimapPassage extends Sprite {


    constructor(width, height) {
        super();
        this.initialize(width, height);
    }

    initialize(width, height) {
        super.initialize();
        this.bitmap = new Bitmap(width, height);
    };

}