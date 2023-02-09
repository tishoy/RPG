import Game_Character from './Game_Character';
import Game_Interpreter from './Game_Interpreter';
import Minimap from '../18ext/MiniMap'
import Point from '../core/point'
import E8ABS from '../18ext/E8ABS'
import Movement from '../core/movement'
import Game_CharacterBase from './Game_CharacterBase'
import Game_Enemy from './Game_Enemy'
import ColliderManager from '../managers/ColliderManager'
import ABSManager from '../managers/ABSManager'
/**
 * create by 18tech
 * 游戏事件
 */
export default class Game_Event extends Game_Character {
    constructor(mapId, eventId) {
        super();
        this.initialize(mapId, eventId);
    }

    initialize(mapId, eventId) {
        super.initialize();
        this._mapId = mapId;
        this._eventId = eventId;
        this.locate(this.event().x, this.event().y);
        this.refresh();
        this.setupBattler();
    }

    battler() {
        return this._battler;
    };


    setupBattler() {
        var foe = /<enemy:([0-9]*?)>/i.exec(this.notes());
        if (foe) {
            this.clearABS();
            this._battlerId = Number(foe[1]);
            this._battler = new Game_Enemy(this._battlerId, 0, 0);
            this._battler._charaId = this.charaId();
            this._skillList = [];
            this._aiType = this._battler._aiType;
            this._aiRange = this._battler._aiRange || E8ABS.aiLength;
            this._aiWait = 0;

            // Path find QSight
            this._aiPathfind = false && E8ABS.aiPathfind && this.validAI();
            this._aiSight = false && E8ABS.aiSight && this.validAI();
            if (this._aiSight) {
                this.setupSight({
                    shape: 'circle',
                    range: this._aiRange / Movement.tileSize,
                    handler: 'AI',
                    targetId: '0'
                });
            }
            var actions = this._battler.enemy().actions;
            for (var i = 0; i < actions.length; i++) {
                this._skillList.push(actions[i].skillId);
            }
            this._respawn = -1;
            this._onDeath = this._battler._onDeath;
            this._noPopup = this._battler._noPopup;
            this._dontErase = this._battler._dontErase;
            this._team = this._battler._team;
            this._isDead = false;
        }
    };


    initMembers() {
        super.initMembers();
        this._moveType = 0;
        this._trigger = 0;
        this._starting = false;
        this._erased = false;
        this._pageIndex = -2;
        this._originalPattern = 1;
        this._originalDirection = 2;
        this._prelockDirection = 0;
        this._locked = false;
        this._comments = null;
        this._prevDir = null;
    }

    eventId() {
        return this._eventId;
    }

    event() {
        return GameGlobal.$dataMap.events[this._eventId];
    }

    page() {
        return this.event().pages[this._pageIndex];
    }

    list() {
        return this.page().list;
    }

    isCollidedWithCharacters(x, y) {
        return (super.isCollidedWithCharacters(x, y) ||
            this.isCollidedWithPlayerCharacters(x, y));
    }

    isCollidedWithEvents(x, y) {
        var events = GameGlobal.$gameMap.eventsXyNt(x, y);
        return events.length > 0;
    }

    isCollidedWithPlayerCharacters(x, y) {
        return this.isNormalPriority() && GameGlobal.$gamePlayer.isCollided(x, y);
    }

    lock() {
        if (!this._locked) {
            this._prelockDirection = this.direction();
            this.turnTowardPlayer();
            this._locked = true;
        }
    }

    unlock() {
        if (this._locked) {
            this._locked = false;
            this.setDirection(this._prelockDirection);
        }
    }

    updateStop() {
        if (this._locked) {
            this.resetStopCount();
        }
        super.updateStop();
        if (!this.isMoveRouteForcing()) {
            this.updateSelfMovement();
        }
    }

