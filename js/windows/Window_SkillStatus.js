import Window_Base from './Window_Base';
export default class Window_SkillStatus extends Window_Base {
    constructor(x, y, width, height) {
        super( x, y, width, height);
        this._actor = null;
    }

    setActor(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
        }
    }

    refresh() {
        this.contents.clear();
        if (this._actor) {
            var w = this.width - this.padding * 2;
            var h = this.height - this.padding * 2;
            var y = h / 2 - this.lineHeight() * 1.5;
            var width = w - 162 - this.textPadding();
            this.drawActorFace(this._actor, 0, 0, 144, h);
            this.drawActorSimpleStatus(this._actor, 162, y, width);
        }
    }
}