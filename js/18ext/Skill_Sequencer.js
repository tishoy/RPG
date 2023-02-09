/**
 * create by 18tech
 * 2020513
 */
import LightManager from '../managers/LightManager'
import Game_Character from '../object/Game_Character'
import Sprite_SkillTrail from '../sprites/Sprite_SkillTrail'
import ImageManager from '../managers/ImageManager'
import Sprite_SkillPicture from '../sprites/Sprite_SkillPicture'
import ColliderManager from '../managers/ColliderManager'
import E8Plus from '../18ext/E8Plus'
import Game_Interpreter from '../object/Game_Interpreter'
import ABSManager from '../managers/ABSManager'
import Graphics from '../core/graphics'
import Sprite_SkillCollider from '../sprites/Sprite_SkillCollider'
export default class Skill_Sequencer {
    constructor(character, skill) {
        this.initialize(character, skill);
    };

    initialize(character, skill) {
        this._character = character;
        this._skill = skill;
    };

    startAction(action) {
        var cmd = action.shift().toLowerCase();
        switch (cmd) {
            case 'user': {
                this.startUserAction(action);
                break;
            }
            case 'store': {
                this.actionStore();
                break;
            }
            case 'move': {
                this.actionMove(action);
                break;
            }
            case 'movetostored': {
                this.actionMoveToStored(action);
                break;
            }
            case 'wave': {
                this.actionWave(action);
                break;
            }
            case 'wavetostored': {
                this.actionWaveToStored(action);
                break;
            }
            case 'damage':
            case 'trigger': {
                this.actionTrigger(action);
                break;
            }
            case 'adjustaim': {
                this.actionAdjustAim(action);
                break;
            }
            case 'wait': {
                this.actionWait(action);
                break;
            }
            case 'picture': {
                this.actionPicture(action);
                break;
            }
            case 'trail': {
                this.actionTrail(action);
                break;
            }
            case 'collider': {
                this.actionCollider(action);
                break;
            }
            case 'animation': {
                this.actionAnimation(action);
                break;
            }
            case 'se': {
                this.actionSE(action);
                break;
            }
            case 'qaudio': {
                this.actionQAudio(action);
                break;
            }
            case 'forceskill': {
                this.actionForceSkill(action);
                break;
            }
            case 'globallock': {
                GameGlobal.$gameMap.globalLock(null, 0, 1);
                break;
            }
            case 'globalunlock': {
                GameGlobal.$gameMap.globalUnlock(null, 0, 0);
                break;
            }
        }
    };

    startUserAction(action) {
        var cmd = action.shift().toLowerCase();
        switch (cmd) {
            case 'casting': {
                this.userCasting(action);
                break;
            }
            case 'lock': {
                this.userLock();
                break;
            }
            case 'unlock': {
                this.userUnlock();
                break;
            }
            case 'speed': {
                this.userSpeed(action);
                break;
            }
            case 'move': {
                this.userMove(action);
                break;
            }
            case 'movehere': {
                this.userMoveHere(action);
                break;
            }
            case 'jump': {
                this.userJump(action);
                break;
            }
            case 'jumphere': {
                this.userJumpHere(action);
                break;
            }
            case 'teleport': {
                this.userTeleport();
                break;
            }
            case 'setdirection': {
                this.userSetDirection(action);
                break;
            }
            case 'directionfix': {
                this.userDirectionFix(action);
                break;
            }
            case 'pose': {
                this.userPose(action);
                break;
            }
            case 'forceskill': {
                this.userForceSkill(action);
                break;
            }
            case 'animation': {
                this.userAnimation(action);
                break;
            }
            case 'qaudio': {
                this.userQAudio(action);
                break;
            }
        }
    };

    startOnDamageAction(action, targets) {
        var cmd = action.shift().toLowerCase();
        switch (cmd) {
            case 'target': {
                this.startOnDamageTargetAction(action, targets);
                break;
            }
            case 'user': {
                this.startOnDamageUserAction(action, targets);
                break;
            }
            case 'animationtarget': {
                this._skill.animationTarget = Number(action[1]) || 0;
                break;
            }
        }
    };

    startOnDamageTargetAction(action, targets) {
        var cmd = action.shift().toLowerCase();
        switch (cmd) {
            case 'move': {
                this.targetMove(action, targets);
                break;
            }
            case 'jump': {
                this.targetJump(action, targets);
                break;
            }
            case 'pose': {
                this.targetPose(action, targets);
                break;
            }
            case 'cancel': {
                this.targetCancel(action, targets);
                break;
            }
            case 'qaudio': {
                this.targetQAudio(action, targets);
                break;
            }
        }
    };

