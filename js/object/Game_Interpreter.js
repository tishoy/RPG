import ImageManager from '../managers/ImageManager'
import SceneManager from '../managers/SceneManager'
import Graphics from '../core/graphics'
import Scene_Shop from '../scenes/Scene_Shop'
import Scene_Gameover from '../scenes/Scene_Gameover'
import Scene_Menu from '../scenes/Scene_Menu'
import Scene_Title from '../scenes/Scene_Title'
import Scene_Save from '../scenes/Scene_Save'
import Scene_Name from '../scenes/Scene_Name'
import Game_Character from './Game_Character';
import AudioManager from '../managers/AudioManager'
import MultiLayer from '../18ext/MultiLayer'
import E8Plus from '../18ext/E8Plus'
/**
 * create by 18tech
 */
export default class Game_Interpreter {
    constructor(depth) {
        this.initialize();
    }

    initialize(depth) {
        this._depth = depth || 0;
        this.checkOverflow();
        this.clear();
        this._branch = {}
        this._params = [];
        this._indent = 0;
        this._frameCount = 0;
        this._freezeChecker = 0;
    }

    checkOverflow() {
        if (this._depth >= 100) {
            throw new Error('Common event calls exceeded the limit');
        }
    }

    clear() {
        this._mapId = 0;
        this._eventId = 0;
        this._list = null;
        this._index = 0;
        this._waitCount = 0;
        this._waitMode = '';
        this._comments = '';
        this._character = null;
        this._childInterpreter = null;
    }

    setup(list, eventId) {
        this.clear();
        this._mapId = GameGlobal.$gameMap.mapId();
        this._eventId = eventId || 0;
        this._list = list;
        Game_Interpreter.requestImages(list);
    }

    eventId() {
        return this._eventId;
    }

    isOnCurrentMap() {
        return this._mapId === GameGlobal.$gameMap.mapId();
    }

    setupReservedCommonEvent() {
        if (GameGlobal.$gameTemp.isCommonEventReserved()) {
            this.setup(GameGlobal.$gameTemp.reservedCommonEvent().list);
            GameGlobal.$gameTemp.clearCommonEvent();
            return true;
        } else {
            return false;
        }
    }

    isRunning() {
        return !!this._list;
    }

    update() {
        while (this.isRunning()) {
            if (this.updateChild() || this.updateWait()) {
                break;
            }
            if (SceneManager.isSceneChanging()) {
                break;
            }
            if (!this.executeCommand()) {
                break;
            }
            if (this.checkFreeze()) {
                break;
            }
        }
    }

    updateChild() {
        if (this._childInterpreter) {
            this._childInterpreter.update();
            if (this._childInterpreter.isRunning()) {
                return true;
            } else {
                this._childInterpreter = null;
            }
        }
        return false;
    }

    updateWait() {
        return this.updateWaitCount() || this.updateWaitMode();
    }

    updateWaitCount() {
        if (this._waitCount > 0) {
            this._waitCount--;
            return true;
        }
        return false;
    }

    updateWaitMode() {
        var waiting = false;
        switch (this._waitMode) {
            case 'message':
                waiting = GameGlobal.$gameMessage.isBusy();
                break;
            case 'transfer':
                waiting = GameGlobal.$gamePlayer.isTransferring();
                break;
            case 'scroll':
                waiting = GameGlobal.$gameMap.isScrolling();
                break;
            case 'route':
                waiting = this._character.isMoveRouteForcing();
                break;
            case 'animation':
                waiting = this._character.isAnimationPlaying();
                break;
            case 'balloon':
                waiting = this._character.isBalloonPlaying();
                break;
            case 'gather':
                waiting = GameGlobal.$gamePlayer.areFollowersGathering();
                break;
            case 'action':
                // waiting = BattleManager.isActionForced();
                break;
            case 'video':
                waiting = Graphics.isVideoPlaying();
                break;
            case 'image':
                waiting = !ImageManager.isReady();
                break;
        }
        var waiting = false
        if (this._waitMode === 'pathfind') {
            waiting = this._character._pathfind || this._character._isPathfinding;
            if (!waiting) {
                this._waitMode = '';
            }
        }
        if (!waiting) {
            this._waitMode = '';
        }
        return waiting;
    }

    setWaitMode(waitMode) {
        this._waitMode = waitMode;
    }

    wait(duration) {
        this._waitCount = duration;
    }

    fadeSpeed() {
        return 24;
    }

    executeCommand() {
        var command = this.currentCommand();
        if (command) {
            this._params = command.parameters;
            this._indent = command.indent;
            var methodName = 'command' + command.code;
            if (typeof this[methodName] === 'function') {
                if (!this[methodName]()) {
                    return false;
                }
            }
            this._index++;
        } else {
            this.terminate();
        }
        return true;
    }

    checkFreeze() {
        if (this._frameCount !== Graphics.frameCount) {
            this._frameCount = Graphics.frameCount;
            this._freezeChecker = 0;
        }
        if (this._freezeChecker++ >= 100000) {
            return true;
        } else {
            return false;
        }
    }

    terminate() {
        this._list = null;
        this._comments = '';
    }

    skipBranch() {
        while (this._list[this._index + 1].indent > this._indent) {
            this._index++;
        }
    }

    currentCommand() {
        return this._list[this._index];
    }

    nextEventCode() {
        var command = this._list[this._index + 1];
        if (command) {
            return command.code;
        } else {
            return 0;
        }
    }

    iterateActorId(param, callback) {
        if (param === 0) {
            GameGlobal.$gameParty.members().forEach(callback);
        } else {
            var actor = GameGlobal.$gameActors.actor(param);
            if (actor) {
                callback(actor);
            }
        }
    }

    iterateActorEx(param1, param2, callback) {
        if (param1 === 0) {
            this.iterateActorId(param2, callback);
        } else {
            this.iterateActorId(GameGlobal.$gameVariables.value(param2), callback);
        }
    }

    iterateActorIndex(param, callback) {
        if (param < 0) {
            GameGlobal.$gameParty.members().forEach(callback);
        } else {
            var actor = GameGlobal.$gameParty.members()[param];
            if (actor) {
                callback(actor);
            }
        }
    }

    iterateEnemyIndex(param, callback) {
        if (param < 0) {
            GameGlobal.$gameTroop.members().forEach(callback);
        } else {
            var enemy = GameGlobal.$gameTroop.members()[param];
            if (enemy) {
                callback(enemy);
            }
        }
    }

    iterateBattler(param1, param2, callback) {
        if (GameGlobal.$gameParty.inBattle()) {
            if (param1 === 0) {
                this.iterateEnemyIndex(param2, callback);
            } else {
                this.iterateActorId(param2, callback);
            }
        }
    }

    character(param) {
        if (GameGlobal.$gameParty.inBattle()) {
            return null;
        } else if (param < 0) {
            return GameGlobal.$gamePlayer;
        } else if (this.isOnCurrentMap()) {
            return GameGlobal.$gameMap.event(param > 0 ? param : this._eventId);
        } else {
            return null;
        }
    }

