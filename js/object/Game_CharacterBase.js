import ImageManager from '../managers/ImageManager';
import Graphics from '../core/graphics';
import ABSManager from '../managers/ABSManager'
import Movement from '../core/movement'
import E8ABS from '../18ext/E8ABS'
import E8Plus from '../18ext/E8Plus'
import ColliderManager from '../managers/ColliderManager'
import Box_Collider from '../collider/Box_Collider'
import Game_CharacterAgro from './Game_CharacterAgro'
import Skill_Sequencer from '../18ext/Skill_Sequencer'
import Circle_Collider from '../collider/Circle_Collider'
import JsonEx from '../core/jsonEx'
import Sprite_SkillCollider from '../sprites/Sprite_SkillCollider';
/**
 * create by 18tech
 * 启动QSprite this.qsprite();
 */
export default class Game_CharacterBase {
    constructor() {
    }

    get x() { return this._x; }
    get y() { return this._y; }

    initialize() {
        this.initMembers();
    }

    initMembers() {
        this._x = 0;
        this._y = 0;
        this._realX = 0;
        this._realY = 0;
        this._moveSpeed = 4;
        this._moveFrequency = 6;
        this._opacity = 255;
        this._blendMode = 0;
        this._direction = 2;
        this._pattern = 1;
        this._priorityType = 1;
        this._tileId = 0;
        this._characterName = '';
        this._characterIndex = 0;
        this._isObjectCharacter = false;
        this._walkAnime = true;
        this._stepAnime = false;
        this._directionFix = false;
        this._through = false;
        this._transparent = false;
        this._bushDepth = 0;
        this._animationId = 0;
        this._balloonId = 0;
        this._animationPlaying = false;
        this._balloonPlaying = false;
        this._animationCount = 0;
        this._stopCount = 0;
        this._jumpCount = 0;
        this._jumpPeak = 0;
        this._movementSuccess = true;

        this._px = 0;
        this._py = 0;
        this._realPX = 0;
        this._realPY = 0;
        this._radian = this.directionToRadian(this._direction);
        this._forwardRadian = this.directionToRadian(this._direction);
        this._adjustFrameSpeed = false;
        this._freqCount = 0;
        this._diagonal = false;
        this._currentRad = 0;
        this._targetRad = 0;
        this._pivotX = 0;
        this._pivotY = 0;
        this._radiusL = 0;
        this._radisuH = 0;
        this._angularSpeed;
        this._passabilityLevel = 0; // TODO
        this._isMoving = false;
        this._smartMove = 0;
        this._colliders = null;
        this._overrideColliders = {};

        this._globalLocked = 0;
        this._comments = '';
        this._waitListeners = [];
        E8Plus.mixinWait(this);

        // movement

        this._overrideColliders = {};
        this._groundTargeting = null;

        this._pathfind = null;
        this._isPathfinding = false;
        this._isChasing = false;

        this._pose = '';
        this._idlePose = 'idle';
        this._availableIdlePoses = [];
        this._idleTimer = 0;
        this._idleIntervalWait = Math.randomIntBetween(60, 300);//_IDLEINTERVAL

        this.initFaceData();
    }

    initFaceData() {
        this._faceData = {};
        this._faceData.enabled = false;
        this._faceData.x = 0;
        this._faceData.y = 0;
        this._faceData.x2 = 0;
        this._faceData.y2 = 0;
        this._faceData.realX = 0;
        this._faceData.realY = 0;
        this._faceData.mode = 0;
        this._faceData.eyeL = true;
        this._faceData.eyeR = true;
        this._faceData.needRefresh = false;
        this._faceData.direction = -1;
        this._faceData.needRemove = false;
    }

    setFace(mode, eleft, eright, x1, y1, x2, y2) {
        var mode = mode != null ? mode : 0;
        var eleft = eleft != null ? eleft : true;
        var eright = eright != null ? eright : true;
        var x1 = x1 != null ? x1 : 0;
        var y1 = y1 != null ? y1 : 0;
        var x2 = x2 != null ? x2 : 0;
        var y2 = y2 != null ? y2 : 0;
        this._faceData.enabled = true;
        this._faceData.mode = Number(mode);
        this._faceData.eyeL = String(eleft) == "true" ? true : false;
        this._faceData.eyeR = String(eright) == "true" ? true : false;
        this._faceData.x = Number(x1);
        this._faceData.y = Number(y1);
        this._faceData.x2 = Number(x2);
        this._faceData.y2 = Number(y2);
        this._faceData.needRefresh = true;
    }

    removeFace() {
        if (this._faceData.enabled) { this._faceData.needRemove = true };
    }

    moveSpeedMultiplier() {
        var ds = 4 - this.realMoveSpeed();
        return Math.pow(2, ds);
    }

    pos(x, y) {
        return this._x === x && this._y === y;
    }

    posNt(x, y) {
        // No through
        return this.pos(x, y) && !this.isThrough();
    }

    moveSpeed() {
        return this._moveSpeed;
    }

    setMoveSpeed(moveSpeed) {
        this._moveSpeed = moveSpeed;
    }

    moveFrequency() {
        return this._moveFrequency;
    }

    setMoveFrequency(moveFrequency) {
        this._moveFrequency = moveFrequency;
    }

    opacity() {
        return this._opacity;
    }

    setOpacity(opacity) {
        this._opacity = opacity;
    }

    blendMode() {
        return this._blendMode;
    }

    setBlendMode(blendMode) {
        this._blendMode = blendMode;
    }

    isNormalPriority() {
        return this._priorityType === 1;
    }

    setPriorityType(priorityType) {
        this._priorityType = priorityType;
    }

    isMoving() {
        return this._isMoving;
    }

    isJumping() {
        return this._jumpCount > 0;
    }

    jumpHeight() {
        return (this._jumpPeak * this._jumpPeak -
            Math.pow(Math.abs(this._jumpCount - this._jumpPeak), 2)) / 2;
    }

    isStopping() {
        return !this.isMoving() && !this.isJumping();
    }

    checkStop(threshold) {
        return this._stopCount > threshold;
    }

    resetStopCount() {
        this._stopCount = 0;
    }

    realMoveSpeed() {
        var value = this._moveSpeed + (this.isDashing() ? 1 : 0);
        if (this.battler()) {
            value += this.battler().moveSpeed();
        }
        return value;
    }

    distancePerFrame() {
        return Math.pow(2, this.realMoveSpeed()) / 256;
    }

    isDashing() {
        return false;
    }

    isDebugThrough() {
        return false;
    }

    straighten() {
        //qsprite
        var oldAnimCount = this._animationCount;
        var oldPattern = this._pattern;


        if (this.hasWalkAnime() || this.hasStepAnime()) {
            this._pattern = 1;
        }
        this._animationCount = 0;

        // qsprite
        if (this.qSprite() && (this.hasWalkAnime() || this.hasStepAnime())) {
            this._pattern = 0;
        }
        if (this.qSprite() && this._posePlaying) {
            this._animationCount = oldAnimCount;
            this._pattern = oldPattern;
        }
    }

    reverseDir(d) {
        return 10 - d;
    }

    canPass(x, y, d) {
        var x2 = GameGlobal.$gameMap.roundXWithDirection(x, d);
        var y2 = GameGlobal.$gameMap.roundYWithDirection(y, d);
        if (!GameGlobal.$gameMap.isValid(x2, y2)) {
            return false;
        }
        if (this.isThrough() || this.isDebugThrough()) {
            return true;
        }
        if (!this.isMapPassable(x, y, d)) {
            return false;
        }
        if (this.isCollidedWithCharacters(x2, y2)) {
            return false;
        }
        return true;
    }

    canPassDiagonally(x, y, horz, vert) {
        var x2 = GameGlobal.$gameMap.roundXWithDirection(x, horz);
        var y2 = GameGlobal.$gameMap.roundYWithDirection(y, vert);
        if (this.canPass(x, y, vert) && this.canPass(x, y2, horz)) {
            return true;
        }
        if (this.canPass(x, y, horz) && this.canPass(x2, y, vert)) {
            return true;
        }
        return false;
    }

