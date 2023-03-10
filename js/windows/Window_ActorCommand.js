import Window_Command from './Window_Command'
import TextManager from '../managers/TextManager'
import ConfigManager from '../managers/ConfigManager'
export default class Window_ActorCommand extends Window_Command {

    constructor() {
        super(0, 0);
        this.initialize();
    }


    initialize() {
        var y = Graphics.boxHeight - this.windowHeight();
        super.initialize(0, y);
        this.openness = 0;
        this.deactivate();
        this._actor = null;
    }

    windowWidth() {
        return 192;
    }

    numVisibleRows() {
        return 4;
    }

    makeCommandList() {
        if (this._actor) {
            this.addAttackCommand();
            this.addSkillCommands();
            this.addGuardCommand();
            this.addItemCommand();
        }
    }

    addAttackCommand() {
        this.addCommand(TextManager.attack, 'attack', this._actor.canAttack());
    }

    addSkillCommands() {
        var skillTypes = this._actor.addedSkillTypes();
        skillTypes.sort(function (a, b) {
            return a - b;
        });
        skillTypes.forEach(function (stypeId) {
            var name = GameGlobal.$dataSystem.skillTypes[stypeId];
            this.addCommand(name, 'skill', true, stypeId);
        }, this);
    }

    addGuardCommand() {
        this.addCommand(TextManager.guard, 'guard', this._actor.canGuard());
    }

    addItemCommand() {
        this.addCommand(TextManager.item, 'item');
    }

    setup(actor) {
        this._actor = actor;
        this.clearCommandList();
        this.makeCommandList();
        this.refresh();
        this.selectLast();
        this.activate();
        this.open();
    }

    processOk() {
        if (this._actor) {
            if (ConfigManager.commandRemember) {
                this._actor.setLastCommandSymbol(this.currentSymbol());
            } else {
                this._actor.setLastCommandSymbol('');
            }
        }
        super.processOk();
    }

    selectLast() {
        this.select(0);
        if (this._actor && ConfigManager.commandRemember) {
            var symbol = this._actor.lastCommandSymbol();
            this.selectSymbol(symbol);
            if (symbol === 'skill') {
                var skill = this._actor.lastBattleSkill();
                if (skill) {
                    this.selectExt(skill.stypeId);
                }
            }
        }
    }
}