    updateSelfMovement() {
        if (!this.canMove()) return;
        if (!this._locked && this.isNearTheScreen() &&
            this.checkStop(this.stopCountThreshold())) {
            switch (this._moveType) {
                case 1:
                    this.moveTypeRandom();
                    break;
                case 2:
                    this.moveTypeTowardPlayer();
                    break;
                case 3:
                    this.moveTypeCustom();
                    break;
            }
        }
    }

    stopCountThreshold() {
        return 30 * (5 - this.moveFrequency());
    }

    moveTypeRandom() {
        switch (Math.randomInt(6)) {
            case 0: case 1:
                this.moveRandom();
                break;
            case 2: case 3: case 4:
                this.moveForward();
                break;
            case 5:
                this.resetStopCount();
                break;
        }
    }

    moveTypeTowardPlayer() {
        if (this.isNearThePlayer()) {
            switch (Math.randomInt(6)) {
                case 0: case 1: case 2: case 3:
                    this.moveTowardPlayer();
                    break;
                case 4:
                    this.moveRandom();
                    break;
                case 5:
                    this.moveForward();
                    break;
            }
        } else {
            this.moveRandom();
        }
    }

    isNearThePlayer() {
        var sx = Math.abs(this.deltaXFrom(GameGlobal.$gamePlayer.x));
        var sy = Math.abs(this.deltaYFrom(GameGlobal.$gamePlayer.y));
        return sx + sy < 20;
    }

    moveTypeCustom() {
        this.updateRoutineMove();
    }

    isStarting() {
        return this._starting;
    }

    clearStartingFlag() {
        this._starting = false;
    }

    isTriggerIn(triggers) {
        return triggers.contains(this._trigger);
    }

    start() {
        var list = this.list();
        if (list && list.length > 1) {
            this._starting = true;
            if (this.isTriggerIn([0, 1, 2])) {
                this.lock();
            }
        }
    }

    erase() {
        this._erased = true;
        this.refresh();
    }

    refresh() {
        var newPageIndex = this._erased ? -1 : this.findProperPageIndex();
        if (this._pageIndex !== newPageIndex) {
            this._pageIndex = newPageIndex;
            this.setupPage();
        }
    }

    findProperPageIndex() {
        var pages = this.event().pages;
        for (var i = pages.length - 1; i >= 0; i--) {
            var page = pages[i];
            if (this.meetsConditions(page)) {
                return i;
            }
        }
        return -1;
    }

    meetsConditions(page) {
        var c = page.conditions;
        if (c.switch1Valid) {
            if (!GameGlobal.$gameSwitches.value(c.switch1Id)) {
                return false;
            }
        }
        if (c.switch2Valid) {
            if (!GameGlobal.$gameSwitches.value(c.switch2Id)) {
                return false;
            }
        }
        if (c.variableValid) {
            if (GameGlobal.$gameVariables.value(c.variableId) < c.variableValue) {
                return false;
            }
        }
        if (c.selfSwitchValid) {
            var key = [this._mapId, this._eventId, c.selfSwitchCh];
            if (GameGlobal.$gameSelfSwitches.value(key) !== true) {
                return false;
            }
        }
        if (c.itemValid) {
            var item = GameGlobal.$dataItems[c.itemId];
            if (!GameGlobal.$gameParty.hasItem(item)) {
                return false;
            }
        }
        if (c.actorValid) {
            var actor = GameGlobal.$gameActors.actor(c.actorId);
            if (!GameGlobal.$gameParty.members().contains(actor)) {
                return false;
            }
        }
        return true;
    }

    setupPage() {
        if (this._isChasing !== false) {
            this.clearPathfind();
        }
        var firstTime = this._prevDir === null;
        this._prevDir = this.direction();

        if (this._pageIndex >= 0) {
            this.setupPageSettings();
        } else {
            this.clearPageSettings();
        }
        this.refreshBushDepth();
        this.clearStartingFlag();
        this.checkEventTriggerAuto();
        this.setupMinimapAttribute();

        var retainDir = /<retainDir>/i.test(this.comments(true));
        if (!firstTime && retainDir) {
            this.setDirection(this._prevDir);
        }

        // 面部表情page页
        this.checkFaceComments();
    }