    isMapPassable(x, y, d) {
        var x2 = GameGlobal.$gameMap.roundXWithDirection(x, d);
        var y2 = GameGlobal.$gameMap.roundYWithDirection(y, d);
        var d2 = this.reverseDir(d);
        return GameGlobal.$gameMap.isPassable(x, y, d) && GameGlobal.$gameMap.isPassable(x2, y2, d2);
    }

    isCollidedWithCharacters(x, y) {
        return this.isCollidedWithEvents(x, y) || this.isCollidedWithVehicles(x, y);
    }

    isCollidedWithEvents(x, y) {
        var events = GameGlobal.$gameMap.eventsXyNt(x, y);
        return events.some(function (event) {
            return event.isNormalPriority();
        });
    }

    isCollidedWithVehicles(x, y) {
        return GameGlobal.$gameMap.boat().posNt(x, y) || GameGlobal.$gameMap.ship().posNt(x, y);
    }

    setPosition(x, y) {
        this._x = Math.round(x);
        this._y = Math.round(y);
        this._realX = x;
        this._realY = y;
        this._px = x * Movement.tileSize;
        this._realPX = x * Movement.tileSize;
        this._py = y * Movement.tileSize;
        this._realPY = y * Movement.tileSize;
        if (!this._colliders) this.collider();
        this.moveColliders();
        if (this._pathfind) {
            this.clearPathfind();
        }
    }

    copyPosition(character) {
        this._x = character._x;
        this._y = character._y;
        this._realX = character._realX;
        this._realY = character._realY;
        this._direction = character._direction;
        this._px = character._px;
        this._py = character._py;
        this._realPX = character._realPX;
        this._realPY = character._realPY;
        if (!this._colliders) this.collider();
        this.moveColliders();
    }

    locate(x, y) {
        this.setPosition(x, y);
        this.straighten();
        this.refreshBushDepth();
    }

    direction() {
        return this._direction;
    }

    setDirection(d) {
        if (d) this._radian = this.directionToRadian(d);
        if (!this.isDirectionFixed() && d) {
            if ([1, 3, 7, 9].contains(d)) {
                this._diagonal = d;
                var horz = [1, 7].contains(d) ? 4 : 6;
                var vert = [1, 3].contains(d) ? 2 : 8;
                if (this._direction === this.reverseDir(horz)) {
                    this._direction = horz;
                }
                if (this._direction === this.reverseDir(vert)) {
                    this._direction = vert;
                }
                this.resetStopCount();
                return;
            } else {
                this._diagonal = false;
            }
        }
        if (!this.isDirectionFixed() && d) {
            this._direction = d;
        }
        this.resetStopCount();
    }

    isTile() {
        return this._tileId > 0 && this._priorityType === 0;
    }

    isObjectCharacter() {
        return this._isObjectCharacter;
    }

    shiftY() {
        return this.isObjectCharacter() ? 0 : 6;
    }

    scrolledX() {
        return GameGlobal.$gameMap.adjustX(this._realX);
    }

    scrolledY() {
        return GameGlobal.$gameMap.adjustY(this._realY);
    }

    screenX() {
        var tw = GameGlobal.$gameMap.tileWidth();
        return Math.round(this.scrolledX() * tw + tw / 2);
    }

    screenY() {
        var th = GameGlobal.$gameMap.tileHeight();
        return Math.round(this.scrolledY() * th + th -
            this.shiftY() - this.jumpHeight());
    }

    screenZ() {
        return this._priorityType * 2 + 1;
    }

    isNearTheScreen() {
        var gw = Graphics.width;
        var gh = Graphics.height;
        var tw = GameGlobal.$gameMap.tileWidth();
        var th = GameGlobal.$gameMap.tileHeight();
        var px = this.scrolledX() * tw + tw / 2 - gw / 2;
        var py = this.scrolledY() * th + th / 2 - gh / 2;
        return px >= -gw && px <= gw && py >= -gh && py <= gh;
    }

    update() {
        // qsprite
        var wasMoving = this.isMoving();

        var prevX = this._realPX;
        var prevY = this._realPY;
        if (this.startedMoving()) {
            this._isMoving = true;
        } else {
            this.updateStop();
        }
        if (this.isArcing()) {
            this.updateArc();
        } else if (this.isJumping()) {
            this.updateJump();
        } else if (this.isMoving()) {
            this.updateMove();
        }
        this.updateAnimation();
        this.updateColliders();
        if (prevX !== this._realPX || prevY !== this._realPY) {
            this.onPositionChange();
        } else {
            this._isMoving = false;
        }
        // if (this.isStopping()) {
        //     this.updateStop();
        // }
        // if (this.isJumping()) {
        //     this.updateJump();
        // } else if (this.isMoving()) {
        //     this.updateMove();
        // }
        // this.updateAnimation();
        if (this.battler() && GameGlobal.$gameSystem._absEnabled) this.updateABS();
        if (this._pathfind) {
            this._pathfind.update();
        }

        // qsprite
        if (this.qSprite()) {
            this.updatePose(wasMoving);
        } else {
            this._pose = '';
        }
    }

    updatePose(wasMoving) {
        var isMoving = wasMoving || this.isMoving();
        if (this._posePlaying) {
            if (!this._posePlaying.canBreak) return;
            if (!isMoving) return;
            this.clearPose();
        }
        var dir = this._direction;
        if (this.isDiagonal()) {
            var diag = this.isDiagonal();
        }
        if (!isMoving && this.hasPose(this._idlePose + dir)) {
            this.updateIdlePose(dir, diag);
        } else {
            this.updateSteppingPose(isMoving, wasMoving);
            if (this._posePlaying) return;
            this.updateMovingPose(dir, diag, isMoving);
        }
        if (this._pose === '') this._pose = 'default';
    }

    updateSteppingPose(isMoving, wasMoving) {
        this._isIdle = !isMoving;
        if (this._isIdle && wasMoving) {
            this._pattern = 0;
        } else if (this._isIdle) {
            if (!this.hasStepAnime()) {
                this._pattern = 0;
            }
            this.updateIdleInterval();
        } else if (!this._isIdle) {
            this._idleTimer = 0;
            this._idleIntervalWait = Math.randomIntBetween(60, 300); //_IDLEINTERVAL
        }
    };

    updateIdleInterval() {
        this._idleTimer++;
        if (this._availableIdlePoses.length > 0) {
            if (this._idleTimer >= this._idleIntervalWait) {
                var i = Math.randomInt(this._availableIdlePoses.length);
                var pose = this._availableIdlePoses[i];
                this.playPose(pose, false, false, false, true);
                this._idleIntervalWait = Math.randomIntBetween(60, 300);//_IDLEINTERVAL[0], _IDLEINTERVAL[1])
                this._idleTimer = 0;
            }
        }
    }

    hasPose(pose) {
        if (this.qSprite()) {
            return this.qSprite().poses.hasOwnProperty(pose);
        }
        return false;
    }

    updateDashingPose(dir, diag) {
        if (diag && this.hasPose('dash' + diag)) {
            dir = diag;
        }
        if (this.hasPose('dash' + dir)) {
            this._pose = 'dash' + dir;
            return true;
        }
        return false;
    }

    updateMovingPose(dir, diag, isMoving) {
        if (this.isDashing() && isMoving) {
            if (this.updateDashingPose(dir, diag)) {
                return;
            }
        }
        if (diag && this.hasPose('move' + diag)) {
            dir = diag;
        }
        if (this.hasPose('move' + dir)) {
            this._pose = 'move' + dir;
        }
    };

    updateIdlePose(dir, diag) {
        if (diag && this.hasPose(this._idlePose + diag)) {
            dir = diag;
        }
        if (this._pose !== this._idlePose + dir) {
            this._pattern = 0;
            this._animationCount = 0;
            this._isIdle = true;
        }
        this._pose = this._idlePose + dir;
        this.updateIdleInterval();
    };

    updateStop() {
        this._stopCount++;
    }

