import Sprite_Base from './Sprite_Base'
import Sprite from '../core/sprite'
import ImageManager from '../managers/ImageManager'
import Sprite_StateOverlay from './Sprite_StateOverlay'
import Sprite_Gauge from './Sprite_Gauge'
import Sprite_BossGauge from './Sprite_BossGauge'
import FaceSetting from '../18ext/FaceSetting'
import Bitmap from '../core/bitmap'
/**
 * 角色
 */
export default class Sprite_Character extends Sprite_Base {
    constructor(character) {
        super();
        this.initialize(character);
    }

    initialize(character) {
        super.initialize()
        this.initMembers();
        this.setCharacter(character);
    }

    initMembers() {
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this._character = null;
        this._balloonDuration = 0;
        this._tilesetId = 0;
        this._upperBody = null;
        this._lowerBody = null;
        this.createStateSprite();
        this.createHaloSprite();
    }

    createHaloSprite() {

    }

    createStateSprite() {
        this._stateSprite = new Sprite_StateOverlay();
        this.addChild(this._stateSprite);
    };

    setCharacter(character) {
        this._character = character;
    }

    update() {
        super.update();
        this.updateBitmap();
        this.updateFrame();
        this.updatePosition();
        this.updateAnimation();
        this.updateBalloon();
        this.updateOther();
        if (this._character) this.updateBattler();
        if (this._battler) this.updateDamagePopup();
    }

    updateBattler() {
        if (this._battler !== this._character.battler()) {
            this.setBattler(this._character.battler());
        }
    };

    setBattler(battler) {
        this._battler = battler;
        this._stateSprite.setup(this._battler);

        if (!battler || this._character === GameGlobal.$gamePlayer) return;
        if (!this._gaugeSprite) {
            this._gaugeSprite = new Sprite_Gauge();
            this.addChild(this._gaugeSprite);
        }
        this._gaugeSprite.setup(this._character, battler);
        if (battler._bossHpBar) {
            if (!this._bossGauge) {
                this._bossGauge = new Sprite_BossGauge();
                this.parent.addChild(this._bossGauge);
            }
            this._bossGauge.setup(this._character, this._battler);
        }
    };

    updateDamagePopup() {
        this.setupDamagePopup();
    };

    // ABS
    setupDamagePopup() {
        return;
        // need QPopup
        if (!Imported.QPopup || this._character._noPopup) return;
        if (this._battler._damageQueue.length > 0) {
            var string;
            var fill = '#ffffff';
            var result = this._battler._damageQueue.shift();
            var type = 'DMG';
            if (result.missed || result.evaded) {
                string = 'Missed';
                type = 'MISSED';
            } else if (result.hpAffected) {
                var dmg = result.hpDamage;
                string = String(Math.abs(dmg));
                if (dmg >= 0) {
                    type = 'DMG';
                } else {
                    type = 'HEAL';
                }
            } else if (result.mpDamage) {
                string = String(result.mpDamage);
                type = 'MP';
            }
            if (!string && string !== '0') return;
            var iconIndex = result.damageIcon;
            if (iconIndex) {
                string = '\\I[' + iconIndex + ']' + string;
            }
            if (result.critical) {
                type += '-CRIT';
            }
            E8ABSManager.startPopup('E8ABS-' + type, {
                string: string,
                oy: this._battler._popupOY,
                bindTo: this._character.charaId(),
                duration: 80
            });
            this._battler.clearDamagePopup();
            this._battler.clearResult();
        }
    };

    updateVisibility() {
        super.updateVisibility();
        if (this._character.isTransparent()) {
            this.visible = false;
        }
    }

    isTile() {
        return this._character.tileId > 0;
    }

    tilesetBitmap(tileId) {
        var tileset = GameGlobal.$gameMap.tileset();
        var setNumber = 5 + Math.floor(tileId / 256);
        return ImageManager.loadTileset(tileset.tilesetNames[setNumber]);
    }

    updateBitmap() {
        if (this.isImageChanged()) {
            this._tilesetId = GameGlobal.$gameMap.tilesetId();
            this._tileId = this._character.tileId();
            this._characterName = this._character.characterName();
            this._characterIndex = this._character.characterIndex();
            if (this._tileId > 0) {
                this.setTileBitmap();
            } else {
                this.setCharacterBitmap();
            }
        }

        var qSprite = this.qSprite();
        if (qSprite) {
            this.anchor.x = qSprite.anchorX || 0.5;
            this.anchor.y = qSprite.anchorY || 1;
        }
    }

    isImageChanged() {
        return (this._tilesetId !== GameGlobal.$gameMap.tilesetId() ||
            this._tileId !== this._character.tileId() ||
            this._characterName !== this._character.characterName() ||
            this._characterIndex !== this._character.characterIndex());
    }

    setTileBitmap() {
        this.bitmap = this.tilesetBitmap(this._tileId);
    }