    startOnDamageUserAction(action, targets) {
        var cmd = action.shift().toLowerCase();
        switch (cmd) {
            case 'forceskill': {
                this.userForceSkill(action);
                break;
            }
        }
    };

    userCasting(action) {
        if (!this._skill.forced) {
            this._character._casting = action[0] === 'true' ? this._skill : false;
        }
    };

    userLock() {
        var i = this._character._skillLocked.indexOf(this._skill);
        if (i >= 0) return;
        this._character._skillLocked.push(this._skill);
    };

    userUnlock() {
        var i = this._character._skillLocked.indexOf(this._skill);
        if (i >= 0) {
            this._character._skillLocked.splice(i, 1);
        }
    };

    userSpeed(action) {
        var amt = Number(action[1]) || 1;
        var spd = this._character.moveSpeed();
        if (action[0] === 'inc') {
            this._character.setMoveSpeed(spd + amt);
        } else if (action[0] === 'dec') {
            this._character.setMoveSpeed(spd - amt);
        }
    };

    userMove(action) {
        var dist = Number(action[1]) || this._character.moveTiles();
        var route = {
            list: [],
            repeat: false,
            skippable: true,
            wait: false
        }
        var radian = this._character._radian;
        var oldRadian = this._character._radian;
        if (action[0] === 'backward') {
            radian -= Math.PI;
        }
        route.list.push({
            code: Game_Character.ROUTE_SCRIPT,
            parameters: ['qmove2(' + radian + ',' + dist + ')']
        });
        if (action[0] === 'backward') {
            route.list.unshift({
                code: Game_Character.ROUTE_DIR_FIX_OFF
            });
            route.list.push({
                code: this._character.isDirectionFixed() ?
                    Game_Character.ROUTE_DIR_FIX_ON : Game_Character.ROUTE_DIR_FIX_OFF
            });
        }
        route.list.push({
            code: Game_Character.ROUTE_END
        });
        this._character.forceMoveRoute(route);
        this._character.updateRoutineMove();
        this._waitForUserMove = action[2] ? action[2] === 'true' : false;
    };

    userMoveHere(action) {
        var center = this._character.centerWithCollider(this._skill.collider);
        var final = this._character.adjustPosition(center.x, center.y);
        var dx = final.x - this._character.px;
        var dy = final.y - this._character.py;
        var radian = Math.atan2(dy, dx);
        var dist = Math.sqrt(dx * dx + dy * dy);
        var route = {
            list: [],
            repeat: false,
            skippable: true,
            wait: false
        }
        route.list.push({
            code: Game_Character.ROUTE_SCRIPT,
            parameters: ['qmove2(' + radian + ',' + dist + ')']
        });
        route.list.push({
            code: Game_Character.ROUTE_END
        });
        this._character.forceMoveRoute(route);
        this._character.updateRoutineMove();
        this._waitForUserMove = action[0] ? action[0] === 'true' : false;
    };

    userJump(action) {
        var dist = Number(action[1]) || 0;
        var x1 = this._character.px;
        var y1 = this._character.py;
        var radian = this._character._radian;
        var oldRadian = this._character._radian;
        if (action[0] === 'backward') {
            radian -= Math.PI;
        }
        var x2 = x1 + Math.cos(radian) * dist;
        var y2 = y1 + Math.sin(radian) * dist;
        var final = this._character.adjustPosition(x2, y2);
        var dx = final.x - x1;
        var dy = final.y - y1;
        var lastDirectionFix = this._character.isDirectionFixed();
        if (action[0] === 'backward') {
            this._character.setDirectionFix(true);
        }
        this._character.pixelJump(dx, dy);
        this._character.setDirectionFix(lastDirectionFix);
        this._character.setRadian(oldRadian);
        this._waitForUserJump = action[2] ? action[2] === 'true' : false;
    };

    userJumpHere(action) {
        var center = this._character.centerWithCollider(this._skill.collider);
        var final = this._character.adjustPosition(center.x, center.y);
        var dx = final.x - this._character.px;
        var dy = final.y - this._character.py;
        this._character.pixelJump(dx, dy);
        this._waitForUserJump = action[0] ? action[0] === 'true' : false;
    };

    userTeleport() {
        var x1 = this._skill.collider.x;
        var y1 = this._skill.collider.y;
        this._character.setPixelPosition(x1, y1);
    };

    userSetDirection(action) {
        var dir = Number(action[0]);
        if (dir) {
            this._character.setDirection(dir);
        }
    };