    operateValue(operation, operandType, operand) {
        var value = operandType === 0 ? operand : GameGlobal.$gameVariables.value(operand);
        return operation === 0 ? value : -value;
    }

    changeHp(target, value, allowDeath) {
        if (target.isAlive()) {
            if (!allowDeath && target.hp <= -value) {
                value = 1 - target.hp;
            }
            target.gainHp(value);
            if (target.isDead()) {
                target.performCollapse();
            }
        }
    }

    // Show Text
    command101() {
        if (!GameGlobal.$gameMessage.isBusy()) {
            GameGlobal.$gameMessage.setFaceImage(this._params[0], this._params[1]);
            GameGlobal.$gameMessage.setBackground(this._params[2]);
            GameGlobal.$gameMessage.setPositionType(this._params[3]);
            while (this.nextEventCode() === 401) {  // Text data
                this._index++;
                GameGlobal.$gameMessage.add(this.currentCommand().parameters[0]);
            }
            switch (this.nextEventCode()) {
                case 102:  // Show Choices
                    this._index++;
                    this.setupChoices(this.currentCommand().parameters);
                    break;
                case 103:  // Input Number
                    this._index++;
                    this.setupNumInput(this.currentCommand().parameters);
                    break;
                case 104:  // Select Item
                    this._index++;
                    this.setupItemChoice(this.currentCommand().parameters);
                    break;
            }
            this._index++;
            this.setWaitMode('message');
        }
        return false;
    }

    // Show Choices
    command102() {
        if (!GameGlobal.$gameMessage.isBusy()) {
            this.setupChoices(this._params);
            this._index++;
            this.setWaitMode('message');
        }
        return false;
    }

    setupChoices(params) {
        var choices = params[0].clone();
        var cancelType = params[1];
        var defaultType = params.length > 2 ? params[2] : 0;
        var positionType = params.length > 3 ? params[3] : 2;
        var background = params.length > 4 ? params[4] : 0;
        if (cancelType >= choices.length) {
            cancelType = -2;
        }
        GameGlobal.$gameMessage.setChoices(choices, defaultType, cancelType);
        GameGlobal.$gameMessage.setChoiceBackground(background);
        GameGlobal.$gameMessage.setChoicePositionType(positionType);
        GameGlobal.$gameMessage.setChoiceCallback(function (n) {
            this._branch[this._indent] = n;
        }.bind(this));
    }

    // When [**]
    command402() {
        if (this._branch[this._indent] !== this._params[0]) {
            this.skipBranch();
        }
        return true;
    }

    // When Cancel
    command403() {
        if (this._branch[this._indent] >= 0) {
            this.skipBranch();
        }
        return true;
    }

    // Input Number
    command103() {
        if (!GameGlobal.$gameMessage.isBusy()) {
            this.setupNumInput(this._params);
            this._index++;
            this.setWaitMode('message');
        }
        return false;
    }

    setupNumInput(params) {
        GameGlobal.$gameMessage.setNumberInput(params[0], params[1]);
    }

    // Select Item
    command104() {
        if (!GameGlobal.$gameMessage.isBusy()) {
            this.setupItemChoice(this._params);
            this._index++;
            this.setWaitMode('message');
        }
        return false;
    }

    setupItemChoice(params) {
        GameGlobal.$gameMessage.setItemChoice(params[0], params[1] || 2);
    }

    // Show Scrolling Text
    command105() {
        if (!GameGlobal.$gameMessage.isBusy()) {
            GameGlobal.$gameMessage.setScroll(this._params[0], this._params[1]);
            while (this.nextEventCode() === 405) {
                this._index++;
                GameGlobal.$gameMessage.add(this.currentCommand().parameters[0]);
            }
            this._index++;
            this.setWaitMode('message');
        }
        return false;
    }

    // Comment
    command108() {
        this._comments = [this._params[0]];
        while (this.nextEventCode() === 408) {
            this._index++;
            this._comments.push(this.currentCommand().parameters[0]);
        }
        return true;
    }

    // Conditional Branch
    command111() {
        var result = false;
        switch (this._params[0]) {
            case 0:  // Switch
                result = (GameGlobal.$gameSwitches.value(this._params[1]) === (this._params[2] === 0));
                break;
            case 1:  // Variable
                var value1 = GameGlobal.$gameVariables.value(this._params[1]);
                var value2;
                if (this._params[2] === 0) {
                    value2 = this._params[3];
                } else {
                    value2 = GameGlobal.$gameVariables.value(this._params[3]);
                }
                switch (this._params[4]) {
                    case 0:  // Equal to
                        result = (value1 === value2);
                        break;
                    case 1:  // Greater than or Equal to
                        result = (value1 >= value2);
                        break;
                    case 2:  // Less than or Equal to
                        result = (value1 <= value2);
                        break;
                    case 3:  // Greater than
                        result = (value1 > value2);
                        break;
                    case 4:  // Less than
                        result = (value1 < value2);
                        break;
                    case 5:  // Not Equal to
                        result = (value1 !== value2);
                        break;
                }
                break;
            case 2:  // Self Switch
                if (this._eventId > 0) {
                    var key = [this._mapId, this._eventId, this._params[1]];
                    result = (GameGlobal.$gameSelfSwitches.value(key) === (this._params[2] === 0));
                }
                break;
            case 3:  // Timer
                if (GameGlobal.$gameTimer.isWorking()) {
                    if (this._params[2] === 0) {
                        result = (GameGlobal.$gameTimer.seconds() >= this._params[1]);
                    } else {
                        result = (GameGlobal.$gameTimer.seconds() <= this._params[1]);
                    }
                }
                break;
            case 4:  // Actor
                var actor = GameGlobal.$gameActors.actor(this._params[1]);
                if (actor) {
                    var n = this._params[3];
                    switch (this._params[2]) {
                        case 0:  // In the Party
                            result = GameGlobal.$gameParty.members().contains(actor);
                            break;
                        case 1:  // Name
                            result = (actor.name() === n);
                            break;
                        case 2:  // Class
                            result = actor.isClass(GameGlobal.$dataClasses[n]);
                            break;
                        case 3:  // Skill
                            result = actor.hasSkill(n);
                            break;
                        case 4:  // Weapon
                            result = actor.hasWeapon(GameGlobal.$dataWeapons[n]);
                            break;
                        case 5:  // Armor
                            result = actor.hasArmor(GameGlobal.$dataArmors[n]);
                            break;
                        case 6:  // State
                            result = actor.isStateAffected(n);
                            break;
                    }
                }
                break;
            case 5:  // Enemy
                var enemy = GameGlobal.$gameTroop.members()[this._params[1]];
                if (enemy) {
                    switch (this._params[2]) {
                        case 0:  // Appeared
                            result = enemy.isAlive();
                            break;
                        case 1:  // State
                            result = enemy.isStateAffected(this._params[3]);
                            break;
                    }
                }
                break;
            case 6:  // Character
                var character = this.character(this._params[1]);
                if (character) {
                    result = (character.direction() === this._params[2]);
                }
                break;
            case 7:  // Gold
                switch (this._params[2]) {
                    case 0:  // Greater than or equal to
                        result = (GameGlobal.$gameParty.gold() >= this._params[1]);
                        break;
                    case 1:  // Less than or equal to
                        result = (GameGlobal.$gameParty.gold() <= this._params[1]);
                        break;
                    case 2:  // Less than
                        result = (GameGlobal.$gameParty.gold() < this._params[1]);
                        break;
                }
                break;
            case 8:  // Item
                result = GameGlobal.$gameParty.hasItem(GameGlobal.$dataItems[this._params[1]]);
                break;
            case 9:  // Weapon
                result = GameGlobal.$gameParty.hasItem(GameGlobal.$dataWeapons[this._params[1]], this._params[2]);
                break;
            case 10:  // Armor
                result = GameGlobal.$gameParty.hasItem(GameGlobal.$dataArmors[this._params[1]], this._params[2]);
                break;
            case 11:  // Button
                result = Input.isPressed(this._params[1]);
                break;
            case 12:  // Script
                // result = !!eval(this._params[1]);
                break;
            case 13:  // Vehicle
                result = (GameGlobal.$gamePlayer.vehicle() === GameGlobal.$gameMap.vehicle(this._params[1]));
                break;
        }
        this._branch[this._indent] = result;
        if (this._branch[this._indent] === false) {
            this.skipBranch();
        }
        return true;
    }

