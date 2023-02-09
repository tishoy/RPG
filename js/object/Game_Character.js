import Game_CharacterBase from './Game_CharacterBase'
import Pathfind from '../18ext/Pathfind'
import Point from '../core/point'
import E8Plus from '../18ext/E8Plus'
import Movement from '../core/movement'
/**
 * create by 18tech
 */
export default class Game_Character extends Game_CharacterBase {
    constructor() {
        super();
    }

    static ROUTE_END = 0;
    static ROUTE_MOVE_DOWN = 1;
    static ROUTE_MOVE_LEFT = 2;
    static ROUTE_MOVE_RIGHT = 3;
    static ROUTE_MOVE_UP = 4;
    static ROUTE_MOVE_LOWER_L = 5;
    static ROUTE_MOVE_LOWER_R = 6;
    static ROUTE_MOVE_UPPER_L = 7;
    static ROUTE_MOVE_UPPER_R = 8;
    static ROUTE_MOVE_RANDOM = 9;
    static ROUTE_MOVE_TOWARD = 10;
    static ROUTE_MOVE_AWAY = 11;
    static ROUTE_MOVE_FORWARD = 12;
    static ROUTE_MOVE_BACKWARD = 13;
    static ROUTE_JUMP = 14;
    static ROUTE_WAIT = 15;
    static ROUTE_TURN_DOWN = 16;
    static ROUTE_TURN_LEFT = 17;
    static ROUTE_TURN_RIGHT = 18;
    static ROUTE_TURN_UP = 19;
    static ROUTE_TURN_90D_R = 20;
    static ROUTE_TURN_90D_L = 21;
    static ROUTE_TURN_180D = 22;
    static ROUTE_TURN_90D_R_L = 23;
    static ROUTE_TURN_RANDOM = 24;
    static ROUTE_TURN_TOWARD = 25;
    static ROUTE_TURN_AWAY = 26;
    static ROUTE_SWITCH_ON = 27;
    static ROUTE_SWITCH_OFF = 28;
    static ROUTE_CHANGE_SPEED = 29;
    static ROUTE_CHANGE_FREQ = 30;
    static ROUTE_WALK_ANIME_ON = 31;
    static ROUTE_WALK_ANIME_OFF = 32;
    static ROUTE_STEP_ANIME_ON = 33;
    static ROUTE_STEP_ANIME_OFF = 34;
    static ROUTE_DIR_FIX_ON = 35;
    static ROUTE_DIR_FIX_OFF = 36;
    static ROUTE_THROUGH_ON = 37;
    static ROUTE_THROUGH_OFF = 38;
    static ROUTE_TRANSPARENT_ON = 39;
    static ROUTE_TRANSPARENT_OFF = 40;
    static ROUTE_CHANGE_IMAGE = 41;
    static ROUTE_CHANGE_OPACITY = 42;
    static ROUTE_CHANGE_BLEND_MODE = 43;
    static ROUTE_PLAY_SE = 44;
    static ROUTE_SCRIPT = 45;

    initialize() {
        super.initialize();
    }

    initMembers() {
        super.initMembers();
        this._moveRouteForcing = false;
        this._moveRoute = null;
        this._moveRouteIndex = 0;
        this._originalMoveRoute = null;
        this._originalMoveRouteIndex = 0;
        this._waitCount = 0;
    }

    memorizeMoveRoute() {
        this._originalMoveRoute = this._moveRoute;
        this._originalMoveRouteIndex = this._moveRouteIndex;
    }

    restoreMoveRoute() {
        this._moveRoute = this._originalMoveRoute;
        this._moveRouteIndex = this._originalMoveRouteIndex;
        this._originalMoveRoute = null;
    }

    isMoveRouteForcing() {
        if (this._isPathfinding && this._pathfind.options.breakable) {
            return false;
        }
        return this._moveRouteForcing;
    }

    setMoveRoute(moveRoute) {
        this._moveRoute = moveRoute;
        this._moveRouteIndex = 0;
        this._moveRouteForcing = false;
    }

    forceMoveRoute(moveRoute) {
        if (!this._originalMoveRoute) {
            this.memorizeMoveRoute();
        }
        this._moveRoute = moveRoute;
        this._moveRouteIndex = 0;
        this._moveRouteForcing = true;
        this._waitCount = 0;
    }

    updateStop() {
        super.updateStop();
        if (this._moveRouteForcing) {
            this.updateRoutineMove();
        }
    }

