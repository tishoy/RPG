import Game_Character from './Game_Character'
import Game_Followers from './Game_Followers'
import Graphics from '../core/graphics'
import Input from '../core/input'
import ConfigManager from '../managers/ConfigManager'
import TouchInput from '../core/touchInput'
import E8ABS from '../18ext/E8ABS'
import Movement from '../core/movement'
import ColliderManager from '../managers/ColliderManager'
import SceneManager from '../managers/SceneManager'
import Game_CharacterBase from './Game_CharacterBase'
/**
 * create by 18tech
 */
export default class Game_Player extends Game_Character {
    constructor() {
        super();
        this.setTransparent(GameGlobal.$dataSystem.optTransparent);
        this.initialize();
    }

    initialize() {
        super.initialize();
    }

    initMembers() {
        super.initMembers();
        this._vehicleType = 'walk';
        this._vehicleGettingOn = false;
        this._vehicleGettingOff = false;
        this._dashing = false;
        this._needsMapReload = false;
        this._transferring = false;
        this._newMapId = 0;
        this._newX = 0;
        this._newY = 0;
        this._newDirection = 0;
        this._fadeType = 0;
        this._followers = new Game_Followers();
        this._encounterCount = 0;
        this._lastMouseRequested = 0;
        this._requestMouseMove = true;
        this._movingWithMouse = true;
        this._smartMove = Movement.smartMove;


        // 角色表情
        // var char = this.followers().follower(0);
        // char._faceData.enabled = true;
        // char._faceData.mode = 3;
        // char._faceData.needRefresh = true;

        this.setMoveSpeed(3);
    }

    clearTransferInfo() {
        this._transferring = false;
        this._newMapId = 0;
        this._newX = 0;
        this._newY = 0;
        this._newDirection = 0;
    }

    followers() {
        return this._followers;
    }

    defaultColliderConfig() {
        return Movement.playerCollider;
    }

    refresh() {
        this.reloadColliders();
        var actor = GameGlobal.$gameParty.leader();
        var characterName = actor ? actor.characterName() : '';
        var characterIndex = actor ? actor.characterIndex() : 0;
        this.setImage(characterName, characterIndex);
        this._followers.refresh();
        if (this.battler() && this._battlerId !== this.battler()._actorId) {
            this.setupBattler();
        }
    }

    battler() {
        return this.actor();
    }

    setupBattler() {
        if (!this.battler()) return;
        this.clearABS();
        this._battlerId = this.battler()._actorId;
        this.battler()._charaId = 0;
        GameGlobal.$gameSystem.loadClassABSKeys();
        GameGlobal.$gameSystem.changeABSWeaponSkills({});
        this.battler().initWeaponSkills();
        this._isDead = false;
    };

    team() {
        return 1;
    };

    isStopping() {
        if (this._vehicleGettingOn || this._vehicleGettingOff) {
            return false;
        }
        return super.isStopping();
    }

    reserveTransfer(mapId, x, y, d, fadeType) {
        this._transferring = true;
        this._newMapId = mapId;
        this._newX = x;
        this._newY = y;
        this._newDirection = d;
        this._fadeType = fadeType;
    }

    requestMapReload() {
        this._needsMapReload = true;
    }

    isTransferring() {
        return this._transferring;
    }

    newMapId() {
        return this._newMapId;
    }

    fadeType() {
        return this._fadeType;
    }

    performTransfer() {
        if (this.isTransferring()) {
            if (this._newMapId !== GameGlobal.$gameMap.mapId() || this._needsMapReload) {
                if (this._agro) this._agro.clear();
            }
        }
        if (this.isTransferring()) {
            this.setDirection(this._newDirection);
            if (this._newMapId !== GameGlobal.$gameMap.mapId() || this._needsMapReload) {
                GameGlobal.$gameMap.setup(this._newMapId);
                this._needsMapReload = false;
            }
            this.locate(this._newX, this._newY);
            this.refresh();
            this.clearTransferInfo();
        }
    }

    isMapPassable(x, y, d) {
        var vehicle = this.vehicle();
        if (vehicle) {
            return vehicle.isMapPassable(x, y, d);
        } else {
            return super.isMapPassable(x, y, d);
        }
    }

    vehicle() {
        return GameGlobal.$gameMap.vehicle(this._vehicleType);
    }

    isInBoat() {
        return this._vehicleType === 'boat';
    }

    isInShip() {
        return this._vehicleType === 'ship';
    }