    userDirectionFix(action) {
        this._character.setDirectionFix(action[0] === 'true');
    };

    userPose(action) {
        this._character.playPose(action[0]);
        this._waitForUserPose = action[1] === 'true';
    };

    userForceSkill(action) {
        var id = Number(action[0]);
        var angleOffset = Number(action[1]);
        var radian = this._character._radian;
        if (angleOffset) {
            radian += angleOffset * Math.PI / 180;
        }
        var skill = this._character.forceSkill(id, true);
        skill.radian = radian;
        skill._target = this._skill._target;
    };

    userAnimation(action) {
        var id = Number(action[0]);
        var x = this._character.cx();
        var y = this._character.cy();
        ABSManager.startAnimation(id, x, y);
    };

    userQAudio(action) {
        return;
        // if (!Imported.QAudio) return;
        var id = Game_Interpreter.prototype.getUniqueQAudioId.call();
        var name = action[0];
        var loop = !!E8Plus.getArg(action, /^loop$/i);
        var dontPan = !!E8Plus.getArg(action, /^noPan$/i);
        var fadein = E8Plus.getArg(action, /^fadein(\d+)/i);
        var type = E8Plus.getArg(action, /^(bgm|bgs|me|se)$/i) || 'bgm';
        type = type.toLowerCase();
        var max = E8Plus.getArg(action, /^max(\d+)/i);
        if (max === null) {
            max = 90;
        }
        max = Number(max) / 100;
        var radius = E8Plus.getArg(action, /^radius(\d+)/i);
        if (radius === null) {
            radius = 5;
        }
        var audio = {
            name: name,
            volume: 100,
            pitch: 0,
            pan: 0
        }
        AudioManager.playQAudio(id, audio, {
            type: type,
            loop: loop,
            maxVolume: Number(max),
            radius: Number(radius),
            bindTo: this._character.charaId(),
            doPan: !dontPan,
            fadeIn: Number(fadein) || 0
        });
    };

    actionStore() {
        this._stored = new Point(this._skill.collider.x, this._skill.collider.y);
    };

    actionMove(action) {
        var dir = action[0];
        var distance = Number(action[1]);
        var duration = Number(action[2]);
        ColliderManager.draw(this._skill.collider, duration);
        var radian = this._skill.radian;
        if (dir === 'backward') {
            radian -= Math.PI;
        }
        radian += radian < 0 ? Math.PI * 2 : 0;
        this._waitForMove = action[3] === 'true';
        this.setSkillRadian(Number(radian));
        this.actionMoveSkill(distance, duration);
    };

    actionMoveToStored(action) {
        if (this._stored) {
            var x1 = this._skill.collider.x;
            var y1 = this._skill.collider.y;
            var x2 = this._stored.x;
            var y2 = this._stored.y;
            var dx = x2 - x1;
            var dy = y2 - y1;
            var dist = Math.sqrt(dx * dx + dy * dy);
            this._skill.radian = Math.atan2(y2 - y1, x2 - x1);
            this._skill.radian += this._skill.radian < 0 ? Math.PI * 2 : 0;
            this.actionMove(['forward', dist, action[0], action[1]]);
        }
    };

    actionWave(action) {
        var dir = action[0];
        var amp = Number(action[1]);
        var harm = Number(action[2]);
        var distance = Number(action[3]);
        var duration = Number(action[4]);
        ColliderManager.draw(this._skill.collider, duration);
        var radian = this._skill.radian;
        if (dir === 'backward') {
            radian -= Math.PI;
        }
        radian += radian < 0 ? Math.PI * 2 : 0;
        this.setSkillRadian(Number(radian));
        this.actionWaveSkill(amp, harm, distance, duration);
        this._waitForMove = action[5] === "true";
    };

    actionWaveToStored(action) {
        if (this._stored) {
            var x1 = this._skill.collider.x;
            var y1 = this._skill.collider.y;
            var x2 = this._stored.x;
            var y2 = this._stored.y;
            var dx = x2 - x1;
            var dy = y2 - y1;
            var dist = Math.sqrt(dx * dx + dy * dy);
            this._skill.radian = Math.atan2(dy, dx);
            this.actionWave(['forward', action[0], action[1], dist, action[2], action[3]]);
        }
    };

    actionTrigger() {
        this._skill.targets = ABSManager.getTargets(this._skill, this._character);
        this.updateSkillDamage();
    };

