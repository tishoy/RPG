import Game_Battler from './Game_Battler';
import Game_Item from './Game_Item';
import Game_Action from './Game_Action'
import Game_BattlerBase from './Game_BattlerBase';
import TextManager from '../managers/TextManager';
import DataManager from '../managers/DataManager'
import E8ABS from '../18ext/E8ABS'
import ABSManager from '../managers/ABSManager';
/**
 * create by 18tech
 */
export default class Game_Actor extends Game_Battler {
    constructor(actorId) {
        super();
        this.initMembers();
        this.setup(actorId);
    }

    get level() {
        return this._level;
    }

    _exp = {};

    initMembers() {
        super.initMembers();
        this._actorId = 0;
        this._name = '';
        this._nickname = '';
        this._classId = 0;
        this._level = 0;
        this._characterName = '';
        this._characterIndex = 0;
        this._faceName = '';
        this._faceIndex = 0;
        this._battlerName = '';
        this._exp = {}
        this._skills = [];
        this._equips = [];
        this._actionInputIndex = 0;
        this._lastMenuSkill = new Game_Item();
        this._lastBattleSkill = new Game_Item();
        this._lastCommandSymbol = '';
        this._halo = 0;
    }

    setup(actorId) {
        var actor = GameGlobal.$dataActors[actorId];
        this._actorId = actorId;
        this._name = actor.name;
        this._nickname = actor.nickname;
        this._profile = actor.profile;
        this._classId = actor.classId;
        this._level = actor.initialLevel;
        this.initImages();
        this.initExp();
        this.initSkills();
        this.initEquips(actor.equips);
        this.clearParamPlus();
        this.recoverAll();
        var meta = this.actor().meta;
        this._popupOY = Number(meta.popupOY) || 0;
    }

    actorId() {
        return this._actorId;
    }

    actor() {
        return GameGlobal.$dataActors[this._actorId];
    }

    name() {
        return this._name;
    }

    setName(name) {
        this._name = name;
    }

    nickname() {
        return this._nickname;
    }

    setNickname(nickname) {
        this._nickname = nickname;
    }

    profile() {
        return this._profile;
    }

    setProfile(profile) {
        this._profile = profile;
    }

    characterName() {
        return this._characterName;
    }

    characterIndex() {
        return this._characterIndex;
    }

    faceName() {
        return this._faceName;
    }

    faceIndex() {
        return this._faceIndex;
    }

    battlerName() {
        return this._battlerName;
    }

    clearStates() {
        super.clearStates();
        this._stateSteps = {}
    }

    eraseState(stateId) {
        super.eraseState(stateId);
        delete this._stateSteps[stateId];
    }

    resetStateCounts(stateId) {
        super.resetStateCounts();
        // super.resetStateCounts(stateId);
        // this._stateSteps[stateId] = GameGlobal.$dataStates[stateId].stepsToRemove;
    }

    initImages() {
        var actor = this.actor();
        this._characterName = actor.characterName;
        this._characterIndex = actor.characterIndex;
        this._faceName = actor.faceName;
        this._faceIndex = actor.faceIndex;
        this._battlerName = actor.battlerName;
    }

    expForLevel(level) {
        var c = this.currentClass();
        var basis = c.expParams[0];
        var extra = c.expParams[1];
        var acc_a = c.expParams[2];
        var acc_b = c.expParams[3];
        return Math.round(basis * (Math.pow(level - 1, 0.9 + acc_a / 250)) * level *
            (level + 1) / (6 + Math.pow(level, 2) / 50 / acc_b) + (level - 1) * extra);
    }

    initExp() {
        this._exp[this._classId] = this.currentLevelExp();
    }

    currentExp() {
        return this._exp[this._classId];
    }

    currentLevelExp() {
        return this.expForLevel(this._level);
    }

    nextLevelExp() {
        return this.expForLevel(this._level + 1);
    }

    nextRequiredExp() {
        return this.nextLevelExp() - this.currentExp();
    }

    maxLevel() {
        return this.actor().maxLevel;
    }

    isMaxLevel() {
        return this._level >= this.maxLevel();
    }