    isInAirship() {
        return this._vehicleType === 'airship';
    }

    isInVehicle() {
        return this.isInBoat() || this.isInShip() || this.isInAirship();
    }

    isNormal() {
        return this._vehicleType === 'walk' && !this.isMoveRouteForcing();
    }

    isDashing() {
        return this._dashing;
    }

    isDebugThrough() {
        return Input.isPressed('control') && GameGlobal.$gameTemp.isPlaytest();
    }

    isCollided(x, y) {
        if (this.isThrough()) {
            return false;
        } else {
            return this.pos(x, y) || this._followers.isSomeoneCollided(x, y);
        }
    }

    centerX() {
        return (Graphics.width / GameGlobal.$gameMap.tileWidth() - 1) / 2.0;
    }

    centerY() {
        return (Graphics.height / GameGlobal.$gameMap.tileHeight() - 1) / 2.0;
    }

    center(x, y) {
        return GameGlobal.$gameMap.setDisplayPos(x - this.centerX(), y - this.centerY());
    }

    locate(x, y) {
        super.locate(x, y);
        this.center(x, y);
        this.makeEncounterCount();
        if (this.isInVehicle()) {
            this.vehicle().refresh();
        }
        this._followers.synchronize(x, y, this.direction());
    }

    increaseSteps() {
        super.increaseSteps();
        if (this.isNormal()) {
            GameGlobal.$gameParty.increaseSteps();
        }
    }

    makeEncounterCount() {
        var n = GameGlobal.$gameMap.encounterStep();
        this._encounterCount = Math.randomInt(n) + Math.randomInt(n) + 1;
    }

    makeEncounterTroopId() {
        var encounterList = [];
        var weightSum = 0;
        GameGlobal.$gameMap.encounterList().forEach(function (encounter) {
            if (this.meetsEncounterConditions(encounter)) {
                encounterList.push(encounter);
                weightSum += encounter.weight;
            }
        }, this);
        if (weightSum > 0) {
            var value = Math.randomInt(weightSum);
            for (var i = 0; i < encounterList.length; i++) {
                value -= encounterList[i].weight;
                if (value < 0) {
                    return encounterList[i].troopId;
                }
            }
        }
        return 0;
    }

    meetsEncounterConditions(encounter) {
        return (encounter.regionSet.length === 0 ||
            encounter.regionSet.contains(this.regionId()));
    }

    executeEncounter() {
        if (!GameGlobal.$gameMap.isEventRunning() && this._encounterCount <= 0) {
            this.makeEncounterCount();
            // var troopId = this.makeEncounterTroopId();
            // if (GameGlobal.$dataTroops[troopId]) {
            //     BattleManager.setup(troopId, true, false);
            //     BattleManager.onEncounter();
            //     return true;
            // } else {
            //     return false;
            // }
        } else {
            return false;
        }
    }

    moveByInput() {
        if (!this.startedMoving() && this.canMove()) {
            if (this.triggerAction()) return;
            var direction = Movement.diagonal ? Input.dir8 : Input.dir4;
            if (direction > 0) {
                this.clearMouseMove();
            } else if (GameGlobal.$gameTemp.isDestinationValid()) {
                if (!Movement.moveOnClick) {
                    GameGlobal.$gameTemp.clearDestination();
                    return;
                }
                this.requestMouseMove();
                if (this._requestMouseMove) {
                    var x = GameGlobal.$gameTemp.destinationPX();
                    var y = GameGlobal.$gameTemp.destinationPY();
                    return this.moveByMouse(x, y);
                }
            }
            // need Qinput
            if (false && Input.preferGamepad() && GameGlobal.$gameMap.offGrid()) {
                this.moveWithAnalog();
            } else {
                if ([4, 6].contains(direction)) {
                    this.moveInputHorizontal(direction);
                } else if ([2, 8].contains(direction)) {
                    this.moveInputVertical(direction);
                } else if ([1, 3, 7, 9].contains(direction) && Movement.diagonal) {
                    this.moveInputDiagonal(direction);
                }
            }
        }
        // if (!this.isMoving() && this.canMove()) {
        //     var direction = this.getInputDirection();
        //     if (direction > 0) {
        //         GameGlobal.$gameTemp.clearDestination();
        //     } else if (GameGlobal.$gameTemp.isDestinationValid()) {
        //         var x = GameGlobal.$gameTemp.destinationX();
        //         var y = GameGlobal.$gameTemp.destinationY();
        //         direction = this.findDirectionTo(x, y);
        //     }
        //     if (direction > 0) {
        //         this.executeMove(direction);
        //     }
        // }
    }