    actionAdjustAim() {
        if (!this._skill._target) return;
        var x1 = this._skill.collider.x;
        var y1 = this._skill.collider.y;
        var forward = this._skill._target.forwardV();
        var dt = Math.randomInt(5) || 1;
        var x2 = this._skill._target.px + forward.x * dt;
        var y2 = this._skill._target.py + forward.y * dt;
        var dx = x2 - x1;
        var dy = y2 - y1;
        this._skill.radian = Math.atan2(dy, dx);
    };

    actionWait(action) {
        var duration = Number(action[0]);
        ColliderManager.draw(this._skill.collider, duration);
        this._waitCount = duration;
    };

    actionPicture(action) {
        this._skill.picture = new Sprite_SkillPicture();
        this._skill.picture.bitmap = ImageManager.loadPicture(action[0]);
        this._skill.picture.rotatable = action[1] === 'true';
        this._skill.picture.originDirection = Number(action[2]);
        this._skill.picture.z = 3;
        this._skill.picture.anchor.x = 0.5;
        this._skill.picture.anchor.y = 0.5;
        var isAnimated = /%\[(\d+)-(\d+)\]/.exec(action[0]);
        if (isAnimated) {
            var frames = Number(isAnimated[1]);
            var speed = Number(isAnimated[2]);
            this._skill.picture.setupAnim(frames, speed);
        }
        this.setSkillPictureRadian(this._skill.picture, this._skill.radian);
        var x = this._skill.collider.center.x;
        var y = this._skill.collider.center.y;
        this._skill.picture.move(x, y);
        this._skill.picture.bitmap.addLoadListener(function () {
            ABSManager.addPicture(this);
        }.bind(this._skill.picture));
    };

    actionTrail(action) {
        this._skill.trail = new Sprite_SkillTrail();
        this._skill.trail.bitmap = ImageManager.loadPicture(action[0]);
        this._skill.trail.move(0, 0, Graphics.width, Graphics.height);
        this._skill.trail.rotatable = action[1] === 'true';
        this._skill.trail.originDirection = Number(action[2]);
        this._skill.trail.z = 3;
        this.setSkillPictureRadian(this._skill.trail, this._skill.radian);
        var x = this._skill.collider.center.x;
        var y = this._skill.collider.center.y;
        this._skill.trail.startX = x;
        this._skill.trail.startY = y;
        this._skill.trail.bitmap.addLoadListener(function () {
            var w = this.bitmap.width;
            var h = this.bitmap.height;
            this.move(x, y, w, h);
            ABSManager.addPicture(this);
        }.bind(this._skill.trail));
    };

    actionCollider(action) {
        var display = action[0];
        if (display === 'show') {
            this._skill.pictureCollider = new Sprite_SkillCollider(this._skill.collider);
            ABSManager.addPicture(this._skill.pictureCollider);
        } else if (display === 'hide' && this._skill.pictureCollider) {
            ABSManager.removePicture(this._skill.pictureCollider);
            this._skill.pictureCollider = null;
        }
    };

    actionAnimation(action) {
        var id = Number(action[0]);
        var x = this._skill.collider.center.x;
        var y = this._skill.collider.center.y;
        ABSManager.startAnimation(id, x, y);
    };

    actionSE(action) {
        var se = {};
        se.name = action[0];
        se.volume = Number(action[1]) || 90;
        se.pitch = Number(action[2]) || 100;
        se.pan = Number(action[3]) || 0;
        AudioManager.playSe(se);
    };

    actionQAudio(action) {
        return;
        // if (!Imported.QAudio) return;
        var x = this._skill.collider.center.x;
        var y = this._skill.collider.center.x;
        var id = Game_Interpreter.prototype.getUniqueQAudioId.call();
        var name = action[0];
        var loop = !!E8Plus.getArg(action, /^loop$/i);
        var dontPan = !!E8Plus.getArg(action, /^noPan$/i);
        var fadein = E8Plus.getArg(action, /^fadein(\d+)/i);
        var type = E8Plus.getArg(action, /^(bgm|bgs|me|se)$/i) || 'bgm';
        type = type.toLowerCase();
        var max = E8Plus.getArg(action, /^max(\d+)/i);
        if (max === null) {
            max = 90;
        }
        max = Number(max) / 100;
        var radius = E8Plus.getArg(action, /^radius(\d+)/i);
        if (radius === null) {
            radius = 5;
        }
        var audio = {
            name: name,
            volume: 100,
            pitch: 0,
            pan: 0
        }
        AudioManager.playQAudio(id, audio, {
            type: type,
            loop: loop,
            maxVolume: Number(max),
            radius: Number(radius),
            x: x / Movement.tileSize,
            y: y / Movement.tileSize,
            doPan: !dontPan,
            fadeIn: Number(fadein) || 0
        });
    };

