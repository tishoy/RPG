import Sprite_Battler from './Sprite_Battler'
/**
 * 演员
 */
export default class Sprite_Actor extends Sprite_Battler {

    constructor(battler) {
        super(battler);
        this.initialize(battler);
    }


    static MOTIONS = {
        walk: { index: 0, loop: true },
        wait: { index: 1, loop: true },
        chant: { index: 2, loop: true },
        guard: { index: 3, loop: true },
        damage: { index: 4, loop: false },
        evade: { index: 5, loop: false },
        thrust: { index: 6, loop: false },
        swing: { index: 7, loop: false },
        missile: { index: 8, loop: false },
        skill: { index: 9, loop: false },
        spell: { index: 10, loop: false },
        item: { index: 11, loop: false },
        escape: { index: 12, loop: true },
        victory: { index: 13, loop: true },
        dying: { index: 14, loop: true },
        abnormal: { index: 15, loop: true },
        sleep: { index: 16, loop: true },
        dead: { index: 17, loop: true }
    }

    initialize(battler) {
        super.initialize(battler);
        this.moveToStartPosition();
    }

    initMembers() {
        super.initMembers();
        this._battlerName = '';
        this._motion = null;
        this._motionCount = 0;
        this._pattern = 0;
        this.createShadowSprite();
        this.createWeaponSprite();
        this.createMainSprite();
        this.createStateSprite();
    }

    createMainSprite() {
        this._mainSprite = new Sprite_Base();
        this._mainSprite.anchor.x = 0.5;
        this._mainSprite.anchor.y = 1;
        this.addChild(this._mainSprite);
        this._effectTarget = this._mainSprite;
    }

    createShadowSprite() {
        this._shadowSprite = new Sprite();
        this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow2');
        this._shadowSprite.anchor.x = 0.5;
        this._shadowSprite.anchor.y = 0.5;
        this._shadowSprite.y = -2;
        this.addChild(this._shadowSprite);
    }

    createWeaponSprite() {
        this._weaponSprite = new Sprite_Weapon();
        this.addChild(this._weaponSprite);
    }

    createStateSprite() {
        this._stateSprite = new Sprite_StateOverlay();
        this.addChild(this._stateSprite);
    }

    setBattler(battler) {
        super.setBattler(battler);
        var changed = (battler !== this._actor);
        if (changed) {
            this._actor = battler;
            if (battler) {
                this.setActorHome(battler.index());
            }
            this.startEntryMotion();
            this._stateSprite.setup(battler);
        }
    }

    moveToStartPosition() {
        this.startMove(300, 0, 0);
    }

    setActorHome(index) {
        this.setHome(600 + index * 32, 280 + index * 48);
    }

    update() {
        super.update();
        this.updateShadow();
        if (this._actor) {
            this.updateMotion();
        }
    }

    updateShadow() {
        this._shadowSprite.visible = !!this._actor;
    }

    updateMain() {
        super.updateMain();
        if (this._actor.isSpriteVisible() && !this.isMoving()) {
            this.updateTargetPosition();
        }
    }

    setupMotion() {
        if (this._actor.isMotionRequested()) {
            this.startMotion(this._actor.motionType());
            this._actor.clearMotion();
        }
    }

    setupWeaponAnimation() {
        if (this._actor.isWeaponAnimationRequested()) {
            this._weaponSprite.setup(this._actor.weaponImageId());
            this._actor.clearWeaponAnimation();
        }
    }

    startMotion(motionType) {
        if (this.isQCharacter()) {
            var pose = motionType;
            var motion = this._qSprite.poses[pose];
            if (motion) {
                this._pose = pose;
                this._pattern = 0;
                this._motionCount = 0;
            }
        } else {
            var newMotion = Sprite_Actor.MOTIONS[motionType];
            if (this._motion !== newMotion) {
                this._motion = newMotion;
                this._motionCount = 0;
                this._pattern = 0;
            }
        }
    }

    updateTargetPosition() {
        if (this._actor.isInputting() || this._actor.isActing()) {
            this.stepForward();
        } else if (this._actor.canMove()) {
            this.retreat();
        } else if (!this.inHomePosition()) {
            this.stepBack();
        }
    }

    updateBitmap() {
        var oldBattlerName = this._battlerName;
        super.updateBitmap();
        var name = this._actor.battlerName();
        if (this._battlerName !== name) {
            this._battlerName = name;
            this._mainSprite.bitmap = ImageManager.loadSvActor(name);
        }
        if (oldBattlerName !== this._battlerName) {
            this._isQChara = undefined;
            if (this.isQCharacter()) {
                this._qSprite = GameGlobal.$qSprite[this.isQCharacter()];
            }
        }
    }