    updateRoutineMove() {
        if (this._waitCount > 0) {
            this._waitCount--;
        } else {
            this.setMovementSuccess(true);
            var command = this._moveRoute.list[this._moveRouteIndex];
            if (command) {
                this.processMoveCommand(command);
                this.advanceMoveRouteIndex();
            }
        }
    }

    processMoveCommand(command) {
        this.subMVMoveCommands(command);
        if (this.subQMoveCommand(command)) {
            command = this._moveRoute.list[this._moveRouteIndex];
        }
        this.processQMoveCommands(command);
        var gc = Game_Character;
        var params = command.parameters;
        switch (command.code) {
            case gc.ROUTE_END:
                this.processRouteEnd();
                break;
            case gc.ROUTE_MOVE_DOWN:
                this.moveStraight(2);
                break;
            case gc.ROUTE_MOVE_LEFT:
                this.moveStraight(4);
                break;
            case gc.ROUTE_MOVE_RIGHT:
                this.moveStraight(6);
                break;
            case gc.ROUTE_MOVE_UP:
                this.moveStraight(8);
                break;
            case gc.ROUTE_MOVE_LOWER_L:
                this.moveDiagonally(4, 2);
                break;
            case gc.ROUTE_MOVE_LOWER_R:
                this.moveDiagonally(6, 2);
                break;
            case gc.ROUTE_MOVE_UPPER_L:
                this.moveDiagonally(4, 8);
                break;
            case gc.ROUTE_MOVE_UPPER_R:
                this.moveDiagonally(6, 8);
                break;
            case gc.ROUTE_MOVE_RANDOM:
                this.moveRandom();
                break;
            case gc.ROUTE_MOVE_TOWARD:
                this.moveTowardPlayer();
                break;
            case gc.ROUTE_MOVE_AWAY:
                this.moveAwayFromPlayer();
                break;
            case gc.ROUTE_MOVE_FORWARD:
                this.moveForward();
                break;
            case gc.ROUTE_MOVE_BACKWARD:
                this.moveBackward();
                break;
            case gc.ROUTE_JUMP:
                this.jump(params[0], params[1]);
                break;
            case gc.ROUTE_WAIT:
                this._waitCount = params[0] - 1;
                break;
            case gc.ROUTE_TURN_DOWN:
                this.setDirection(2);
                break;
            case gc.ROUTE_TURN_LEFT:
                this.setDirection(4);
                break;
            case gc.ROUTE_TURN_RIGHT:
                this.setDirection(6);
                break;
            case gc.ROUTE_TURN_UP:
                this.setDirection(8);
                break;
            case gc.ROUTE_TURN_90D_R:
                this.turnRight90();
                break;
            case gc.ROUTE_TURN_90D_L:
                this.turnLeft90();
                break;
            case gc.ROUTE_TURN_180D:
                this.turn180();
                break;
            case gc.ROUTE_TURN_90D_R_L:
                this.turnRightOrLeft90();
                break;
            case gc.ROUTE_TURN_RANDOM:
                this.turnRandom();
                break;
            case gc.ROUTE_TURN_TOWARD:
                this.turnTowardPlayer();
                break;
            case gc.ROUTE_TURN_AWAY:
                this.turnAwayFromPlayer();
                break;
            case gc.ROUTE_SWITCH_ON:
                GameGlobal.$gameSwitches.setValue(params[0], true);
                break;
            case gc.ROUTE_SWITCH_OFF:
                GameGlobal.$gameSwitches.setValue(params[0], false);
                break;
            case gc.ROUTE_CHANGE_SPEED:
                this.setMoveSpeed(params[0]);
                break;
            case gc.ROUTE_CHANGE_FREQ:
                this.setMoveFrequency(params[0]);
                break;
            case gc.ROUTE_WALK_ANIME_ON:
                this.setWalkAnime(true);
                break;
            case gc.ROUTE_WALK_ANIME_OFF:
                this.setWalkAnime(false);
                break;
            case gc.ROUTE_STEP_ANIME_ON:
                this.setStepAnime(true);
                break;
            case gc.ROUTE_STEP_ANIME_OFF:
                this.setStepAnime(false);
                break;
            case gc.ROUTE_DIR_FIX_ON:
                this.setDirectionFix(true);
                break;
            case gc.ROUTE_DIR_FIX_OFF:
                this.setDirectionFix(false);
                break;
            case gc.ROUTE_THROUGH_ON:
                this.setThrough(true);
                break;
            case gc.ROUTE_THROUGH_OFF:
                this.setThrough(false);
                break;
            case gc.ROUTE_TRANSPARENT_ON:
                this.setTransparent(true);
                break;
            case gc.ROUTE_TRANSPARENT_OFF:
                this.setTransparent(false);
                break;
            case gc.ROUTE_CHANGE_IMAGE:
                this.setImage(params[0], params[1]);
                break;
            case gc.ROUTE_CHANGE_OPACITY:
                this.setOpacity(params[0]);
                break;
            case gc.ROUTE_CHANGE_BLEND_MODE:
                this.setBlendMode(params[0]);
                break;
            case gc.ROUTE_PLAY_SE:
                AudioManager.playSe(params[0]);
                break;
            case gc.ROUTE_SCRIPT:
                eval(params[0]);
                break;
        }
    }

