import * as PIXI from '../../js/libs/pixi'
/**
 * create by 18tech
 */
export default class Stage extends PIXI.Container {
    contructor() {
        PIXI.Container.call(this);
        // The interactive flag causes a memory leak.
        this.interactive = false;
    }
}