    // Else
    command411() {
        if (this._branch[this._indent] !== false) {
            this.skipBranch();
        }
        return true;
    }

    // Loop
    command112() {
        return true;
    }

    // Repeat Above
    command413() {
        do {
            this._index--;
        } while (this.currentCommand().indent !== this._indent);
        return true;
    }

    // Break Loop
    command113() {
        var depth = 0;
        while (this._index < this._list.length - 1) {
            this._index++;
            var command = this.currentCommand();

            if (command.code === 112)
                depth++;

            if (command.code === 413) {
                if (depth > 0)
                    depth--;
                else
                    break;
            }
        }
        return true;
    }

    // Exit Event Processing
    command115() {
        this._index = this._list.length;
        return true;
    }

    // Common Event
    command117() {
        var commonEvent = GameGlobal.$dataCommonEvents[this._params[0]];
        if (commonEvent) {
            var eventId = this.isOnCurrentMap() ? this._eventId : 0;
            this.setupChild(commonEvent.list, eventId);
        }
        return true;
    }

    setupChild(list, eventId) {
        this._childInterpreter = new Game_Interpreter(this._depth + 1);
        this._childInterpreter.setup(list, eventId);
    }

    // Label
    command118() {
        return true;
    }

    // Jump to Label
    command119() {
        var labelName = this._params[0];
        for (var i = 0; i < this._list.length; i++) {
            var command = this._list[i];
            if (command.code === 118 && command.parameters[0] === labelName) {
                this.jumpTo(i);
                return;
            }
        }
        return true;
    }

    jumpTo(index) {
        var lastIndex = this._index;
        var startIndex = Math.min(index, lastIndex);
        var endIndex = Math.max(index, lastIndex);
        var indent = this._indent;
        for (var i = startIndex; i <= endIndex; i++) {
            var newIndent = this._list[i].indent;
            if (newIndent !== indent) {
                this._branch[indent] = null;
                indent = newIndent;
            }
        }
        this._index = index;
    }

    // Control Switches
    command121() {
        for (var i = this._params[0]; i <= this._params[1]; i++) {
            GameGlobal.$gameSwitches.setValue(i, this._params[2] === 0);
        }
        return true;
    }

    // Control Variables
    command122() {
        var value = 0;
        switch (this._params[3]) { // Operand
            case 0: // Constant
                value = this._params[4];
                break;
            case 1: // Variable
                value = GameGlobal.$gameVariables.value(this._params[4]);
                break;
            case 2: // Random
                value = this._params[5] - this._params[4] + 1;
                for (var i = this._params[0]; i <= this._params[1]; i++) {
                    this.operateVariable(i, this._params[2], this._params[4] + Math.randomInt(value));
                }
                return true;
                break;
            case 3: // Game Data
                value = this.gameDataOperand(this._params[4], this._params[5], this._params[6]);
                break;
            case 4: // Script
                // value = eval(this._params[4]);
                break;
        }
        for (var i = this._params[0]; i <= this._params[1]; i++) {
            this.operateVariable(i, this._params[2], value);
        }
        return true;
    }

    gameDataOperand(type, param1, param2) {
        switch (type) {
            case 0:  // Item
                return GameGlobal.$gameParty.numItems(GameGlobal.$dataItems[param1]);
            case 1:  // Weapon
                return GameGlobal.$gameParty.numItems(GameGlobal.$dataWeapons[param1]);
            case 2:  // Armor
                return GameGlobal.$gameParty.numItems(GameGlobal.$dataArmors[param1]);
            case 3:  // Actor
                var actor = GameGlobal.$gameActors.actor(param1);
                if (actor) {
                    switch (param2) {
                        case 0:  // Level
                            return actor.level;
                        case 1:  // EXP
                            return actor.currentExp();
                        case 2:  // HP
                            return actor.hp;
                        case 3:  // MP
                            return actor.mp;
                        default:    // Parameter
                            if (param2 >= 4 && param2 <= 11) {
                                return actor.param(param2 - 4);
                            }
                    }
                }
                break;
            case 4:  // Enemy
                var enemy = GameGlobal.$gameTroop.members()[param1];
                if (enemy) {
                    switch (param2) {
                        case 0:  // HP
                            return enemy.hp;
                        case 1:  // MP
                            return enemy.mp;
                        default:    // Parameter
                            if (param2 >= 2 && param2 <= 9) {
                                return enemy.param(param2 - 2);
                            }
                    }
                }
                break;
            case 5:  // Character
                var character = this.character(param1);
                if (character) {
                    switch (param2) {
                        case 0:  // Map X
                            return character.x;
                        case 1:  // Map Y
                            return character.y;
                        case 2:  // Direction
                            return character.direction();
                        case 3:  // Screen X
                            return character.screenX();
                        case 4:  // Screen Y
                            return character.screenY();
                    }
                }
                break;
            case 6:  // Party
                actor = GameGlobal.$gameParty.members()[param1];
                return actor ? actor.actorId() : 0;
            case 7:  // Other
                switch (param1) {
                    case 0:  // Map ID
                        return GameGlobal.$gameMap.mapId();
                    case 1:  // Party Members
                        return GameGlobal.$gameParty.size();
                    case 2:  // Gold
                        return GameGlobal.$gameParty.gold();
                    case 3:  // Steps
                        return GameGlobal.$gameParty.steps();
                    case 4:  // Play Time
                        return GameGlobal.$gameSystem.playtime();
                    case 5:  // Timer
                        return GameGlobal.$gameTimer.seconds();
                    case 6:  // Save Count
                        return GameGlobal.$gameSystem.saveCount();
                    case 7:  // Battle Count
                        return GameGlobal.$gameSystem.battleCount();
                    case 8:  // Win Count
                        return GameGlobal.$gameSystem.winCount();
                    case 9:  // Escape Count
                        return GameGlobal.$gameSystem.escapeCount();
                }
                break;
        }
        return 0;
    }