    deltaXFrom(x) {
        return GameGlobal.$gameMap.deltaX(this.x, x);
    }

    deltaYFrom(y) {
        return GameGlobal.$gameMap.deltaY(this.y, y);
    }

    moveRandom() {
        var d = 2 + Math.randomInt(4) * 2;
        if (this.canPass(this.x, this.y, d)) {
            this.moveStraight(d);
        }
    }

    moveTowardCharacter(character) {
        if (GameGlobal.$gameMap.offGrid()) {
            var dx = this.deltaPXFrom(character.cx());
            var dy = this.deltaPYFrom(character.cy());
            var radian = Math.atan2(-dy, -dx);
            if (radian < 0) radian += Math.PI * 2;
            var oldSM = this._smartMove;
            if (oldSM <= 1) this._smartMove = 2;
            this.moveRadian(radian);
            this._smartMove = oldSM;
        } else {
            var sx = this.deltaXFrom(character.x);
            var sy = this.deltaYFrom(character.y);
            if (Math.abs(sx) > Math.abs(sy)) {
                this.moveStraight(sx > 0 ? 4 : 6);
                if (!this.isMovementSucceeded() && sy !== 0) {
                    this.moveStraight(sy > 0 ? 8 : 2);
                }
            } else if (sy !== 0) {
                this.moveStraight(sy > 0 ? 8 : 2);
                if (!this.isMovementSucceeded() && sx !== 0) {
                    this.moveStraight(sx > 0 ? 4 : 6);
                }
            }
        }
    }

    moveAwayFromCharacter(character) {
        if (GameGlobal.$gameMap.offGrid()) {
            var dx = this.deltaPXFrom(character.cx());
            var dy = this.deltaPYFrom(character.cy());
            var radian = Math.atan2(dy, dx);
            if (radian < 0) radian += Math.PI * 2;
            var oldSM = this._smartMove;
            if (oldSM <= 1) this._smartMove = 2;
            this.moveRadian(radian);
            this._smartMove = oldSM;
        } else {
            var sx = this.deltaXFrom(character.x);
            var sy = this.deltaYFrom(character.y);
            if (Math.abs(sx) > Math.abs(sy)) {
                this.moveStraight(sx > 0 ? 6 : 4);
                if (!this.isMovementSucceeded() && sy !== 0) {
                    this.moveStraight(sy > 0 ? 2 : 8);
                }
            } else if (sy !== 0) {
                this.moveStraight(sy > 0 ? 2 : 8);
                if (!this.isMovementSucceeded() && sx !== 0) {
                    this.moveStraight(sx > 0 ? 6 : 4);
                }
            }
        }
    }

    turnTowardCharacter(character) {
        var sx = this.deltaXFrom(character.x);
        var sy = this.deltaYFrom(character.y);
        if (Math.abs(sx) > Math.abs(sy)) {
            this.setDirection(sx > 0 ? 4 : 6);
        } else if (sy !== 0) {
            this.setDirection(sy > 0 ? 8 : 2);
        }
    }

    turnAwayFromCharacter(character) {
        var sx = this.deltaXFrom(character.x);
        var sy = this.deltaYFrom(character.y);
        if (Math.abs(sx) > Math.abs(sy)) {
            this.setDirection(sx > 0 ? 6 : 4);
        } else if (sy !== 0) {
            this.setDirection(sy > 0 ? 2 : 8);
        }
    }

    turnTowardPlayer() {
        this.turnTowardCharacter(GameGlobal.$gamePlayer);
    }