    setCharacterBitmap() {
        this.bitmap = ImageManager.loadCharacter(this._characterName);
        this._isBigCharacter = ImageManager.isBigCharacter(this._characterName);
        if (this._faceBody) {
            this.setFaceBitmap(this._faceBody[0]);
            this.setFaceBitmap(this._faceBody[1]);
        };
    }

    updateFrame() {
        if (this._tileId > 0) {
            this.updateTileFrame();
        } else {
            this.updateCharacterFrame();
        }
    }

    updateTileFrame() {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (Math.floor(this._tileId / 128) % 2 * 8 + this._tileId % 8) * pw;
        var sy = Math.floor(this._tileId % 256 / 8) % 16 * ph;
        this.setFrame(sx, sy, pw, ph);
    }

    updateCharacterFrame() {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
        var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
        this.updateHalfBodySprites();
        if (this._bushDepth > 0) {
            var d = this._bushDepth;
            this._upperBody.setFrame(sx, sy, pw, ph - d);
            this._lowerBody.setFrame(sx, sy + ph - d, pw, d);
            this.setFrame(sx, sy, 0, ph);
        } else {
            this.setFrame(sx, sy, pw, ph);
        }
    }

    characterBlockX() {
        if (this.qSprite()) return 0;
        if (this._isBigCharacter) {
            return 0;
        } else {
            var index = this._character.characterIndex();
            return index % 4 * 3;
        }
    }

    characterBlockY() {
        if (this.qSprite()) return 0;
        if (this._isBigCharacter) {
            return 0;
        } else {
            var index = this._character.characterIndex();
            return Math.floor(index / 4) * 4;
        }
    }

    characterPatternX() {
        var qSprite = this.qSprite();
        if (qSprite) {
            var pose = qSprite.poses[this._character._pose];
            if (!pose) return 0;
            var pattern = pose.pattern;
            var i = pattern[this._character._pattern];
            var x = i % qSprite.cols;
            return x;
        }
        return this._character.pattern();
    }

    characterPatternY() {
        var qSprite = this.qSprite();
        if (qSprite) {
            var pose = qSprite.poses[this._character._pose];
            if (!pose) return 0;
            var pattern = pose.pattern;
            var i = pattern[this._character._pattern];
            var x = i % qSprite.cols;
            var y = (i - x) / qSprite.cols;
            return y;
        }
        return (this._character.direction() - 2) / 2;
    }

    patternWidth() {
        var qSprite = this.qSprite();
        if (qSprite) {
            return this.bitmap.width / qSprite.cols;
        }
        if (this._tileId > 0) {
            return GameGlobal.$gameMap.tileWidth();
        } else if (this._isBigCharacter) {
            return this.bitmap.width / 3;
        } else {
            return this.bitmap.width / 12;
        }
    }

    patternHeight() {
        var qSprite = this.qSprite();
        if (qSprite) {
            return this.bitmap.height / qSprite.rows;
        }
        if (this._tileId > 0) {
            return GameGlobal.$gameMap.tileHeight();
        } else if (this._isBigCharacter) {
            return this.bitmap.height / 4;
        } else {
            return this.bitmap.height / 8;
        }
    }

    updateHalfBodySprites() {
        if (this._bushDepth > 0) {
            this.createHalfBodySprites();
            this._upperBody.bitmap = this.bitmap;
            this._upperBody.visible = true;
            this._upperBody.y = - this._bushDepth;
            this._lowerBody.bitmap = this.bitmap;
            this._lowerBody.visible = true;
            this._upperBody.setBlendColor(this.getBlendColor());
            this._lowerBody.setBlendColor(this.getBlendColor());
            this._upperBody.setColorTone(this.getColorTone());
            this._lowerBody.setColorTone(this.getColorTone());
        } else if (this._upperBody) {
            this._upperBody.visible = false;
            this._lowerBody.visible = false;
        }

        if (this._bushDepth > 0) {
            var ph = this.patternHeight();
            var offsetA = Math.round(ph - ph * this.anchor.y);
            var offsetB = ph - offsetA;
            this._upperBody.y = -offsetB;
            this._lowerBody.y = -this._bushDepth;
        }
        if (this._character) { this.updateFaceBase() };
    }

    createHalfBodySprites() {
        //qsprite
        var upper = this._upperBody;
        var lower = this._lowerBody;

        if (!this._upperBody) {
            this._upperBody = new Sprite();
            this._upperBody.anchor.x = 0.5;
            this._upperBody.anchor.y = 1;
            this.addChild(this._upperBody);
        }
        if (!this._lowerBody) {
            this._lowerBody = new Sprite();
            this._lowerBody.anchor.x = 0.5;
            this._lowerBody.anchor.y = 1;
            this._lowerBody.opacity = 128;
            this.addChild(this._lowerBody);
        }

        if (!upper) {
            this._upperBody.anchor.x = this.anchor.x;
            this._upperBody.anchor.y = 0;
        }
        if (!lower) {
            this._lowerBody.anchor.x = this.anchor.x;
            this._lowerBody.anchor.y = 0;
            this._lowerBody.opacity = 128;
        }
    }