    initSkills() {
        this._skills = [];
        this.currentClass().learnings.forEach((learning) => {
            if (learning.level <= this._level) {
                this.learnSkill(learning.skillId);
            }
        });
    }

    initEquips(equips) {
        var slots = this.equipSlots();
        var maxSlots = slots.length;
        this._equips = [];
        for (var i = 0; i < maxSlots; i++) {
            this._equips[i] = new Game_Item();
        }
        for (var j = 0; j < equips.length; j++) {
            if (j < maxSlots) {
                this._equips[j].setEquip(slots[j] === 1, equips[j]);
            }
        }
        this.releaseUnequippableItems(true);
        this.refresh();
    }

    equipSlots() {
        var slots = [];
        for (var i = 1; i < GameGlobal.$dataSystem.equipTypes.length; i++) {
            slots.push(i);
        }
        if (slots.length >= 2 && this.isDualWield()) {
            slots[1] = 1;
        }
        return slots;
    }

    equips() {
        return this._equips.map(function (item) {
            return item.object();
        });
    }

    weapons() {
        return this.equips().filter(function (item) {
            return item && DataManager.isWeapon(item);
        });
    }

    armors() {
        return this.equips().filter(function (item) {
            return item && DataManager.isArmor(item);
        });
    }

    hasWeapon(weapon) {
        return this.weapons().contains(weapon);
    }

    hasArmor(armor) {
        return this.armors().contains(armor);
    }

    isEquipChangeOk(slotId) {
        return (!this.isEquipTypeLocked(this.equipSlots()[slotId]) &&
            !this.isEquipTypeSealed(this.equipSlots()[slotId]));
    }

    changeEquip(slotId, item) {
        // E8
        if (this !== GameGlobal.$gameParty.leader()) {
            return Alias_Game_Actor_changeEquip.call(this, slotId, item);
        }
        var equips = this._equips;
        var oldId, newId = 0;
        var wasWeapon;
        if (equips[slotId] && equips[slotId].object()) {
            oldId = equips[slotId].object().baseItemId || equips[slotId].object().id;
            wasWeapon = equips[slotId].isWeapon();
        }

        // RPG
        if (this.tradeItemWithParty(item, this.equips()[slotId]) &&
            (!item || this.equipSlots()[slotId] === item.etypeId)) {
            this._equips[slotId].setObject(item);
            this.refresh();
        }

        // E8
        if (equips[slotId] && equips[slotId].object()) {
            newId = equips[slotId].object().baseItemId || equips[slotId].object().id;
        }
        if (newId && newId !== oldId && equips[slotId].isWeapon()) {
            this.changeWeaponSkill(newId);
        } else if (wasWeapon) {
            this.changeWeaponSkill(0);
        }
    }

    changeWeaponSkill(id) {
        if (this !== GameGlobal.$gameParty.leader()) return;
        var weaponSkills;
        if (!GameGlobal.$dataWeapons[id]) {
            weaponSkills = {};
        } else {
            weaponSkills = E8ABS.weaponSkills(id);
        }
        GameGlobal.$gameSystem.changeABSWeaponSkills(weaponSkills);
    };

    forceChangeEquip(slotId, item) {
        this._equips[slotId].setObject(item);
        this.releaseUnequippableItems(true);
        this.refresh();
    }

    tradeItemWithParty(newItem, oldItem) {
        if (newItem && !GameGlobal.$gameParty.hasItem(newItem)) {
            return false;
        } else {
            GameGlobal.$gameParty.gainItem(oldItem, 1);
            GameGlobal.$gameParty.loseItem(newItem, 1);
            return true;
        }
    }

    changeEquipById(etypeId, itemId) {
        var slotId = etypeId - 1;
        if (this.equipSlots()[slotId] === 1) {
            this.changeEquip(slotId, GameGlobal.$dataWeapons[itemId]);
        } else {
            this.changeEquip(slotId, GameGlobal.$dataArmors[itemId]);
        }
    }

    isEquipped(item) {
        return this.equips().contains(item);
    }

