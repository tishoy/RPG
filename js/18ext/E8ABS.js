import E8Plus from './E8Plus'
import Movement from '../core/movement'
export default class E8ABS {
    constructor() {
        throw new Error('This is a static class');
    }


    static quickTarget = false;
    static lockTargeting = true;
    static towardsMouse = true;
    static towardsAnalog = true;
    static radianAtks = true;
    static radianAtks = Movement.offGrid;

    static lootDecay = 600;
    static aoeLoot = true;
    static lootTrigger = true;
    static goldIcon = 314
    static levelAni = 52;
    static showDmg = true;

    static mrst = "xparm(1)"; // ?

    static aiLength = 240;
    static aiWait = 30;
    static aiSight = true;
    static aiPathfind = true;



    static getDefaultSkillKeys() {
        var skills = [{ 'Keyboard Input': 'mouse2', 'Skill Id': 17 },
        { 'Keyboard Input': '#shift', 'Skill Id': 3 }, { 'Keyboard Input': '#q', 'Skill Id': 7 },
        { 'Keyboard Input': '#e', 'Skill Id': 9 }, { 'Keyboard Input': '#1', 'Skill Id': 2 },
        { 'Keyboard Input': "#2", 'Skill Id': 21 }, { 'Keyboard Input': "#3", 'Skill Id': 22 }];
        var obj = {};
        for (var i = 0; i < skills.length; i++) {
            var skill = skills[i];
            obj[i + 1] = {
                input: [skill['Keyboard Input'].trim()],
                rebind: true,
                skillId: skill['Skill Id']
            }
        }
        return obj;
    };

    static skillKey = E8ABS.getDefaultSkillKeys();

    static stringToSkillKeyObj(string) {
        var obj = E8Plus.stringToObj(string);
        for (var key in obj) {
            var data = String(obj[key]).split(' ').filter(function (i) {
                return i !== '';
            }).map(function (i) {
                return i.trim();
            });
            var skillId = Number(data[0]) || 0;
            var rebind = data[1] === 'true';
            var msg;
            if (skillId && !GameGlobal.$dataSkills[skillId]) {
                msg = 'ERROR: Attempted to apply a Skill Id that does not exist in database.\n';
                msg += 'Skill Key Number: ' + key;
                alert(msg);
                delete obj[key];
                continue;
            }
            if (!this.skillKey[key]) {
                msg = 'ERROR: Attempted to apply a skill key that has not been setup ';
                msg += 'in the plugin parameters.\n';
                msg += 'Skill Key Number: ' + key;
                alert(msg);
                delete obj[key];
                continue;
            }
            obj[key] = {
                input: this.skillKey[key].input.clone(),
                skillId: skillId,
                rebind: rebind
            }
        }
        return obj;
    };

    static _skillSettings = {};
    static getSkillSettings(skill) {
        if (!this._skillSettings.hasOwnProperty(skill.id)) {
            var settings = skill.meta.absSettings;
            this._skillSettings[skill.id] = {
                cooldown: 0,
                through: 0,
                groundTarget: false,
                selectTarget: false,
                throughTerrain: []
            }
            if (settings) {
                // TODO change this, hate how it looks
                settings = E8Plus.stringToObj(settings);
                Object.assign(settings, {
                    cooldown: Number(settings.cooldown) || 0,
                    through: Number(settings.through) || 0,
                    groundTarget: settings.groundtarget && !settings.selecttarget,
                    selectTarget: !settings.groundtarget && settings.selecttarget,
                    throughTerrain: settings.throughTerrain || ''
                });
                if (settings.throughTerrain.constructor !== Array) {
                    settings.throughTerrain = [settings.throughTerrain];
                }
                if (settings.groundtarget) var range = Number(settings.groundtarget);
                if (settings.selecttarget) var range = Number(settings.selecttarget);
                settings.range = range || 0;
                this._skillSettings[skill.id] = settings;
            }
        }
        return this._skillSettings[skill.id];
    };

    static _skillSequence = {};
    static getSkillSequence(skill) {
        if (!this._skillSequence.hasOwnProperty(skill.id)) {
            var settings = skill.meta.absSequence;
            this._skillSequence[skill.id] = [];
            if (settings) {
                settings = settings.split('\n');
                var actions = [];
                for (var i = 0; i < settings.length; i++) {
                    if (settings[i].trim() !== '') {
                        actions.push(settings[i].trim());
                    }
                }
                actions.push('collider hide');
                actions.push('user unlock');
                actions.push('user casting false');
                this._skillSequence[skill.id] = actions;
            }
        }
        return this._skillSequence[skill.id].clone();
    };

    static _skillOnDamage = {};
    static getSkillOnDamage(skill) {
        if (!this._skillOnDamage.hasOwnProperty(skill.id)) {
            var settings = skill.meta.absOnDamage;
            var actions = [];
            actions.push('animation 0');
            if (settings) {
                settings = settings.split('\n');
                for (var i = 0; i < settings.length; i++) {
                    if (settings[i].trim() !== '') {
                        actions.push(settings[i].trim());
                    }
                }
            }
            this._skillOnDamage[skill.id] = actions;
        }
        return this._skillOnDamage[skill.id].clone();
    };

    static _weaponSkills = {};
    static weaponSkills(id) {
        if (!this._weaponSkills[id]) {
            var skills = GameGlobal.$dataWeapons[id].meta.skillKeys || GameGlobal.$dataWeapons[id].meta.absSkills;
            this._weaponSkills[id] = {};
            if (skills) {
                this._weaponSkills[id] = this.stringToSkillKeyObj(skills);
            }
        }
        return this._weaponSkills[id];
    };

    static _aiRange = {};
    static getAIRange(skill) {
        if (!this._aiRange.hasOwnProperty(skill.id)) {
            this._aiRange[skill.id] = this.calcAIRange(skill);
        }
        return this._aiRange[skill.id];
    };

    static calcAIRange(skill) {
        var settings = this.getSkillSettings(skill);
        if (settings.range) {
            return settings.range;
        }
        var actions = this.getSkillSequence(skill);
        var currDist = 0;
        var stored = 0;
        var maxDist = 0;
        actions.forEach(function (action) {
            var move = /^(?:move|wave) (.*)/i.exec(action);
            if (move) {
                move = move[1].trim().split(' ');
                if (move[0] === 'forward') {
                    currDist += Number(move[1]) || 0;
                } else {
                    currDist -= Number(move[1]) || 0;
                }
                maxDist = Math.max(currDist, maxDist);
            }
            var store = /^store/i.exec(action);
            if (store) {
                stored = currDist;
            }
            var toStore = /^(?:move|wave)ToStored/i.exec(action);
            if (toStore) {
                currDist = stored;
                maxDist = Math.max(currDist, maxDist);
            }
            var userForce = /^user forceSkill (.*)/i.exec(action);
            if (userForce) {
                userForce = Number(userForce[1].trim().split(' ')[0]);
                var dist2 = E8ABS.getAIRange(GameGlobal.$dataSkills[userForce]);
                maxDist = Math.max(dist2, maxDist);
            }
            var skillForce = /^forceSkill (.*)/i.exec(action);
            if (skillForce) {
                skillForce = Number(skillForce[1].trim().split(' ')[0]);
                var dist3 = E8ABS.getAIRange(GameGlobal.$dataSkills[skillForce]);
                dist3 += currDist;
                maxDist = Math.max(dist3, maxDist);
            }
        });
        return maxDist;
    };
}