    updatePosition() {
        this.x = this._character.screenX();
        this.y = this._character.screenY();
        this.z = this._character.screenZ();
    }

    updateAnimation() {
        this.setupAnimation();
        if (!this.isAnimationPlaying()) {
            this._character.endAnimation();
        }
        if (!this.isBalloonPlaying()) {
            this._character.endBalloon();
        }
    }

    updateOther() {
        this.opacity = this._character.opacity();
        this.blendMode = this._character.blendMode();
        this._bushDepth = this._character.bushDepth();
    }

    setupAnimation() {
        if (this._character.animationId() > 0) {
            var animation = GameGlobal.$dataAnimations[this._character.animationId()];
            this.startAnimation(animation, false, 0);
            this._character.startAnimation();
        }
    }

    setupBalloon() {
        if (this._character.balloonId() > 0) {
            this.startBalloon();
            this._character.startBalloon();
        }
    }

    startBalloon() {
        if (!this._balloonSprite) {
            this._balloonSprite = new Sprite_Balloon();
        }
        this._balloonSprite.setup(this._character.balloonId());
        this.parent.addChild(this._balloonSprite);
    }

    updateBalloon() {
        this.setupBalloon();
        if (this._balloonSprite) {
            this._balloonSprite.x = this.x;
            this._balloonSprite.y = this.y - this.height;
            if (!this._balloonSprite.isPlaying()) {
                this.endBalloon();
            }
        }
    }

    endBalloon() {
        if (this._balloonSprite) {
            this.parent.removeChild(this._balloonSprite);
            this._balloonSprite = null;
        }
    }

    isBalloonPlaying() {
        return !!this._balloonSprite;
    }


    qSprite() {
        return this._character.qSprite();
    };

    updateCharacterFrame() {
        var pw = this.patternWidth();
        var ph = this.patternHeight();
        var sx = (this.characterBlockX() + this.characterPatternX()) * pw;
        var sy = (this.characterBlockY() + this.characterPatternY()) * ph;
        this.updateHalfBodySprites();
        if (this._bushDepth > 0) {
            var offsetA = Math.round(ph - ph * this.anchor.y);
            var d = this._bushDepth + offsetA;
            this._upperBody.setFrame(sx, sy, pw, ph - d);
            this._lowerBody.setFrame(sx, sy + ph - d, pw, d);
            this.setFrame(sx, sy, 0, ph);
        } else {
            this.setFrame(sx, sy, pw, ph);
        }
    }


    // Face

    //==============================
    // * update Half Body
    //==============================

    //==============================
    // * update Face Base
    //==============================
    updateFaceBase() {
        if (this.canCreateFace()) { this.createFaceSprites() };
        if (this.needRemoveFaceSprite()) { this.removeFaceSprite() };
        if (this._faceBody) {
            for (var i = 0; i < this._faceBody.length; i++) {
                this.updateFaceBody(this._faceBody[i])
            };
        };
        if (this._FaceField) { this._FaceField.y = this._character.pattern() == 1 ? -1 : 0 };
        this._character._faceData.direction = this._character.direction();
        this._character._faceData.needRefresh = false;
        if (this._upperBody && !this._upperBody.mz) { this.sortFaceMZ() };
    };

    //==============================
    // * update Face Body
    //==============================
    updateFaceBody(sprite) {
        if (!sprite.bitmap) {
            this.setFaceBitmap(sprite);
        } else {
            if (this.needRefreshFaceFrame()) { this.setFaceFrame(sprite) };
            if (this.needHideFace(sprite)) { sprite.visible = false };
        };
    };

    //==============================
    // * needHideFace
    //==============================
    needHideFace(sprite) {
        if (this._character.direction == 8) { return true };
        if (!this._character._faceData.eyeL) {
            if (sprite.index == 1 || sprite.index == 3) { return true };
        };
        if (!this._character._faceData.eyeR) {
            if (sprite.index == 0 || sprite.index == 2) { return true };
        };
        return false;
    };


    //==============================
    // * needRefreshFaceFrame
    //==============================
    needRefreshFaceFrame(sprite) {
        if (this._character._faceData.direction != this._character.direction()) { return true };
        if (this._character._faceData.needRefresh) { return true };
        return false;
    };

    //==============================
    // * need Refresh Face Bitmap
    //==============================
    needRefreshFaceBitmap() {
        if (this._character._faceData.direction != this._character.direction) { return true };
        return false;
    };