    checkFaceComments() {
        if (!this._erased && this.page()) {this.list().forEach(function(l) {
               if (l.code === 108) {var comment = l.parameters[0].split(' : ')
                    if (comment[0].toLowerCase() == "face"){
                        var mode = comment[1] ? comment[1] : 0;					
                        var eleft = comment[2] != null ? comment[2] : true;
                        var eright = comment[3] != null ? comment[3] : true;	   
                        var x1 = comment[4] != null ? comment[4] : 0;
                        var y1 = comment[5] != null ? comment[5] : 0;
                        var x2 = comment[6] != null ? comment[6] : 0;
                        var y2 = comment[7] != null ? comment[7] : 0;	
                        this._faceData.enabled = true;
                        this._faceData.mode = Number(mode);	
                        this._faceData.eyeL = String(eleft) == "true" ? true : false;
                        this._faceData.eyeR = String(eright) == "true" ? true : false;					
                        this._faceData.x = Number(x1);
                        this._faceData.y = Number(y1);
                        this._faceData.x2 = Number(x2);	
                        this._faceData.y2 = Number(y2);
                     };
                };
        }, this);};
    };	

    setupMinimapAttribute() {
        this._minimapAttribute = { dirty: true, wall: false, move: false, person: -1, object: -1 };

        var isComment = (command) => {
            return command && (command.code === 108 || command.code === 408);
        };

        // 注釈以外に達するまで解析
        var page = this.page();
        if (!page) {
            return;
        }

        var commands = page.list;
        var index = 0;
        var command = commands[index++];
        while (isComment(command)) {
            var comment = command.parameters[0];

            this._minimapAttribute.wall |= Minimap.regex.wallEvent.test(comment);
            this._minimapAttribute.move |= Minimap.regex.moveEvent.test(comment);
            Minimap.keysRequireNumber.forEach(function (key) {
                var match = Minimap.regex[key].exec(comment);
                if (match) {
                    this._minimapAttribute[key] = Number(match[1]);
                }
            }, this);

            command = commands[index++];
        }
    }

    isMinimapAttributeDirty() {
        return this._minimapAttribute.dirty;
    }

    setMinimapAttributeDirty() {
        this._minimapAttribute.dirty = true;
    }

    clearMinimapAttributeDirty() {
        this._minimapAttribute.dirty = false;
    }

    isMinimapWall() {
        return this._minimapAttribute.wall;
    }

    isMinimapMove() {
        return this._minimapAttribute.move;
    }


    minimapPersonType() {
        return this._minimapAttribute.person;
    };

    minimapObjectType() {
        return this._minimapAttribute.object;
    };


    clearPageSettings() {
        this.setImage('', 0);
        this._moveType = 0;
        this._trigger = null;
        this._interpreter = null;
        this.setThrough(true);
        this._ignoreCharacters = [];
        this._comments = '';
    }

    setupPageSettings() {
        var page = this.page();
        var image = page.image;
        if (image.tileId > 0) {
            this.setTileImage(image.tileId);
        } else {
            this.setImage(image.characterName, image.characterIndex);
        }
        if (this._originalDirection !== image.direction) {
            this._originalDirection = image.direction;
            this._prelockDirection = 0;
            this.setDirectionFix(false);
            this.setDirection(image.direction);
        }
        if (this._originalPattern !== image.pattern) {
            this._originalPattern = image.pattern;
            this.setPattern(image.pattern);
        }
        this.setMoveSpeed(page.moveSpeed);
        this.setMoveFrequency(page.moveFrequency);
        this.setPriorityType(page.priorityType);
        this.setWalkAnime(page.walkAnime);
        this.setStepAnime(page.stepAnime);
        this.setDirectionFix(page.directionFix);
        this.setThrough(page.through);
        this.setMoveRoute(page.moveRoute);
        this._moveType = page.moveType;
        this._trigger = page.trigger;
        if (this._trigger === 4) {
            this._interpreter = new Game_Interpreter();
        } else {
            this._interpreter = null;
        }

        this.reloadColliders();
        this.initialPosition();
        this._typeRandomDir = null;
        this._typeTowardPlayer = null;
        var notes = this.notes(true);
        var ignore = /<ignoreCharas:(.*?)>/i.exec(notes);
        this._ignoreCharacters = [];
        if (ignore) {
            this._ignoreCharacters = ignore[1].split(',').map(function (s) {
                return QPlus.charaIdToId(s);
            })
        }
        this.setupComments();

        //qsprite
        var match = /<direction:(\d+?)>/i.exec(this.comments());
        if (match) {
            this.setDirection(Number(match[1]));
        }
    }