    canMove() {
        if (this._posePlaying && this._posePlaying.lock) return false;
        if (E8ABS.lockTargeting && this._groundTargeting) {
            return false;
        }
        if (GameGlobal.$gameMap.isEventRunning() || GameGlobal.$gameMessage.isBusy()) {
            return false;
        }
        if (this.isMoveRouteForcing() || this.areFollowersGathering()) {
            return false;
        }
        if (this._vehicleGettingOn || this._vehicleGettingOff) {
            return false;
        }
        if (this.isInVehicle() && !this.vehicle().canMove()) {
            return false;
        }
        return true && super.canMove();
    }

    getInputDirection() {
        return Input.dir4;
    }

    executeMove(direction) {
        this.moveStraight(direction);
    }

    update(sceneActive) {
        var lastScrolledX = this.scrolledX();
        var lastScrolledY = this.scrolledY();
        var wasMoving = this.isMoving();
        this.updateDashing();
        if (sceneActive) {
            this.moveByInput();
        }
        super.update();
        this.updateScroll(lastScrolledX, lastScrolledY);
        this.updateVehicle();
        if (!this.startedMoving()) {
            this.updateNonmoving(wasMoving);
        }
        this._followers.update();
    }

    updateDashing() {
        if (this.startedMoving()) {
            return;
        }
        if (this.canMove() && !this.isInVehicle() && !GameGlobal.$gameMap.isDashDisabled()) {
            this._dashing = this.isDashButtonPressed() || GameGlobal.$gameTemp.isDestinationValid();
        } else {
            this._dashing = false;
        }
    }

    isDashButtonPressed() {
        var shift = Input.isPressed('shift');
        if (ConfigManager.alwaysDash) {
            return !shift;
        } else {
            return shift;
        }
    }

    updateScroll(lastScrolledX, lastScrolledY) {
        var x1 = lastScrolledX;
        var y1 = lastScrolledY;
        var x2 = this.scrolledX();
        var y2 = this.scrolledY();
        if (y2 > y1 && y2 > this.centerY()) {
            GameGlobal.$gameMap.scrollDown(y2 - y1);
        }
        if (x2 < x1 && x2 < this.centerX()) {
            GameGlobal.$gameMap.scrollLeft(x1 - x2);
        }
        if (x2 > x1 && x2 > this.centerX()) {
            GameGlobal.$gameMap.scrollRight(x2 - x1);
        }
        if (y2 < y1 && y2 < this.centerY()) {
            GameGlobal.$gameMap.scrollUp(y1 - y2);
        }
    }

    updateVehicle() {
        if (this.isInVehicle() && !this.areFollowersGathering()) {
            if (this._vehicleGettingOn) {
                this.updateVehicleGetOn();
            } else if (this._vehicleGettingOff) {
                this.updateVehicleGetOff();
            } else {
                this.vehicle().syncWithPlayer();
            }
        }
    }

    updateVehicleGetOn() {
        if (!this.areFollowersGathering() && !this.isMoving()) {
            this.setDirection(this.vehicle().direction());
            this.setMoveSpeed(this.vehicle().moveSpeed());
            this._vehicleGettingOn = false;
            this.setTransparent(true);
            if (this.isInAirship()) {
                this.setThrough(true);
            }
            this.vehicle().getOn();
        }
    }

    updateVehicleGetOff() {
        if (!this.areFollowersGathering() && this.vehicle().isLowest()) {
            this._vehicleGettingOff = false;
            this._vehicleType = 'walk';
            this.setTransparent(false);
        }
    }

    triggerAction() {
        if (this.canMove()) {
            if (this.triggerButtonAction()) {
                return true;
            }
            if (this.triggerTouchAction()) {
                return true;
            }
        }
        return false;
    }

    triggerButtonAction() {
        if (Input.isTriggered('ok')) {
            if (this.getOnOffVehicle()) {
                return true;
            }
            this.checkEventTriggerHere([0]);
            if (GameGlobal.$gameMap.setupStartingEvent()) {
                return true;
            }
            this.checkEventTriggerThere([0, 1, 2]);
            if (GameGlobal.$gameMap.setupStartingEvent()) {
                return true;
            }
        }
        return false;
    }