    updateJump() {
        this._jumpCount--;
        this._realX = (this._realX * this._jumpCount + this._x) / (this._jumpCount + 1.0);
        this._realY = (this._realY * this._jumpCount + this._y) / (this._jumpCount + 1.0);
        this.refreshBushDepth();
        if (this._jumpCount === 0) {
            this._realX = this._x = GameGlobal.$gameMap.roundX(this._x);
            this._realY = this._y = GameGlobal.$gameMap.roundY(this._y);
        }
        this._px = this._realPX = this._x * Movement.tileSize;
        this._py = this._realPY = this._y * Movement.tileSize;
        this.moveColliders(this._px, this._py);
    }

    updateAnimation() {
        this.updateAnimationCount();
        if (this._animationCount >= this.animationWait()) {
            this.updatePattern();
            this._animationCount = 0;
        }
        if (this._globalLocked >= 2) {
            return;
        }
    }

    animationWait() {
        if (this.qSprite() && this.qSprite().poses[this._pose]) {
            var pose = this.qSprite().poses[this._pose];
            if (pose.adjust) {
                if (true) { //_USENEWADJUST
                    return pose.speed / this.moveSpeedMultiplier();
                } else {
                    return (pose.speed - this.realMoveSpeed()) * 3;
                }
            }
            return pose.speed;
        }
        return (9 - this.realMoveSpeed()) * 3;
    }

    calcPoseWait() {
        if (!this.qSprite()) return 0;
        var frameWait = this.animationWait();
        var frames = this.qSprite().poses[this._pose].pattern.length;
        return Math.ceil(frameWait * frames);
    }

    updateAnimationCount() {
        if (this._isIdle || this._posePlaying) {
            this._animationCount++;
            return;
        }
        if (this.isMoving() && this.hasWalkAnime()) {
            this._animationCount += 1.5;
        } else if (this.hasStepAnime() || !this.isOriginalPattern()) {
            this._animationCount++;
        }
    }

    updatePattern() {
        if (this._isIdle || this._posePlaying || this.qSprite()) {
            this._pattern++;
            if (this._pattern >= this.maxPattern()) {
                if (this._posePlaying) {
                    if (this._posePlaying.pause) {
                        this._pattern--;
                        return;
                    }
                    if (!this._posePlaying.loop) {
                        this.clearPose();
                        return;
                    }
                }
                this.resetPattern();
            }
            return;
        }
        if (!this.hasStepAnime() && this._stopCount > 0) {
            this.resetPattern();
        } else {
            this._pattern = (this._pattern + 1) % this.maxPattern();
        }
    }

    maxPattern() {
        if (this.qSprite()) {
            var pose = this.qSprite().poses[this._pose];
            return pose ? pose.pattern.length : 0;
        }
        return 4;
    }

    resetPattern() {
        this.qSprite() ? this.setPattern(0) : this.setPattern(1);
    }

    pattern() {
        return this._pattern < 3 ? this._pattern : 1;
    }

    setPattern(pattern) {
        this._pattern = pattern;
    }

    isOriginalPattern() {
        return this.pattern() === 1;
    }

    resetPattern() {
        this.setPattern(1);
    }

    isOnLadder() {
        return GameGlobal.$gameMap.isLadder(this._x, this._y);
    }

    isOnBush() {
        if (!this.collider()) return false;
        var collider = this.collider('collision');
        var collided = false;
        var colliders = ColliderManager.getCollidersNear(collider, function (tile) {
            if (!tile.isTile) return false;
            if (tile.isBush && tile.intersects(collider)) {
                collided = true;
                return 'break';
            }
            return false;
        });
        return collided;
    }

    increaseSteps() {
        if (this.isOnLadder()) {
            this.setDirection(8);
        }
        this.resetStopCount();
        this.refreshBushDepth();
    }

    tileId() {
        return this._tileId;
    }

    characterName() {
        return this._characterName;
    }

    characterIndex() {
        return this._characterIndex;
    }

    setImage(characterName, characterIndex) {
        var wasPosePlaying = this._posePlaying;
        this._tileId = 0;
        this._characterName = characterName;
        this._characterIndex = characterIndex;
        this._isObjectCharacter = ImageManager.isObjectCharacter(characterName);
        this._isQChara = undefined;
        this._isIdle = null;
        this._posePlaying = null;
        this.getAvailableIdlePoses();
        if (this.isQCharacter()) {
            this._posePlaying = wasPosePlaying;
        }
    }

    getAvailableIdlePoses() {
        this._availableIdlePoses = [];
        if (this.isQCharacter()) {
            var poses = this.qSprite().poses;
            for (var pose in poses) {
                var match = /^idle[a-zA-Z]([0-9]+x)?[12346789]$/.exec(pose);
                if (match) {
                    var name = pose.slice(0, -1);
                    if (!this._availableIdlePoses.contains(name)) {
                        var x = 1;
                        if (match[1]) {
                            x = Number(match[1].slice(0, -1));
                        }
                        for (var i = 0; i < x; i++) {
                            this._availableIdlePoses.push(name);
                        }
                    }
                }
            }
        }
    }

    addRandIdle(pose) {
        var match = /^(.*)[a-zA-Z]([0-9]+x)?$/.exec(pose);
        if (match) {
            if (!this._availableIdlePoses.contains(pose)) {
                var x = 1;
                if (match[2]) {
                    x = Number(match[2].slice(0, -1));
                }
                for (var i = 0; i < x; i++) {
                    this._availableIdlePoses.push(pose);
                }
            }
        }
    }

    removeRandIdle(pose) {
        for (var i = this._availableIdlePoses.length - 1; i >= 0; i--) {
            if (this._availableIdlePoses[i] === pose) {
                this._availableIdlePoses.splice(i, 1);
            }
        }
    }

    changeIdle(pose) {
        this._idlePose = pose;
    }

    setTileImage(tileId) {
        this._tileId = tileId;
        this._characterName = '';
        this._characterIndex = 0;
        this._isObjectCharacter = true;
    }

    playPose(pose, lock, pause, looping, canBreak) {
        if (!this.qSprite()) return;
        var dir = this._direction;
        if (this.isDiagonal()) {
            var diag = this.isDiagonal();
            if (this.hasPose(pose + diag)) {
                dir = diag;
            }
        }
        if (this.hasPose(pose + dir)) {
            pose += dir;
        } else if (!this.hasPose(pose)) {
            return;
        }
        this._pose = pose;
        this._posePlaying = {
            lock: lock,
            pause: pause,
            loop: looping,
            canBreak: canBreak
        }
        this._animationCount = 0;
        this._pattern = 0;
    };

    clearPose() {
        this._pose = '';
        this._posePlaying = null;
        this._locked = false;
        this._animationCount = 0;
        this._pattern = 0;
        this.updatePose(false);
    }

    isQCharacter() {
        if (this._isQChara === undefined) {
            var _IDENTIFIER = '%{config}-';
            _IDENTIFIER = _IDENTIFIER.replace('{config}', 'test');
            _IDENTIFIER = new RegExp(_IDENTIFIER);
            this._isQChara = this._characterName.match(_IDENTIFIER);
        }
        return this._isQChara ? this._isQChara[1] : false;
    };

    checkEventTriggerTouch(x, y) {
        return false;
    }

    qSprite() {
        // return false;
        // this.isQCharacter()
        return GameGlobal.$qSprite["test"] || null;
    };

    isMovementSucceeded(x, y) {
        return this._movementSuccess;
    }

    setMovementSuccess(success) {
        this._movementSuccess = success;
    }

    moveDiagonally(horz, vert) {
        this.setMovementSuccess(this.canPassDiagonally(this._x, this._y, horz, vert));
        if (this.isMovementSucceeded()) {
            this._x = GameGlobal.$gameMap.roundXWithDirection(this._x, horz);
            this._y = GameGlobal.$gameMap.roundYWithDirection(this._y, vert);
            this._realX = GameGlobal.$gameMap.xWithDirection(this._x, this.reverseDir(horz));
            this._realY = GameGlobal.$gameMap.yWithDirection(this._y, this.reverseDir(vert));
            this.increaseSteps();
        }
        if (this._direction === this.reverseDir(horz)) {
            this.setDirection(horz);
        }
        if (this._direction === this.reverseDir(vert)) {
            this.setDirection(vert);
        }
    }