    turnAwayFromPlayer() {
        this.turnAwayFromCharacter(GameGlobal.$gamePlayer);
    }

    moveTowardPlayer() {
        this.moveTowardCharacter(GameGlobal.$gamePlayer);
    }

    moveAwayFromPlayer() {
        this.moveAwayFromCharacter(GameGlobal.$gamePlayer);
    }

    moveForward() {
        this.moveStraight(this.direction());
    }

    moveBackward() {
        var lastDirectionFix = this.isDirectionFixed();
        this.setDirectionFix(true);
        this.moveStraight(this.reverseDir(this.direction()));
        this.setDirectionFix(lastDirectionFix);
    }

    processRouteEnd() {
        if (this._moveRoute.repeat) {
            this._moveRouteIndex = -1;
        } else if (this._moveRouteForcing) {
            this._moveRouteForcing = false;
            this.restoreMoveRoute();
        }
        if (this._isPathfinding) {
            this.onPathfindComplete();
        }
    }

    advanceMoveRouteIndex() {
        if (this._isPathfinding) {
            var moveRoute = this._moveRoute;
            if (moveRoute && (!this.isMovementSucceeded() && this._pathfind.options.smart > 0)) {
                this._isPathfinding = false;
                this.processRouteEnd();
                this._pathfind.requestRestart(2);
                return;
            }
        }
        var moveRoute = this._moveRoute;
        if (moveRoute && (this.isMovementSucceeded() || moveRoute.skippable)) {
            var numCommands = moveRoute.list.length - 1;
            this._moveRouteIndex++;
            if (moveRoute.repeat && this._moveRouteIndex >= numCommands) {
                this._moveRouteIndex = 0;
            }
        }
    }

    turnRight90() {
        switch (this.direction()) {
            case 2:
                this.setDirection(4);
                break;
            case 4:
                this.setDirection(8);
                break;
            case 6:
                this.setDirection(2);
                break;
            case 8:
                this.setDirection(6);
                break;
        }
    }

    turnLeft90() {
        switch (this.direction()) {
            case 2:
                this.setDirection(6);
                break;
            case 4:
                this.setDirection(2);
                break;
            case 6:
                this.setDirection(8);
                break;
            case 8:
                this.setDirection(4);
                break;
        }
    }

    turn180() {
        this.setDirection(this.reverseDir(this.direction()));
    }

    turnRightOrLeft90() {
        switch (Math.randomInt(2)) {
            case 0:
                this.turnRight90();
                break;
            case 1:
                this.turnLeft90();
                break;
        }
    }

    turnRandom() {
        this.setDirection(2 + Math.randomInt(4) * 2);
    }

    swap(character) {
        var newX = character.x;
        var newY = character.y;
        character.locate(this.x, this.y);
        this.locate(newX, newY);
    }