    triggerTouchAction() {
        if (GameGlobal.$gameTemp.isDestinationValid()) {
            var dist = this.pixelDistanceFrom(GameGlobal.$gameTemp.destinationPX(), GameGlobal.$gameTemp.destinationPY());
            if (dist <= Movement.tileSize * 1.5) {
                var dx = GameGlobal.$gameTemp.destinationPX() - this.cx();
                var dy = GameGlobal.$gameTemp.destinationPY() - this.cy();
                if (Math.abs(dx) < this.moveTiles() / 2 && Math.abs(dy) < this.moveTiles() / 2) {
                    return false;
                }
                var radian = Math.atan2(dy, dx);
                radian += radian < 0 ? 2 * Math.PI : 0;
                var dir = this.radianToDirection(radian, true);
                var horz = dir;
                var vert = dir;
                if ([1, 3, 7, 9].contains(dir)) {
                    if (dir === 1 || dir === 7) horz = 4;
                    if (dir === 1 || dir === 3) vert = 2;
                    if (dir === 3 || dir === 9) horz = 6;
                    if (dir === 7 || dir === 9) vert = 8;
                }
                var x1 = GameGlobal.$gameMap.roundPXWithDirection(this._px, horz, this.moveTiles());
                var y1 = GameGlobal.$gameMap.roundPYWithDirection(this._py, vert, this.moveTiles());
                this.startMapEvent(x1, y1, [0, 1, 2], true);
                if (!GameGlobal.$gameMap.isAnyEventStarting()) {
                    if (this.checkCounter([0, 1, 2], GameGlobal.$gameTemp.destinationPX(), GameGlobal.$gameTemp.destinationPY())) {
                        this.clearMouseMove();
                        this.setDirection(dir);
                        return true;
                    }
                } else {
                    this.clearMouseMove();
                    this.setDirection(dir);
                    return true;
                }
            }
        }
        return false;
    };

    triggerTouchActionD1(x1, y1) {
        if (GameGlobal.$gameMap.airship().pos(x1, y1)) {
            if (TouchInput.isTriggered() && this.getOnOffVehicle()) {
                return true;
            }
        }
        this.checkEventTriggerHere([0]);
        return GameGlobal.$gameMap.setupStartingEvent();
    }

    triggerTouchActionD2(x2, y2) {
        if (GameGlobal.$gameMap.boat().pos(x2, y2) || GameGlobal.$gameMap.ship().pos(x2, y2)) {
            if (TouchInput.isTriggered() && this.getOnVehicle()) {
                return true;
            }
        }
        if (this.isInBoat() || this.isInShip()) {
            if (TouchInput.isTriggered() && this.getOffVehicle()) {
                return true;
            }
        }
        this.checkEventTriggerThere([0, 1, 2]);
        return GameGlobal.$gameMap.setupStartingEvent();
    }

    triggerTouchActionD3(x2, y2) {
        if (GameGlobal.$gameMap.isCounter(x2, y2)) {
            this.checkEventTriggerThere([0, 1, 2]);
        }
        return GameGlobal.$gameMap.setupStartingEvent();
    }

    updateEncounterCount() {
        if (this.canEncounter()) {
            this._encounterCount -= this.encounterProgressValue();
        }
    }

    canEncounter() {
        return (!GameGlobal.$gameParty.hasEncounterNone() && GameGlobal.$gameSystem.isEncounterEnabled() &&
            !this.isInAirship() && !this.isMoveRouteForcing() && !this.isDebugThrough());
    }

    encounterProgressValue() {
        var value = GameGlobal.$gameMap.isBush(this.x, this.y) ? 2 : 1;
        if (GameGlobal.$gameParty.hasEncounterHalf()) {
            value *= 0.5;
        }
        if (this.isInShip()) {
            value *= 0.5;
        }
        return value;
    }

    checkEventTriggerHere(triggers) {
        if (this.canStartLocalEvents()) {
            this.startMapEvent(this.x, this.y, triggers, false);
        }
    }

    checkEventTriggerThere(triggers) {
        if (this.canStartLocalEvents()) {
            var direction = this.direction();
            var x1 = this.x;
            var y1 = this.y;
            var x2 = GameGlobal.$gameMap.roundXWithDirection(x1, direction);
            var y2 = GameGlobal.$gameMap.roundYWithDirection(y1, direction);
            this.startMapEvent(x2, y2, triggers, true);
            if (!GameGlobal.$gameMap.isAnyEventStarting() && GameGlobal.$gameMap.isCounter(x2, y2)) {
                var x3 = GameGlobal.$gameMap.roundXWithDirection(x2, direction);
                var y3 = GameGlobal.$gameMap.roundYWithDirection(y2, direction);
                this.startMapEvent(x3, y3, triggers, true);
            }
        }
    }