    jump(xPlus, yPlus) {
        if (Math.abs(xPlus) > Math.abs(yPlus)) {
            if (xPlus !== 0) {
                this.setDirection(xPlus < 0 ? 4 : 6);
            }
        } else {
            if (yPlus !== 0) {
                this.setDirection(yPlus < 0 ? 8 : 2);
            }
        }
        this._x += xPlus;
        this._y += yPlus;
        var distance = Math.round(Math.sqrt(xPlus * xPlus + yPlus * yPlus));
        this._jumpPeak = 10 + distance - this._moveSpeed;
        this._jumpCount = this._jumpPeak * 2;
        this.resetStopCount();
        this.straighten();
    }

    hasWalkAnime() {
        return this._walkAnime;
    }

    setWalkAnime(walkAnime) {
        this._walkAnime = walkAnime;
    }

    hasStepAnime() {
        return this._stepAnime;
    }

    setStepAnime(stepAnime) {
        this._stepAnime = stepAnime;
    }

    isDirectionFixed() {
        return this._directionFix;
    }

    setDirectionFix(directionFix) {
        this._directionFix = directionFix;
    }

    isThrough() {
        return this._through;
    }

    setThrough(through) {
        this._through = through;
    }

    isTransparent() {
        return this._transparent;
    }

    bushDepth() {
        return this._bushDepth;
    }

    setTransparent(transparent) {
        this._transparent = transparent;
    }

    requestAnimation(animationId) {
        this._animationId = animationId;
    }

    requestBalloon(balloonId) {
        this._balloonId = balloonId;
    }

    animationId() {
        return this._animationId;
    }

    balloonId() {
        return this._balloonId;
    }

    startAnimation() {
        this._animationId = 0;
        this._animationPlaying = true;
    }

    startBalloon() {
        this._balloonId = 0;
        this._balloonPlaying = true;
    }

    isAnimationPlaying() {
        return this._animationId > 0 || this._animationPlaying;
    }

    isBalloonPlaying() {
        return this._balloonId > 0 || this._balloonPlaying;
    }

    endAnimation() {
        this._animationPlaying = false;
    }

    endBalloon() {
        this._balloonPlaying = false;
    }


    isMinimapAttributeDirty() {
        // TODO
    };

    setMinimapAttributeDirty() {
        // TODO
    };

    clearMinimapAttributeDirty() {
        // TODO
    };


    battler() {
        return null
    }

    clearABS() {
        if (this._activeSkills && this._activeSkills.length > 0) {
            this.clearSkills();
        }
        this.clearAgro();
        this._activeSkills = [];
        this._skillCooldowns = {};
        this._casting = null;
        this._skillLocked = [];
    }

    clearSkills() {
        for (var i = this._activeSkills.length - 1; i >= 0; i--) {
            var skill = this._activeSkills[i];
            ABSManager.removePicture(skill.picture);
            ABSManager.removePicture(skill.trail);
            ABSManager.removePicture(skill.pictureCollider);
            this._activeSkills.splice(i, 1);
        }
    }

    team() {
        return 0;
    };

    isFriendly(target) {
        return target.team() === this.team();
    };

    inCombat() {
        if (!this.battler()) return false;
        return this._inCombat;
    };

    isCasting() {
        if (this._casting) {
            if (this._casting.break) {
                this._casting = null;
                return false;
            }
            return true;
        }
        return false;
    };

    canMove() {
        // return this._globalLocked === 0;
        if (this._locked) return false;
        if (this.battler()) {
            if (this._skillLocked.length > 0) return false;
            if (this.battler().isStunned()) return false;
        }
        if (this.realMoveSpeed() <= 0) return false;
        return true;
    };

    canInputSkill(fromEvent) {
        if (this._globalLocked > 0) return false;
        if (!fromEvent && GameGlobal.$gameMap.isEventRunning()) return false;
        if (!GameGlobal.$gameSystem._absEnabled) return false;
        if (!this.battler()) return false;
        if (this.battler().isDead()) return false;
        if (this.battler().isStunned()) return false;
        if (this.isCasting()) return false;
        if (this._skillLocked.length > 0) return false;
        return true;
    };

    canUseSkill(id) {
        var skill = GameGlobal.$dataSkills[id];
        return this.usableSkills().contains(id) && this.battler().canPaySkillCost(skill);
    };

    usableSkills() {
        return [];
    };


    inCombat() {
        if (!this._agro) return false;
        return this._agro.inCombat();
    };

    addAgro(from, skill) {
        var chara = E8Plus.getCharacter(from);
        if (!chara || chara === this || !chara._agro) {
            return;
        }
        if (this.isFriendly(chara) || !this._agro) {
            return;
        }
        var amt = skill ? skill.agroPoints || 1 : 1;
        this._agro.add(from, amt);
    };

    removeAgro(from) {
        if (!this._agro) {
            return;
        }
        this._agro.remove(from);
    };

    clearAgro() {
        if (this._agro) {
            var agrod = this._agro._agrodList;
            for (var charaId in agrod) {
                var chara = E8Plus.getCharacter(charaId);
                if (chara) chara.removeAgro(this.charaId());
            }
            this._agro.clear();
        } else {
            this._agro = new Game_CharacterAgro(this.charaId());
        }
    };

    bestTarget() {
        if (!this._agro) {
            return null;
        }
        return this._agro.highest();
    };


    updateABS() {
        if (this.battler().isDead()) {
            if (!this._isDead) {
                this.onDeath();
            }
            return;
        }
        this._agro.update();
        this.updateSkills();
        this.battler().updateABS(this._realX, this._realY);
    };

    onDeath() {
        // Placeholder method, overwritten in Game_Player and Game_Event
    };

    updateSkills() {
        if (this._groundTargeting) this.updateTargeting();
        if (this._activeSkills.length > 0) this.updateSkillSequence();
        this.updateSkillCooldowns();
    };

    updateTargeting() {
        return this.onTargetingEnd();
    };

    updateSkillSequence() {
        for (var i = this._activeSkills.length - 1; i >= 0; i--) {
            this._activeSkills[i].sequencer.update();
        }
    };

    updateSkillCooldowns() {
        for (var id in this._skillCooldowns) {
            if (this._skillCooldowns[id] === 0) {
                delete this._skillCooldowns[id];
            } else {
                this._skillCooldowns[id]--;
            }
        }
    };

    onTargetingEnd() {
        var skill = this._groundTargeting;
        this.battler().paySkillCost(skill.data);
        this._activeSkills.push(skill);
        this._skillCooldowns[skill.id] = skill.settings.cooldown;
        ColliderManager.draw(skill.collider, skill.sequence.length + 60);
        this.onTargetingCancel();
    };

    onTargetingCancel() {
        ABSManager.removePicture(this._groundTargeting.picture);
        this._groundTargeting.targeting.kill = true;
        this._groundTargeting = null;
        this._selectTargeting = null;
    };

    useSkill(skillId, fromEvent) {
        // if (!this.canInputSkill(fromEvent)) return null;
        if (!this.canUseSkill(skillId)) return null;
        if (this._groundTargeting) {
            this.onTargetingCancel();
        }
        var skill = this.forceSkill(skillId);
        if (!this._groundTargeting) {
            this.battler().paySkillCost(GameGlobal.$dataSkills[skillId]);
        }
        return skill;
    };

    beforeSkill(skill) {
        // Runs before the skills sequence and collider are made
        var before = skill.data.meta.beforeSkill || '';
        if (before !== '') {
            try {
                eval(before);
            } catch (e) {
                console.error('Error with `beforeSkill` meta inside skill ' + skill.data.id, e);
            }
        }
    };

    forceSkill(skillId, forced) {
        var skill = this.makeSkill(skillId, forced);
        if (skill.settings.groundTarget || skill.settings.selectTarget) {
            return this.makeTargetingSkill(skill);
        }
        this._activeSkills.push(skill);
        this._skillCooldowns[skillId] = skill.settings.cooldown;
        ColliderManager.draw(skill.collider, skill.sequence.length + 60);
        return skill;
    };