    isOriginalPattern() {
        return this.pattern() === this._originalPattern;
    }

    resetPattern() {
        this.setPattern(this._originalPattern);
    }

    checkEventTriggerAuto() {
        if (this._trigger === 3) {
            this.start();
        }
    }

    update() {
        super.update();
        this.checkEventTriggerAuto();
        this.updateParallel();
    }

    updateParallel() {
        if (this._interpreter) {
            if (!this._interpreter.isRunning()) {
                this._interpreter.setup(this.list(), this._eventId);
            }
            this._interpreter.update();
        }
    }

    locate(x, y) {
        super.locate(x, y);
        this._prelockDirection = 0;
    }

    forceMoveRoute(moveRoute) {
        super.forceMoveRoute(moveRoute);
        this._prelockDirection = 0;
    }

    //ABS

    //   var Alias_Game_Event_comments =comments;
    comments(withNotes) {
        var comments = super.comments(withNotes);
        if (!this._aiSight) return comments;
        var range = this._aiRange / Movement.tileSize;
        return comments + '<sight:circle,' + range + ', AI, 0>';
    };

    canSeeThroughChara(chara) {
        if (typeof chara.team === 'function' && chara.team() === this.team()) {
            return true;
        } else if (this._isDead || (typeof chara.battler === 'function' && chara.battler() && chara.battler().isDead())) {
            return true;
        }
        return super.canSeeThroughChara(chara);
    };

    disableEnemy() {
        GameGlobal.$gameSystem.disableEnemy(this._mapId, this._eventId);
        this.clearABS();
        this._battler = null;
    };

    team() {
        return this._battler ? this._team : 0;
    };

    usableSkills() {
        if (!this._battler) return [];
        return this._skillList.filter(function (skillId) {
            return !this._skillCooldowns[skillId];
        }, this);
    };

    // var Alias_Game_Event_bestTarget =bestTarget;
    bestTarget() {
        var best = super.bestTarget();
        if (!best && this.team() === 2) {
            return GameGlobal.$gamePlayer;
        }
        return best;
    };

    updateABS() {
        if (GameGlobal.$gameSystem.isDisabled(this._mapId, this._eventId)) return;
        super.updateABS();
        if (this.page() && !this._isDead && this.isNearTheScreen() && this.validAI()) {
            return this.updateAI(this._aiType);
        }
        if (this._respawn >= 0) {
            this.updateRespawn();
        }
    };

    validAI() {
        // if added new AI types, expand here with its name so the
        // updateAI will run
        return this._aiType === "simple";
    };

    updateAI(type) {
        if (type === 'simple') {
            return this.updateAISimple();
        }
        // to add more AI types, alias this function
        // and do something similar to above
    };

    updateAISimple() {
        var bestTarget = this.bestTarget();
        if (!bestTarget) return;
        var targetId = bestTarget.charaId();
        if (!this.AISimpleInRange(bestTarget)) return;
        this.AISimpleAction(bestTarget, this.AISimpleGetAction(bestTarget));
    };

    removeAgro(charaId) {
        if (!this._agro) return;
        super.removeAgro(charaId);
        if (!this.inCombat() && !this._endWait) {
            this.endCombat();
        }
    };