    checkEventTriggerTouch(x, y) {
        if (this.canStartLocalEvents()) {
            this.startMapEvent(x, y, [1, 2], true);
        }
    }

    canStartLocalEvents() {
        return !this.isInAirship();
    }

    getOnOffVehicle() {
        if (this.isInVehicle()) {
            return this.getOffVehicle();
        } else {
            return this.getOnVehicle();
        }
    }

    getOnVehicle() {
        var direction = this.direction();
        var x1 = this.x;
        var y1 = this.y;
        var x2 = GameGlobal.$gameMap.roundXWithDirection(x1, direction);
        var y2 = GameGlobal.$gameMap.roundYWithDirection(y1, direction);
        if (GameGlobal.$gameMap.airship().pos(x1, y1)) {
            this._vehicleType = 'airship';
        } else if (GameGlobal.$gameMap.ship().pos(x2, y2)) {
            this._vehicleType = 'ship';
        } else if (GameGlobal.$gameMap.boat().pos(x2, y2)) {
            this._vehicleType = 'boat';
        }
        if (this.isInVehicle()) {
            this._vehicleGettingOn = true;
            if (!this.isInAirship()) {
                this.forceMoveForward();
            }
            this.gatherFollowers();
        }
        return this._vehicleGettingOn;
    }

    getOffVehicle() {
        if (this.vehicle().isLandOk(this.x, this.y, this.direction())) {
            if (this.isInAirship()) {
                this.setDirection(2);
            }
            this._followers.synchronize(this.x, this.y, this.direction());
            this.vehicle().getOff();
            if (!this.isInAirship()) {
                this.forceMoveForward();
                this.setTransparent(false);
            }
            this._vehicleGettingOff = true;
            this.setMoveSpeed(4);
            this.setThrough(false);
            this.makeEncounterCount();
            this.gatherFollowers();
        }
        return this._vehicleGettingOff;
    }

    forceMoveForward() {
        this.setThrough(true);
        this.moveForward();
        this.setThrough(false);
    }

    isOnDamageFloor() {
        return GameGlobal.$gameMap.isDamageFloor(this.x, this.y) && !this.isInAirship();
    }

    moveStraight(d) {
        if (this.canPass(this.x, this.y, d)) {
            this._followers.updateMove();
        }
        super.moveStraight(d);
    }

    moveDiagonally(horz, vert) {
        if (this.canPassDiagonally(this.x, this.y, horz, vert)) {
            this._followers.updateMove();
        }
        super.moveDiagonally(horz, vert);
    }

    jump(xPlus, yPlus) {
        super.jump(xPlus, yPlus);
        this._followers.jumpAll();
    }

    showFollowers() {
        this._followers.show();
    }

    hideFollowers() {
        this._followers.hide();
    }

    gatherFollowers() {
        this._followers.gather();
    }

    areFollowersGathering() {
        return this._followers.areGathering();
    }

    areFollowersGathered() {
        return this._followers.areGathered();
    }

    canInput() {
        if (GameGlobal.$gameMap.isEventRunning() || GameGlobal.$gameMessage.isBusy()) {
            return false;
        }
        return this.canInputSkill() && !this._groundTargeting;
    };


    usableSkills() {
        return this.battler().skills().filter(function (skill) {
            return !this._skillCooldowns[skill.id];
        }, this).map(function (skill) {
            return skill.id;
        });
    };

    onDeath() {
        this.clearABS();
        this._isDead = true;
        SceneManager.goto(Scene_Gameover);
    };

    onPositionChange() {
        super.onPositionChange();
        // Alias_Game_Player_onPositionChange.call(this);
        if (this._groundTargeting && !E8ABS.lockTargeting) {
            this.onTargetingCancel();
        }
    };

    collidesWithEvent(event, type) {
        if (event.GetConstructorType() === "Game_Loot") {
            return event.collider('interaction').intersects(this.collider(type));
        }
        if (event.GetConstructorType() === "Game_Event" && !event._erased) {
            return event.collider('interaction').intersects(this.collider(type));
        }
        return false;
    };

    updateABS() {
        if (this._isDead) return;
        if (this.battler() && this.canInput()) this.updateABSInput();
        super.updateABS();
        if (this._battlerId !== this.actor()._actorId) {
            this.clearABS();
            this.setupBattler();
        }
    };

