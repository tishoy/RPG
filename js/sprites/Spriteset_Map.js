import Spriteset_Base from './Spriteset_Base'
import TilingSprite from '../core/tilingSprite'
import Graphics from '../core/graphics'
import Sprite from '../core/sprite'
import Weather from '../core/weather'
import ShaderTilemap from '../core/shaderTilemap'
import Tilemap from '../core/tilemap';
import ImageManager from '../managers/ImageManager'
import Sprite_Character from '../sprites/Sprite_Character'
import Sprite_Destination from './Sprite_Destination'
import Sprite_Minimap from './Sprite_Minimap'
import MultiLayer from '../18ext/MultiLayer'
import ABSManager from '../managers/ABSManager'
import ColliderManager from '../managers/ColliderManager'
import Lightmask from '../mask/Lightmask'
export default class Spriteset_Map extends Spriteset_Base {
    constructor() {
        super();
        this.initialize();
    }

    initialize() {
        super.initialize();
    }

    createUpperLayer() {
        super.createUpperLayer();

        // 关闭小地图功能
        this.createMinimap();
    }

    createMinimap() {
        this._minimap = new Sprite_Minimap();
        this._minimap.refresh();
        // this.addChild(this._minimap);
    }

    createLowerLayer() {
        super.createLowerLayer();
        this.createParallax();
        this.createTilemap();
        this.createCharacters();
        this.createShadow();
        this.createDestination();
        this.createLightmask();
        this.createWeather();
        this._pictures = [];
        this._tempAnimations = [];
        if (GameGlobal.$gameTemp.isPlaytest()) {
            this.createColliders();
        }
    }

    createColliders() {
        this.addChild(ColliderManager.container);
    }

    update() {
        super.update();
        this.updateTileset();
        this.updateParallax();
        this.updateTilemap();
        this.updateShadow();
        this.updateWeather();

        // 关闭小地图功能
        this.updateMinimap();
    }

    updateMinimap() {
        this._minimap.setWholeOpacity(255 - this._fadeSprite.opacity);
        this._minimap.update();
    }

    hideCharacters() {
        for (var i = 0; i < this._characterSprites.length; i++) {
            var sprite = this._characterSprites[i];
            if (!sprite.isTile()) {
                sprite.hide();
            }
        }
    }

    createParallax() {
        this._parallax = new TilingSprite();
        this._parallax.move(0, 0, Graphics.width, Graphics.height);
        this._baseSprite.addChild(this._parallax);
    }

    createTilemap() {
        if (Graphics.isWebGL()) {
            this._tilemap = new ShaderTilemap();
        } else {
            this._tilemap = new Tilemap();
        }
        this._tilemap.tileWidth = GameGlobal.$gameMap.tileWidth();
        this._tilemap.tileHeight = GameGlobal.$gameMap.tileHeight();
        this._tilemap.setData(GameGlobal.$gameMap.width(), GameGlobal.$gameMap.height(), GameGlobal.$gameMap.data());
        this._tilemap.horizontalWrap = GameGlobal.$gameMap.isLoopHorizontal();
        this._tilemap.verticalWrap = GameGlobal.$gameMap.isLoopVertical();
        this.loadTileset();
        this._baseSprite.addChild(this._tilemap);

        //E8extension
        MultiLayer.bmps = [];
        GameGlobal.$dataMap.note.replace(MultiLayer.RE, function (_match, settings) {
            var isValid = false;
            try {
                settings = JSON.parse(settings);
                isValid = typeof (settings) === 'object';
                if (!isValid) {
                    throw 'ULDS settings should be an object';
                }
            } catch (e) {
                console.error(e);
            }
            if (isValid) {
                let spr = new MultiLayer(settings);
                MultiLayer.bmps.push(spr);
                this._tilemap.addChild(spr);
            }
        }.bind(this));
    }

    loadTileset() {
        this._tileset = GameGlobal.$gameMap.tileset();
        if (this._tileset) {
            var tilesetNames = this._tileset.tilesetNames;
            for (var i = 0; i < tilesetNames.length; i++) {
                this._tilemap.bitmaps[i] = ImageManager.loadTileset(tilesetNames[i]);
            }
            var newTilesetFlags = GameGlobal.$gameMap.tilesetFlags();
            this._tilemap.refreshTileset();
            if (!this._tilemap.flags.equals(newTilesetFlags)) {
                this._tilemap.refresh();
            }
            this._tilemap.flags = newTilesetFlags;
        }
    }