    makeSkill(skillId, forced) {
        var data = GameGlobal.$dataSkills[skillId];
        var skill = {
            id: skillId,
            data: data,
            settings: E8ABS.getSkillSettings(data),
            sequence: E8ABS.getSkillSequence(data),
            ondmg: E8ABS.getSkillOnDamage(data),
            radian: this._radian,
            targetsHit: [],
            forced: forced
        }
        this.beforeSkill(skill);
        skill.sequencer = new Skill_Sequencer(this, skill);
        skill.collider = this.makeSkillCollider(skill.settings);
        return skill;
    };

    makeSkillCollider(settings) {
        var w1 = this.collider('collision').width;
        var h1 = this.collider('collision').height;
        settings.collider = settings.collider || ['box', w1, h1];
        var collider = ColliderManager.convertToCollider(settings.collider);
        var infront = settings.infront === true;
        var rotate = settings.rotate === true;
        if (rotate) {
            if (E8ABS.radianAtks) {
                collider.rotate(Math.PI / 2 + this._radian);
            } else {
                collider.rotate(Math.PI / 2 + this.directionToRadian(this._direction));
            }
        }
        var x1 = this.cx() - collider.center.x;
        var y1 = this.cy() - collider.center.y;
        if (infront) {
            var w2 = collider.width;
            var h2 = collider.height;
            var radian;
            if (E8ABS.radianAtks) {
                radian = this._radian;
            } else {
                radian = this.directionToRadian(this._direction);
            }
            var w3 = Math.cos(radian) * w1 / 2 + Math.cos(radian) * w2 / 2;
            var h3 = Math.sin(radian) * h1 / 2 + Math.sin(radian) * h2 / 2;
            x1 += w3;
            y1 += h3;
        }
        collider.moveTo(x1, y1);
        return collider;
    };

    makeTargetingSkill(skill) {
        this._groundTargeting = skill;
        this._selectTargeting = (typeof this == "Game_Event") ? true : skill.settings.selectTarget;
        var collider = skill.collider;
        var diameter = skill.settings.range * 2;
        skill.targeting = new Circle_Collider(diameter, diameter);
        skill.targeting.moveTo(this.cx() - diameter / 2, this.cy() - diameter / 2);
        ColliderManager.draw(skill.targeting, -1);
        skill.collider = skill.targeting;
        skill.targets = ABSManager.getTargets(skill, this);
        skill.collider = collider;
        skill.picture = new Sprite_SkillCollider(skill.collider);
        if (this._selectTargeting) {
            if (skill.targets.length === 0) {
                return this.onTargetingCancel();
            }
            skill.collider.color = '#00ff00';
            skill.index = 0;
        }
        ABSManager.addPicture(skill.picture);
        return skill;
    };

    // movement
    get px() { return this._px; }
    get py() { return this._py; }


    direction8(horz, vert) {
        if (horz === 4 && vert === 8) return 7;
        if (horz === 4 && vert === 2) return 1;
        if (horz === 6 && vert === 8) return 9;
        if (horz === 6 && vert === 2) return 3;
        return 5;
    }

    startedMoving() {
        return this._realPX !== this._px || this._realPY !== this._py;
    };

    isDiagonal() {
        return this._diagonal;
    };

    isArcing() {
        return this._currentRad !== this._targetRad;
    };

    setPixelPosition(x, y) {
        this.setPosition(x / Movement.tileSize, y / Movement.tileSize);
    };

    setRadian(radian) {
        radian = E8Plus.adjustRadian(radian);
        this.setDirection(this.radianToDirection(radian, Movement.diagonal));
        this._radian = radian;
    };

    moveTiles() {
        if (GameGlobal.$gameMap.gridSize() < this.frameSpeed()) {
            return GameGlobal.$gameMap.offGrid() ? this.frameSpeed() : GameGlobal.$gameMap.gridSize();
        }
        return GameGlobal.$gameMap.gridSize();
    }

    frameSpeed(multi) {
        var multi = multi === undefined ? 1 : Math.abs(multi);
        return this.distancePerFrame() * Movement.tileSize * multi;
    };

    angularSpeed() {
        return this._angularSpeed || this.frameSpeed() / this._radiusL;
    };

    forwardV() {
        return {
            x: Math.cos(this._forwardRadian) * this.frameSpeed(),
            y: Math.sin(this._forwardRadian) * this.frameSpeed()
        }
    };

    canPass(x, y, dir) {
        return this.canPixelPass(x * Movement.tileSize, y * Movement.tileSize, dir);
    };

    canPixelPass(x, y, dir, dist, type) {
        dist = dist || this.moveTiles();
        type = type || 'collision';
        var x1 = GameGlobal.$gameMap.roundPXWithDirection(x, dir, dist);
        var y1 = GameGlobal.$gameMap.roundPYWithDirection(y, dir, dist);
        if (!this.collisionCheck(x1, y1, dir, dist, type)) {
            this.collider(type).moveTo(this._px, this._py);
            return false;
        }
        if (type[0] !== '_') {
            this.moveColliders(x1, y1);
        }
        return true;
    };

    canPassDiagonally(x, y, horz, vert) {
        return this.canPixelPassDiagonally(x * Movement.tileSize, y * Movement.tileSize, horz, vert);
    };

    canPixelPassDiagonally(x, y, horz, vert, dist, type) {
        dist = dist || this.moveTiles();
        type = type || 'collision';
        var x1 = GameGlobal.$gameMap.roundPXWithDirection(x, horz, dist);
        var y1 = GameGlobal.$gameMap.roundPYWithDirection(y, vert, dist);
        if (dist === this.moveTiles()) {
            if (!this.canPixelPass(x1, y1, 5, null, type)) return false;
            if (GameGlobal.$gameMap.midPass()) {
                var x2 = GameGlobal.$gameMap.roundPXWithDirection(x, horz, dist / 2);
                var y2 = GameGlobal.$gameMap.roundPYWithDirection(y, vert, dist / 2);
                if (!this.canPixelPass(x2, y2, 5, null, type)) return false;
            }
        } else {
            return (this.canPixelPass(x, y, vert, dist, type) && this.canPixelPass(x, y1, horz, dist, type)) &&
                (this.canPixelPass(x, y, horz, dist, type) && this.canPixelPass(x1, y, vert, dist, type));
        }
        return true;
    };

    collisionCheck(x, y, dir, dist, type) {
        this.collider(type).moveTo(x, y);
        if (!this.valid(type)) return false;
        if (this.isThrough() || this.isDebugThrough()) return true;
        if (GameGlobal.$gameMap.midPass() && dir !== 5) {
            if (!this.middlePass(x, y, dir, dist, type)) return false;
        }
        if (this.collidesWithAnyTile(type)) return false;
        if (this.collidesWithAnyCharacter(type)) return false;
        return true;
    };

    middlePass(x, y, dir, dist, type) {
        var dist = dist / 2 || this.moveTiles() / 2;
        var x2 = GameGlobal.$gameMap.roundPXWithDirection(x, this.reverseDir(dir), dist);
        var y2 = GameGlobal.$gameMap.roundPYWithDirection(y, this.reverseDir(dir), dist);
        this.collider(type).moveTo(x2, y2);
        if (this.collidesWithAnyTile(type)) return false;
        if (this.collidesWithAnyCharacter(type)) return false;
        this.collider(type).moveTo(x, y);
        return true;
    };

    collidesWithAnyTile(type) {
        var collider = this.collider(type);
        var collided = false;
        ColliderManager.getCollidersNear(collider, (function (collider) {
            collided = this.collidedWithTile(type, collider);
            if (collided) return 'break';
        }).bind(this));
        return collided;
    };

    collidedWithTile(type, collider) {
        if (collider.color && this.passableColors().contains(collider.color)) {
            return false;
        }
        if (collider.type && (collider.type !== 'collision' || collider.type !== 'default')) {
            return false;
        }
        return collider.intersects(this.collider(type));
    };

    collidesWithAnyCharacter(type) {
        var collider = this.collider(type);
        var collided = false;
        ColliderManager.getCharactersNear(collider, function (chara) {
            collided = this.collidedWithCharacter(type, chara);
            if (collided) return 'break';
        }.bind(this));
        return collided;
    };