    actionForceSkill(action) {
        var id = Number(action[0]);
        var angleOffset = Number(action[1]);
        var radian = this._skill.radian;
        if (angleOffset) {
            radian += angleOffset * Math.PI / 180;
        }
        var center = this._skill.collider.center;
        var skill = this._character.makeSkill(id);
        var w = skill.collider.width;
        var h = skill.collider.height;
        skill.collider.moveTo(center.x - w / 2, center.y - w / 2);
        skill.radian = radian;
        skill._target = this._skill._target;
        this._character._activeSkills.push(skill);
        this._character._skillCooldowns[id] = skill.settings.cooldown;
    };

    actionMoveSkill(distance, duration) {
        var instant = duration === 0;
        if (duration <= 0) duration = 1;
        this._skill.newX = this._skill.collider.x + Math.round(distance * Math.cos(this._skill.radian));
        this._skill.newY = this._skill.collider.y + Math.round(distance * Math.sin(this._skill.radian));
        this._skill.speed = Math.abs(distance / duration);
        this._skill.speedX = Math.abs(this._skill.speed * Math.cos(this._skill.radian));
        this._skill.speedY = Math.abs(this._skill.speed * Math.sin(this._skill.radian));
        this._skill.moving = true;
        if (instant) {
            this.updateSkillPosition();
        }
    };

    actionWaveSkill(amp, harmonics, distance, duration) {
        this._skill.amp = amp;
        this._skill.distance = distance;
        this._skill.waveLength = harmonics * Math.PI;
        this._skill.waveSpeed = this._skill.waveLength / duration;
        this._skill.theta = 0;
        this._skill.xi = this._skill.collider.x;
        this._skill.yi = this._skill.collider.y;
        this._skill.waving = true;
        this._skill.moving = true;
    };

    targetMove(action, targets) {
        var dist = Number(action[1]) || this._character.moveTiles();
        for (var i = 0; i < targets.length; i++) {
            var dist2 = dist - dist * eval('targets[i].battler().' + E8ABS.mrst);
            if (dist2 <= 0) return;
            var dx = targets[i].cx() - this._character.cx();
            var dy = targets[i].cy() - this._character.cy();
            var radian = Math.atan2(dy, dx);
            radian += radian < 0 ? Math.PI * 2 : 0;
            if (action[0] === 'towards') {
                radian += Math.PI;
            } else if (action[0] === 'into' || action[0] === 'towardsSkill') {
                var dxi = this._skill.collider.center.x - targets[i].cx();
                var dyi = this._skill.collider.center.y - targets[i].cy();
                radian = Math.atan2(dyi, dxi);
                dist2 = Math.min(dist2, Math.sqrt(dxi * dxi + dyi * dyi));
            } else if (action[0] === 'awayFromSkill') {
                var dxi = targets[i].cx() - this._skill.collider.center.x;
                var dyi = targets[i].cy() - this._skill.collider.center.y;
                radian = Math.atan2(dyi, dxi);
            }
            var route = {
                list: [],
                repeat: false,
                skippable: true,
                wait: false
            }
            route.list.push({
                code: Game_Character.ROUTE_DIR_FIX_ON
            });
            route.list.push({
                code: Game_Character.ROUTE_SCRIPT,
                parameters: ['qmove2(' + radian + ',' + dist + ')']
            });
            if (!targets[i].isDirectionFixed()) {
                route.list.push({
                    code: Game_Character.ROUTE_DIR_FIX_OFF
                });
            }
            route.list.push({
                code: Game_Character.ROUTE_SCRIPT,
                parameters: ['this.setRadian(' + targets[i]._radian + ')']
            });
            route.list.push({
                code: Game_Character.ROUTE_END
            });
            targets[i].forceMoveRoute(route);
            targets[i].updateRoutineMove();
        }
    };