    useSkill(skillId) {
        var skill = super.useSkill(skillId, false);
        if (skill) skill._target = this.bestTarget();
    }

    updateABSInput() {
        // var absKeys = GameGlobal.$gameSystem.absKeys();
        // for (var key in absKeys) {
        //     if (!absKeys[key]) continue;
        //     var inputs = absKeys[key].input;
        //     for (var i = 0; i < inputs.length; i++) {
        //         var input = inputs[i];
        // if (SceneManager._scene._attack._touching) {
        //     this.useSkill(1);
        // }
        // if (input === 'mouse1' && (TouchInput.isTriggered() || TouchInput.isPressed()) && this.canClick()) {
        //     TouchInput.stopPropagation();
        //     this.useSkill(absKeys[key].skillId);
        // }
        // if (input === 'mouse2' && TouchInput.isCancelled() && this.canClick()) {
        //     TouchInput.stopPropagation();
        //     this.useSkill(absKeys[key].skillId);
        // }
        //     }
        // }
    };

    updateTargeting() {
        return this._selectTargeting ? this.updateSelectTargeting() : this.updateGroundTargeting();
    };

    updateSelectTargeting() {
        // TODO add mouse support
        if (Input.isTriggered('pageup')) {
            Input.stopPropagation();
            this._groundTargeting.index++;
            this.updateSkillTarget();
        }
        if (Input.isTriggered('pagedown')) {
            Input.stopPropagation();
            this._groundTargeting.index--;
            this.updateSkillTarget();
        }
        if (Input.isTriggered('ok')) {
            Input.stopPropagation();
            this.onTargetingEnd();
        }
        if (Input.isTriggered('escape') || TouchInput.isCancelled()) {
            TouchInput.stopPropagation();
            Input.stopPropagation();
            this.onTargetingCancel();
        }
    };

    updateSkillTarget() {
        var skill = this._groundTargeting;
        if (skill.index < 0) skill.index = skill.targets.length - 1;
        if (skill.index >= skill.targets.length) skill.index = 0;
        var target = skill.targets[skill.index];
        var w = skill.collider.width;
        var h = skill.collider.height;
        var x = target.cx() - w / 2;
        var y = target.cy() - h / 2;
        skill.collider.moveTo(x, y);
    };

    updateGroundTargeting() {
        this.updateGroundTargetingPosition();
        if (Input.isTriggered('escape') || TouchInput.isCancelled()) {
            TouchInput.stopPropagation();
            Input.stopPropagation();
            this.onTargetingCancel();
        }
        if (Input.isTriggered('ok') || (this.canClick() && TouchInput.isTriggered()) ||
            E8ABS.quickTarget) {
            if (!this._groundTargeting.isOk) {
                TouchInput.stopPropagation();
                Input.stopPropagation();
                this.onTargetingCancel();
            } else {
                this.onTargetingEnd();
            }
        }
    };

    updateGroundTargetingPosition() {
        var skill = this._groundTargeting;
        var w = skill.collider.width;
        var h = skill.collider.height;
        // Imported.QInput 
        if (false && Input.preferGamepad()) {
            var x1 = skill.collider.center.x;
            var y1 = skill.collider.center.y;
            x1 += Input._dirAxesB.x * 5;
            y1 += Input._dirAxesB.y * 5;
        } else {
            var x1 = GameGlobal.$gameMap.canvasToMapPX(TouchInput.x);
            var y1 = GameGlobal.$gameMap.canvasToMapPY(TouchInput.y);
        }
        var x2 = x1 - w / 2;
        var y2 = y1 - h / 2;
        this.setRadian(Math.atan2(y1 - this.cy(), x1 - this.cx()));
        skill.radian = this._radian;
        skill.collider.moveTo(x2, y2);
        var dx = Math.abs(this.cx() - x2 - w / 2);
        var dy = Math.abs(this.cy() - y2 - h / 2);
        var distance = Math.sqrt(dx * dx + dy * dy);
        skill.isOk = distance <= skill.settings.range;
        skill.collider.color = skill.isOk ? '#00ff00' : '#ff0000';
    };

