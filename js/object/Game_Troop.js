import Game_Interpreter from './Game_Interpreter';
import Game_Unit from './Game_Unit';
import Game_Enemy from './Game_Enemy';
/**
 * create by 18tech
 */
export default class Game_Troop extends Game_Unit {

    LETTER_TABLE_HALF = [
        ' A', ' B', ' C', ' D', ' E', ' F', ' G', ' H', ' I', ' J', ' K', ' L', ' M',
        ' N', ' O', ' P', ' Q', ' R', ' S', ' T', ' U', ' V', ' W', ' X', ' Y', ' Z'
    ];
    LETTER_TABLE_FULL = [
        'Ａ', 'Ｂ', 'Ｃ', 'Ｄ', 'Ｅ', 'Ｆ', 'Ｇ', 'Ｈ', 'Ｉ', 'Ｊ', 'Ｋ', 'Ｌ', 'Ｍ',
        'Ｎ', 'Ｏ', 'Ｐ', 'Ｑ', 'Ｒ', 'Ｓ', 'Ｔ', 'Ｕ', 'Ｖ', 'Ｗ', 'Ｘ', 'Ｙ', 'Ｚ'
    ];

    constructor() {
        super();
        this._interpreter = new Game_Interpreter();
        this.clear();
    }

    isEventRunning() {
        return this._interpreter.isRunning();
    }

    updateInterpreter() {
        this._interpreter.update();
    }

    turnCount() {
        return this._turnCount;
    }

    members() {
        return this._enemies;
    }

    clear() {
        this._interpreter.clear();
        this._troopId = 0;
        this._eventFlags = {}
        this._enemies = [];
        this._turnCount = 0;
        this._namesCount = {}
    }

    troop() {
        return GameGlobal.$dataTroops[this._troopId];
    }

    setup(troopId) {
        this.clear();
        this._troopId = troopId;
        this._enemies = [];
        this.troop().members.forEach(function (member) {
            if (GameGlobal.$dataEnemies[member.enemyId]) {
                var enemyId = member.enemyId;
                var x = member.x;
                var y = member.y;
                var enemy = new Game_Enemy(enemyId, x, y);
                if (member.hidden) {
                    enemy.hide();
                }
                this._enemies.push(enemy);
            }
        }, this);
        this.makeUniqueNames();
    }

    makeUniqueNames() {
        var table = this.letterTable();
        this.members().forEach(function (enemy) {
            if (enemy.isAlive() && enemy.isLetterEmpty()) {
                var name = enemy.originalName();
                var n = this._namesCount[name] || 0;
                enemy.setLetter(table[n % table.length]);
                this._namesCount[name] = n + 1;
            }
        }, this);
        this.members().forEach(function (enemy) {
            var name = enemy.originalName();
            if (this._namesCount[name] >= 2) {
                enemy.setPlural(true);
            }
        }, this);
    }

    letterTable() {
        return GameGlobal.$gameSystem.isCJK() ? Game_Troop.LETTER_TABLE_FULL :
            Game_Troop.LETTER_TABLE_HALF;
    }

    enemyNames() {
        var names = [];
        this.members().forEach(function (enemy) {
            var name = enemy.originalName();
            if (enemy.isAlive() && !names.contains(name)) {
                names.push(name);
            }
        });
        return names;
    }

    meetsConditions(page) {
        var c = page.conditions;
        if (!c.turnEnding && !c.turnValid && !c.enemyValid &&
            !c.actorValid && !c.switchValid) {
            return false;  // Conditions not set
        }
        
        if (c.turnValid) {
            var n = this._turnCount;
            var a = c.turnA;
            var b = c.turnB;
            if ((b === 0 && n !== a)) {
                return false;
            }
            if ((b > 0 && (n < 1 || n < a || n % b !== a % b))) {
                return false;
            }
        }
        if (c.enemyValid) {
            var enemy = GameGlobal.$gameTroop.members()[c.enemyIndex];
            if (!enemy || enemy.hpRate() * 100 > c.enemyHp) {
                return false;
            }
        }
        if (c.actorValid) {
            var actor = GameGlobal.$gameActors.actor(c.actorId);
            if (!actor || actor.hpRate() * 100 > c.actorHp) {
                return false;
            }
        }
        if (c.switchValid) {
            if (!GameGlobal.$gameSwitches.value(c.switchId)) {
                return false;
            }
        }
        return true;
    }

    setupBattleEvent() {
        if (!this._interpreter.isRunning()) {
            if (this._interpreter.setupReservedCommonEvent()) {
                return;
            }
            var pages = this.troop().pages;
            for (var i = 0; i < pages.length; i++) {
                var page = pages[i];
                if (this.meetsConditions(page) && !this._eventFlags[i]) {
                    this._interpreter.setup(page.list);
                    if (page.span <= 1) {
                        this._eventFlags[i] = true;
                    }
                    break;
                }
            }
        }
    }

    increaseTurn() {
        var pages = this.troop().pages;
        for (var i = 0; i < pages.length; i++) {
            var page = pages[i];
            if (page.span === 1) {
                this._eventFlags[i] = false;
            }
        }
        this._turnCount++;
    }

    expTotal() {
        return this.deadMembers().reduce(function (r, enemy) {
            return r + enemy.exp();
        }, 0);
    }

    goldTotal() {
        return this.deadMembers().reduce(function (r, enemy) {
            return r + enemy.gold();
        }, 0) * this.goldRate();
    }

    goldRate() {
        return GameGlobal.$gameParty.hasGoldDouble() ? 2 : 1;
    }

    makeDropItems() {
        return this.deadMembers().reduce(function (r, enemy) {
            return r.concat(enemy.makeDropItems());
        }, []);
    }
}