    operateVariable(variableId, operationType, value) {
        try {
            var oldValue = GameGlobal.$gameVariables.value(variableId);
            switch (operationType) {
                case 0:  // Set
                    GameGlobal.$gameVariables.setValue(variableId, oldValue = value);
                    break;
                case 1:  // Add
                    GameGlobal.$gameVariables.setValue(variableId, oldValue + value);
                    break;
                case 2:  // Sub
                    GameGlobal.$gameVariables.setValue(variableId, oldValue - value);
                    break;
                case 3:  // Mul
                    GameGlobal.$gameVariables.setValue(variableId, oldValue * value);
                    break;
                case 4:  // Div
                    GameGlobal.$gameVariables.setValue(variableId, oldValue / value);
                    break;
                case 5:  // Mod
                    GameGlobal.$gameVariables.setValue(variableId, oldValue % value);
                    break;
            }
        } catch (e) {
            GameGlobal.$gameVariables.setValue(variableId, 0);
        }
    }

    // Control Self Switch
    command123() {
        if (this._eventId > 0) {
            var key = [this._mapId, this._eventId, this._params[0]];
            GameGlobal.$gameSelfSwitches.setValue(key, this._params[1] === 0);
        }
        return true;
    }

    // Control Timer
    command124() {
        if (this._params[0] === 0) {  // Start
            GameGlobal.$gameTimer.start(this._params[1] * 60);
        } else {  // Stop
            GameGlobal.$gameTimer.stop();
        }
        return true;
    }

    // Change Gold
    command125() {
        var value = this.operateValue(this._params[0], this._params[1], this._params[2]);
        GameGlobal.$gameParty.gainGold(value);
        return true;
    }

    // Change Items
    command126() {
        var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
        GameGlobal.$gameParty.gainItem(GameGlobal.$dataItems[this._params[0]], value);
        return true;
    }

    // Change Weapons
    command127() {
        var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
        GameGlobal.$gameParty.gainItem(GameGlobal.$dataWeapons[this._params[0]], value, this._params[4]);
        return true;
    }

    // Change Armors
    command128() {
        var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
        GameGlobal.$gameParty.gainItem(GameGlobal.$dataArmors[this._params[0]], value, this._params[4]);
        return true;
    }

    // Change Party Member
    command129() {
        var actor = GameGlobal.$gameActors.actor(this._params[0]);
        if (actor) {
            if (this._params[1] === 0) {  // Add
                if (this._params[2]) {   // Initialize
                    GameGlobal.$gameActors.actor(this._params[0]).setup(this._params[0]);
                }
                GameGlobal.$gameParty.addActor(this._params[0]);
            } else {  // Remove
                GameGlobal.$gameParty.removeActor(this._params[0]);
            }
        }
        return true;
    }

    // Change Battle BGM
    command132() {
        GameGlobal.$gameSystem.setBattleBgm(this._params[0]);
        return true;
    }

    // Change Victory ME
    command133() {
        GameGlobal.$gameSystem.setVictoryMe(this._params[0]);
        return true;
    }

    // Change Save Access
    command134() {
        if (this._params[0] === 0) {
            GameGlobal.$gameSystem.disableSave();
        } else {
            GameGlobal.$gameSystem.enableSave();
        }
        return true;
    }

    // Change Menu Access
    command135() {
        if (this._params[0] === 0) {
            GameGlobal.$gameSystem.disableMenu();
        } else {
            GameGlobal.$gameSystem.enableMenu();
        }
        return true;
    }

    // Change Encounter Disable
    command136() {
        if (this._params[0] === 0) {
            GameGlobal.$gameSystem.disableEncounter();
        } else {
            GameGlobal.$gameSystem.enableEncounter();
        }
        GameGlobal.$gamePlayer.makeEncounterCount();
        return true;
    }

    // Change Formation Access
    command137() {
        if (this._params[0] === 0) {
            GameGlobal.$gameSystem.disableFormation();
        } else {
            GameGlobal.$gameSystem.enableFormation();
        }
        return true;
    }

    // Change Window Color
    command138() {
        GameGlobal.$gameSystem.setWindowTone(this._params[0]);
        return true;
    }

    // Change Defeat ME
    command139() {
        GameGlobal.$gameSystem.setDefeatMe(this._params[0]);
        return true;
    }

    // Change Vehicle BGM
    command140() {
        var vehicle = GameGlobal.$gameMap.vehicle(this._params[0]);
        if (vehicle) {
            vehicle.setBgm(this._params[1]);
        }
        return true;
    }

    // Transfer Player
    command201() {
        if (!GameGlobal.$gameParty.inBattle() && !GameGlobal.$gameMessage.isBusy()) {
            var mapId, x, y;
            if (this._params[0] === 0) {  // Direct designation
                mapId = this._params[1];
                x = this._params[2];
                y = this._params[3];
            } else {  // Designation with variables
                mapId = GameGlobal.$gameVariables.value(this._params[1]);
                x = GameGlobal.$gameVariables.value(this._params[2]);
                y = GameGlobal.$gameVariables.value(this._params[3]);
            }
            GameGlobal.$gamePlayer.reserveTransfer(mapId, x, y, this._params[4], this._params[5]);
            this.setWaitMode('transfer');
            this._index++;
        }
        return false;
    }

    // Set Vehicle Location
    command202() {
        var mapId, x, y;
        if (this._params[1] === 0) {  // Direct designation
            mapId = this._params[2];
            x = this._params[3];
            y = this._params[4];
        } else {  // Designation with variables
            mapId = GameGlobal.$gameVariables.value(this._params[2]);
            x = GameGlobal.$gameVariables.value(this._params[3]);
            y = GameGlobal.$gameVariables.value(this._params[4]);
        }
        var vehicle = GameGlobal.$gameMap.vehicle(this._params[0]);
        if (vehicle) {
            vehicle.setLocation(mapId, x, y);
        }
        return true;
    }

    // Set Event Location
    command203() {
        var character = this.character(this._params[0]);
        if (character) {
            if (this._params[1] === 0) {  // Direct designation
                character.locate(this._params[2], this._params[3]);
            } else if (this._params[1] === 1) {  // Designation with variables
                var x = GameGlobal.$gameVariables.value(this._params[2]);
                var y = GameGlobal.$gameVariables.value(this._params[3]);
                character.locate(x, y);
            } else {  // Exchange with another event
                var character2 = this.character(this._params[2]);
                if (character2) {
                    character.swap(character2);
                }
            }
            if (this._params[4] > 0) {
                character.setDirection(this._params[4]);
            }
        }
        return true;
    }

    // Scroll Map
    command204() {
        if (!GameGlobal.$gameParty.inBattle()) {
            if (GameGlobal.$gameMap.isScrolling()) {
                this.setWaitMode('scroll');
                return false;
            }
            GameGlobal.$gameMap.startScroll(this._params[0], this._params[1], this._params[2]);
        }
        return true;
    }