    createCharacters() {
        this._characterSprites = [];
        GameGlobal.$gameMap.events().forEach(function (event) {
            this._characterSprites.push(new Sprite_Character(event));
        }, this);
        GameGlobal.$gameMap.vehicles().forEach(function (vehicle) {
            this._characterSprites.push(new Sprite_Character(vehicle));
        }, this);
        GameGlobal.$gamePlayer.followers().reverseEach(function (follower) {
            this._characterSprites.push(new Sprite_Character(follower));
        }, this);
        this._characterSprites.push(new Sprite_Character(GameGlobal.$gamePlayer));
        for (var i = 0; i < this._characterSprites.length; i++) {
            this._tilemap.addChild(this._characterSprites[i]);
        }
    }

    createShadow() {
        this._shadowSprite = new Sprite();
        this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow1');
        this._shadowSprite.anchor.x = 0.5;
        this._shadowSprite.anchor.y = 1;
        this._shadowSprite.z = 6;
        this._tilemap.addChild(this._shadowSprite);
    }

    createDestination() {
        this._destinationSprite = new Sprite_Destination();
        this._destinationSprite.z = 9;
        this._tilemap.addChild(this._destinationSprite);
    }

    createLightmask() {
        this._lightmask = new Lightmask();
        this.addChild(this._lightmask);
    };

    createWeather() {
        this._weather = new Weather();
        this.addChild(this._weather);
    }

    updateTileset() {
        if (this._tileset !== GameGlobal.$gameMap.tileset()) {
            this.loadTileset();
        }
    }

    /*
     * Simple fix for canvas parallax issue, destroy old parallax and readd to  the tree.
     */
    _canvasReAddParallax() {
        var index = this._baseSprite.children.indexOf(this._parallax);
        this._baseSprite.removeChild(this._parallax);
        this._parallax = new TilingSprite();
        this._parallax.move(0, 0, Graphics.width, Graphics.height);
        this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
        this._baseSprite.addChildAt(this._parallax, index);
    }

    updateParallax() {
        if (this._parallaxName !== GameGlobal.$gameMap.parallaxName()) {
            this._parallaxName = GameGlobal.$gameMap.parallaxName();

            if (this._parallax.bitmap && Graphics.isWebGL() != true) {
                this._canvasReAddParallax();
            } else {
                this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
            }
        }
        if (this._parallax.bitmap) {
            this._parallax.origin.x = GameGlobal.$gameMap.parallaxOx();
            this._parallax.origin.y = GameGlobal.$gameMap.parallaxOy();
        }
    }

    updateTilemap() {
        this._tilemap.origin.x = GameGlobal.$gameMap.displayX() * GameGlobal.$gameMap.tileWidth();
        this._tilemap.origin.y = GameGlobal.$gameMap.displayY() * GameGlobal.$gameMap.tileHeight();
        if (this._pictures !== ABSManager._pictures) this.addPictures();
        if (this._tempAnimations !== ABSManager._animations) this.addAnimations();
    }

    updateShadow() {
        // TODO  影子update 被注视掉了
        // var airship = GameGlobal.$gameMap.airship();
        // this._shadowSprite.x = airship.shadowX();
        // this._shadowSprite.y = airship.shadowY();
        // this._shadowSprite.opacity = airship.shadowOpacity();
    }

    updateWeather() {
        this._weather.type = GameGlobal.$gameScreen.weatherType();
        this._weather.power = GameGlobal.$gameScreen.weatherPower();
        this._weather.origin.x = GameGlobal.$gameMap.displayX() * GameGlobal.$gameMap.tileWidth();
        this._weather.origin.y = GameGlobal.$gameMap.displayY() * GameGlobal.$gameMap.tileHeight();
    }


    addPictures() {
        this._pictures = ABSManager._pictures;
        if (this._pictures.length === 0) return;
        for (var i = 0; i < this._pictures.length; i++) {
            if (this.children.indexOf(this._pictures[i]) !== -1) continue;
            this._tilemap.addChild(this._pictures[i]);
        }
    };

    addAnimations() {
        this._tempAnimations = ABSManager._animations;
        if (this._tempAnimations.length === 0) return;
        for (var i = 0; i < this._tempAnimations.length; i++) {
            if (this.children.indexOf(this._tempAnimations[i]) !== -1) continue;
            this._tilemap.addChild(this._tempAnimations[i]);
            if (this._tempAnimations[i].isAnimationPlaying()) {
                for (var j = 0; j < this._tempAnimations[i]._animationSprites.length; j++) {
                    this._tilemap.addChild(this._tempAnimations[i]._animationSprites[j]);
                }
            }
        }
    };
}