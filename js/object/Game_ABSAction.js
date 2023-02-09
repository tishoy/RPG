import Game_Action from './Game_Action'
import Game_ActionResult from './Game_ActionResult'

export default class Game_ABSAction extends Game_Action {
    constructor(subject, forcing) {
        super(subject, forcing);
        // this.initialize();
    }

    setSubject(subject) {
        super.setSubject(subject);
        this._realSubject = subject;
    };

    subject() {
        return this._realSubject;
    };

    absApply(target) {
        var result = target.result();
        this._realSubject.clearResult();
        result.clear();
        result.physical = this.isPhysical();
        result.drain = this.isDrain();
        if (this.item().damage.type > 0) {
            result.critical = (Math.random() < this.itemCri(target));
            var value = this.makeDamageValue(target, result.critical);
            this.executeDamage(target, value);
            target.startDamagePopup();
        }
        this.item().effects.forEach(function (effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target);
    };

}