    AISimpleInRange(bestTarget) {
        var targetId = bestTarget.charaId();
        if (this.isTargetInRange(bestTarget)) {
            this._agro.placeInCombat();
            if (!this._agro.has(targetId)) {
                this._aiWait = E8ABS.aiWait;
                this.addAgro(targetId);
                if (this._aiPathfind) {
                    this.clearPathfind();
                }
            }
            if (this._endWait) {
                this.removeWaitListener(this._endWait);
                this._endWait = null;
            }
            return true;
        } else {
            if (this._agro.has(targetId)) {
                if (this._aiPathfind) {
                    this.clearPathfind();
                }
                this._endWait = this.wait(90).then(function () {
                    this._endWait = null;
                    this.endCombat();
                }.bind(this));
                this.removeAgro(targetId);
            }
            if (this._endWait && this.canMove()) {
                this.moveTowardCharacter(bestTarget);
            }
            return false;
        }
        return false;
    };

    AISimpleGetAction(bestTarget) {
        var bestAction = null;
        if (this._aiWait >= E8ABS.aiWait) {
            this.turnTowardCharacter(bestTarget);
            bestAction = ABSManager.bestAction(this.charaId());
            this._aiWait = 0;
        } else {
            this._aiWait++;
        }
        return bestAction;
    };

    AISimpleAction(bestTarget, bestAction) {
        if (bestAction) {
            var skill = this.useSkill(bestAction);
            if (skill) skill._target = bestTarget;
        } else if (this.canMove()) {
            if (this._aiPathfind) {
                var dx = bestTarget.cx() - this.cx();
                var dy = bestTarget.cy() - this.cy();
                var mw = this.collider('collision').width + bestTarget.collider('collision').width;
                var mh = this.collider('collision').height + bestTarget.collider('collision').height;
                if (Math.abs(dx) <= mw && Math.abs(dy) <= mh) {
                    this.clearPathfind();
                    this.moveTowardCharacter(bestTarget);
                } else {
                    this.initChase(bestTarget.charaId());
                }
            } else {
                this.moveTowardCharacter(bestTarget);
            }
        }
    };

    isTargetInRange(target) {
        if (!target) return false;
        if (this._aiSight) {
            var prev = this._sight.range;
            if (this.inCombat()) {
                this._sight.range = this._aiRange + Movement.tileSize * 3;
            } else {
                this._sight.range = this._aiRange;
            }
            this._sight.range /= Movement.tileSize;
            if (prev !== this._sight.range) {
                if (this._sight.base) {
                    this._sight.base.kill = true;
                    this._sight.base.id = 'sightOld' + this.charaId();
                }
                this._sight.base = null;
                this._sight.reshape = true;
            }
            if (this._sight.targetId !== target.charaId()) {
                delete this._sight.cache.charas[this._sight.targetId];
                this._sight.targetId = target.charaId();
                this._sight.reshape = true;
            }
            if (this._sight.reshape) {
                this.updateSight();
            }
            var key = [this._mapId, this._eventId, this._sight.handler];
            return GameGlobal.$gameSelfSwitches.value(key);
        }
        var dx = Math.abs(target.cx() - this.cx());
        var dy = Math.abs(target.cy() - this.cy());
        var range = this._aiRange + (this.inCombat() ? 96 : 0);
        return dx <= range && dy <= range;
    };

    updateRespawn() {
        if (this._respawn === 0) {
            this.respawn();
        } else {
            this._respawn--;
        }
    };

    respawn() {
        this._erased = false;
        this.refresh();
        this.findRespawnLocation();
        this.setupBattler();
    };

    endCombat() {
        if (this._aiPathfind) {
            this.clearPathfind();
        }
        this.clearAgro();
        if (this._aiPathfind) {
            var x = this.event().x * Movement.tileSize;
            var y = this.event().y * Movement.tileSize;
            this.initPathfind(x, y, {
                smart: 1,
                adjustEnd: true
            });
        } else {
            this.findRespawnLocation();
        }
        this.refresh();
    };