    //==============================
    // * create Face Sprites
    //==============================
    createFaceSprites() {
        if (!this._FaceField) {
            this._FaceField = new Sprite();
            this._FaceField.mz = 15;
            this.addChild(this._FaceField);
        };
        if (!this._faceBody) {
            this._faceBody = [];
            for (var i = 0; i < 4; i++) {
                this._faceBody[i] = new Sprite();
                this._faceBody[i].index = i;
                this._faceBody[i].anchor.x = 0.5;
                this._faceBody[i].anchor.y = 0.5;
                this._faceBody[i].visible = false;
                this._FaceField.addChild(this._faceBody[i])
            };
        };
    };

    //==============================
    // * sort Face MZ
    //==============================
    sortFaceMZ() {
        this._lowerBody.mz = 10;
        this._upperBody.mz = 11;
        this.children.sort(function (a, b) { return a.mz - b.mz });
    };

    //==============================
    // * can Create Face
    //==============================
    canCreateFace() {
        if (this._faceBody) { return false };
        if (!this._character) { return false };
        if (!this._character._faceData.enabled) { return false };
        if (!this.bitmap) { return false };
        if (this.patternHeight() == 0) { return false };
        if (this._character.isTransparent()) { return false };
        if (this._character.characterName() == '') { return false };
        return true;
    };
    //==============================
    // * face Mode
    //==============================
    faceMode() {
        return this._character._faceData.mode;
    };

    //==============================
    // * set Face Pos X
    //==============================
    setFacePosX(sprite, xf, rx, x) {
        return x + xf + rx + (11 * (sprite.index - 2)) + this._character._faceData.x;
    };

    //==============================
    // * set Face Pos Y
    //==============================
    setFacePosY(sprite, yf, ry, y) {
        return y + ry + yf + this._character._faceData.y;
    };

    //==============================
    // * set Face Frame
    //==============================
    setFaceFrame(sprite) {
        var pw = this.patternHeight();
        var ph = this.patternWidth();
        var sx = (this.characterBlockX() + 1) * pw;
        var sy = (this.characterBlockY()) * ph;
        var bx = pw - 31;
        if (this.patternHeight() >= 60) {
            var by = ph - (this.patternHeight() - 40);
        } else {
            var by = ph - 12;
        };
        sprite.bitmap.clear();
        sprite.visible = true;
        if (sprite.index < 2) {
            this.setBitmapEyesBack(sprite, sx, sy, pw, ph)
        } else {
            this.setBitmapEyes(sprite, sx, sy, pw, ph)
        };
        this.setFacePosition(sprite);
        if (this.needHideFace(sprite)) { sprite.visible = false };
    };

    //==============================
    // * set Face Frame Front
    //==============================
    setFaceFrameFront(sprite, pw, ph, sx, sy, bx, by) {
        if (sprite.index < 2) {
            this.setBitmapEyesBack(sprite, sx, sy, pw, ph)
        } else {
            this.setBitmapEyes(sprite, sx, sy, pw, ph)
        };
    };

    //==============================
    // * set Bitmap Eyes Back
    //==============================
    setBitmapEyesBack(sprite, sx, sy, pw, ph) {
        if (this._character.direction() == 2) {
            this.setBitmapEyesBackFront(sprite, sx, sy, pw, ph);
        } else {
            this.setBitmapEyesBackSide(sprite, sx, sy, pw, ph);
        };
    };

