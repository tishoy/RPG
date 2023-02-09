import Game_Character from './Game_Character'
import DataManager from '../managers/DataManager';
/**
 * create by 18tech
 */
export default class Game_Follower extends Game_Character {
    constructor(memberIndex) {
        super();
        this.initialize(memberIndex);
    }

    initialize(memberIndex) {
        super.initialize();
        this._memberIndex = memberIndex;
        this.setTransparent(GameGlobal.$dataSystem.optTransparent);
        this.setThrough(true);
    }

    refresh() {
        var characterName = this.isVisible() ? this.actor().characterName() : '';
        var characterIndex = this.isVisible() ? this.actor().characterIndex() : 0;
        this.setImage(characterName, characterIndex);
    }

    actor() {
        return GameGlobal.$gameParty.battleMembers()[this._memberIndex];
    }

    isVisible() {
        return this.actor() && GameGlobal.$gamePlayer.followers().isVisible();
    }

    update() {
        super.update();
        this.setMoveSpeed(GameGlobal.$gamePlayer.realMoveSpeed());
        this.setOpacity(GameGlobal.$gamePlayer.opacity());
        this.setBlendMode(GameGlobal.$gamePlayer.blendMode());
        this.setWalkAnime(GameGlobal.$gamePlayer.hasWalkAnime());
        this.setStepAnime(GameGlobal.$gamePlayer.hasStepAnime());
        this.setDirectionFix(GameGlobal.$gamePlayer.isDirectionFixed());
        this.setTransparent(GameGlobal.$gamePlayer.isTransparent());
    }

    chaseCharacter(character) {
        var sx = this.deltaXFrom(character.x);
        var sy = this.deltaYFrom(character.y);
        if (sx !== 0 && sy !== 0) {
            this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
        } else if (sx !== 0) {
            this.moveStraight(sx > 0 ? 4 : 6);
        } else if (sy !== 0) {
            this.moveStraight(sy > 0 ? 8 : 2);
        }
        this.setMoveSpeed(GameGlobal.$gamePlayer.realMoveSpeed());
    }
}