    targetJump(action, targets) {
        var dist = Number(action[1]) || 0;
        for (var i = 0; i < targets.length; i++) {
            var dist2 = dist - dist * eval('targets[i].battler().' + E8ABS.mrst);
            if (dist2 <= 0) return;
            var dx = targets[i].cx() - this._character.cx();
            var dy = targets[i].cy() - this._character.cy();
            var radian = Math.atan2(dy, dx);
            radian += radian < 0 ? Math.PI * 2 : 0;
            if (action[0] === 'towards') {
                radian += Math.PI;
            } else if (action[0] === 'into' || action[0] === 'towardsSkill') {
                var dxi = this._skill.collider.center.x - targets[i].cx();
                var dyi = this._skill.collider.center.y - targets[i].cy();
                radian = Math.atan2(dyi, dxi);
                dist2 = Math.min(dist2, Math.sqrt(dxi * dxi + dyi * dyi));
            } else if (action[0] === 'awayFromSkill') {
                var dxi = targets[i].cx() - this._skill.collider.center.x;
                var dyi = targets[i].cy() - this._skill.collider.center.y;
                radian = Math.atan2(dyi, dxi);
                dist2 = Math.min(dist2, Math.sqrt(dxi * dxi + dyi * dyi));
            }
            var x1 = targets[i].px;
            var y1 = targets[i].py;
            var x2 = x1 + Math.round(dist2 * Math.cos(radian));
            var y2 = y1 + Math.round(dist2 * Math.sin(radian));
            var final = targets[i].adjustPosition(x2, y2);
            dx = final.x - x1;
            dy = final.y - y1;
            var lastDirectionFix = targets[i].isDirectionFixed();
            var prevRadian = targets[i]._radian;
            targets[i].setDirectionFix(true);
            targets[i].pixelJump(dx, dy);
            targets[i].setDirectionFix(lastDirectionFix);
            targets[i].setRadian(prevRadian);
        }
    };

    targetPose(action, targets) {
        var pose = action[0];
        for (var i = 0; i < targets.length; i++) {
            targets[i].playPose(pose);
        }
    };

    targetCancel(action, targets) {
        for (var i = 0; i < targets.length; i++) {
            if (targets[i]._casting) {
                targets[i]._casting.break = true;
            }
        }
    };

    targetQAudio(action, targets) {
        return;
        // if (!Imported.QAudio) return;
        var id = Game_Interpreter.prototype.getUniqueQAudioId.call();
        var name = action[0];
        var loop = !!E8Plus.getArg(action, /^loop$/i);
        var dontPan = !!E8Plus.getArg(action, /^noPan$/i);
        var fadein = E8Plus.getArg(action, /^fadein(\d+)/i);
        var type = E8Plus.getArg(action, /^(bgm|bgs|me|se)$/i) || 'bgm';
        type = type.toLowerCase();
        var max = E8Plus.getArg(action, /^max(\d+)/i);
        if (max === null) {
            max = 90;
        }
        max = Number(max) / 100;
        var radius = E8Plus.getArg(action, /^radius(\d+)/i);
        if (radius === null) {
            radius = 5;
        }
        var audio = {
            name: name,
            volume: 100,
            pitch: 0,
            pan: 0
        }
        for (var i = 0; i < targets.length; i++) {
            AudioManager.playQAudio(id, audio, {
                type: type,
                loop: loop,
                maxVolume: Number(max),
                radius: Number(radius),
                bindTo: targets[i].charaId(),
                doPan: !dontPan,
                fadeIn: Number(fadein) || 0
            });
        };
    };

    setSkillRadian(radian) {
        var rotate = this._skill.settings.rotate === true;
        this._skill.radian = radian;
        this._skill.collider.setRadian(Math.PI / 2 + radian);
        if (this._skill.picture) {
            this.setSkillPictureRadian(this._skill.picture, this._skill.radian);
        }
    };

    setSkillPictureRadian(picture, radian) {
        if (!picture.rotatable) return;
        var originDirection = picture.originDirection;
        var originRadian = this._character.directionToRadian(originDirection);
        picture.rotation = originRadian + radian;
    };