    discardEquip(item) {
        var slotId = this.equips().indexOf(item);
        if (slotId >= 0) {
            this._equips[slotId].setObject(null);
        }
    }

    releaseUnequippableItems(forcing) {
        for (; ;) {
            var slots = this.equipSlots();
            var equips = this.equips();
            var changed = false;
            for (var i = 0; i < equips.length; i++) {
                var item = equips[i];
                if (item && (!this.canEquip(item) || item.etypeId !== slots[i])) {
                    if (!forcing) {
                        this.tradeItemWithParty(null, item);
                    }
                    this._equips[i].setObject(null);
                    changed = true;
                }
            }
            if (!changed) {
                break;
            }
        }
    }

    clearEquipments() {
        var maxSlots = this.equipSlots().length;
        for (var i = 0; i < maxSlots; i++) {
            if (this.isEquipChangeOk(i)) {
                this.changeEquip(i, null);
            }
        }
    }

    optimizeEquipments() {
        var maxSlots = this.equipSlots().length;
        this.clearEquipments();
        for (var i = 0; i < maxSlots; i++) {
            if (this.isEquipChangeOk(i)) {
                this.changeEquip(i, this.bestEquipItem(i));
            }
        }
    }

    bestEquipItem(slotId) {
        var etypeId = this.equipSlots()[slotId];
        var items = GameGlobal.$gameParty.equipItems().filter(function (item) {
            return item.etypeId === etypeId && this.canEquip(item);
        }, this);
        var bestItem = null;
        var bestPerformance = -1000;
        for (var i = 0; i < items.length; i++) {
            var performance = this.calcEquipItemPerformance(items[i]);
            if (performance > bestPerformance) {
                bestPerformance = performance;
                bestItem = items[i];
            }
        }
        return bestItem;
    }

    calcEquipItemPerformance(item) {
        return item.params.reduce(function (a, b) {
            return a + b;
        });
    }

    isSkillWtypeOk(skill) {
        var wtypeId1 = skill.requiredWtypeId1;
        var wtypeId2 = skill.requiredWtypeId2;
        if ((wtypeId1 === 0 && wtypeId2 === 0) ||
            (wtypeId1 > 0 && this.isWtypeEquipped(wtypeId1)) ||
            (wtypeId2 > 0 && this.isWtypeEquipped(wtypeId2))) {
            return true;
        } else {
            return false;
        }
    }

    isWtypeEquipped(wtypeId) {
        return this.weapons().some(function (weapon) {
            return weapon.wtypeId === wtypeId;
        });
    }

    refresh() {
        this.releaseUnequippableItems(false);
        super.refresh.call(this);
    }

    isActor() {
        return true;
    }

    friendsUnit() {
        return GameGlobal.$gameParty;
    }

    opponentsUnit() {
        return GameGlobal.$gameTroop;
    }

    index() {
        return GameGlobal.$gameParty.members().indexOf(this);
    }

    isBattleMember() {
        return GameGlobal.$gameParty.battleMembers().contains(this);
    }

    isFormationChangeOk() {
        return true;
    }

    currentClass() {
        return GameGlobal.$dataClasses[this._classId];
    }

    isClass(gameClass) {
        return gameClass && this._classId === gameClass.id;
    }

    skills() {
        var list = [];
        this._skills.concat(this.addedSkills()).forEach(function (id) {
            if (!list.contains(GameGlobal.$dataSkills[id])) {
                list.push(GameGlobal.$dataSkills[id]);
            }
        });
        return list;
    }

    usableSkills() {
        return this.skills().filter(function (skill) {
            return this.canUse(skill);
        }, this);
    }