    beforeSkill(skill) {
        var meta = skill.data.meta;
        //Imported.QInput 
        var isGamepad = false && Input.preferGamepad();
        if (!meta.dontTurn) {
            if (isGamepad && E8ABS.towardsAnalog) {
                var horz = Input._dirAxesB.x;
                var vert = Input._dirAxesB.y;
                if (horz !== 0 || vert !== 0) {
                    this.setRadian(Math.atan2(vert, horz));
                    skill.radian = this._radian;
                }
            } else if (!isGamepad && E8ABS.towardsMouse) {
                var x1 = GameGlobal.$gameMap.canvasToMapPX(TouchInput.x);
                var y1 = GameGlobal.$gameMap.canvasToMapPY(TouchInput.y);
                var x2 = this.cx();
                var y2 = this.cy();
                this.setRadian(Math.atan2(y1 - y2, x1 - x2));
                skill.radian = this._radian;
            }
        }
        if (meta.towardsMove) {
            var radian;
            if (isGamepad) {
                var horz = Input._dirAxesA.x;
                var vert = Input._dirAxesA.y;
                if (horz === 0 && vert === 0) {
                    radian = skill.radian;
                } else {
                    radian = Math.atan2(vert, horz);
                }
            } else {
                var direction = Movement.diagonal ? Input.dir8 : Input.dir4;
                if (direction === 0) {
                    radian = skill.radian;
                } else {
                    radian = this.directionToRadian(direction);
                }
            }
            skill.radian = radian;
        }
        super.beforeSkill(skill);
    };

    makeTargetingSkill(skill) {
        super.makeTargetingSkill(skill);
        if (this._selectTargeting) {
            this.updateSkillTarget();
        }
    };

    moveByMouse(x, y) {
        if (this.triggerTouchAction()) {
            this.clearMouseMove();
            return false;
        }
        this._movingWithMouse = true;
        var half = Movement.tileSize / 2;
        var x2 = x - half;
        var y2 = y - half;
        var dx = Math.abs(this._px - x2);
        var dy = Math.abs(this._py - y2);
        if (dx + dy < this.optTiles()) {
            this.clearMouseMove();
            return false;
        }
        this.initPathfind(x2, y2, {
            smart: 2,
            earlyEnd: true,
            breakable: true,
            adjustEnd: true
        })
        GameGlobal.$gameTemp.setPixelDestination(x, y);
        return true;
    };

    requestMouseMove() {
        if (this._pathfind && !this._pathfind._completed) {
            this._requestMouseMove = false;
            return;
        }
        if (GameGlobal.$gameSystem.anyAbsMouse()) return this.clearMouseMove();
        if (this._groundTargeting) return this.clearMouseMove();
        var currFrame = Graphics.frameCount;
        var dt = currFrame - this._lastMouseRequested;
        if (dt >= 5) {
            this._lastMouseRequested = currFrame;
            this._requestMouseMove = true;
        } else {
            this._requestMouseMove = false;
        }
    };

    clearMouseMove() {
        if (this._movingWithMouse && this._isPathfinding) this.clearPathfind();
        this._requestMouseMove = false;
        this._movingWithMouse = false;
        GameGlobal.$gameTemp.clearDestination();
    };

    moveInputHorizontal(dir) {
        this.moveStraight(dir);
    };

    moveInputVertical(dir) {
        this.moveStraight(dir);
    };

    moveInputDiagonal(dir) {
        var diag = {
            1: [4, 2], 3: [6, 2],
            7: [4, 8], 9: [6, 8]
        }
        this.moveDiagonally(diag[dir][0], diag[dir][1]);
    };

    moveWithAnalog() {
        var horz = Input._dirAxesA.x;
        var vert = Input._dirAxesA.y;
        if (horz === 0 && vert === 0) return;
        var radian = Math.atan2(vert, horz);
        radian += radian < 0 ? Math.PI * 2 : 0;
        this.moveRadian(radian);
    };

    updateNonmoving(wasMoving) {
        if (!GameGlobal.$gameMap.isEventRunning()) {
            if (wasMoving) {
                if (this._freqCount >= this.freqThreshold()) {
                    GameGlobal.$gameParty.onPlayerWalk();
                }
                this.checkEventTriggerHere([1, 2]);
                if (GameGlobal.$gameMap.setupStartingEvent()) return;
            }
            if (this.triggerAction()) return;
            if (wasMoving) {
                if (this._freqCount >= this.freqThreshold()) {
                    this.updateEncounterCount();
                    this._freqCount = 0;
                }
            } else if (!this.isMoving() && !this._movingWithMouse) {
                GameGlobal.$gameTemp.clearDestination();
            }
        }
    };

