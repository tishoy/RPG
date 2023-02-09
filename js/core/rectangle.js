import * as PIXI from '../../js/libs/pixi'
/**
 * create by 18tech
 */
export default class Rectangle extends PIXI.Rectangle {
    static emptyRectangle = new Rectangle(0, 0, 0, 0);
    constructor(x, y, width, height) {
        super(x, y, width, height);
        PIXI.Rectangle.call(this, x, y, width, height);
    }
}