    updateFrame() {
        super.updateFrame();
        if (this.isQCharacter()) {
            var bitmap = this._mainSprite.bitmap;
            if (bitmap) {
                var motion = this._qSprite.poses[this._pose];
                if (!motion) {
                    this._mainSprite.visible = false;
                    return;
                }
                this._mainSprite.visible = true;
                var pattern = motion.pattern;
                var i = pattern[this._pattern];
                var cw = bitmap.width / this._qSprite.cols;
                var ch = bitmap.height / this._qSprite.rows;
                var cx = i % this._qSprite.cols;
                var cy = (i - cx) / this._qSprite.cols;
                this._mainSprite.setFrame(cx * cw, cy * ch, cw, ch);
            }
        } else {
            var bitmap = this._mainSprite.bitmap;
            if (bitmap) {
                var motionIndex = this._motion ? this._motion.index : 0;
                var pattern = this._pattern < 3 ? this._pattern : 1;
                var cw = bitmap.width / 9;
                var ch = bitmap.height / 6;
                var cx = Math.floor(motionIndex / 6) * 3 + pattern;
                var cy = motionIndex % 6;
                this._mainSprite.setFrame(cx * cw, cy * ch, cw, ch);
            }
        }
    }

    updateMove() {
        var bitmap = this._mainSprite.bitmap;
        if (!bitmap || bitmap.isReady()) {
            super.updateMove();
        }
    }

    updateMotion() {
        this.setupMotion();
        this.setupWeaponAnimation();
        if (this._actor.isMotionRefreshRequested()) {
            this.refreshMotion();
            this._actor.clearMotion();
        }
        this.updateMotionCount();
    }

    updateMotionCount() {

        if (this.isQCharacter()) {
            var motion = this._qSprite.poses[this._pose];
            if (!motion) return;
            var poseWait = motion.speed;
            if (++this._motionCount >= poseWait) {
                this._pattern++;
                var maxPattern = motion.pattern.length;
                if (this._pattern === maxPattern) {
                    this.refreshMotion();
                }
                this._motionCount = 0;
            }
        } else {
            if (this._motion && ++this._motionCount >= this.motionSpeed()) {
                if (this._motion.loop) {
                    this._pattern = (this._pattern + 1) % 4;
                } else if (this._pattern < 2) {
                    this._pattern++;
                } else {
                    this.refreshMotion();
                }
                this._motionCount = 0;
            }
        }
    }

    motionSpeed() {
        return 12;
    }

    refreshMotion() {
        if (this.isQCharacter()) {
            var actor = this._actor;
            if (actor) {
                var stateMotion = actor.stateMotionIndex();
                if (actor.isInputting()) {
                    this.startMotion('idle2');
                } else if (actor.isActing()) {
                    this.startMotion('walk');
                } else if (stateMotion === 3) {
                    this.startMotion('dead');
                } else if (stateMotion === 2) {
                    this.startMotion('sleep');
                } else if (actor.isChanting()) {
                    this.startMotion('chant');
                } else if (actor.isGuard() || actor.isGuardWaiting()) {
                    this.startMotion('guard');
                } else if (stateMotion === 1) {
                    this.startMotion('abnormal');
                } else if (actor.isDying()) {
                    this.startMotion('dying');
                } else if (actor.isUndecided()) {
                    this.startMotion('idle1');
                } else {
                    this.startMotion('idle2');
                }
            }
        } else {
            var actor = this._actor;
            var motionGuard = Sprite_Actor.MOTIONS['guard'];
            if (actor) {
                if (this._motion === motionGuard) {
                    return;
                }
                var stateMotion = actor.stateMotionIndex();
                if (actor.isInputting() || actor.isActing()) {
                    this.startMotion('walk');
                } else if (stateMotion === 3) {
                    this.startMotion('dead');
                } else if (stateMotion === 2) {
                    this.startMotion('sleep');
                } else if (actor.isChanting()) {
                    this.startMotion('chant');
                } else if (actor.isGuard() || actor.isGuardWaiting()) {
                    this.startMotion('guard');
                } else if (stateMotion === 1) {
                    this.startMotion('abnormal');
                } else if (actor.isDying()) {
                    this.startMotion('dying');
                } else if (actor.isUndecided()) {
                    this.startMotion('walk');
                } else {
                    this.startMotion('wait');
                }
            }
        }
    }

    startEntryMotion() {
        if (this._actor && this._actor.canMove()) {
            this.startMotion('walk');
            this.startMove(0, 0, 30);
        } else if (!this.isMoving()) {
            this.refreshMotion();
            this.startMove(0, 0, 0);
        }
    }

    stepForward() {
        this.startMove(-48, 0, 12);
    }

    stepBack() {
        this.startMove(0, 0, 12);
    }

    retreat() {
        this.startMove(300, 0, 30);
    }

    onMoveEnd() {
        super.onMoveEnd();
        this.refreshMotion();
    }

    damageOffsetX() {
        return -32;
    }

    damageOffsetY() {
        return 0;
    }

    isQCharacter() {
        if (this._isQChara === undefined) {
            var _IDENTIFIER = '%{config}-';
            _IDENTIFIER = _IDENTIFIER.replace('{config}', '(.+?)');
            _IDENTIFIER = new RegExp(_IDENTIFIER);
            this._isQChara = this._battlerName.match(_IDENTIFIER);
        }
        return this._isQChara ? this._isQChara[1] : false;
    }
}