    updateDashing() {
        if (this.startedMoving()) return;
        if (this.canMove() && !this.isInVehicle() && !GameGlobal.$gameMap.isDashDisabled()) {
            this._dashing = this.isDashButtonPressed() || GameGlobal.$gameTemp.isDestinationValid();
        } else {
            this._dashing = false;
        }
    };

    startMapEvent(x, y, triggers, normal) {
        if (!GameGlobal.$gameMap.isEventRunning()) {
            var collider = this.collider('interaction');
            var x1 = this._px;
            var y1 = this._py;
            collider.moveTo(x, y);
            var events = ColliderManager.getCharactersNear(collider, function (chara) {
                return this.collidesWithEvent(chara, 'interaction');
            }.bind(this));
            collider.moveTo(x1, y1);
            if (events.length === 0) {
                events = null;
                return;
            }
            var cx = this.cx();
            var cy = this.cy();
            events.sort(function (a, b) {
                return a.pixelDistanceFrom(cx, cy) - b.pixelDistanceFrom(cx, cy);
            })
            var event = events.shift();
            while (true) {
                if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
                    event.start();
                }
                if (events.length === 0 || GameGlobal.$gameMap.isAnyEventStarting()) {
                    break;
                }
                event = events.shift();
            }
            events = null;
        }
    };

    collidesWithEvent(event, type) {
        if (event.GetConstructorType() === "Game_Event" && !event._erased) {
            return event.collider('interaction').intersects(this.collider(type));
        }
        return false;
    };

    checkEventTriggerHere(triggers) {
        if (this.canStartLocalEvents()) {
            this.startMapEvent(this.collider('interaction').x, this.collider('interaction').y, triggers, false);
        }
    };

    checkEventTriggerThere(triggers, x2, y2) {
        if (this.canStartLocalEvents()) {
            var direction = this.direction();
            var x1 = this.collider('interaction').x;
            var y1 = this.collider('interaction').y;
            x2 = x2 || GameGlobal.$gameMap.roundPXWithDirection(x1, direction, this.moveTiles());
            y2 = y2 || GameGlobal.$gameMap.roundPYWithDirection(y1, direction, this.moveTiles());
            this.startMapEvent(x2, y2, triggers, true);
            if (!GameGlobal.$gameMap.isAnyEventStarting()) {
                return this.checkCounter(triggers);
            }
        }
    };

    checkCounter(triggers, x2, y2) {
        var direction = this.direction();
        var x1 = this._px;
        var y1 = this._py;
        x2 = x2 || GameGlobal.$gameMap.roundPXWithDirection(x1, direction, this.moveTiles());
        y2 = y2 || GameGlobal.$gameMap.roundPYWithDirection(y1, direction, this.moveTiles());
        var collider = this.collider('interaction');
        collider.moveTo(x2, y2);
        var counter;
        ColliderManager.getCollidersNear(collider, function (tile) {
            if (!tile.isTile) return false;
            if (tile.isCounter && tile.intersects(collider)) {
                counter = tile;
                return 'break';
            }
            return false;
        })
        collider.moveTo(x1, y1);
        if (counter) {
            if ([4, 6].contains(direction)) {
                var dist = Math.abs(counter.center.x - collider.center.x);
                dist += collider.width;
            } else if ([8, 2].contains(direction)) {
                var dist = Math.abs(counter.center.y - collider.center.y);
                dist += collider.height;
            }
            var x3 = GameGlobal.$gameMap.roundPXWithDirection(x1, direction, dist);
            var y3 = GameGlobal.$gameMap.roundPYWithDirection(y1, direction, dist);
            return this.startMapEvent(x3, y3, triggers, true);
        }
        return false;
    };

    airshipHere() {
        // TODO
        return false;
    };

    shipBoatThere(x2, y2) {
        // TODO
        return false;
    };

    // TODO create follower support addon
    moveStraight(d, dist) {
        super.moveStraight(d, dist);
    };

    moveDiagonally(horz, vert) {
        super.moveDiagonally(horz, vert);
    };

    canClick() {
        return !TouchInput.insideWindow;
    };

    charaId() {
        return 0;
    };

    actor() {
        return GameGlobal.$gameParty.leader();
    };

    notes() {
        return this.actor() ? this.actor().actor().note : '';
    };

    onPathfindComplete() {
        super.onPathfindComplete();
        if (this._movingWithMouse) {
            this.clearMouseMove();
        }
    }

    GetConstructorType() {
        return "Game_Player"
    }
}