    collidedWithCharacter(type, chara) {
        if (chara.isThrough() || chara === this || !chara.isNormalPriority()) {
            return false;
        }
        if (this.ignoreCharacters(type).contains(chara.charaId())) {
            return false;
        }
        return chara.collider('collision').intersects(this.collider(type));
    };

    ignoreCharacters(type) {
        // This function is to be aliased by plugins to return a list
        // of charaId's this character can pass through
        var ignores = [];
        if (this._isChasing !== false && type === '_pathfind') {
            ignores.push(Number(this._isChasing));
        }
        return ignores;
    };

    valid(type) {
        var edge = this.collider(type).gridEdge();
        var maxW = GameGlobal.$gameMap.width();
        var maxH = GameGlobal.$gameMap.height();
        if (!GameGlobal.$gameMap.isLoopHorizontal()) {
            if (edge.x1 < 0 || edge.x2 >= maxW) return false;
        }
        if (!GameGlobal.$gameMap.isLoopVertical()) {
            if (edge.y1 < 0 || edge.y2 >= maxH) return false;
        }
        return true;
    };

    passableColors() {
        // #00000000 is a transparent return value in collisionmap addon
        var colors = ['#ffffff', '#00000000'];
        switch (this._passabilityLevel) {
            case 1:
            case 3: {
                colors.push(Movement.water1);
                break;
            }
            case 2:
            case 4: {
                colors.push(Movement.water1);
                colors.push(Movement.water2);
                break;
            }
        }
        return colors;
    };

    canPassToFrom(xf, yf, xi, yi, type) {
        xi = xi === undefined ? this._px : xi;
        yi = yi === undefined ? this._py : yi;
        type = type || 'collision';
        // TODO remove this check by having the start and end colliders
        // be included in the _stretched collider
        if (!this.canPixelPass(xi, yi, 5, null, type) || !this.canPixelPass(xf, yf, 5, null, type)) {
            this.collider(type).moveTo(this._px, this._py);
            return false;
        }
        var dx = xf - xi;
        var dy = yf - yi;
        var radian = Math.atan2(dy, dx);
        if (radian < 0) radian += Math.PI * 2;
        var dist = Math.sqrt(dx * dx + dy * dy);
        this._colliders['_stretched'] = this.collider(type).stretchedPoly(radian, dist);
        if (!this.canPixelPass(xi, yi, 5, null, '_stretched')) {
            delete this._colliders['_stretched'];
            return false;
        }
        delete this._colliders['_stretched'];
        return true;
    };

    checkEventTriggerTouchFront(d) {
        var horz = d;
        var vert = d;
        if ([1, 3, 7, 9].contains(d)) {
            horz = (d === 1 || d === 7) ? 4 : 6;
            vert = (d === 1 || d === 3) ? 2 : 8;
        }
        var x2 = GameGlobal.$gameMap.roundPXWithDirection(this.px, horz, this.moveTiles());
        var y2 = GameGlobal.$gameMap.roundPYWithDirection(this.py, vert, this.moveTiles());
        this.checkEventTriggerTouch(x2, y2);
    };

    isOnLadder() {
        if (!this.collider()) return false;
        var collider = this.collider('collision');
        var collided = false;
        var colliders = ColliderManager.getCollidersNear(collider, function (tile) {
            if (!tile.isTile) return false;
            if (tile.isLadder && tile.intersects(collider)) {
                collided = true;
                return 'break';
            }
            return false;
        });
        return collided;
    };


    freqThreshold() {
        return Movement.tileSize;
    };

    terrainTag() {
        return GameGlobal.$gameMap.terrainTag(Math.floor(this.cx(true)), Math.floor(this.cy(true)));
    };

    regionId() {
        return GameGlobal.$gameMap.regionId(Math.floor(this.cx(true)), Math.floor(this.cy(true)));
    };

    updateMove() {
        var xSpeed = 1;
        var ySpeed = 1;
        if (this._adjustFrameSpeed) {
            xSpeed = Math.cos(this._radian);
            ySpeed = Math.sin(this._radian);
        }
        if (this._px < this._realPX) {
            this._realPX = Math.max(this._realPX - this.frameSpeed(xSpeed), this._px);
        }
        if (this._px > this._realPX) {
            this._realPX = Math.min(this._realPX + this.frameSpeed(xSpeed), this._px);
        }
        if (this._py < this._realPY) {
            this._realPY = Math.max(this._realPY - this.frameSpeed(ySpeed), this._py);
        }
        if (this._py > this._realPY) {
            this._realPY = Math.min(this._realPY + this.frameSpeed(ySpeed), this._py);
        }
        this._x = this._realPX / Movement.tileSize;
        this._realX = this._realPX / Movement.tileSize;
        this._y = this._realPY / Movement.tileSize;
        this._realY = this._realPY / Movement.tileSize;
        this._freqCount += this.frameSpeed();
    };

    updateArc() {
        if (this._currentRad < this._targetRad) {
            var newRad = Math.min(this._currentRad + this.angularSpeed(), this._targetRad);
        }
        if (this._currentRad > this._targetRad) {
            var newRad = Math.max(this._currentRad - this.angularSpeed(), this._targetRad);
        }
        var x1 = this._pivotX + this._radiusL * Math.cos(newRad);
        var y1 = this._pivotY + this._radiusH * Math.sin(newRad);
        this._currentRad = newRad;
        this._px = this._realPX = x1;
        this._py = this._realPY = y1;
        this._x = this._realPX / Movement.tileSize;
        this._realX = this._realPX / Movement.tileSize;
        this._y = this._realPY / Movement.tileSize;
        this._realY = this._realPY / Movement.tileSize;
        this.moveColliders(x1, y1);
        this.checkEventTriggerTouchFront(this._direction);
    };


    updateColliders() {
        var colliders = this._colliders;
        if (!colliders) return;
        var hidden = false;
        hidden = this.isTransparent() || this._erased;
        if (!hidden && this.isVisible) {
            hidden = !this.isVisible();
        }
        for (var type in colliders) {
            if (colliders.hasOwnProperty(type)) {
                colliders[type]._isHidden = !!hidden;
            }
        }
    };

    onPositionChange() {
        this.refreshBushDepth();
    };

    refreshBushDepth() {
        if (this.isNormalPriority() && !this.isObjectCharacter() &&
            this.isOnBush() && !this.isJumping()) {
            if (!this.startedMoving()) this._bushDepth = 12;
        } else {
            this._bushDepth = 0;
        }
    };

    pixelJump(xPlus, yPlus) {
        return this.jump(xPlus / Movement.tileSize, yPlus / Movement.tileSize);
    };

    pixelJumpForward(dist, dir) {
        dir = dir || this._direction;
        dist = dist / Movement.tileSize;
        var x = dir === 6 ? dist : dir === 4 ? -dist : 0;
        var y = dir === 2 ? dist : dir === 8 ? -dist : 0;
        this.jump(x, y);
    };

    pixelJumpBackward(dist) {
        this.pixelJumpFixed(this.reverseDir(this.direction()), dist);
    };

    pixelJumpFixed(dir, dist) {
        var lastDirectionFix = this.isDirectionFixed();
        this.setDirectionFix(true);
        this.pixelJumpForward(dist, dir);
        this.setDirectionFix(lastDirectionFix);
    };

    moveStraight(dir, dist) {
        dist = dist || this.moveTiles();
        this.setMovementSuccess(this.canPixelPass(this._px, this._py, dir, dist));
        var originalSpeed = this._moveSpeed;
        if (this.smartMove() === 1 || this.smartMove() > 2) {
            this.smartMoveSpeed(dir);
        }
        this.setDirection(dir);
        if (this.isMovementSucceeded()) {
            this._forwardRadian = this.directionToRadian(dir);
            this._diagonal = false;
            this._adjustFrameSpeed = false;
            this._px = GameGlobal.$gameMap.roundPXWithDirection(this._px, dir, dist);
            this._py = GameGlobal.$gameMap.roundPYWithDirection(this._py, dir, dist);
            this._realPX = GameGlobal.$gameMap.pxWithDirection(this._px, this.reverseDir(dir), dist);
            this._realPY = GameGlobal.$gameMap.pyWithDirection(this._py, this.reverseDir(dir), dist);
            this.increaseSteps();
        } else {
            this.checkEventTriggerTouchFront(dir);
        }
        this._moveSpeed = originalSpeed;
        if (!this.isMovementSucceeded() && this.smartMove() > 1) {
            this.smartMoveDir8(dir);
        }
    };