    findDirectionTo(goalX, goalY) {
        var searchLimit = this.searchLimit();
        var mapWidth = GameGlobal.$gameMap.width();
        var nodeList = [];
        var openList = [];
        var closedList = [];
        var start = {}
        var best = start;

        if (this.x === goalX && this.y === goalY) {
            return 0;
        }

        start.parent = null;
        start.x = this.x;
        start.y = this.y;
        start.g = 0;
        start.f = GameGlobal.$gameMap.distance(start.x, start.y, goalX, goalY);
        nodeList.push(start);
        openList.push(start.y * mapWidth + start.x);

        while (nodeList.length > 0) {
            var bestIndex = 0;
            for (var i = 0; i < nodeList.length; i++) {
                if (nodeList[i].f < nodeList[bestIndex].f) {
                    bestIndex = i;
                }
            }

            var current = nodeList[bestIndex];
            var x1 = current.x;
            var y1 = current.y;
            var pos1 = y1 * mapWidth + x1;
            var g1 = current.g;

            nodeList.splice(bestIndex, 1);
            openList.splice(openList.indexOf(pos1), 1);
            closedList.push(pos1);

            if (current.x === goalX && current.y === goalY) {
                best = current;
                break;
            }

            if (g1 >= searchLimit) {
                continue;
            }

            for (var j = 0; j < 4; j++) {
                var direction = 2 + j * 2;
                var x2 = GameGlobal.$gameMap.roundXWithDirection(x1, direction);
                var y2 = GameGlobal.$gameMap.roundYWithDirection(y1, direction);
                var pos2 = y2 * mapWidth + x2;

                if (closedList.contains(pos2)) {
                    continue;
                }
                if (!this.canPass(x1, y1, direction)) {
                    continue;
                }

                var g2 = g1 + 1;
                var index2 = openList.indexOf(pos2);

                if (index2 < 0 || g2 < nodeList[index2].g) {
                    var neighbor;
                    if (index2 >= 0) {
                        neighbor = nodeList[index2];
                    } else {
                        neighbor = {}
                        nodeList.push(neighbor);
                        openList.push(pos2);
                    }
                    neighbor.parent = current;
                    neighbor.x = x2;
                    neighbor.y = y2;
                    neighbor.g = g2;
                    neighbor.f = g2 + GameGlobal.$gameMap.distance(x2, y2, goalX, goalY);
                    if (!best || neighbor.f - neighbor.g < best.f - best.g) {
                        best = neighbor;
                    }
                }
            }
        }

        var node = best;
        while (node.parent && node.parent !== start) {
            node = node.parent;
        }

        var deltaX1 = GameGlobal.$gameMap.deltaX(node.x, start.x);
        var deltaY1 = GameGlobal.$gameMap.deltaY(node.y, start.y);
        if (deltaY1 > 0) {
            return 2;
        } else if (deltaX1 < 0) {
            return 4;
        } else if (deltaX1 > 0) {
            return 6;
        } else if (deltaY1 < 0) {
            return 8;
        }

        var deltaX2 = this.deltaXFrom(goalX);
        var deltaY2 = this.deltaYFrom(goalY);
        if (Math.abs(deltaX2) > Math.abs(deltaY2)) {
            return deltaX2 > 0 ? 4 : 6;
        } else if (deltaY2 !== 0) {
            return deltaY2 > 0 ? 8 : 2;
        }

        return 0;
    }

    searchLimit() {
        return 12;
    }

