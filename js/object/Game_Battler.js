import Game_BattlerBase from './Game_BattlerBase'
import Game_ActionResult from './Game_ActionResult'
import DataManager from '../managers/DataManager'
import SoundManager from '../managers/SoundManager'
import LightManager from '../managers/LightManager'
/**
 * create by 18tech
 */
export default class Game_Battler extends Game_BattlerBase {

    constructor() {
        super();
    }

    initialize() {
        super.initialize();
        this.initMembers();
    }

    initMembers() {
        super.initMembers();
        this._actions = [];
        this._speed = 0;
        this._result = new Game_ActionResult();
        this._actionState = '';
        this._lastTargetIndex = 0;
        this._animations = [];
        this._damagePopup = false;
        this._effectType = null;
        this._motionType = null;
        this._weaponImageId = 0;
        this._motionRefresh = false;
        this._selected = false;

        // ABS
        this._isStunned = 0;
        this._moveSpeed = 0;
        this._damageQueue = [];
    }

    clearAnimations() {
        this._animations = [];
    }

    clearDamagePopup() {
        this._damagePopup = false;
    }

    clearWeaponAnimation() {
        this._weaponImageId = 0;
    }

    clearEffect() {
        this._effectType = null;
    }

    clearMotion() {
        this._motionType = null;
        this._motionRefresh = false;
    }

    requestEffect(effectType) {
        this._effectType = effectType;
    }

    requestMotion(motionType) {
        this._motionType = motionType;
    }

    requestMotionRefresh() {
        this._motionRefresh = true;
    }

    select() {
        this._selected = true;
    }

    deselect() {
        this._selected = false;
    }

    isAnimationRequested() {
        return this._animations.length > 0;
    }

    isDamagePopupRequested() {
        return this._damagePopup;
    }

    isEffectRequested() {
        return !!this._effectType;
    }

    isMotionRequested() {
        return !!this._motionType;
    }

    isWeaponAnimationRequested() {
        return this._weaponImageId > 0;
    }

    isMotionRefreshRequested() {
        return this._motionRefresh;
    }

    isSelected() {
        return this._selected;
    }

    effectType() {
        return this._effectType;
    }

    motionType() {
        return this._motionType;
    }

    weaponImageId() {
        return this._weaponImageId;
    }

    shiftAnimation() {
        return this._animations.shift();
    }

    startAnimation(animationId, mirror, delay) {
        var data = { animationId: animationId, mirror: mirror, delay: delay }
        this._animations.push(data);
    }

    startDamagePopup() {
        this._damageQueue.push(Object.assign({}, this._result));
        this._damagePopup = true;
    }

    startWeaponAnimation(weaponImageId) {
        this._weaponImageId = weaponImageId;
    }

    action(index) {
        return this._actions[index];
    }

    setAction(index, action) {
        this._actions[index] = action;
    }

    numActions() {
        return this._actions.length;
    }

    clearActions() {
        this._actions = [];
    }

    result() {
        return this._result;
    }

    clearResult() {
        this._result.clear();
    }

    refresh() {
        super.refresh();
        if (this.hp === 0) {
            this.addState(this.deathStateId());
        } else {
            this.removeState(this.deathStateId());
        }
    }

    addState(stateId) {
        if (this.isStateAddable(stateId)) {
            if (!this.isStateAffected(stateId)) {
                this.addNewState(stateId);
                this.refresh();
            }
            this.resetStateCounts(stateId);
            this._result.pushAddedState(stateId);
        }
    }

    isStateAddable(stateId) {
        return (this.isAlive() && GameGlobal.$dataStates[stateId] &&
            !this.isStateResist(stateId) &&
            !this._result.isStateRemoved(stateId) &&
            !this.isStateRestrict(stateId));
    }

    isStateRestrict(stateId) {
        return GameGlobal.$dataStates[stateId].removeByRestriction && this.isRestricted();
    }

    onRestrict() {
        super.onRestrict();
        this.clearActions();
        this.states().forEach(function (state) {
            if (state.removeByRestriction) {
                this.removeState(state.id);
            }
        }, this);
    }

    removeState(stateId) {
        if (this.isStateAffected(stateId)) {
            if (GameGlobal.$dataStates[stateId].meta.moveSpeed) {
                this._moveSpeed -= Number(GameGlobal.$dataStates[stateId].meta.moveSpeed) || 0;
            }
            if (GameGlobal.$dataStates[stateId].meta.stun) {
                this._isStunned--;
            }
        }

        if (this.isStateAffected(stateId)) {
            if (stateId === this.deathStateId()) {
                this.revive();
            }
            this.eraseState(stateId);
            this.refresh();
            this._result.pushRemovedState(stateId);
        }
    }