    moveDiagonally(horz, vert, dist) {
        dist = dist || this.moveTiles();
        this.setMovementSuccess(this.canPixelPassDiagonally(this._px, this._py, horz, vert, dist));
        var originalSpeed = this._moveSpeed;
        if (this.smartMove() === 1 || this.smartMove() > 2) {
            this.smartMoveSpeed([horz, vert]);
        }
        this.setDirection(this.direction8(horz, vert));
        if (this.isMovementSucceeded()) {
            this._forwardRadian = this.directionToRadian(this.direction8(horz, vert));
            this._adjustFrameSpeed = false;
            this._px = GameGlobal.$gameMap.roundPXWithDirection(this._px, horz, dist);
            this._py = GameGlobal.$gameMap.roundPYWithDirection(this._py, vert, dist);
            this._realPX = GameGlobal.$gameMap.pxWithDirection(this._px, this.reverseDir(horz), dist);
            this._realPY = GameGlobal.$gameMap.pyWithDirection(this._py, this.reverseDir(vert), dist);
            this.increaseSteps();
        } else {
            this.checkEventTriggerTouchFront(this.direction8(horz, vert));
        }
        this._moveSpeed = originalSpeed;
        if (!this.isMovementSucceeded() && this.smartMove() > 1) {
            if (this.canPixelPass(this._px, this._py, horz)) {
                this.moveStraight(horz);
            } else if (this.canPixelPass(this._px, this._py, vert)) {
                this.moveStraight(vert);
            }
        }
    };

    moveRadian(radian, dist) {
        dist = dist || this.moveTiles();
        this.fixedRadianMove(radian, dist);
        if (!this.isMovementSucceeded() && this.smartMove() > 1) {
            var realDir = this.radianToDirection(radian, true);
            var xAxis = Math.cos(radian);
            var yAxis = Math.sin(radian);
            var horz = xAxis > 0 ? 6 : xAxis < 0 ? 4 : 0;
            var vert = yAxis > 0 ? 2 : yAxis < 0 ? 8 : 0;
            if ([1, 3, 7, 9].contains(realDir)) {
                if (this.canPixelPass(this._px, this._py, horz, dist)) {
                    this.moveStraight(horz, dist);
                } else if (this.canPixelPass(this._px, this._py, vert, dist)) {
                    this.moveStraight(vert, dist);
                }
            } else {
                var dir = this.radianToDirection(radian);
                this.smartMoveDir8(dir);
            }
        }
    };

    fixedMove(dir, dist) {
        dist = dist || this.moveTiles();
        dir = dir === 5 ? this.direction() : dir;
        if ([1, 3, 7, 9].contains(dir)) {
            var horz = (dir === 1 || dir === 7) ? 4 : 6;
            var vert = (dir === 1 || dir === 3) ? 2 : 8;
            return this.fixedDiagMove(horz, vert, dist);
        }
        this.setMovementSuccess(this.canPixelPass(this._px, this._py, dir, dist));
        this.setDirection(dir);
        if (this.isMovementSucceeded()) {
            this._forwardRadian = this.directionToRadian(dir);
            this._adjustFrameSpeed = false;
            this._px = GameGlobal.$gameMap.roundPXWithDirection(this._px, dir, dist);
            this._py = GameGlobal.$gameMap.roundPYWithDirection(this._py, dir, dist);
            this._realPX = GameGlobal.$gameMap.pxWithDirection(this._px, this.reverseDir(dir), dist);
            this._realPY = GameGlobal.$gameMap.pyWithDirection(this._py, this.reverseDir(dir), dist);
            this.increaseSteps();
        } else {
            this.checkEventTriggerTouchFront(dir);
        }
    };

    fixedDiagMove(horz, vert, dist) {
        dist = dist || this.moveTiles();
        this.setMovementSuccess(this.canPixelPassDiagonally(this._px, this._py, horz, vert));
        this.setDirection(this.direction8(horz, vert));
        if (this.isMovementSucceeded()) {
            this._forwardRadian = this.directionToRadian(this.direction8(horz, vert));
            this._adjustFrameSpeed = false;
            this._px = GameGlobal.$gameMap.roundPXWithDirection(this._px, horz, dist);
            this._py = GameGlobal.$gameMap.roundPYWithDirection(this._py, vert, dist);
            this._realPX = GameGlobal.$gameMap.pxWithDirection(this._px, this.reverseDir(horz), dist);
            this._realPY = GameGlobal.$gameMap.pyWithDirection(this._py, this.reverseDir(vert), dist);
            this.increaseSteps();
        } else {
            this.checkEventTriggerTouchFront(this.direction8(horz, vert));
        }
    };

    fixedRadianMove(radian, dist) {
        dist = dist || this.moveTiles();
        var dir = this.radianToDirection(radian, true);
        var xAxis = Math.cos(radian);
        var yAxis = Math.sin(radian);
        var horzSteps = Math.abs(xAxis) * dist;
        var vertSteps = Math.abs(yAxis) * dist;
        var horz = xAxis > 0 ? 6 : xAxis < 0 ? 4 : 0;
        var vert = yAxis > 0 ? 2 : yAxis < 0 ? 8 : 0;
        var x2 = GameGlobal.$gameMap.roundPXWithDirection(this._px, horz, horzSteps);
        var y2 = GameGlobal.$gameMap.roundPYWithDirection(this._py, vert, vertSteps);
        this.setMovementSuccess(this.canPassToFrom(x2, y2, this._px, this._py));
        this.setRadian(radian);
        if (this.isMovementSucceeded()) {
            this._forwardRadian = E8Plus.adjustRadian(radian);
            this._adjustFrameSpeed = true;
            this._px = x2;
            this._py = y2;
            this._realPX = GameGlobal.$gameMap.pxWithDirection(this._px, this.reverseDir(horz), horzSteps);
            this._realPY = GameGlobal.$gameMap.pyWithDirection(this._py, this.reverseDir(vert), vertSteps);
            this.increaseSteps();
        } else {
            this.checkEventTriggerTouchFront(dir);
        }
    };

    fixedMoveBackward(dist) {
        var lastDirectionFix = this.isDirectionFixed();
        this.setDirectionFix(true);
        this.fixedMove(this.reverseDir(this.direction()), dist);
        this.setDirectionFix(lastDirectionFix);
    };

    arc(pivotX, pivotY, radians, cc, frames) {
        var cc = cc ? 1 : -1;
        var dx = this._px - pivotX;
        var dy = this._py - pivotY;
        var rad = Math.atan2(dy, dx);
        frames = frames || 1;
        rad += rad < 0 ? 2 * Math.PI : 0;
        this._currentRad = rad;
        this._targetRad = rad + radians * cc;
        this._pivotX = pivotX;
        this._pivotY = pivotY;
        this._radiusL = this._radiusH = Math.sqrt(dy * dy + dx * dx);
        this._angularSpeed = radians / frames;
    };

    smartMove() {
        return this._smartMove;
    };