    //movement
    subMVMoveCommands(command) {
        var gc = Game_Character;
        var params = command.parameters;
        switch (command.code) {
            case gc.ROUTE_MOVE_DOWN: {
                this.subQMove('2, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_LEFT: {
                this.subQMove('4, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_RIGHT: {
                this.subQMove('6, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_UP: {
                this.subQMove('8, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_LOWER_L: {
                this.subQMove('1, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_LOWER_R: {
                this.subQMove('3, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_UPPER_L: {
                this.subQMove('7, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_UPPER_R: {
                this.subQMove('9, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_FORWARD: {
                this.subQMove('5, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_MOVE_BACKWARD: {
                this.subQMove('0, 1,' + Movement.tileSize);
                break;
            }
            case gc.ROUTE_TURN_DOWN:
            case gc.ROUTE_TURN_LEFT:
            case gc.ROUTE_TURN_RIGHT:
            case gc.ROUTE_TURN_UP:
            case gc.ROUTE_TURN_90D_R:
            case gc.ROUTE_TURN_90D_L:
            case gc.ROUTE_TURN_180D:
            case gc.ROUTE_TURN_90D_R_L:
            case gc.ROUTE_TURN_RANDOM:
            case gc.ROUTE_TURN_TOWARD:
            case gc.ROUTE_TURN_AWAY: {
                this._freqCount = this.freqThreshold();
                break;
            }
        }
    };

    subQMoveCommand(command) {
        var gc = Game_Character;
        var code = command.code;
        var params = command.parameters;
        if (command.code === gc.ROUTE_SCRIPT) {
            var qmove = /^qmove\((.*)\)/i.exec(params[0]);
            var qmove2 = /^qmove2\((.*)\)/i.exec(params[0]);
            var arc = /^arc\((.*)\)/i.exec(params[0]);
            var arc2 = /^arc2\((.*)\)/i.exec(params[0]);
            if (qmove) return this.subQMove(qmove[1]);
            if (qmove2) return this.subQMove2(qmove2[1]);
            if (arc) return this.subArc(arc[1]);
            if (arc2) return this.subArc2(arc2[1]);
        }
        return false;
    };

    processQMoveCommands(command) {
        var params = command.parameters;
        switch (command.code) {
            case 'arc': {
                this.arc(params[0], params[1], eval(params[2]), params[3], params[4]);
                break;
            }
            case 'arc2': {
                var x = params[0] + this.px;
                var y = params[1] + this.py;
                this.arc(x, y, eval(params[2]), params[3], params[4]);
                break;
            }
            case 'fixedRadianMove': {
                this.fixedRadianMove(params[0], params[1]);
                break;
            }
            case 'fixedMove': {
                this.fixedMove(params[0], params[1]);
                break;
            }
            case 'fixedMoveBackward': {
                this.fixedMoveBackward(params[0]);
                break;
            }
            case 'fixedMoveForward': {
                this.fixedMove(this.direction(), params[0]);
                break;
            }
        }
    };

    subArc(settings) {
        var cmd = {};
        cmd.code = 'arc';
        cmd.parameters = E8Plus.stringToAry(settings);
        this._moveRoute.list[this._moveRouteIndex] = cmd;
        return true;
    };

    subArc2(settings) {
        var cmd = {};
        cmd.code = 'arc2';
        cmd.parameters = E8Plus.stringToAry(settings);
        this._moveRoute.list[this._moveRouteIndex] = cmd;
        return true;
    };

    subQMove(settings) {
        settings = E8Plus.stringToAry(settings);
        var dir = settings[0];
        var amt = settings[1];
        var multi = settings[2] || 1;
        var tot = amt * multi;
        var steps = Math.floor(tot / this.moveTiles());
        var moved = 0;
        var i;
        for (i = 0; i < steps; i++) {
            moved += this.moveTiles();
            var cmd = {};
            if (dir === 0) {
                cmd.code = 'fixedMoveBackward';
                cmd.parameters = [this.moveTiles()];
            } else if (dir === 5) {
                cmd.code = 'fixedMoveForward';
                cmd.parameters = [this.moveTiles()];
            } else {
                cmd.code = 'fixedMove';
                cmd.parameters = [dir, this.moveTiles()];
            }
            this._moveRoute.list.splice(this._moveRouteIndex + 1, 0, cmd);
        }
        if (moved < tot) {
            var cmd = {};
            if (dir === 0) {
                cmd.code = 'fixedMoveBackward';
                cmd.parameters = [this.moveTiles()];
            } else if (dir === 5) {
                cmd.code = 'fixedMoveForward';
                cmd.parameters = [this.moveTiles()];
            } else {
                cmd.code = 'fixedMove';
                cmd.parameters = [dir, this.moveTiles()];
            }
            this._moveRoute.list.splice(this._moveRouteIndex + 1 + i, 0, cmd);
        }
        this._moveRoute.list.splice(this._moveRouteIndex, 1);
        return true;
    };

    subQMove2(settings) {
        settings = E8Plus.stringToAry(settings);
        var radian = settings[0];
        var dist = settings[1];
        var maxSteps = Math.floor(dist / this.moveTiles());
        var steps = 0;
        var i;
        for (i = 0; i < maxSteps; i++) {
            steps += this.moveTiles();
            var cmd = {};
            cmd.code = 'fixedRadianMove';
            cmd.parameters = [radian, this.moveTiles()];
            this._moveRoute.list.splice(this._moveRouteIndex + 1, 0, cmd);
        }
        if (steps < dist) {
            var cmd = {};
            cmd.code = 'fixedRadianMove';
            cmd.parameters = [radian, dist - steps];
            this._moveRoute.list.splice(this._moveRouteIndex + 1 + i, 0, cmd);
        }
        this._moveRoute.list.splice(this._moveRouteIndex, 1);
        return true;
    };

    moveRandom() {
        var d = 2 + Math.randomInt(4) * 2;
        if (this.canPixelPass(this._px, this._py, d)) {
            this.moveStraight(d);
        }
    };




    turnTowardCharacter(character) {
        var dx = this.deltaPXFrom(character.cx());
        var dy = this.deltaPYFrom(character.cy());
        this.setRadian(Math.atan2(-dy, -dx));
    };

    turnTowardCharacterForward(character, dt) {
        if (!character.isMoving()) {
            return this.turnTowardCharacter(character);
        }
        dt = dt || 1;
        var forward = character.forwardV();
        var x = character.cx() + (forward.x * dt);
        var y = character.cy() + (forward.y * dt);
        var dx = this.deltaPXFrom(x);
        var dy = this.deltaPYFrom(y);
        this.setRadian(Math.atan2(-dy, -dx));
    };

    turnAwayFromCharacter(character) {
        var dx = this.deltaPXFrom(character.cx());
        var dy = this.deltaPYFrom(character.cy());
        this.setRadian(Math.atan2(dy, dx));
    };

    deltaPXFrom(x) {
        return GameGlobal.$gameMap.deltaPX(this.cx(), x);
    };

    deltaPYFrom(y) {
        return GameGlobal.$gameMap.deltaPY(this.cy(), y);
    };

    pixelDistanceFrom(x, y) {
        return GameGlobal.$gameMap.distance(this.cx(), this.cy(), x, y);
    };

    // Returns the px, py needed for this character to be center aligned
    // with the character passed in (align is based off collision collider)
    centerWith(character) {
        var dx1 = this.cx() - this._px;
        var dy1 = this.cy() - this._py;
        var dx2 = character.cx() - character._px;
        var dy2 = character.cy() - character._py;
        var dx = dx2 - dx1;
        var dy = dy2 - dy1;
        return new Point(character._px + dx, character._py + dy);
    };

    centerWithCollider(collider) {
        var dx1 = this.cx() - this._px;
        var dy1 = this.cy() - this._py;
        var dx2 = collider.center.x - collider.x;
        var dy2 = collider.center.y - collider.y;
        var dx = dx2 - dx1;
        var dy = dy2 - dy1;
        return new Point(collider.x + dx, collider.y + dy);
    };

    adjustPosition(xf, yf) {
        var dx = xf - this._px;
        var dy = yf - this._py;
        var radian = Math.atan2(dy, dx);
        var distX = Math.cos(radian) * this.moveTiles();
        var distY = Math.sin(radian) * this.moveTiles();
        var final = new Point(xf, yf);
        while (!this.canPixelPass(final.x, final.y, 5, 'collision')) {
            final.x -= distX;
            final.y -= distY;
            dx = final.x - this._px;
            dy = final.y - this._py;
            if (Math.atan2(dy, dx) !== radian) {
                final.x = this._px;
                final.y = this._py;
                break;
            }
        }
        this.moveColliders(this._px, this._py);
        return final;
    };


    // if using QMovement, x and y are pixel values
    initPathfind(x, y, options) {
        if (!this.isSamePathfind(x, y, options)) {
            return;
        }
        if (this._isPathfinding) {
            this.clearPathfind();
        }
        options = options || {};
        this._isChasing = options.chase !== undefined ? options.chase : false;
        this._pathfind = new Pathfind(this.charaId(), new Point(x, y), options);
    };

    initChase(charaId) {
        if (this.charaId() === charaId) return;
        if (!E8Plus.getCharacter(charaId)) return;
        if (this._isChasing === charaId) return;
        this.initPathfind(0, 0, {
            smart: 2,
            chase: charaId,
            adjustEnd: true,
            //towards: true
        })
    };

    isSamePathfind(x, y, options) {
        if (!this._pathfind) {
            return true;
        }
        if (options.chase !== undefined) {
            return options.chase !== this._isChasing;
        }
        var oldX1 = this._pathfind._originalEnd.x;
        var oldY1 = this._pathfind._originalEnd.y;
        var oldX2 = this._pathfind._endNode.x;
        var oldY2 = this._pathfind._endNode.y;
        if ((x === oldX1 && y === oldY1) || (x === oldX2 && y === oldY2)) {
            return false;
        }
        return true;
    };

    restartPathfind() {
        if (!this._pathfind._completed) return;
        var x = this._pathfind._endNode.x;
        var y = this._pathfind._endNode.y;
        this._isPathfinding = false;
        if (this._moveRoute) {
            this.processRouteEnd();
        }
        var options = this._pathfind.options;
        this._isChasing = options.chase !== undefined ? options.chase : false;
        this._pathfind = new Pathfind(this.charaId(), new Point(x, y), options);
    };

    startPathfind(path) {
        this._isPathfinding = true;
        this.forceMoveRoute(Pathfind.pathToRoute(this, path));
    };

    onPathfindComplete() {
        if (this._isChasing !== false) {
            var chara = E8Plus.getCharacter(this._isChasing);
            if (chara) {
                this._isPathfinding = false;
                this.processRouteEnd();
                this._pathfind.requestRestart(5);
                this.turnTowardCharacter(chara);
                return;
            } else {
                this._isChasing = false;
            }
        }
        this._isPathfinding = false;
        this._pathfind = null;
    };

    clearPathfind() {
        this._pathfind = null;
        this._isChasing = false;
        if (this._isPathfinding) {
            this.processRouteEnd();
        }
    };

    showGauge() {
        return this.inCombat();
    }

    GetConstructorType() {
        return "Game_Character"
    }

}