    // Set Movement Route
    command205() {
        GameGlobal.$gameMap.refreshIfNeeded();
        this._character = this.character(this._params[0]);
        if (this._character) {
            this._character.forceMoveRoute(this._params[1]);
            if (this._params[1].wait) {
                this.setWaitMode('route');
            }
        }
        return true;
    }

    // Getting On and Off Vehicles
    command206() {
        GameGlobal.$gamePlayer.getOnOffVehicle();
        return true;
    }

    // Change Transparency
    command211() {
        GameGlobal.$gamePlayer.setTransparent(this._params[0] === 0);
        return true;
    }

    // Show Animation
    command212() {
        this._character = this.character(this._params[0]);
        if (this._character) {
            this._character.requestAnimation(this._params[1]);
            if (this._params[2]) {
                this.setWaitMode('animation');
            }
        }
        return true;
    }

    // Show Balloon Icon
    command213() {
        this._character = this.character(this._params[0]);
        if (this._character) {
            this._character.requestBalloon(this._params[1]);
            if (this._params[2]) {
                this.setWaitMode('balloon');
            }
        }
        return true;
    }

    // Erase Event
    command214() {
        if (this.isOnCurrentMap() && this._eventId > 0) {
            GameGlobal.$gameMap.eraseEvent(this._eventId);
        }
        return true;
    }

    // Change Player Followers
    command216() {
        if (this._params[0] === 0) {
            GameGlobal.$gamePlayer.showFollowers();
        } else {
            GameGlobal.$gamePlayer.hideFollowers();
        }
        GameGlobal.$gamePlayer.refresh();
        return true;
    }

    // Gather Followers
    command217() {
        if (!GameGlobal.$gameParty.inBattle()) {
            GameGlobal.$gamePlayer.gatherFollowers();
            this.setWaitMode('gather');
        }
        return true;
    }

    // Fadeout Screen
    command221() {
        if (!GameGlobal.$gameMessage.isBusy()) {
            GameGlobal.$gameScreen.startFadeOut(this.fadeSpeed());
            this.wait(this.fadeSpeed());
            this._index++;
        }
        return false;
    }

    // Fadein Screen
    command222() {
        if (!GameGlobal.$gameMessage.isBusy()) {
            GameGlobal.$gameScreen.startFadeIn(this.fadeSpeed());
            this.wait(this.fadeSpeed());
            this._index++;
        }
        return false;
    }

    // Tint Screen
    command223() {
        GameGlobal.$gameScreen.startTint(this._params[0], this._params[1]);
        if (this._params[2]) {
            this.wait(this._params[1]);
        }
        return true;
    }

    // Flash Screen
    command224() {
        GameGlobal.$gameScreen.startFlash(this._params[0], this._params[1]);
        if (this._params[2]) {
            this.wait(this._params[1]);
        }
        return true;
    }

    // Shake Screen
    command225() {
        GameGlobal.$gameScreen.startShake(this._params[0], this._params[1], this._params[2]);
        if (this._params[3]) {
            this.wait(this._params[2]);
        }
        return true;
    }

    // Wait
    command230() {
        this.wait(this._params[0]);
        return true;
    }

    // Show Picture
    command231() {
        var x, y;
        if (this._params[3] === 0) {  // Direct designation
            x = this._params[4];
            y = this._params[5];
        } else {  // Designation with variables
            x = GameGlobal.$gameVariables.value(this._params[4]);
            y = GameGlobal.$gameVariables.value(this._params[5]);
        }
        GameGlobal.$gameScreen.showPicture(this._params[0], this._params[1], this._params[2],
            x, y, this._params[6], this._params[7], this._params[8], this._params[9]);
        return true;
    }

    // Move Picture
    command232() {
        var x, y;
        if (this._params[3] === 0) {  // Direct designation
            x = this._params[4];
            y = this._params[5];
        } else {  // Designation with variables
            x = GameGlobal.$gameVariables.value(this._params[4]);
            y = GameGlobal.$gameVariables.value(this._params[5]);
        }
        GameGlobal.$gameScreen.movePicture(this._params[0], this._params[2], x, y, this._params[6],
            this._params[7], this._params[8], this._params[9], this._params[10]);
        if (this._params[11]) {
            this.wait(this._params[10]);
        }
        return true;
    }

    // Rotate Picture
    command233() {
        GameGlobal.$gameScreen.rotatePicture(this._params[0], this._params[1]);
        return true;
    }

    // Tint Picture
    command234() {
        GameGlobal.$gameScreen.tintPicture(this._params[0], this._params[1], this._params[2]);
        if (this._params[3]) {
            this.wait(this._params[2]);
        }
        return true;
    }

    // Erase Picture
    command235() {
        GameGlobal.$gameScreen.erasePicture(this._params[0]);
        return true;
    }

    // Set Weather Effect
    command236() {
        if (!GameGlobal.$gameParty.inBattle()) {
            GameGlobal.$gameScreen.changeWeather(this._params[0], this._params[1], this._params[2]);
            if (this._params[3]) {
                this.wait(this._params[2]);
            }
        }
        return true;
    }

    // Play BGM
    command241() {
        AudioManager.playBgm(this._params[0]);
        return true;
    }

    // Fadeout BGM
    command242() {
        AudioManager.stopBgm(this._params[0]);
        return true;
    }

    // Save BGM
    command243() {
        GameGlobal.$gameSystem.saveBgm();
        return true;
    }

    // Resume BGM
    command244() {
        GameGlobal.$gameSystem.replayBgm();
        return true;
    }

    // Play BGS
    command245() {
        AudioManager.playBgs(this._params[0]);
        return true;
    }

    // Fadeout BGS
    command246() {
        AudioManager.fadeOutBgs(this._params[0]);
        return true;
    }

    // Play ME
    command249() {
        AudioManager.playMe(this._params[0]);
        return true;
    }

    // Play SE
    command250() {
        AudioManager.playSe(this._params[0]);
        return true;
    }

    // Stop SE
    command251() {
        AudioManager.stopSe();
        return true;
    }

    // Play Movie
    command261() {
        if (!GameGlobal.$gameMessage.isBusy()) {
            var name = this._params[0];
            if (name.length > 0) {
                var ext = this.videoFileExt();
                Graphics.playVideo('movies/' + name + ext);
                this.setWaitMode('video');
            }
            this._index++;
        }
        return false;
    }

    videoFileExt() {
        if (Graphics.canPlayVideoType('video/webm') && !Utils.isMobileDevice()) {
            return '.webm';
        } else {
            return '.mp4';
        }
    }

    // Change Map Name Display
    command281() {
        if (this._params[0] === 0) {
            GameGlobal.$gameMap.enableNameDisplay();
        } else {
            GameGlobal.$gameMap.disableNameDisplay();
        }
        return true;
    }

    // Change Tileset
    command282() {
        var tileset = GameGlobal.$dataTilesets[this._params[0]];
        if (!this._imageReservationId) {
            this._imageReservationId = Utils.generateRuntimeId();
        }

        var allReady = tileset.tilesetNames.map(function (tilesetName) {
            return ImageManager.reserveTileset(tilesetName, 0, this._imageReservationId);
        }, this).every(function (bitmap) { return bitmap.isReady(); });

        if (allReady) {
            GameGlobal.$gameMap.changeTileset(this._params[0]);
            ImageManager.releaseReservation(this._imageReservationId);
            this._imageReservationId = null;

            return true;
        } else {
            return false;
        }
    }