    smartMoveDir8(dir) {
        var dist = this.moveTiles();
        var collider = this.collider('collision');
        var x1 = this._px;
        var y1 = this._py;
        var x2 = GameGlobal.$gameMap.roundPXWithDirection(x1, dir, dist);
        var y2 = GameGlobal.$gameMap.roundPYWithDirection(y1, dir, dist);
        collider.moveTo(x2, y2);
        var collided = false;
        ColliderManager.getCharactersNear(collider, (function (chara) {
            if (chara.isThrough() || chara === this || !chara.isNormalPriority() ||
                /<smartdir>/i.test(chara.notes())) {
                return false;
            }
            if (chara.collider('collision').intersects(collider)) {
                collided = true;
                return 'break';
            }
            return false;
        }).bind(this));
        collider.moveTo(x1, y1);
        if (collided) return;
        var horz = [4, 6].contains(dir) ? true : false;
        var steps = horz ? collider.height : collider.width;
        steps /= 2;
        var pass = false;
        for (var i = 0; i < 2; i++) {
            var sign = i === 0 ? 1 : -1;
            var j = 0;
            var x2 = x1;
            var y2 = y1;
            if (horz) {
                x2 = GameGlobal.$gameMap.roundPXWithDirection(x1, dir, dist);
            } else {
                y2 = GameGlobal.$gameMap.roundPYWithDirection(y1, dir, dist);
            }
            while (j < steps) {
                j += dist;
                if (horz) {
                    y2 = y1 + j * sign;
                } else {
                    x2 = x1 + j * sign;
                }
                pass = this.canPixelPass(x2, y2, 5);
                if (pass) break;
            }
            if (pass) break;
        }
        if (!pass) return;
        var radian = E8Plus.adjustRadian(Math.atan2(y2 - y1, x2 - x1));
        this._forwardRadian = radian;
        this._px = x2;
        this._py = y2;
        this._realPX = x1;
        this._realPY = y1;
        this._adjustFrameSpeed = false;
        this.setRadian(radian);
        this.increaseSteps();
    };

    smartMoveSpeed(dir) {
        var diag = dir.constructor === Array;
        while (!this.isMovementSucceeded()) {
            // should improve by figuring out what 1 pixel is in terms of movespeed
            // and subtract by that value instead
            this._moveSpeed--;
            if (diag) {
                this.setMovementSuccess(this.canPixelPassDiagonally(this._px, this._py, dir[0], dir[1]));
            } else {
                this.setMovementSuccess(this.canPixelPass(this._px, this._py, dir));
            }
            if (this._moveSpeed < 1) break;
        }
    };

    reloadColliders() {
        this.removeColliders();
        this.setupColliders();
    };

    removeColliders() {
        ColliderManager.remove(this);
        for (var collider in this._colliders) {
            if (!this._colliders.hasOwnProperty(collider)) continue;
            ColliderManager.remove(this._colliders[collider]);
            this._colliders[collider] = null;
        }
        this._colliders = null;
    };

    // Can pass multiple types into args, ect:
    // collider('collision', 'interaction', 'default')
    // will return first one thats found
    collider(type, alternative) {
        if (!this._colliders) this.setupColliders();
        for (var i = 0; i < arguments.length; i++) {
            if (this._colliders[arguments[i]]) {
                return this._colliders[arguments[i]];
            }
        }
        return this._colliders['default'];
    };

    defaultColliderConfig() {
        return 'box,0,0';
    };

    setupColliders() {
        this._colliders = {};
        var defaultCollider = this.defaultColliderConfig();
        var notes = this.notes(true);
        var configs = {};
        var multi = /<colliders>([\s\S]*)<\/colliders>/i.exec(notes);
        var single = /<collider[:|=](.*?)>/i.exec(notes);
        if (multi) {
            configs = E8Plus.stringToObj(multi[1]);
        }
        if (single) {
            configs.default = E8Plus.stringToAry(single[1]);
        } else if (!configs.default) {
            configs.default = E8Plus.stringToAry(defaultCollider);
        }
        Object.assign(configs, this._overrideColliders);
        for (var collider in configs) {
            this.makeCollider(collider, configs[collider]);
        }
        this.makeBounds();
        this.moveColliders();
        var collider = this.collider('collision');
        // _pathfind not a collider
        // this._colliders['_pathfind'] = JsonEx.parse(JsonEx.stringify(collider));
        this._colliders['_pathfind'] = collider;
        this._optTiles = null;
    };

    makeCollider(type, settings) {
        this._colliders[type] = ColliderManager.convertToCollider(settings);
        this._colliders[type].oy -= this.shiftY();
        this._colliders[type]._charaId = this.charaId();
        ColliderManager.addCollider(this._colliders[type], -1, true);
    };

    changeCollider(type, settings) {
        this._overrideColliders[type] = settings;
        this.reloadColliders();
    };

    makeBounds() {
        var minX = null;
        var maxX = null;
        var minY = null;
        var maxY = null;
        for (var type in this._colliders) {
            if (!this._colliders.hasOwnProperty(type)) continue;
            var edge = this._colliders[type].edge();
            if (minX === null || minX > edge.x1) {
                minX = edge.x1;
            }
            if (maxX === null || maxX < edge.x2) {
                maxX = edge.x2;
            }
            if (minY === null || minY > edge.y1) {
                minY = edge.y1;
            }
            if (maxY === null || maxY < edge.y2) {
                maxY = edge.y2;
            }
        }
        var w = maxX - minX + 1;
        var h = maxY - minY + 1;
        this._colliders['bounds'] = new Box_Collider(w, h, minX, minY);
        this._colliders['bounds']._charaId = String(this.charaId());
        ColliderManager.addCharacter(this, 0);
    };

    moveColliders(x, y) {
        x = typeof x === 'number' ? x : this.px;
        y = typeof y === 'number' ? y : this.py;
        var prev = this._colliders['bounds'].sectorEdge();
        for (var collider in this._colliders) {
            if (this._colliders.hasOwnProperty(collider)) {
                this._colliders[collider].moveTo(x, y);
            }
        }
        ColliderManager.updateGrid(this, prev);
    };

    cx(grid) {
        var x = this.collider('collision').center.x;;
        if (grid) {
            x /= Movement.tileSize;
        }
        return x;
    };

    cy(grid) {
        var y = this.collider('collision').center.y;
        if (grid) {
            y /= Movement.tileSize;
        }
        return y;
    };

    //plus
    charaId() {
        return -1;
    };

    notes() {
        return '';
    };


    /**
     * east is 0, north is 270, west is 180 and south is 90
     */
    directionToRadian(dir) {
        dir = dir || this._direction;
        if (dir === 2) return Math.PI / 2;
        if (dir === 4) return Math.PI;
        if (dir === 6) return 0;
        if (dir === 8) return Math.PI * 3 / 2;
        if (dir === 1) return Math.PI * 3 / 4;
        if (dir === 3) return Math.PI / 4;
        if (dir === 7) return Math.PI * 5 / 4;
        if (dir === 9) return Math.PI * 7 / 4;
        return 0;
    };

    radianToDirection(radian, useDiag) {
        radian = E8Plus.adjustRadian(radian);
        if (useDiag) {
            // use degrees for diagonals
            // since I don't know clean PI numbers for these degrees
            var deg = radian * 180 / Math.PI;
            if (deg >= 22.5 && deg <= 67.5) {
                return 3;
            } else if (deg >= 112.5 && deg <= 157.5) {
                return 1;
            } else if (deg >= 202.5 && deg <= 247.5) {
                return 7;
            } else if (deg >= 292.5 && deg <= 337.5) {
                return 9;
            }
        }
        if (radian >= 0 && radian < Math.PI / 4) {
            return 6;
        } else if (radian >= Math.PI / 4 && radian < 3 * Math.PI / 4) {
            return 2;
        } else if (radian >= Math.PI * 3 / 4 && radian < Math.PI * 5 / 4) {
            return 4;
        } else if (radian >= Math.PI * 5 / 4 && radian < Math.PI * 7 / 4) {
            return 8;
        } else if (radian >= Math.PI * 7 / 4) {
            return 6;
        }
    };

    setSelfSwitch() {
        return;
    };

    updateRoutineMove() {
        if (this._globalLocked >= 1) {
            return;
        }
    }


    // Path finding

    optTiles() {
        if (!GameGlobal.$gameMap.offGrid()) {
            return this.moveTiles();
        }
        if (!this._optTiles) {
            var w = Math.round(this.collider('collision').width);
            var h = Math.round(this.collider('collision').height);
            while (w % this.moveTiles() !== 0) {
                w--;
                if (w <= this.moveTiles()) break;
            }
            while (h % this.moveTiles() !== 0) {
                h--;
                if (h <= this.moveTiles()) break;
            }
            this._optTiles = Math.max(Math.min(w, h), this.moveTiles());
        }
        return this._optTiles;
    };

    GetConstructorType() {
        return "Game_CharacterBase"
    }
}