    findRespawnLocation() {
        var x = this.event().x * Movement.tileSize;
        var y = this.event().y * Movement.tileSize;
        if (this.canPixelPass(x, y, 5)) {
            this.setPixelPosition(x, y);
            this.straighten();
            this.refreshBushDepth();
            return;
        }
        var dist = Math.min(this.collider('collision').width, this.collider('collision').height);
        dist = Math.max(dist / 2, this.moveTiles());
        var open = [x + ',' + y];
        var closed = [];
        var current;
        var x2;
        var y2;
        while (open.length) {
            current = open.shift();
            closed.push(current);
            current = current.split(',').map(Number);
            var passed;
            for (var i = 1; i < 5; i++) {
                var dir = i * 2;
                x2 = Math.round(GameGlobal.$gameMap.roundPXWithDirection(current[0], dir, dist));
                y2 = Math.round(GameGlobal.$gameMap.roundPYWithDirection(current[1], dir, dist));
                if (this.canPixelPass(x2, y2, 5)) {
                    passed = true;
                    break;
                }
                var key = x2 + ',' + y2;
                if (!closed.contains(key) && !open.contains(key)) {
                    open.push(key);
                }
            }
            if (passed) break;
        }
        this.setPixelPosition(x2, y2);
        this.straighten();
        this.refreshBushDepth();
    };

    onDeath() {
        if (this._onDeath) {
            try {
                eval(this._onDeath);
            } catch (e) {
                var id = this.battler()._enemyId;
                console.error('Error with `onDeath` meta inside enemy ' + id, e);
            }
        }
        if (this._agro.has(0)) {
            var exp = this.battler().exp();
            GameGlobal.$gamePlayer.battler().gainExp(exp);
            if (exp > 0) {
                ABSManager.startPopup('E8ABS-EXP', {
                    x: GameGlobal.$gamePlayer.cx(), y: GameGlobal.$gamePlayer.cy(),
                    string: 'Exp: ' + exp
                });
            }
            this.setupLoot();
        }
        this.clearABS();
        this._respawn = Number(this.battler().enemy().meta.respawn) || -1;
        this._isDead = true;
        if (!this._dontErase) this.erase();
    };

    setupLoot() {
        var x, y;
        var loot = [];
        this.battler().makeDropItems().forEach(function (item) {
            x = this.x + (Math.random() / 2) - (Math.random() / 2);
            y = this.y + (Math.random() / 2) - (Math.random() / 2);
            var type = 0;
            if (DataManager.isWeapon(item)) type = 1;
            if (DataManager.isArmor(item)) type = 2;
            loot.push(ABSManager.createItem(x, y, item.id, type));
        }.bind(this));
        if (this.battler().gold() > 0) {
            x = this.x + (Math.random() / 2) - (Math.random() / 2);
            y = this.y + (Math.random() / 2) - (Math.random() / 2);
            loot.push(ABSManager.createGold(x, y, this.battler().gold()));
        }
        if (this.battler().enemy().meta.autoLoot) {
            var prevAoeLoot = E8ABS.aoeLoot;
            E8ABS.aoeLoot = false;
            loot.forEach(function (loot) {
                loot.collectDrops();
            });
        }
    };

    onTargetingEnd() {
        var skill = this._groundTargeting;
        var target = skill.targets[Math.floor(Math.random() * skill.targets.length)];
        var w = skill.collider.width;
        var h = skill.collider.height;
        var x = target.cx() - w / 2;
        var y = target.cy() - h / 2;
        skill.collider.moveTo(x, y);
        skill.picture.move(x + w / 2, y + h / 2);
        super.onTargetingEnd();
    };

    //movement

    initialPosition() {
        var ox = /<ox[=|:](-?[0-9]+)>/i.exec(this.comments(true)) || 0;
        var oy = /<oy[=|:](-?[0-9]+)>/i.exec(this.comments(true)) || 0;
        if (ox) ox = Number(ox[1]) || 0;
        if (oy) oy = Number(oy[1]) || 0;
        var nextOffset = new Point(ox, oy);
        if (this._initialOffset) {
            ox -= this._initialOffset.x;
            oy -= this._initialOffset.y;
        }
        this._initialOffset = nextOffset;
        this.setPixelPosition(this.px + ox, this.py + oy);
    };