    // Change Battle Back
    command283() {
        GameGlobal.$gameMap.changeBattleback(this._params[0], this._params[1]);
        return true;
    }

    // Change Parallax
    command284() {
        GameGlobal.$gameMap.changeParallax(this._params[0], this._params[1],
            this._params[2], this._params[3], this._params[4]);
        return true;
    }

    // Get Location Info
    command285() {
        var x, y, value;
        if (this._params[2] === 0) {  // Direct designation
            x = this._params[3];
            y = this._params[4];
        } else {  // Designation with variables
            x = GameGlobal.$gameVariables.value(this._params[3]);
            y = GameGlobal.$gameVariables.value(this._params[4]);
        }
        switch (this._params[1]) {
            case 0:     // Terrain Tag
                value = GameGlobal.$gameMap.terrainTag(x, y);
                break;
            case 1:     // Event ID
                value = GameGlobal.$gameMap.eventIdXy(x, y);
                break;
            case 2:     // Tile ID (Layer 1)
            case 3:     // Tile ID (Layer 2)
            case 4:     // Tile ID (Layer 3)
            case 5:     // Tile ID (Layer 4)
                value = GameGlobal.$gameMap.tileId(x, y, this._params[1] - 2);
                break;
            default:    // Region ID
                value = GameGlobal.$gameMap.regionId(x, y);
                break;
        }
        GameGlobal.$gameVariables.setValue(this._params[0], value);
        return true;
    }

    // Battle Processing
    command301() {
        // 删掉原始战斗内容
        return true;
    }

    // If Win
    command601() {
        if (this._branch[this._indent] !== 0) {
            this.skipBranch();
        }
        return true;
    }

    // If Escape
    command602() {
        if (this._branch[this._indent] !== 1) {
            this.skipBranch();
        }
        return true;
    }

    // If Lose
    command603() {
        if (this._branch[this._indent] !== 2) {
            this.skipBranch();
        }
        return true;
    }

    // Shop Processing
    command302() {
        if (!GameGlobal.$gameParty.inBattle()) {
            var goods = [this._params];
            while (this.nextEventCode() === 605) {
                this._index++;
                goods.push(this.currentCommand().parameters);
            }
            SceneManager.push(Scene_Shop);
            SceneManager.prepareNextScene(goods, this._params[4]);
        }
        return true;
    }

    // Name Input Processing
    command303() {
        if (!GameGlobal.$gameParty.inBattle()) {
            if (GameGlobal.$dataActors[this._params[0]]) {
                SceneManager.push(Scene_Name);
                SceneManager.prepareNextScene(this._params[0], this._params[1]);
            }
        }
        return true;
    }