    //==============================
    // * set Bitmap Eyes Back Front
    //==============================	
    setBitmapEyesBackFront(sprite, sx, sy, pw, ph) {
        if (this.patternHeight() >= 60) {
            var bx = pw + FaceSetting.face_RectX_64_F1;
            var by = ph - this.patternHeight() + FaceSetting.face_RectY_64_F1;
            var wx = 1;
            var wy = 6;
        } else {
            var bx = pw + FaceSetting.face_RectX_48_F1;
            var by = ph + FaceSetting.face_RectY_48_F1;
            var wx = 1;
            var wy = 1;
        };
        if (this.faceMode() == 5) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, wx, wy, 0, 0, 6, 6);
            if (sprite.index == 1) {
                this.setBitmapEyeBackWhite(sprite, 5, 4)

            } else {
                ;
                this.setBitmapEyesBackFrontHp(sprite, sx, sy, pw, ph)
            };
        } else if (this.faceMode() == 6) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, wx, wy, 0, 0, 6, 6);
            if (sprite.index == 0) {
                this.setBitmapEyeBackWhite(sprite, 5, 4)
            } else {
                ;
                this.setBitmapEyesBackFrontHp(sprite, sx, sy, pw, ph);
            };
        } else if (this.faceMode() == 7) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, wx, wy, 0, 0, 6, 6);
            this.setBitmapEyesBackFrontHp(sprite, sx, sy, pw, ph);
        } else if (this.faceMode() == 8) {
        } else if (this.faceMode() == 9) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 1, 1, 0, 0, 6, 4);
            var color = "#FFFFFF"
            sprite.bitmap.fillRect(0, 2, 5, 3, color);
            var color = "#200000"
            sprite.bitmap.fillRect(0, 2, 5, 1, color);
        } else if (this.faceMode() == 10) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 1, 1, 0, 0, 6, 4);
            this.setBitmapEyeBackWhite(sprite, 5, 6);
            var color = "#FFFFFF"
            if (sprite.index == 0) {
                sprite.bitmap.fillRect(1, 2, 4, 5, color);
                sprite.bitmap.fillRect(2, 3, 3, 5, color);
                sprite.bitmap.fillRect(3, 4, 2, 4, color);
            } else {
                sprite.bitmap.fillRect(0, 2, 4, 5, color);
                sprite.bitmap.fillRect(0, 3, 3, 5, color);
                sprite.bitmap.fillRect(0, 2, 2, 4, color);
            };
        } else if (this.faceMode() == 11) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 1, 1, 0, 0, 6, 4);
            this.setBitmapEyeBackWhite(sprite, 5, 2);
            var color = "#FFFFFF"
            sprite.bitmap.fillRect(0, 2, 1, 1, color);
            sprite.bitmap.fillRect(4, 2, 1, 1, color);
            if (sprite.index == 0) {
                var color = "#500000"
                sprite.bitmap.fillRect(7, 6, 3, 2, color);
                var color = "#700000"
                sprite.bitmap.fillRect(7, 7, 3, 1, color);
                var color = "#FF9000"
                sprite.bitmap.fillRect(0, 4, 3, 1, color);
                sprite.bitmap.fillRect(13, 4, 3, 1, color);
            };
        } else {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 1, 1, 0, 0, 6, 4);
            this.setBitmapEyeBackWhite(sprite, 5, 4);
        };
    };

    //==============================
    // * set Bitmap Eyes Back HP
    //==============================	
    setBitmapEyesBackFrontHp(sprite, sx, sy, pw, ph) {
        var color = "#200000"
        sprite.bitmap.fillRect(0, 3, 1, 1, color);
        sprite.bitmap.fillRect(1, 2, 4, 1, color);
        sprite.bitmap.fillRect(5, 3, 1, 1, color);
    };

    //==============================
    // * set Bitmap Eye Back White
    //==============================	
    setBitmapEyeBackWhite(sprite, w, h) {
        var color = "#FFFFFF"
        sprite.bitmap.fillRect(0, 0, w, h, color);
    };

    //==============================
    // * set Bitmap Eyes Back Side
    //==============================	
    setBitmapEyesBackSide(sprite, sx, sy, pw, ph) {
        var color = "#200000"
        if (this.patternHeight() >= 60) {
            var bx = pw + FaceSetting.face_RectX_64_S1;
            var by = ph - this.patternHeight() + FaceSetting.face_RectY_64_S1;
        } else {
            var bx = pw + FaceSetting.face_RectX_48_S1;
            var by = ph + FaceSetting.face_RectY_48_S1;
        };
        sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 1, 1, 0, 0, 3, 5);
        if (this.faceMode() == 5) {
            sprite.bitmap.fillRect(0, 3, 1, 1, color);
            sprite.bitmap.fillRect(1, 2, 3, 1, color);
        } else if (this.faceMode() == 6) {
            sprite.bitmap.fillRect(0, 2, 3, 1, color);
            sprite.bitmap.fillRect(3, 3, 1, 1, color);
        } else if (this.faceMode() == 7) {
            if (this._character.direction() == 4) {
                sprite.bitmap.fillRect(0, 2, 3, 1, color);
                sprite.bitmap.fillRect(3, 3, 1, 1, color);
            } else {
                sprite.bitmap.fillRect(0, 3, 1, 1, color);
                sprite.bitmap.fillRect(1, 2, 3, 1, color);
            };
        } else if (this.faceMode() == 9) {
            var color = "#FFFFFF"
            sprite.bitmap.fillRect(0, 2, 5, 2, color);
            var color = "#200000"
            sprite.bitmap.fillRect(0, 1, 5, 1, color);
        } else if (this.faceMode() == 10) {
            this.setBitmapEyeBackWhite(sprite, 3, 8);
            var color = "#FFFFFF"
            if (this._character.direction() == 4) {
                sprite.bitmap.fillRect(1, 4, 3, 6, color);
                sprite.bitmap.fillRect(2, 5, 2, 5, color);
                sprite.bitmap.fillRect(3, 6, 1, 4, color);
            } else {
                sprite.bitmap.fillRect(0, 4, 3, 6, color);
                sprite.bitmap.fillRect(0, 5, 2, 5, color);
                sprite.bitmap.fillRect(0, 6, 1, 4, color);
            };
        } else if (this.faceMode() == 11) {
            this.setBitmapEyeBackWhite(sprite, 4, 2);
            var color = "#FFFFFF"
            if (sprite.index == 0) {
                sprite.bitmap.fillRect(0, 2, 1, 1, color);
                var color = "#500000"
                sprite.bitmap.fillRect(0, 7, 3, 1, color);
                var color = "#700000"
                sprite.bitmap.fillRect(0, 8, 3, 1, color);
            } else {
                sprite.bitmap.fillRect(3, 2, 1, 1, color);
                var color = "#500000"
                sprite.bitmap.fillRect(0, 7, 3, 1, color);
                var color = "#700000"
                sprite.bitmap.fillRect(0, 8, 3, 1, color);
            };
        } else {
            this.setBitmapEyeBackWhite(sprite, 3, 5);
        };
    };

    //==============================
    // * set Bitmap Eyes
    //==============================
    setBitmapEyes(sprite, sx, sy, pw, ph) {
        if (this._character.direction() == 2) {
            this.setBitmapEyesFront(sprite, sx, sy, pw, ph);
        } else {
            this.setBitmapEyesSide(sprite, sx, sy, pw, ph);
        };
    };

    //==============================
    // * set Bitmap Eyes Front
    //==============================
    setBitmapEyesFront(sprite, sx, sy, pw, ph) {
        if (this.patternHeight() >= 60) {
            var es = sprite.index == 3 ? FaceSetting.face_RectX_64_F3 : 0;
            var bx = pw + es + FaceSetting.face_RectX_64_F2;
            var by = ph - this.patternHeight() + FaceSetting.face_RectY_64_F2;
        } else {
            var es = sprite.index == 3 ? FaceSetting.face_RectX_48_F3 : 0;
            var bx = pw + es + FaceSetting.face_RectX_48_F2;
            var by = ph + FaceSetting.face_RectY_48_F2;
        };
        if (this.faceMode() == 2) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 3, 4, 0, 0, 3, 2);
        } else if (this.faceMode() == 3) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 3, 4, 0, 0, 3, 3);
        } else if (this.faceMode() == 4) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 3, 4, 0, 0, 3, 2);
        } else if (this.faceMode() == 8) {
            var color = "#400000"
            if (sprite.index == 2) {
                sprite.bitmap.fillRect(2, 0, 2, 3, color);
                sprite.bitmap.fillRect(3, 1, 2, 3, color);
                sprite.bitmap.fillRect(4, 2, 1, 2, color);
                sprite.bitmap.fillRect(5, 3, 1, 1, color);
                sprite.bitmap.fillRect(6, 4, 1, 1, color);
            } else {
                ;
                sprite.bitmap.fillRect(4, 0, 2, 3, color);
                sprite.bitmap.fillRect(3, 1, 2, 3, color);
                sprite.bitmap.fillRect(2, 2, 1, 2, color);
                sprite.bitmap.fillRect(1, 3, 1, 1, color);
                sprite.bitmap.fillRect(0, 3, 1, 1, color);
            };
        } else if (this.faceMode() == 9) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by + 2, 3, 1, 0, 0, 3, 2);
        } else if (this.faceMode() == 10) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 3, 4, 0, 0, 3, 2);
        } else if (this.faceMode() == 11) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 3, 4, 0, 0, 3, 2);
        } else {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 3, 4, 0, 0, 3, 4);
        }
    };

    //==============================
    // * set Bitmap Eyes Side
    //==============================
    setBitmapEyesSide(sprite, sx, sy, pw, ph) {
        if (this.patternHeight() >= 60) {
            var es = sprite.index == 3 ? FaceSetting.face_RectX_64_S3 : 0;
            var bx = pw + es + FaceSetting.face_RectX_64_S2;
            var by = ph - this.patternHeight() + FaceSetting.face_RectY_64_S2;
        } else {
            var es = sprite.index == 3 ? FaceSetting.face_RectX_48_S3 : 0;
            var bx = pw + es + FaceSetting.face_RectX_48_S2;
            var by = ph + FaceSetting.face_RectY_48_S2;
        };
        if (this.faceMode() == 2) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 2, 5, 0, 0, 2, 3);
        } else if (this.faceMode() == 4) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 2, 5, 0, 0, 2, 3);
        } else if (this.faceMode() == 8) {
            var color = "#400000"
            if (this._character.direction() == 4) {
                sprite.bitmap.fillRect(6, 0, 2, 1, color);
                sprite.bitmap.fillRect(5, 1, 2, 1, color);
                sprite.bitmap.fillRect(4, 2, 1, 1, color);
                sprite.bitmap.fillRect(3, 3, 1, 1, color);
                sprite.bitmap.fillRect(2, 4, 1, 1, color);
            } else {
                ;
                sprite.bitmap.fillRect(2, 0, 2, 1, color);
                sprite.bitmap.fillRect(3, 1, 2, 1, color);
                sprite.bitmap.fillRect(4, 2, 1, 1, color);
                sprite.bitmap.fillRect(5, 3, 1, 1, color);
                sprite.bitmap.fillRect(6, 4, 1, 1, color);
            };
        } else if (this.faceMode() == 9) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by + 2, 2, 2, 0, 2, 2, 2);
        } else if (this.faceMode() == 10) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 2, 5, 0, 0, 2, 3);
        } else if (this.faceMode() == 11) {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 3, 5, 0, 0, 3, 3);
        } else {
            sprite.bitmap.blt(this.bitmap, sx + bx, sy + by, 2, 5, 0, 0, 2, 5);
        };
    };

    //==============================
    // * set Face Pos Right
    //==============================
    setFacePosRight(sprite) {
        var bsize = this.patternHeight() < 60 ? false : true;
        var esX = !bsize ? FaceSetting.face_PosX_48_S : FaceSetting.face_PosX_64_S;
        var esY = !bsize ? FaceSetting.face_PosY_48_S : FaceSetting.face_PosY_64_S;
        var xf = (this.patternWidth() / 2) + esX;
        var yf = (this.patternHeight() / 2) + esY;
        var rx = !bsize ? 4 : 5;
        var ry = !bsize ? -26 : -38;
        if (sprite.index == 1 || sprite.index == 3) { sprite.visible = false };
        if (sprite.index < 2) {
            sprite.x = xf + rx + this._character._faceData.x2;
            sprite.y = ry + yf + this._character._faceData.y2;
            if (this.faceMode() == 6 || this.faceMode() == 8) {
                sprite.visible = false;
            };
        } else {
            if (this.faceMode() == 0) {
                sprite.x = -1 + xf + rx + this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 1) {
                sprite.x = 1 + xf + rx + this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 2) {
                sprite.x = 1 + xf + rx + this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 3) {
                sprite.x = 1 + xf + rx + this._character._faceData.x2;
                sprite.y = 2 + ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 4) {
                sprite.x = 1 + xf + rx + this._character._faceData.x2;
                sprite.y = 1 + ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 5) {
                sprite.visible = false;
            } else if (this.faceMode() == 6) {
                sprite.visible = false;
            } else if (this.faceMode() == 7) {
                sprite.visible = false;
            } else if (this.faceMode() == 8) {
                sprite.x = -2 + xf + rx + this._character._faceData.x2;
                sprite.y = -2 + ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 9) {
                sprite.x = 1 + xf + rx + this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 10) {
                sprite.x = 1 + xf + rx + this._character._faceData.x2;
                sprite.y = 1 + ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 11) {
                sprite.x = 0 + xf + rx + this._character._faceData.x2;
                sprite.y = -1 + ry + yf + this._character._faceData.y2;
            } else {
                sprite.visible = false;
            };
        };
    };

    //==============================
    // * set Face Pos Left
    //==============================
    setFacePosLeft(sprite) {
        var bsize = this.patternHeight() < 60 ? false : true
        var esX = !bsize ? FaceSetting.face_PosX_48_S : FaceSetting.face_PosX_64_S;
        var esY = !bsize ? FaceSetting.face_PosY_48_S : FaceSetting.face_PosY_64_S;
        var xf = (this.patternWidth() / 2) - esX;
        var yf = (this.patternHeight() / 2) + esY;
        var rx = !bsize ? -8 : -7;
        var ry = !bsize ? -26 : -38;
        if (sprite.index == 0 || sprite.index == 2) { sprite.visible = false };
        if (sprite.index < 2) {
            sprite.x = xf + rx - this._character._faceData.x2;
            sprite.y = ry + yf + this._character._faceData.y2;
            if (this.faceMode() == 5 || this.faceMode() == 8) {
                sprite.visible = false;
            };
        } else {
            if (this.faceMode() == 0) {
                sprite.x = xf + rx - this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 1) {
                sprite.x = 2 + xf + rx - this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 2) {
                sprite.x = xf + rx - this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 3) {
                sprite.x = xf + rx - this._character._faceData.x2;
                sprite.y = 2 + ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 4) {
                sprite.x = xf + rx - this._character._faceData.x2;
                sprite.y = 1 + ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 5) {
                sprite.x = xf + rx - this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 6) {
                sprite.visible = false;
            } else if (this.faceMode() == 7) {
                sprite.visible = false;
            } else if (this.faceMode() == 8) {
                sprite.x = - 4 + xf + rx - this._character._faceData.x2;
                sprite.y = - 2 + ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 9) {
                sprite.x = 1 + xf + rx - this._character._faceData.x2;
                sprite.y = ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 10) {
                sprite.x = xf + rx - this._character._faceData.x2;
                sprite.y = 1 + ry + yf + this._character._faceData.y2;
            } else if (this.faceMode() == 11) {
                sprite.x = xf + rx - this._character._faceData.x2;
                sprite.y = -1 + ry + yf + this._character._faceData.y2;
            } else {
                sprite.visible = false;
            };
        };

    };

    //==============================
    // * set Face Pos Front
    //==============================
    setFacePosFront(sprite) {
        var bsize = this.patternHeight() < 60 ? false : true;
        var esX = !bsize ? FaceSetting.face_PosX_48_F : FaceSetting.face_PosX_64_F;
        var esY = !bsize ? FaceSetting.face_PosY_48_F : FaceSetting.face_PosY_64_F;
        var xf = (this.patternWidth() / 2) + esX;
        var yf = (1 + this.patternHeight() / 2) + esY;
        var rx = !bsize ? -9 : -8;
        var ry = !bsize ? -26 : -38;
        if (this.faceMode() == 5) {
            if (sprite.index == 1 || sprite.index == 3) { sprite.visible = false };
        } else if (this.faceMode() == 5) {
            if (sprite.index == 0 || sprite.index == 2) { sprite.visible = false };
        }
        if (sprite.index < 2) {
            sprite.x = xf + rx + (11 * sprite.index) + this._character._faceData.x;
            if (this.faceMode() == 5 && sprite.index == 0) {
                sprite.y = -1 + ry + yf + this._character._faceData.y;
            } else if (this.faceMode() == 6 && sprite.index == 1) {
                sprite.y = -1 + ry + yf + this._character._faceData.y;
            } else if (this.faceMode() == 7) {
                sprite.y = -1 + ry + yf + this._character._faceData.y;
            } else if (this.faceMode() == 8) {
                sprite.y = -1 + ry + yf + this._character._faceData.y;
            } else if (this.faceMode() == 9) {
                sprite.y = -1 + ry + yf + this._character._faceData.y;
            } else {
                sprite.y = ry + yf + this._character._faceData.y;
            };
        } else {
            if (this.faceMode() == 0) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 0);
                sprite.y = this.setFacePosY(sprite, yf, ry, 0);
            } else if (this.faceMode() == 1) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 2);
                sprite.y = this.setFacePosY(sprite, yf, ry, 0);
            } else if (this.faceMode() == 2) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 1);
                sprite.y = this.setFacePosY(sprite, yf, ry, 0);
            } else if (this.faceMode() == 3) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 1);
                sprite.y = this.setFacePosY(sprite, yf, ry, 2);
            } else if (this.faceMode() == 4) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 1);
                sprite.y = this.setFacePosY(sprite, yf, ry, 1);
            } else if (this.faceMode() == 5) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 1);
                sprite.y = this.setFacePosY(sprite, yf, ry, 0);
                if (sprite.index == 2) { sprite.visible = false };
            } else if (this.faceMode() == 6) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 1);
                sprite.y = this.setFacePosY(sprite, yf, ry, 0);
                if (sprite.index == 3) { sprite.visible = false };
            } else if (this.faceMode() == 7) {
                sprite.visible = false;
            } else if (this.faceMode() == 8) {
                sprite.x = this.setFacePosX(sprite, xf, rx, -1);
                sprite.y = this.setFacePosY(sprite, yf, ry, -2);
            } else if (this.faceMode() == 9) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 1);
                sprite.y = this.setFacePosY(sprite, yf, ry, 2);
            } else if (this.faceMode() == 10) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 1);
                sprite.y = this.setFacePosY(sprite, yf, ry, 1);
            } else if (this.faceMode() == 11) {
                sprite.x = this.setFacePosX(sprite, xf, rx, 1);
                sprite.y = this.setFacePosY(sprite, yf, ry, -1);
            } else {
                sprite.visible = false;
            };
        };
    };

    //==============================
    // * set Tile Bitmap
    //==============================
    setTileBitmap() {
        _mog_face_sprtChar_setTileBitmap.call(this);
        this._character._faceData.enabled = false;
    };

    //==============================
    // * need Remove Face Sprite
    //==============================
    needRemoveFaceSprite() {
        if (!this._faceBody) { return false };
        if (!this._character) { return true };
        if (!this._character._faceData.enabled) { return true };
        if (this._character._faceData.needRemove) { return true };
        return false;
    };

    //==============================
    // * remove Face Sprite
    //==============================
    removeFaceSprite() {
        for (var i = 0; i < this._faceBody.length; i++) {
            this._FaceField.removeChild(this._faceBody[i])
        };
        this._faceBody = null;
        this._character.initFaceData();
    };

    //==============================
    // * set Face Bitmap
    //==============================
    setFaceBitmap(sprite) {
        var pw = this.patternHeight();
        var ph = this.patternWidth();
        sprite.bitmap = new Bitmap(pw, ph);
        this.setFaceFrame(sprite);
    };

    //==============================
    // * set Face Position
    //==============================
    setFacePosition(sprite) {
        sprite.visible = true;
        if (this._character.direction() == 8) {
            sprite.visible = false;
        } else if (this._character.direction() == 4) {
            this.setFacePosLeft(sprite);
        } else if (this._character.direction() == 6) {
            this.setFacePosRight(sprite);
        } else {
            this.setFacePosFront(sprite);
        };
    };
}