    escape() {
        if (GameGlobal.$gameParty.inBattle()) {
            this.hide();
        }
        this.clearActions();
        this.clearStates();
        SoundManager.playEscape();
    }

    addBuff(paramId, turns) {
        if (this.isAlive()) {
            this.increaseBuff(paramId);
            if (this.isBuffAffected(paramId)) {
                this.overwriteBuffTurns(paramId, turns);
            }
            this._result.pushAddedBuff(paramId);
            this.refresh();
        }
    }

    addDebuff(paramId, turns) {
        if (this.isAlive()) {
            this.decreaseBuff(paramId);
            if (this.isDebuffAffected(paramId)) {
                this.overwriteBuffTurns(paramId, turns);
            }
            this._result.pushAddedDebuff(paramId);
            this.refresh();
        }
    }

    removeBuff(paramId) {
        if (this.isAlive() && this.isBuffOrDebuffAffected(paramId)) {
            this.eraseBuff(paramId);
            this._result.pushRemovedBuff(paramId);
            this.refresh();
        }
    }

    removeBattleStates() {
        this.states().forEach(function (state) {
            if (state.removeAtBattleEnd) {
                this.removeState(state.id);
            }
        }, this);
    }

    removeAllBuffs() {
        for (var i = 0; i < this.buffLength(); i++) {
            this.removeBuff(i);
        }
    }

    removeStatesAuto(timing) {
        this.states().forEach(function (state) {
            if (this.isStateExpired(state.id) && state.autoRemovalTiming === timing) {
                this.removeState(state.id);
            }
        }, this);
    }

    removeBuffsAuto() {
        for (var i = 0; i < this.buffLength(); i++) {
            if (this.isBuffExpired(i)) {
                this.removeBuff(i);
            }
        }
    }

    removeStatesByDamage() {
        this.states().forEach(function (state) {
            if (state.removeByDamage && Math.randomInt(100) < state.chanceByDamage) {
                this.removeState(state.id);
            }
        }, this);
    }

    makeActionTimes() {
        return this.actionPlusSet().reduce(function (r, p) {
            return Math.random() < p ? r + 1 : r;
        }, 1);
    }

    makeActions() {
        this.clearActions();
        if (this.canMove()) {
            var actionTimes = this.makeActionTimes();
            this._actions = [];
            for (var i = 0; i < actionTimes; i++) {
                this._actions.push(new Game_Action(this));
            }
        }
    }

    speed() {
        return this._speed;
    }

    makeSpeed() {
        this._speed = Math.min.apply(null, this._actions.map(function (action) {
            return action.speed();
        })) || 0;
    }

    currentAction() {
        return this._actions[0];
    }

    removeCurrentAction() {
        this._actions.shift();
    }

    setLastTarget(target) {
        if (target) {
            this._lastTargetIndex = target.index();
        } else {
            this._lastTargetIndex = 0;
        }
    }

    forceAction(skillId, targetIndex) {
        this.clearActions();
        var action = new Game_Action(this, true);
        action.setSkill(skillId);
        if (targetIndex === -2) {
            action.setTarget(this._lastTargetIndex);
        } else if (targetIndex === -1) {
            action.decideRandomTarget();
        } else {
            action.setTarget(targetIndex);
        }
        this._actions.push(action);
    }

    useItem(item) {
        if (DataManager.isSkill(item)) {
            this.paySkillCost(item);
        } else if (DataManager.isItem(item)) {
            this.consumeItem(item);
        }
    }

    consumeItem(item) {
        GameGlobal.$gameParty.consumeItem(item);
    }

    gainHp(value) {
        this._result.hpDamage = -value;
        this._result.hpAffected = true;
        this.setHp(this.hp + value);
    }

    gainMp(value) {
        this._result.mpDamage = -value;
        this.setMp(this.mp + value);
    }

    gainTp(value) {
        this._result.tpDamage = -value;
        this.setTp(this.tp + value);
    }

    gainSilentTp(value) {
        this.setTp(this.tp + value);
    }

    initTp() {
        this.setTp(Math.randomInt(25));
    }

    clearTp() {
        this.setTp(0);
    }

    chargeTpByDamage(damageRate) {
        var value = Math.floor(50 * damageRate * this.tcr);
        this.gainSilentTp(value);
    }

    regenerateHp() {
        var value = Math.floor(this.mhp * this.hrg);
        value = Math.max(value, -this.maxSlipDamage());
        if (value !== 0) {
            this.gainHp(value);
        }
    }

    maxSlipDamage() {
        return GameGlobal.$dataSystem.optSlipDeath ? this.hp : Math.max(this.hp - 1, 0);
    }

    regenerateMp() {
        var value = Math.floor(this.mmp * this.mrg);
        if (value !== 0) {
            this.gainMp(value);
        }
    }

