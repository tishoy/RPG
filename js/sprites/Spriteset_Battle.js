import Spriteset_Base from './Spriteset_Base'
import TilingSprite from '../core/tilingSprite'
import Sprite from '../core/sprite';
import Graphics from '../core/graphics'
import SceneManager from '../managers/SceneManager'
import ImageManager from '../managers/ImageManager'
import Sprite_Actor from '../sprites/Sprite_Actor'
import Sprite_Enemy from '../sprites/Sprite_Enemy'
export default class Spriteset_Battle extends Spriteset_Base {

    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        super.initialize();
        this._battlebackLocated = false;
    }

    createLowerLayer() {
        super.createLowerLayer();
        this.createBackground();
        this.createBattleField();
        this.createBattleback();
        this.createEnemies();
        this.createActors();
    }

    createBackground() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this._baseSprite.addChild(this._backgroundSprite);
    }

    update() {
        super.update();
        this.updateActors();
        this.updateBattleback();
    }

    createBattleField() {
        var width = Graphics.boxWidth;
        var height = Graphics.boxHeight;
        var x = (Graphics.width - width) / 2;
        var y = (Graphics.height - height) / 2;
        this._battleField = new Sprite();
        this._battleField.setFrame(x, y, width, height);
        this._battleField.x = x;
        this._battleField.y = y;
        this._baseSprite.addChild(this._battleField);
    }

    createBattleback() {
        var margin = 32;
        var x = -this._battleField.x - margin;
        var y = -this._battleField.y - margin;
        var width = Graphics.width + margin * 2;
        var height = Graphics.height + margin * 2;
        this._back1Sprite = new TilingSprite();
        this._back2Sprite = new TilingSprite();
        this._back1Sprite.bitmap = this.battleback1Bitmap();
        this._back2Sprite.bitmap = this.battleback2Bitmap();
        this._back1Sprite.move(x, y, width, height);
        this._back2Sprite.move(x, y, width, height);
        this._battleField.addChild(this._back1Sprite);
        this._battleField.addChild(this._back2Sprite);
    }

    updateBattleback() {
        if (!this._battlebackLocated) {
            this.locateBattleback();
            this._battlebackLocated = true;
        }
    }

    locateBattleback() {
        var width = this._battleField.width;
        var height = this._battleField.height;
        var sprite1 = this._back1Sprite;
        var sprite2 = this._back2Sprite;
        sprite1.origin.x = sprite1.x + (sprite1.bitmap.width - width) / 2;
        sprite2.origin.x = sprite1.y + (sprite2.bitmap.width - width) / 2;
        if (GameGlobal.$gameSystem.isSideView()) {
            sprite1.origin.y = sprite1.x + sprite1.bitmap.height - height;
            sprite2.origin.y = sprite1.y + sprite2.bitmap.height - height;
        }
    }

    autotileType(z) {
        return GameGlobal.$gameMap.autotileType(GameGlobal.$gamePlayer.x, GameGlobal.$gamePlayer.y, z);
    }

    createEnemies() {
        var enemies = GameGlobal.$gameTroop.members();
        var sprites = [];
        for (var i = 0; i < enemies.length; i++) {
            sprites[i] = new Sprite_Enemy(enemies[i]);
        }
        sprites.sort(this.compareEnemySprite.bind(this));
        for (var j = 0; j < sprites.length; j++) {
            this._battleField.addChild(sprites[j]);
        }
        this._enemySprites = sprites;
    }

    compareEnemySprite(a, b) {
        if (a.y !== b.y) {
            return a.y - b.y;
        } else {
            return b.spriteId - a.spriteId;
        }
    }

    createActors() {
        this._actorSprites = [];
        for (var i = 0; i < GameGlobal.$gameParty.maxBattleMembers(); i++) {
            this._actorSprites[i] = new Sprite_Actor();
            this._battleField.addChild(this._actorSprites[i]);
        }
    }

    updateActors() {
        var members = GameGlobal.$gameParty.battleMembers();
        for (var i = 0; i < this._actorSprites.length; i++) {
            this._actorSprites[i].setBattler(members[i]);
        }
    }

    battlerSprites() {
        return this._enemySprites.concat(this._actorSprites);
    }

    isAnimationPlaying() {
        return this.battlerSprites().some(function (sprite) {
            return sprite.isAnimationPlaying();
        });
    }

    isEffecting() {
        return this.battlerSprites().some(function (sprite) {
            return sprite.isEffecting();
        });
    }

    isAnyoneMoving() {
        return this.battlerSprites().some(function (sprite) {
            return sprite.isMoving();
        });
    }

    isBusy() {
        return this.isAnimationPlaying() || this.isAnyoneMoving();
    }
}