    defaultColliderConfig() {
        return Movement.eventCollider;
    };

    ignoreCharacters(type) {
        var ignores = super.ignoreCharacters(type);
        return ignores.concat(this._ignoreCharacters);
    };

    updateStop() {
        if (this._locked) {
            this._freqCount = this.freqThreshold();
            this.resetStopCount();
        }
        super.updateStop();
        if (!this.isMoveRouteForcing()) {
            this.updateSelfMovement();
        }
    };

    updateSelfMovement() {
        if (!this._locked && this.isNearTheScreen()) {
            if (this._freqCount < this.freqThreshold()) {
                switch (this._moveType) {
                    case 1:
                        this.moveTypeRandom();
                        break;
                    case 2:
                        this.moveTypeTowardPlayer();
                        break;
                    case 3:
                        this.moveTypeCustom();
                        break;
                }
            } else if (this.checkStop(this.stopCountThreshold())) {
                this._freqCount = 0;
            }
        }
    };

    // TODO stop random dir from reseting every frame if event can't move
    moveTypeRandom() {
        if (this._freqCount === 0 || this._typeRandomDir === null) {
            this._typeRandomDir = 2 * (Math.randomInt(4) + 1);
        }
        if (!this.canPixelPass(this._px, this._py, this._typeRandomDir)) {
            this._typeRandomDir = 2 * (Math.randomInt(4) + 1);
        }
        this.moveStraight(this._typeRandomDir);
    };

    moveTypeTowardPlayer() {
        if (this.isNearThePlayer()) {
            if (this._freqCount === 0 || this._typeTowardPlayer === null) {
                this._typeTowardPlayer = Math.randomInt(6);
            }
            switch (this._typeTowardPlayer) {
                case 0: case 1: case 2: case 3: {
                    this.moveTowardPlayer();
                    break;
                }
                case 4: {
                    this.moveTypeRandom();
                    break;
                }
                case 5: {
                    this.moveForward();
                    break;
                }
            }
        } else {
            this.moveTypeRandom();
        }
    };

    checkEventTriggerTouch(x, y) {
        if (!GameGlobal.$gameMap.isEventRunning()) {
            if (this._trigger === 2 && !this.isJumping() && this.isNormalPriority()) {
                var collider = this.collider('collision');
                var prevX = collider.x;
                var prevY = collider.y;
                collider.moveTo(x, y);
                var collided = false;
                ColliderManager.getCharactersNear(collider, (chara) => {
                    if (chara.GetConstructorType()) return false;
                    collided = chara.collider('collision').intersects(collider);
                    return 'break';
                });
                collider.moveTo(prevX, prevY);
                if (collided) {
                    this._stopCount = 0;
                    this._freqCount = this.freqThreshold();
                    this.start();
                }
            }
        }
    };

    charaId() {
        return this.eventId();
    };

    notes(withComments) {
        var notes = this.event() ? this.event().note : '';
        return notes + (withComments ? this.comments() : '');
    };

    comments(withNotes) {
        var notes = '';
        if (this.event()) {
            notes = this.event().note;
        }
        return this._comments + (withNotes ? notes : '');
    };

    setupComments() {
        this._comments = '';
        if (this.page() && this.list()) {
            this._comments = this.list().filter(function (list) {
                return list.code === 108 || list.code === 408;
            }).map(function (list) {
                return list.parameters;
            }).join('\n')
        }
    };

    setSelfSwitch(selfSwitch, bool) {
        var mapId = this._mapId;
        var eventId = this._eventId;
        if (!mapId || !eventId) return;
        var key = [mapId, eventId, selfSwitch];
        GameGlobal.$gameSelfSwitches.setValue(key, bool);
    };

    showGauge() {
        return this.inCombat() && !this.battler()._hideHpBar;
    }

    GetConstructorType() {
        return "Game_Event"
    }
}