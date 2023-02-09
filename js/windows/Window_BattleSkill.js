export default class Window_BattleSkill extends Window_SkillList {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.initialize(x, y, width, height);
    }

    initialize(x, y, width, height) {
        super.initialize(x, y, width, height);
        this.hide();
    }

    show() {
        this.selectLast();
        this.showHelpWindow();
        super.show();
    }

    hide() {
        this.hideHelpWindow();
        super.hide();
    }
}