    regenerateTp() {
        var value = Math.floor(100 * this.trg);
        this.gainSilentTp(value);
    }

    regenerateAll() {
        if (this.isAlive()) {
            this.regenerateHp();
            this.regenerateMp();
            this.regenerateTp();
        }
    }

    onBattleStart() {
        this.setActionState('undecided');
        this.clearMotion();
        if (!this.isPreserveTp()) {
            this.initTp();
        }
    }

    onAllActionsEnd() {
        this.clearResult();
        this.removeStatesAuto(1);
        this.removeBuffsAuto();
    }

    onTurnEnd() {
        this.clearResult();
        this.regenerateAll();
        // if (!BattleManager.isForcedTurn()) {
        //     this.updateStateTurns();
        //     this.updateBuffTurns();
        // }
        this.removeStatesAuto(2);
    }

    onBattleEnd() {
        this.clearResult();
        this.removeBattleStates();
        this.removeAllBuffs();
        this.clearActions();
        if (!this.isPreserveTp()) {
            this.clearTp();
        }
        this.appear();
    }

    onDamage(value) {
        this.removeStatesByDamage();
        this.chargeTpByDamage(value / this.mhp);
    }

    setActionState(actionState) {
        this._actionState = actionState;
        this.requestMotionRefresh();
    }

    isUndecided() {
        return this._actionState === 'undecided';
    }

    isInputting() {
        return this._actionState === 'inputting';
    }

    isWaiting() {
        return this._actionState === 'waiting';
    }

    isActing() {
        return this._actionState === 'acting';
    }

    isChanting() {
        if (this.isWaiting()) {
            return this._actions.some(function (action) {
                return action.isMagicSkill();
            });
        }
        return false;
    }

    isGuardWaiting() {
        if (this.isWaiting()) {
            return this._actions.some(function (action) {
                return action.isGuard();
            });
        }
        return false;
    }

    performActionStart(action) {
        if (!action.isGuard()) {
            this.setActionState('acting');
        }
    }

    performAction(action) {
    }

    performActionEnd() {
        this.setActionState('done');
    }

    performDamage() {
    }

    performMiss() {
        SoundManager.playMiss();
    }

    performRecovery() {
        SoundManager.playRecovery();
    }

    performEvasion() {
        SoundManager.playEvasion();
    }

    performMagicEvasion() {
        SoundManager.playMagicEvasion();
    }

    performCounter() {
        SoundManager.playEvasion();
    }

    performReflection() {
        SoundManager.playReflection();
    }

    performSubstitute(target) {
    }

    performCollapse() {
    }

    // ABS
    updateABS() {
        var states = this.states();
        for (var i = 0; i < states.length; i++) {
            this.updateStateSteps(states[i], x, y);
        }
        //this.showAddedStates();   //Currently does nothing, so no need to run it
        //this.showRemovedStates(); //Currently does nothing, so no need to run it
    };

    stepsForTurn() {
        return 60;
    };

    updateStateSteps(state, x, y) {
        if (!state.removeByWalking) return;
        if (this._stateSteps[state.id] >= 0) {
            if (this._stateSteps[state.id] % this.stepsForTurn() === 0) {
                // this.onTurnEnd();
                // TODO ????????????buff??????
                this.result().damageIcon = GameGlobal.$dataStates[state.id].iconIndex;
                this.startDamagePopup();
                if (this._stateSteps[state.id] === 0) this.removeState(state.id);
            }
            this._stateSteps[state.id]--;


            // ADDED
            var statenote = GameGlobal.$dataStates[state.id].note;

            if (statenote) {
                var searchnote = statenote.indexOf("TX:");
                if (searchnote >= 0) {
                    var closetag = statenote.indexOf(";", searchnote);
                    var txdata = statenote.substring(searchnote + 3, closetag);

                    //Graphics.Debug2('state',$dataStates[state.id].note+ " "+txdata);

                    var tw = GameGlobal.$gameMap.tileWidth();
                    var ty = GameGlobal.$gameMap.tileHeight();
                    var x1 = (x * tw) + (tw / 2);
                    var y1 = (y * ty) + (ty / 2);

                    LightManager.Terrax_ABS_skill_x.push(x1);
                    LightManager.Terrax_ABS_skill_y.push(y1);
                    LightManager.Terrax_ABS_skill.push(txdata);

                }
            }
        }
    };

    showAddedStates() {
        // TODO
        this.result().addedStateObjects().forEach(function (state) {
            // does nothing
        }, this);
    };

    showRemovedStates() {
        // TODO
        this.result().removedStateObjects().forEach(function (state) {
            // Popup that state was removed?
        }, this);
    };



    moveSpeed = function () {
        return this._moveSpeed;
    };

    isStunned = function () {
        return this._isStunned > 0;
    };
}