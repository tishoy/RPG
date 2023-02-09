import E8Plus from '../18ext/E8Plus'
import E8ABS from '../18ext/E8ABS'
import ImageManager from './ImageManager'
import ColliderManager from '../managers/ColliderManager'
import Circle_Collider from '../collider/Circle_Collider'
import SceneManager from './SceneManager'
import Scene_Map from '../scenes/Scene_Map'
import Sprite_MapAnimation from '../sprites/Sprite_MapAnimation'
import Game_ABSAction from '../object/Game_ABSAction'
import LightManager from './LightManager'
export default class ABSManager {
    constructor() {
        throw new Error('This is a static class');
    }

    static clear() {
        this._animations = [];
        this._pictures = [];
        this._mapId = GameGlobal.$gameMap._mapId;
    };

    static getTargets(item, self) {
        return ColliderManager.getCharactersNear(item.collider, function (chara) {
            if (typeof chara.battler !== 'function' || !chara.battler()) return false;
            if (chara.battler().isDeathStateAffected()) return false;
            if (chara.isFriendly(self) && [1, 2, 3, 4, 5, 6].contains(item.data.scope)) {
                return false;
            }
            if (!chara.isFriendly(self) && [7, 8, 9, 10].contains(item.data.scope)) {
                return false;
            }
            if (item.data.scope === 11 && chara !== self) return false;
            var type = item.settings.collides || 'collision';
            return item.collider.intersects(chara.collider(type));
        });
    };

    static bestAction(userId) {
        var chara = E8Plus.getCharacter(userId);
        if (!chara.battler()) return null;
        var targets;
        var skills = chara.usableSkills().filter(function (skillId) {
            if (!skillId) return false;
            targets = ABSManager.skillWillHit(skillId, userId);
            if (targets && targets.length > 0) {
                return true;
            }
            return false;
        })
        if (skills.length === 0) return null;
        return skills[Math.floor(Math.random() * skills.length)];
    };

    static skillWillHit(skillId, userId) {
        var skill = GameGlobal.$dataSkills[skillId];
        var chara = E8Plus.getCharacter(userId);
        var settings = E8ABS.getSkillSettings(skill);
        var collider = chara.collider('collision');
        var skillCollider = chara.makeSkillCollider(settings);
        var w1 = settings.collider[1] || chara.collider('collision').width;
        var h1 = settings.collider[2] || chara.collider('collision').height;
        var x1 = chara.cx() - w1 / 2;
        var y1 = chara.cy() - h1 / 2;
        var targets = [];
        var aiRange = E8ABS.getAIRange(skill);
        var range = 0;
        if (aiRange > 0) {
            var r1 = aiRange * 2;
            range = new Circle_Collider(w1 + r1, h1 + r1);
            range.moveTo(x1 - r1 / 2, y1 - r1 / 2);
            targets = this.getTargets({
                settings: settings,
                data: skill,
                collider: range
            }, chara);
            ColliderManager.draw(range, E8ABS.aiWait / 2);
        } else {
            targets = this.getTargets({
                settings: settings,
                data: skill,
                collider: skillCollider
            }, chara);
            ColliderManager.draw(skillCollider, E8ABS.aiWait / 2);
        }
        return targets;
    };

    static startAction(self, targets, item) {
        if (!item.animationTarget || targets.length === 0) {
            this.startAnimation(item.data.animationId, item.collider.center.x, item.collider.center.y);
        }
        self._agro.placeInCombat();
        var action = new Game_ABSAction(self.battler(), true);
        action.setSkill(item.data.id);
        for (var i = 0; i < targets.length; i++) {
            if (item.animationTarget === 1) {
                var x = targets[i].cx();
                var y = targets[i].cy();
                this.startAnimation(item.data.animationId, x, y);
            }

            // TX ADD ONHitNPC
            LightManager.onHitNPC(targets[i], item);

            action.absApply(targets[i].battler());
            targets[i].addAgro(self.charaId(), item.data);
        }
        action.applyGlobal();
    };

    static startPopup(type, options) {
        if (!true) return;
        var preset = GameGlobal.$gameSystem.qPopupPreset(type);
        Object.assign(options, {
            style: preset.style,
            transitions: preset.transitions
        })
        if (!options.duration) options.duration = 80;
        if (!options.transitions) {
            var start = options.duration - 30;
            var end = start + 30;
            var fadeout = start + ' 30 fadeout';
            var slideup = '0 ' + end + ' slideup 24';
            options.transitions = [fadeout, slideup];
        }
        return QPopup.start(options);
    };