    canSkillMove() {
        var collided = false;
        var through = this._skill.settings.through;
        var targets = ABSManager.getTargets(this._skill, this._character);
        if (targets.length > 0) {
            for (var i = targets.length - 1; i >= 0; i--) {
                if (!this._skill.targetsHit.contains(targets[i].charaId())) {
                    this._skill.targetsHit.push(targets[i].charaId());
                } else {
                    targets.splice(i, 1);
                }
            }
            if (targets.length > 0) {
                this._skill.targets = targets;
                if (through === 1 || through === 3) {
                    collided = true;
                    // TODO select the nearest target
                    this._skill.targets = [targets[0]];
                }
                this.updateSkillDamage();
            }
        }
        if (collided) return false;
        var edge = this._skill.collider.gridEdge();
        var maxW = GameGlobal.$gameMap.width();
        var maxH = GameGlobal.$gameMap.height();
        if (!GameGlobal.$gameMap.isLoopHorizontal()) {
            if (edge.x2 < 0 || edge.x1 >= maxW) return false;
        }
        if (!GameGlobal.$gameMap.isLoopVertical()) {
            if (edge.y2 < 0 || edge.y1 >= maxH) return false;
        }
        if (through === 2 || through === 3) {
            ColliderManager.getCollidersNear(this._skill.collider, function (collider) {
                if (collider === this.collider) return false;
                if (this.settings.throughTerrain.contains(collider.terrain)) {
                    return false;
                }
                if (this.collider.intersects(collider)) {
                    collided = true;
                    return 'break';
                }
            }.bind(this._skill));
        }
        if (through === 1 || through === 3) {
            ColliderManager.getCharactersNear(this._skill.collider, function (chara) {
                if (chara === this._character || chara.isThrough() || !chara.isNormalPriority()) return false;
                if (chara.isLoot || chara._erased || chara.isDead) return false;
                if (this._skill.collider.intersects(chara.collider('collision'))) {
                    collided = true;
                    return 'break';
                }
            }.bind(this));
        }
        return !collided;
    };

    isWaiting() {
        return this._waitCount > 0 || this._waitForMove ||
            this._waitForUserMove || this._waitForUserJump ||
            this._waitForUserJump || this._waitForUserPose;
    };

    onBreak() {
        var i = this._character._skillLocked.indexOf(this._skill);
        if (i >= 0) {
            this._character._skillLocked.splice(i, 1);
        }
        this._character._casting = false;
        this.onEnd();
    };

    onEnd() {

        this._skill.collider.kill = true;
        ABSManager.removePicture(this._skill.picture);
        ABSManager.removePicture(this._skill.trail);
        ABSManager.removePicture(this._skill.pictureCollider);
        var i = this._character._activeSkills.indexOf(this._skill);
        this._character._activeSkills.splice(i, 1);
    };

    update() {
        if (this._skill.break) {
            var i = this._character._skillLocked.indexOf(this._skill);
            if (i >= 0) {
                this._character._skillLocked.splice(i, 1);
            }
            this._character._casting = false;
            ABSManager.removePicture(this._skill.picture);
            ABSManager.removePicture(this._skill.trail);
            ABSManager.removePicture(this._skill.pictureCollider);
            i = this._character._activeSkills.indexOf(this._skill);
            this._character._activeSkills.splice(i, 1);
            return;
        }
        if (this._skill.moving) {

            // ADDED
            LightManager.Terrax_ABS_skill_x.push(this._skill.collider.center.x);
            LightManager.Terrax_ABS_skill_y.push(this._skill.collider.center.y);
            LightManager.Terrax_ABS_skill.push(this._skill.settings.tx_missle);
            this.updateSkillPosition();
        }
        if (this._waitCount > 0) {
            this._waitCount--;
            return;
        }
        if (this._waitForUserMove || this._waitForUserJump || this._waitForPose) {
            if (!this._character.isMoving()) this._waitForUserMove = false;
            if (!this._character.isJumping()) this._waitForUserJump = false;
            if (!this._character._posePlaying) this._waitForPose = false;
        }
        if (this._waitForMove || this._waitForUserMove ||
            this._waitForUserJump || this._waitForPose) {
            return;
        }
        var sequence = this._skill.sequence.shift();
        if (sequence) {
            var action = sequence.split(' ');

            // TX ADDED Trigger
            if (action[0].toLowerCase() == "trigger") {
                LightManager.Terrax_ABS_blast_x.push(this._skill.collider.center.x);
                LightManager.Terrax_ABS_blast_y.push(this._skill.collider.center.y);
                LightManager.Terrax_ABS_blast.push(this._skill.settings.tx_blast);
                LightManager.Terrax_ABS_blast_duration.push(-1);
                LightManager.Terrax_ABS_blast_fade.push(-1);
                LightManager.Terrax_ABS_blast_grow.push(-1);
                LightManager.Terrax_ABS_blast_mapid.push($gameMap.mapId());
            }

            this.startAction(action);
        }
        if (this._skill.sequence.length === 0) {
            if (!this._skill.moving) {
                var i = this._character._activeSkills.indexOf(this._skill);
                ABSManager.removePicture(this._skill.picture);
                ABSManager.removePicture(this._skill.trail);
                ABSManager.removePicture(this._skill.pictureCollider);
                this._character._activeSkills.splice(i, 1);

                // TX ADDED On hit
                //Graphics.Debug2('coors xy',this._skill.collider.center.x+'-'+this._skill.collider.center.y+' '+this._skill.settings.tx_onhit);

                LightManager.Terrax_ABS_blast_x.push(this._skill.collider.center.x - $gameMap.tileWidth() / 2);
                LightManager.Terrax_ABS_blast_y.push(this._skill.collider.center.y - $gameMap.tileHeight() / 2);
                LightManager.Terrax_ABS_blast.push(this._skill.settings.tx_onhit);
                LightManager.Terrax_ABS_blast_duration.push(-1);
                LightManager.Terrax_ABS_blast_fade.push(-1);
                LightManager.Terrax_ABS_blast_grow.push(-1);
                LightManager.Terrax_ABS_blast_mapid.push($gameMap.mapId());

            }
        }
    };