    // Change HP
    command311() {
        var value = this.operateValue(this._params[2], this._params[3], this._params[4]);
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            this.changeHp(actor, value, this._params[5]);
        }.bind(this));
        return true;
    }

    // Change MP
    command312() {
        var value = this.operateValue(this._params[2], this._params[3], this._params[4]);
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            actor.gainMp(value);
        }.bind(this));
        return true;
    }

    // Change TP
    command326() {
        var value = this.operateValue(this._params[2], this._params[3], this._params[4]);
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            actor.gainTp(value);
        }.bind(this));
        return true;
    }

    // Change State
    command313() {
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            var alreadyDead = actor.isDead();
            if (this._params[2] === 0) {
                actor.addState(this._params[3]);
            } else {
                actor.removeState(this._params[3]);
            }
            if (actor.isDead() && !alreadyDead) {
                actor.performCollapse();
            }
            actor.clearResult();
        }.bind(this));
        return true;
    }

    // Recover All
    command314() {
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            actor.recoverAll();
        }.bind(this));
        return true;
    }

    // Change EXP
    command315() {
        var value = this.operateValue(this._params[2], this._params[3], this._params[4]);
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            actor.changeExp(actor.currentExp() + value, this._params[5]);
        }.bind(this));
        return true;
    }

    // Change Level
    command316() {
        var value = this.operateValue(this._params[2], this._params[3], this._params[4]);
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            actor.changeLevel(actor.level + value, this._params[5]);
        }.bind(this));
        return true;
    }

    // Change Parameter
    command317() {
        var value = this.operateValue(this._params[3], this._params[4], this._params[5]);
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            actor.addParam(this._params[2], value);
        }.bind(this));
        return true;
    }

    // Change Skill
    command318() {
        this.iterateActorEx(this._params[0], this._params[1], function (actor) {
            if (this._params[2] === 0) {
                actor.learnSkill(this._params[3]);
            } else {
                actor.forgetSkill(this._params[3]);
            }
        }.bind(this));
        return true;
    }

    // Change Equipment
    command319() {
        var actor = GameGlobal.$gameActors.actor(this._params[0]);
        if (actor) {
            actor.changeEquipById(this._params[1], this._params[2]);
        }
        return true;
    }

    // Change Name
    command320() {
        var actor = GameGlobal.$gameActors.actor(this._params[0]);
        if (actor) {
            actor.setName(this._params[1]);
        }
        return true;
    }

    // Change Class
    command321() {
        
        var actor = GameGlobal.$gameActors.actor(this._params[0]);
        if (actor && GameGlobal.$dataClasses[this._params[1]]) {
            actor.changeClass(this._params[1], this._params[2]);
        }
        return true;
    }

    // Change Actor Images
    command322() {
        var actor = GameGlobal.$gameActors.actor(this._params[0]);
        if (actor) {
            actor.setCharacterImage(this._params[1], this._params[2]);
            actor.setFaceImage(this._params[3], this._params[4]);
            actor.setBattlerImage(this._params[5]);
        }
        GameGlobal.$gamePlayer.refresh();
        return true;
    }

    // Change Vehicle Image
    command323() {
        var vehicle = GameGlobal.$gameMap.vehicle(this._params[0]);
        if (vehicle) {
            vehicle.setImage(this._params[1], this._params[2]);
        }
        return true;
    }

    // Change Nickname
    command324() {
        var actor = GameGlobal.$gameActors.actor(this._params[0]);
        if (actor) {
            actor.setNickname(this._params[1]);
        }
        return true;
    }

    // Change Profile
    command325() {
        var actor = GameGlobal.$gameActors.actor(this._params[0]);
        if (actor) {
            actor.setProfile(this._params[1]);
        }
        return true;
    }

    // Change Enemy HP
    command331() {
        var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
        this.iterateEnemyIndex(this._params[0], function (enemy) {
            this.changeHp(enemy, value, this._params[4]);
        }.bind(this));
        return true;
    }

    // Change Enemy MP
    command332() {
        var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
        this.iterateEnemyIndex(this._params[0], function (enemy) {
            enemy.gainMp(value);
        }.bind(this));
        return true;
    }

    // Change Enemy TP
    command342() {
        var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
        this.iterateEnemyIndex(this._params[0], function (enemy) {
            enemy.gainTp(value);
        }.bind(this));
        return true;
    }

    // Change Enemy State
    command333() {
        this.iterateEnemyIndex(this._params[0], function (enemy) {
            var alreadyDead = enemy.isDead();
            if (this._params[1] === 0) {
                enemy.addState(this._params[2]);
            } else {
                enemy.removeState(this._params[2]);
            }
            if (enemy.isDead() && !alreadyDead) {
                enemy.performCollapse();
            }
            enemy.clearResult();
        }.bind(this));
        return true;
    }

    // Enemy Recover All
    command334() {
        this.iterateEnemyIndex(this._params[0], function (enemy) {
            enemy.recoverAll();
        }.bind(this));
        return true;
    }

    // Enemy Appear
    command335() {
        this.iterateEnemyIndex(this._params[0], function (enemy) {
            enemy.appear();
            GameGlobal.$gameTroop.makeUniqueNames();
        }.bind(this));
        return true;
    }

    // Enemy Transform
    command336() {
        this.iterateEnemyIndex(this._params[0], function (enemy) {
            enemy.transform(this._params[1]);
            GameGlobal.$gameTroop.makeUniqueNames();
        }.bind(this));
        return true;
    }

    // Show Battle Animation
    command337() {
        if (this._params[2] == true) {
            this.iterateEnemyIndex(-1, function (enemy) {
                if (enemy.isAlive()) {
                    enemy.startAnimation(this._params[1], false, 0);
                }
            }.bind(this));
        } else {
            this.iterateEnemyIndex(this._params[0], function (enemy) {
                if (enemy.isAlive()) {
                    enemy.startAnimation(this._params[1], false, 0);
                }
            }.bind(this));
        }
        return true;
    }

    // Force Action
    command339() {
        // this.iterateBattler(this._params[0], this._params[1], function (battler) {
        //     if (!battler.isDeathStateAffected()) {
        //         battler.forceAction(this._params[2], this._params[3]);
        //         BattleManager.forceAction(battler);
        //         this.setWaitMode('action');
        //     }
        // }.bind(this));
        return true;
    }

    // Abort Battle
    command340() {
        // BattleManager.abort();
        return true;
    }

    // Open Menu Screen
    command351() {
        if (!GameGlobal.$gameParty.inBattle()) {
            SceneManager.push(Scene_Menu);
            Window_MenuCommand.initCommandPosition();
        }
        return true;
    }

    // Open Save Screen
    command352() {
        if (!GameGlobal.$gameParty.inBattle()) {
            SceneManager.push(Scene_Save);
        }
        return true;
    }

    // Game Over
    command353() {
        SceneManager.goto(Scene_Gameover);
        return true;
    }

    // Return to Title Screen
    command354() {
        SceneManager.goto(Scene_Title);
        return true;
    }

    // Script
    command355() {
        var script = this.currentCommand().parameters[0] + '\n';
        while (this.nextEventCode() === 655) {
            this._index++;
            script += this.currentCommand().parameters[0] + '\n';
        }
        // eval(script);
        return true;
    }

    // Plugin Command
    command356() {
        var args = this._params[0].split(" ");
        var command = args.shift();
        this.pluginCommand(command, args);
        return true;
    }

    pluginCommand(command, args) {
        if (command.toLowerCase() === 'quasi') {
            this.qSpriteCommandOld(args);
        }
        if (command.toLowerCase() === 'qsprite') {
            return this.qSpriteCommand(E8Plus.makeArgs(args));
        }

        // to be overridden by plugins

        // if (command == "change_light") {
        //     console.log("change_light");
        //     if (MultiLayer.bmps.length === 0) {
        //         return;
        //     }
        //     var now;
        //     if (typeof args[0] === Number) {
        //         console.log("isNumber");
        //         now = args[0] > 22 ? "nightlight" : args[0] > 18 ? "dusklight" : args[0] > 10 ? "daylight" : args[0] > 6 ? "morninglight" : "nightlight";
        //     } else {
        //         now = args[0] === undefined ? "daylight" : args[0];
        //     }
        //     console.log(MultiLayer.bmps);
        //     MultiLayer.bmps[0].t = 0;
        //     console.log(MultiLayer.bmps);
        //     MultiLayer.bmps[0].update = () => {
        //         MultiLayer.bmps[0].t++;
        //         if (MultiLayer.bmps[0].t < 201) {
        //             switch (now) {
        //                 case "daylight":
        //                     MultiLayer.bmps[4].alpha = 1 - 1 / 200 * MultiLayer.bmps[0].t;
        //                     MultiLayer.bmps[1].alpha = 1 / 200 * MultiLayer.bmps[0].t;
        //                     break;

        //                 case "dusklight":
        //                     MultiLayer.bmps[1].alpha = 1 - 1 / 200 * MultiLayer.bmps[0].t;
        //                     MultiLayer.bmps[2].alpha = 1 / 200 * MultiLayer.bmps[0].t;
        //                     break;

        //                 case "nightlight":
        //                     MultiLayer.bmps[2].alpha = 1 - 1 / 200 * MultiLayer.bmps[0].t;
        //                     MultiLayer.bmps[3].alpha = 1 / 200 * MultiLayer.bmps[0].t;
        //                     break;

        //                 case "morninglight":
        //                     MultiLayer.bmps[3].alpha = 1 - 1 / 200 * MultiLayer.bmps[0].t;
        //                     MultiLayer.bmps[4].alpha = 1 / 200 * MultiLayer.bmps[0].t;
        //                     break;
        //             }
        //         }

        //     };
        // }

        if (command.toLowerCase() === 'qpathfind') {
            return this.pathfindCommand(E8Plus.makeArgs(args));
        }

        if (command !== 'Minimap') {
            return;
        }

        switch (args[0]) {
            case 'show':
                GameGlobal.$gameSystem.setMinimapEnabled(true);
                break;
            case 'hide':
                GameGlobal.$gameSystem.setMinimapEnabled(false);
                break;
            case 'refresh':
                GameGlobal.$gameMap.refreshMinimapCache();
                break;
            default:
                // 不明なコマンド
                break;
        }
    }


    qSpriteCommand(args) {
        var chara;
        if (args[0].toLowerCase() === 'this') {
            chara = this.character(0);
        } else {
            chara = E8Plus.getCharacter(args[0]);
        }
        if (!chara) return;
        var cmd = args[1].toLowerCase();
        var args2 = args.slice(2);
        if (cmd === 'play') {
            var pose = args2.shift();
            var locked = !!E8Plus.getArg(args2, /^lock$/i);
            var pause = !!E8Plus.getArg(args2, /^pause$/i);
            var canBreak = !!E8Plus.getArg(args2, /^breakable$/i);
            var wait = !!E8Plus.getArg(args2, /^wait$/i);
            chara.playPose(pose, locked, pause, false, canBreak);
            if (wait) {
                this.wait(chara.calcPoseWait());
            }
        }
        if (cmd === 'loop') {
            var pose = args2.shift();
            var locked = !!E8Plus.getArg(args2, /^lock$/i);
            var canBreak = !!E8Plus.getArg(args2, /^breakable$/i);
            var wait = !!E8Plus.getArg(args2, /^wait$/i);
            chara.loopPose(pose, locked, canBreak);
            if (wait) {
                this.wait(chara.calcPoseWait());
            }
        }
        if (cmd === 'clear') {
            chara.clearPose();
        }
        if (cmd === 'addidleaz') {
            chara.addRandIdle(args2[0]);
        }
        if (cmd === 'removeidleaz') {
            chara.removeRandIdle(args2[0]);
        }
        if (cmd === 'changeidle') {
            chara.changeIdle(args2[0]);
        }
    };

    qSpriteCommandOld(args) { // backwards compatibility
        if (args[0].toLowerCase() === "playpose") {
            var charaId = Number(args[1]);
            var chara = charaId === 0 ? $gamePlayer : $gameMap.event(charaId);
            var pose = args[2];
            var locked = args[3] === "true";
            var pause = args[4] === "true";
            chara.playPose(pose, locked, pause);
            return;
        }
        if (args[0].toLowerCase() === "looppose") {
            var charaId = Number(args[1]);
            var chara = charaId === 0 ? $gamePlayer : $gameMap.event(charaId);
            var pose = args[2];
            var locked = args[3] === "true";
            chara.loopPose(pose, locked);
            return;
        }
        if (args[0].toLowerCase() === "clearpose") {
            var charaId = Number(args[1]);
            var chara = charaId === 0 ? $gamePlayer : $gameMap.event(charaId);
            chara.clearPose();
            return;
        }
    };


    static pathfindCommand(args) {
        var chara;
        if (args[0].toLowerCase() === 'this') {
            chara = this.character(0);
        } else {
            chara = E8Plus.getCharacter(args[0]);
        }
        if (!chara) return;
        var args2 = args.slice(1);
        if (args2[0].toLowerCase() === 'chase') {
            if (args2[1].toLowerCase() === 'this') {
                chara.initChase(this.character(0).charaId());
            } else if (E8Plus.getCharacter(args2[1])) {
                chara.initChase(E8Plus.getCharacter(args2[1]).charaId());
            }
            return;
        }
        if (args2[0].toLowerCase() === 'clear') {
            chara.clearPathfind();
            return;
        }
        var x;
        var y;
        if (args2[0].toLowerCase() === 'towards') {
            var chara2;
            if (args2[1].toLowerCase() === 'this') {
                chara2 = this.character(0);
            } else {
                chara2 = E8Plus.getCharacter(args2[1]);
            }
            // if (Imported.QMovement) {
            var pos = chara.centerWith(chara2);
            x = pos.x;
            y = pos.y;
            // } else {
            //     x = chara2.x;
            //     y = chara2.y;
            // }
        } else {
            x = E8Plus.getArg(args2, /^x(\d+)/i);
            y = E8Plus.getArg(args2, /^y(\d+)/i);
            if (Imported.QMovement) {
                if (x === null) {
                    x = E8Plus.getArg(args2, /^px(\d+)/i);
                } else {
                    x = Number(x) * QMovement.tileSize;
                }
                if (y === null) {
                    y = E8Plus.getArg(args2, /^py(\d+)/i);
                } else {
                    y = Number(y) * QMovement.tileSize;
                }
            }
        }
        if (x === null && y === null) return;
        chara.initPathfind(Number(x), Number(y), {
            smart: Number(E8Plus.getArg(args2, /^smart(\d+)/i)),
            adjustEnd: true
        })
        var wait = E8Plus.getArg(args2, /^wait$/i);
        if (wait) {
            this._character = chara;
            this.setWaitMode('pathfind');
        }
    }

    static requestImages(list, commonList) {
        if (!list) return;

        list.forEach(function (command) {
            var params = command.parameters;
            switch (command.code) {
                // Show Text
                case 101:
                    ImageManager.requestFace(params[0]);
                    break;

                // Common Event
                case 117:
                    var commonEvent = GameGlobal.$dataCommonEvents[params[0]];
                    if (commonEvent) {
                        if (!commonList) {
                            commonList = [];
                        }
                        if (!commonList.contains(params[0])) {
                            commonList.push(params[0]);
                            Game_Interpreter.requestImages(commonEvent.list, commonList);
                        }
                    }
                    break;

                // Change Party Member
                case 129:
                    var actor = GameGlobal.$gameActors.actor(params[0]);
                    if (actor && params[1] === 0) {
                        var name = actor.characterName();
                        ImageManager.requestCharacter(name);
                    }
                    break;

                // Set Movement Route
                case 205:
                    if (params[1]) {
                        params[1].list.forEach(function (command) {
                            var params = command.parameters;
                            if (command.code === Game_Character.ROUTE_CHANGE_IMAGE) {
                                ImageManager.requestCharacter(params[0]);
                            }
                        });
                    }
                    break;

                // Show Animation, Show Battle Animation
                case 212: case 337:
                    if (params[1]) {
                        var animation = GameGlobal.$dataAnimations[params[1]];
                        var name1 = animation.animation1Name;
                        var name2 = animation.animation2Name;
                        var hue1 = animation.animation1Hue;
                        var hue2 = animation.animation2Hue;
                        ImageManager.requestAnimation(name1, hue1);
                        ImageManager.requestAnimation(name2, hue2);
                    }
                    break;

                // Change Player Followers
                case 216:
                    if (params[0] === 0) {
                        GameGlobal.$gamePlayer.followers().forEach(function (follower) {
                            var name = follower.characterName();
                            ImageManager.requestCharacter(name);
                        });
                    }
                    break;

                // Show Picture
                case 231:
                    ImageManager.requestPicture(params[1]);
                    break;

                // Change Tileset
                case 282:
                    var tileset = GameGlobal.$dataTilesets[params[0]];
                    tileset.tilesetNames.forEach(function (tilesetName) {
                        ImageManager.requestTileset(tilesetName);
                    });
                    break;

                // Change Battle Back
                case 283:
                    if (GameGlobal.$gameParty.inBattle()) {
                        ImageManager.requestBattleback1(params[0]);
                        ImageManager.requestBattleback2(params[1]);
                    }
                    break;

                // Change Parallax
                case 284:
                    if (!GameGlobal.$gameParty.inBattle()) {
                        ImageManager.requestParallax(params[0]);
                    }
                    break;

                // Change Actor Images
                case 322:
                    ImageManager.requestCharacter(params[1]);
                    ImageManager.requestFace(params[3]);
                    ImageManager.requestSvActor(params[5]);
                    break;

                // Change Vehicle Image
                case 323:
                    var vehicle = GameGlobal.$gameMap.vehicle(params[0]);
                    if (vehicle) {
                        ImageManager.requestCharacter(params[1]);
                    }
                    break;

                // Enemy Transform
                case 336:
                    var enemy = GameGlobal.$dataEnemies[params[1]];
                    var name = enemy.battlerName;
                    var hue = enemy.battlerHue;
                    if (GameGlobal.$gameSystem.isSideView()) {
                        ImageManager.requestSvEnemy(name, hue);
                    } else {
                        ImageManager.requestEnemy(name, hue);
                    }
                    break;
            }
        });
    }
}