    static _animations = [];
    static startAnimation(id, x, y) {
        var scene = SceneManager._scene;
        if (scene.constructor !== Scene_Map) return;
        if (id < 0) id = 1;
        if (id <= 0) return;
        var animation = GameGlobal.$dataAnimations[id];
        var temp = new Sprite_MapAnimation(animation);
        temp.move(x, y);
        this._animations.push(temp);
        scene._spriteset._tilemap.addChild(temp);
    };

    static removeAnimation(sprite) {
        var scene = SceneManager._scene;
        if (scene.constructor !== Scene_Map) return;
        var i = this._animations.indexOf(sprite);
        if (i < 0) return;
        this._animations[i] = null;
        this._animations.splice(i, 1);
        scene._spriteset._tilemap.removeChild(sprite);
    };

    static _pictures = [];
    static addPicture(sprite) {
        var scene = SceneManager._scene;
        if (scene.constructor !== Scene_Map) return;
        this._pictures.push(sprite);
        scene._spriteset._tilemap.addChild(sprite);
    };

    static removePicture(sprite) {
        var scene = SceneManager._scene;
        if (scene.constructor !== Scene_Map) return;
        var i = this._pictures.indexOf(sprite);
        if (i < 0) return;
        this._pictures[i] = null;
        this._pictures.splice(i, 1);
        scene._spriteset._tilemap.removeChild(sprite);
    };

    static createItem(x, y, itemId, type) {
        var loot = new Game_Loot(x, y);
        var data = GameGlobal.$dataItems;
        if (type === 1) data = GameGlobal.$dataWeapons;
        if (type === 2) data = GameGlobal.$dataArmors;
        loot.setItem(data[itemId]);
        return loot;
    };

    static createGold(x, y, value) {
        var loot = new Game_Loot(x, y);
        loot.setGold(value);
        return loot;
    };

    static _freeEventIds = [];
    static addEvent(event) {
        var id = this._freeEventIds.unshift() || 0;
        if (!id || GameGlobal.$gameMap._events[id]) {
            id = GameGlobal.$gameMap._events.length;
        }
        event._eventId = id;
        GameGlobal.$gameMap._events[id] = event;
        if (!event._noSprite) {
            var scene = SceneManager._scene;
            if (scene === Scene_Map) {
                var spriteset = scene._spriteset;
                var sprite = new Sprite_Character(event);
                spriteset._characterSprites.push(sprite);
                spriteset._tilemap.addChild(sprite);
            }
        }
    };

    static removeEvent(event) {
        var id = event._eventId;
        if (!id || !GameGlobal.$gameMap._events[id]) return;
        event.removeColliders();
        if (!event._noSprite) {
            var scene = SceneManager._scene;
            if (scene === Scene_Map) {
                var spriteset = scene._spriteset;
                var spriteCharas = spriteset._characterSprites;
                for (var i = 0; i < spriteCharas.length; i++) {
                    if (spriteCharas[i] && spriteCharas[i]._character === event) {
                        spriteset._tilemap.removeChild(spriteCharas[i]);
                        spriteCharas.splice(i, 1);
                        break;
                    }
                }
            }
        }
        GameGlobal.$gameMap._events[id].clearABS();
        GameGlobal.$gameMap._events[id] = null;
        this._freeEventIds.push(id);
    };

    static preloadSkill(skill) {
        var aniId = skill.animationId;
        aniId = aniId < 0 ? 1 : aniId;
        var ani = GameGlobal.$dataAnimations[aniId];
        if (ani) {
            ImageManager.loadAnimation(ani.animation1Name, ani.animation1Hue);
            ImageManager.loadAnimation(ani.animation2Name, ani.animation2Hue);
        }
        var sequence = E8ABS.getSkillSequence(skill);
        for (var i = 0; i < sequence.length; i++) {
            var action = sequence[i];
            var ani = /^animation (.*)/i.exec(action);
            var pic = /^picture (.*)/i.exec(action);
            var forced = /forceSkill (\d+)/i.exec(action);
            if (ani) {
                ani = ani[1].trim();
                ani = GameGlobal.$dataAnimations[ani];
                if (ani) {
                    ImageManager.loadAnimation(ani.animation1Name, ani.animation1Hue);
                    ImageManager.loadAnimation(ani.animation2Name, ani.animation2Hue);
                }
            }
            if (pic) {
                pic = E8Plus.makeArgs(pic[1])[0];
                ImageManager.loadPicture(pic);
            }
            if (forced) {
                var forcedSkill = GameGlobal.$dataSkills[Number(forced[1])];
                if (forcedSkill) this.preloadSkill(forcedSkill);
            }
        }
    };
}