    updateWait() {
        if (this._waitCount > 0) {
            this._waitCount--;
        }
        if (this._waitForUserMove && !this._character.isMoving()) {
            this._waitForUserMove = false;
        }
        if (this._waitForUserJump && !this._character.isJumping()) {
            this._waitForUserJump = false;
        }
        if (this._waitForUserPose && !this._character._posePlaying) {
            this._waitForUserPose = false;
        }
    };

    updateSequence() {
        var sequence = this._skill.sequence;
        while (sequence.length !== 0) {
            var action = E8Plus.makeArgs(sequence.shift());
            this.startAction(action);
            if (this.isWaiting()) {
                break;
            }
        }
        if (this._skill.sequence.length === 0 && !this._skill.moving) {
            return this.onEnd();
        }
    };

    updateSkillDamage() {
        var targets = this._skill.targets;
        for (var i = 0; i < this._skill.ondmg.length; i++) {
            var action = this._skill.ondmg[i].split(' ');
            this.startOnDamageAction(action, targets);
        }
        ABSManager.startAction(this._character, targets, this._skill);
    };

    updateSkillPosition() {
        if (this._skill.waving) {
            return this.updateSkillWavePosition();
        }
        var collider = this._skill.collider;
        var x1 = collider.x;
        var x2 = this._skill.newX;
        var y1 = collider.y;
        var y2 = this._skill.newY;
        if (x1 < x2) x1 = Math.min(x1 + this._skill.speedX, x2);
        if (x1 > x2) x1 = Math.max(x1 - this._skill.speedX, x2);
        if (y1 < y2) y1 = Math.min(y1 + this._skill.speedY, y2);
        if (y1 > y2) y1 = Math.max(y1 - this._skill.speedY, y2);
        collider.moveTo(x1, y1);
        var x3 = collider.center.x;
        var y3 = collider.center.y;
        if (this._skill.picture) {
            this._skill.picture.move(x3, y3);
        }
        if (this._skill.trail) {
            var x4 = this._skill.trail.startX;
            var y4 = this._skill.trail.startY;
            var x5 = x4 - x3;
            var y5 = y4 - y3;
            var dist = Math.sqrt(x5 * x5 + y5 * y5);
            var radian = this._skill.trail.rotation;
            var w = this._skill.trail.bitmap.width;
            var h = this._skill.trail.bitmap.height;
            var ox = w * Math.sin(radian);
            var oy = (h / 2) * -Math.cos(radian);
            x4 += dist * -Math.cos(radian) + ox;
            y4 += dist * -Math.sin(radian) + oy;
            this._skill.trail.move(x4, y4, dist, h);
        }
        if (!this.canSkillMove() || (x1 === x2 && y1 === y2)) {
            this._skill.targetsHit = [];
            this._skill.moving = false;
            this._waitForMove = false;
        }
    };

    updateSkillWavePosition() {
        var collider = this._skill.collider;
        var x1 = this._skill.xi;
        var y1 = this._skill.yi;
        var x2 = (this._skill.theta / this._skill.waveLength * this._skill.distance);
        var y2 = this._skill.amp * -Math.sin(this._skill.theta);
        var h = Math.sqrt(y2 * y2 + x2 * x2);
        var radian = Math.atan2(y2, x2);
        radian += this._skill.radian;
        var x3 = h * Math.cos(radian);
        var y3 = h * Math.sin(radian);
        collider.moveTo(x1 + x3, y1 + y3);
        var x4 = collider.center.x;
        var y4 = collider.center.y;
        if (this._skill.picture) {
            this._skill.picture.move(x4, y4);
        }
        if (!this.canSkillMove() || this._skill.theta >= this._skill.waveLength) {
            this._skill.targetsHit = [];
            this._skill.waving = false;
            this._skill.moving = false;
            this._waitForMove = false;
        }
        this._skill.theta += this._skill.waveSpeed;
    };

    updateState() {

    }

}