    traitObjects() {
        var objects = super.traitObjects();
        objects = objects.concat([this.actor(), this.currentClass()]);
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (item) {
                objects.push(item);
            }
        }
        return objects;
    }

    attackElements() {
        var set = super.attackElements.call(this);
        if (this.hasNoWeapons() && !set.contains(this.bareHandsElementId())) {
            set.push(this.bareHandsElementId());
        }
        return set;
    }

    hasNoWeapons() {
        return this.weapons().length === 0;
    }

    bareHandsElementId() {
        return 1;
    }

    paramMax(paramId) {
        if (paramId === 0) {
            return 9999;    // MHP
        }
        return super.paramMax(paramId);
    }

    paramBase(paramId) {
        return this.currentClass().params[paramId][this._level];
    }

    paramPlus(paramId) {
        var value = super.paramPlus(paramId);
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (item) {
                value += item.params[paramId];
            }
        }
        return value;
    }

    attackAnimationId1() {
        if (this.hasNoWeapons()) {
            return this.bareHandsAnimationId();
        } else {
            var weapons = this.weapons();
            return weapons[0] ? weapons[0].animationId : 0;
        }
    }

    attackAnimationId2() {
        var weapons = this.weapons();
        return weapons[1] ? weapons[1].animationId : 0;
    }

    bareHandsAnimationId() {
        return 1;
    }

    changeExp(exp, show) {
        this._exp[this._classId] = Math.max(exp, 0);
        var lastLevel = this._level;
        var lastSkills = this.skills();
        while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
            this.levelUp();
        }
        while (this.currentExp() < this.currentLevelExp()) {
            this.levelDown();
        }
        if (show && this._level > lastLevel) {
            this.displayLevelUp(this.findNewSkills(lastSkills));
        }
        this.refresh();
    }

    levelUp() {
        this._level++;
        this.currentClass().learnings.forEach((learning) => {
            if (learning.level === this._level) {
                this.learnSkill(learning.skillId);
            }
        });
    }

    levelDown() {
        this._level--;
    }

    findNewSkills(lastSkills) {
        var newSkills = this.skills();
        for (var i = 0; i < lastSkills.length; i++) {
            var index = newSkills.indexOf(lastSkills[i]);
            if (index >= 0) {
                newSkills.splice(index, 1);
            }
        }
        return newSkills;
    }

    displayLevelUp(newSkills) {
        var text = TextManager.levelUp.format(this._name, TextManager.level, this._level);
        GameGlobal.$gameMessage.newPage();
        GameGlobal.$gameMessage.add(text);
        newSkills.forEach(function (skill) {
            GameGlobal.$gameMessage.add(TextManager.obtainSkill.format(skill.name));
        });
    }

    gainExp(exp) {
        var newExp = this.currentExp() + Math.round(exp * this.finalExpRate());
        this.changeExp(newExp, this.shouldDisplayLevelUp());
    }

    finalExpRate() {
        return this.exr * (this.isBattleMember() ? 1 : this.benchMembersExpRate());
    }

    benchMembersExpRate() {
        return GameGlobal.$dataSystem.optExtraExp ? 1 : 0;
    }

    shouldDisplayLevelUp() {
        return true;
    }

    changeLevel(level, show) {
        level = level.clamp(1, this.maxLevel());
        this.changeExp(this.expForLevel(level), show);
    }

    learnSkill(skillId) {
        if (!this.isLearnedSkill(skillId)) {
            this._skills.push(skillId);
            this._skills.sort(function (a, b) {
                return a - b;
            });
        }
        // ABSSkillbar.requestRefresh = true;
    }

    forgetSkill(skillId) {
        var index = this._skills.indexOf(skillId);
        if (index >= 0) {
            this._skills.splice(index, 1);
        }
        // ABSSkillbar.requestRefresh = true;
    }

    isLearnedSkill(skillId) {
        return this._skills.contains(skillId);
    }

    hasSkill(skillId) {
        return this.skills().contains(GameGlobal.$dataSkills[skillId]);
    }

    changeClass(classId, keepExp) {
        if (keepExp) {
            this._exp[classId] = this.currentExp();
        }
        this._classId = classId;
        this.changeExp(this._exp[this._classId] || 0, false);
        this.refresh();
        if (this === GameGlobal.$gameParty.leader()) GameGlobal.$gameSystem.loadClassABSKeys();
        // ABSSkillbar.requestRefresh = true;
    }

    initWeaponSkills() {
        var equips = this._equips;
        for (var i = 0; i < equips.length; i++) {
            if (equips[i].object()) {
                var equipId = equips[i].object().baseItemId || equips[i].object().id;
                if (equips[i].isWeapon() && equipId) {
                    this.changeWeaponSkill(equipId);
                }
            }
        }
    };

    setCharacterImage(characterName, characterIndex) {
        this._characterName = characterName;
        this._characterIndex = characterIndex;
    }

    setFaceImage(faceName, faceIndex) {
        this._faceName = faceName;
        this._faceIndex = faceIndex;
    }

    setBattlerImage(battlerName) {
        this._battlerName = battlerName;
    }

    isSpriteVisible() {
        return GameGlobal.$gameSystem.isSideView();
    }

    startAnimation(animationId, mirror, delay) {
        mirror = !mirror;
        super.startAnimation(animationId, mirror, delay);
    }

    performActionStart(action) {
        super.performActionStart(action);
    }

    performAction(action) {
        super.performAction(action);
        if (action.isAttack()) {
            this.performAttack();
        } else if (action.isGuard()) {
            this.requestMotion('guard');
        } else if (action.isMagicSkill()) {
            this.requestMotion('spell');
        } else if (action.isSkill()) {
            this.requestMotion('skill');
        } else if (action.isItem()) {
            this.requestMotion('item');
        }
        if (action._item._dataClass === 'skill') {
            var id = action._item._itemId;
            var skill = $dataSkills[id];
            var motion = skill.meta.motion;
            if (motion) {
                this.requestMotion(motion);
            }
        }
    }

    performActionEnd() {
        super.performActionEnd();
    }

    performAttack() {
        var weapons = this.weapons();
        var wtypeId = weapons[0] ? weapons[0].wtypeId : 0;
        var attackMotion = GameGlobal.$dataSystem.attackMotions[wtypeId];
        if (attackMotion) {
            if (attackMotion.type === 0) {
                this.requestMotion('thrust');
            } else if (attackMotion.type === 1) {
                this.requestMotion('swing');
            } else if (attackMotion.type === 2) {
                this.requestMotion('missile');
            }
            this.startWeaponAnimation(attackMotion.weaponImageId);
        }
    }

    performDamage() {
        super.performDamage();
        if (this.isSpriteVisible()) {
            this.requestMotion('damage');
        } else {
            GameGlobal.$gameScreen.startShake(5, 5, 10);
        }
        SoundManager.playActorDamage();
    }

    performEvasion() {
        super.performEvasion.call(this);
        this.requestMotion('evade');
    }

    performMagicEvasion() {
        super.performMagicEvasion.call(this);
        this.requestMotion('evade');
    }

    performCounter() {
        super.performCounter.call(this);
        this.performAttack();
    }

    performCollapse() {
        super.performCollapse.call(this);
        if (GameGlobal.$gameParty.inBattle()) {
            SoundManager.playActorCollapse();
        }
    }

    performVictory() {
        if (this.canMove()) {
            this.requestMotion('victory');
        }
    }

    performEscape() {
        if (this.canMove()) {
            this.requestMotion('escape');
        }
    }

    makeActionList() {
        var list = [];
        var action = new Game_Action(this);
        action.setAttack();
        list.push(action);
        this.usableSkills().forEach(function (skill) {
            action = new Game_Action(this);
            action.setSkill(skill.id);
            list.push(action);
        }, this);
        return list;
    }

    makeAutoBattleActions() {
        for (var i = 0; i < this.numActions(); i++) {
            var list = this.makeActionList();
            var maxValue = Number.MIN_VALUE;
            for (var j = 0; j < list.length; j++) {
                var value = list[j].evaluate();
                if (value > maxValue) {
                    maxValue = value;
                    this.setAction(i, list[j]);
                }
            }
        }
        this.setActionState('waiting');
    }

    makeConfusionActions() {
        for (var i = 0; i < this.numActions(); i++) {
            this.action(i).setConfusion();
        }
        this.setActionState('waiting');
    }

    makeActions() {
        super.makeActions.call(this);
        if (this.numActions() > 0) {
            this.setActionState('undecided');
        } else {
            this.setActionState('waiting');
        }
        if (this.isAutoBattle()) {
            this.makeAutoBattleActions();
        } else if (this.isConfused()) {
            this.makeConfusionActions();
        }
    }

    onPlayerWalk() {
        this.clearResult();
        this.checkFloorEffect();

        // this.clearResult();
        // this.checkFloorEffect();
        // if (GameGlobal.$gamePlayer.isNormal()) {
        //     this.turnEndOnMap();
        //     this.states().forEach(function (state) {
        //         this.updateStateSteps(state);
        //     }, this);
        //     this.showAddedStates();
        //     this.showRemovedStates();
        // }
    }

    updateStateSteps(state) {
        super.updateStateSteps(state);
        // if (state.removeByWalking) {
        //     if (this._stateSteps[state.id] > 0) {
        //         if (--this._stateSteps[state.id] === 0) {
        //             this.removeState(state.id);
        //         }
        //     }
        // }
    }

    showAddedStates() {
        super.showAddedStates();
        // this.result().addedStateObjects().forEach(function (state) {
        //     if (state.message1) {
        //         GameGlobal.$gameMessage.add(this._name + state.message1);
        //     }
        // }, this);
    }

    showRemovedStates() {
        super.showRemovedStates();
        // this.result().removedStateObjects().forEach(function (state) {
        //     if (state.message4) {
        //         GameGlobal.$gameMessage.add(this._name + state.message4);
        //     }
        // }, this);
    }

    stepsForTurn() {
        super.stepsForTurn();
        // return 20;
    }

    turnEndOnMap() {
        if (GameGlobal.$gameParty.steps() % this.stepsForTurn() === 0) {
            this.onTurnEnd();
            if (this.result().hpDamage > 0) {
                this.performMapDamage();
            }
        }
    }

    checkFloorEffect() {
        if (GameGlobal.$gamePlayer.isOnDamageFloor()) {
            this.executeFloorDamage();
        }
    }

    executeFloorDamage() {
        var damage = Math.floor(this.basicFloorDamage() * this.fdr);
        damage = Math.min(damage, this.maxFloorDamage());
        this.gainHp(-damage);
        if (damage > 0) {
            this.performMapDamage();
        }
    }

    basicFloorDamage() {
        return 10;
    }

    maxFloorDamage() {
        return GameGlobal.$dataSystem.optFloorDeath ? this.hp : Math.max(this.hp - 1, 0);
    }

    performMapDamage() {
        if (!GameGlobal.$gameParty.inBattle()) {
            GameGlobal.$gameScreen.startFlashForDamage();
        }
    }

    clearActions() {
        super.clearActions.call(this);
        this._actionInputIndex = 0;
    }

    inputtingAction() {
        return this.action(this._actionInputIndex);
    }

    selectNextCommand() {
        if (this._actionInputIndex < this.numActions() - 1) {
            this._actionInputIndex++;
            return true;
        } else {
            return false;
        }
    }

    selectPreviousCommand() {
        if (this._actionInputIndex > 0) {
            this._actionInputIndex--;
            return true;
        } else {
            return false;
        }
    }

    lastMenuSkill() {
        return this._lastMenuSkill.object();
    }

    setLastMenuSkill(skill) {
        this._lastMenuSkill.setObject(skill);
    }

    lastBattleSkill() {
        return this._lastBattleSkill.object();
    }

    setLastBattleSkill(skill) {
        this._lastBattleSkill.setObject(skill);
    }

    lastCommandSymbol() {
        return this._lastCommandSymbol;
    }

    setLastCommandSymbol(symbol) {
        this._lastCommandSymbol = symbol;
    }

    testEscape(item) {
        return item.effects.some(function (effect, index, ar) {
            return effect && effect.code === Game_Action.EFFECT_SPECIAL;
        });
    }

    displayLevelUp(newSkills) {
        ABSManager.startPopup('E8ABS-LEVEL', {
            x: GameGlobal.$gamePlayer.cx(),
            y: GameGlobal.$gamePlayer.cy(),
            string: 'Level Up!'
        })
        ABSManager.startAnimation(E8ABS.levelAnimation, GameGlobal.$gamePlayer.cx(), GameGlobal.$gamePlayer.cy());
    };


}