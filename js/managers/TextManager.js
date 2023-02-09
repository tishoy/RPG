
/**
 * create by 18tech
 * 语言管理
 */
/**
 * 18tech TODO
 * 国际化 多语言
 */
export default class TextManager {

    static basic(basicId) {
        return GameGlobal.$dataSystem.terms.basic[basicId] || '';
    }

    static param(paramId) {
        return GameGlobal.$dataSystem.terms.params[paramId] || '';
    }

    static command(commandId) {
        return GameGlobal.$dataSystem.terms.commands[commandId] || '';
    }

    static message(messageId) {
        return GameGlobal.$dataSystem.terms.messages[messageId] || '';
    }

    static getter(method, param) {
        let result = TextManager[method](param)
        return result;
    }

    static get currencyUnit() { return GameGlobal.$dataSystem.currencyUnit; }

    static get level() { return TextManager.getter('basic', 0) }
    static get levelA() { return TextManager.getter('basic', 1) }
    static get hp() { return TextManager.getter('basic', 2) }
    static get hpA() { return TextManager.getter('basic', 3) }
    static get mp() { return TextManager.getter('basic', 4) }
    static get mpA() { return TextManager.getter('basic', 5) }
    static get tp() { return TextManager.getter('basic', 6) }
    static get tpA() { return TextManager.getter('basic', 7) }
    static get exp() { return TextManager.getter('basic', 8) }
    static get expA() { return TextManager.getter('basic', 9) }
    static get fight() { return TextManager.getter('command', 0) }
    static get escape() { return TextManager.getter('command', 1) }
    static get attack() { return TextManager.getter('command', 2) }
    static get guard() { return TextManager.getter('command', 3) }
    static get item() { return TextManager.getter('command', 4) }
    static get skill() { return TextManager.getter('command', 5) }
    static get equip() { return TextManager.getter('command', 6) }
    static get status() { return TextManager.getter('command', 7) }
    static get formation() { return TextManager.getter('command', 8) }
    static get save() { return TextManager.getter('command', 9) }
    static get gameEnd() { return TextManager.getter('command', 10) }
    static get options() { return TextManager.getter('command', 11) }
    static get weapon() { return TextManager.getter('command', 12) }
    static get armor() { return TextManager.getter('command', 13) }
    static get keyItem() { return TextManager.getter('command', 14) }
    static get equip2() { return TextManager.getter('command', 15) }
    static get optimize() { return TextManager.getter('command', 16) }
    static get clear() { return TextManager.getter('command', 17) }
    static get newGame() { return TextManager.getter('command', 18) }
    static get continue_() { return TextManager.getter('command', 19) }
    static get toTitle() { return TextManager.getter('command', 21) }
    static get cancel() { return TextManager.getter('command', 22) }
    static get buy() { return TextManager.getter('command', 24) }
    static get sell() { return TextManager.getter('command', 25) }
    static get alwaysDash() { return TextManager.getter('message', 'alwaysDash') }
    static get commandRemember() { return TextManager.getter('message', 'commandRemember') }
    static get bgmVolume() { return TextManager.getter('message', 'bgmVolume') }
    static get bgsVolume() { return TextManager.getter('message', 'bgsVolume') }
    static get meVolume() { return TextManager.getter('message', 'meVolume') }
    static get seVolume() { return TextManager.getter('message', 'seVolume') }
    static get possession() { return TextManager.getter('message', 'possession') }
    static get expTotal() { return TextManager.getter('message', 'expTotal') }
    static get expNext() { return TextManager.getter('message', 'expNext') }
    static get saveMessage() { return TextManager.getter('message', 'saveMessage') }
    static get loadMessage() { return TextManager.getter('message', 'loadMessage') }
    static get file() { return TextManager.getter('message', 'file') }
    static get partyName() { return TextManager.getter('message', 'partyName') }
    static get emerge() { return TextManager.getter('message', 'emerge') }
    static get preemptive() { return TextManager.getter('message', 'preemptive') }
    static get surprise() { return TextManager.getter('message', 'surprise') }
    static get escapeStart() { return TextManager.getter('message', 'escapeStart') }
    static get escapeFailure() { return TextManager.getter('message', 'escapeFailure') }
    static get victory() { return TextManager.getter('message', 'victory') }
    static get defeat() { return TextManager.getter('message', 'defeat') }
    static get obtainExp() { return TextManager.getter('message', 'obtainExp') }
    static get obtainGold() { return TextManager.getter('message', 'obtainGold') }
    static get obtainItem() { return TextManager.getter('message', 'obtainItem') }
    static get levelUp() { return TextManager.getter('message', 'levelUp') }
    static get obtainSkill() { return TextManager.getter('message', 'obtainSkill') }
    static get useItem() { return TextManager.getter('message', 'useItem') }
    static get criticalToEnemy() { return TextManager.getter('message', 'criticalToEnemy') }
    static get criticalToActor() { return TextManager.getter('message', 'criticalToActor') }
    static get actorDamage() { return TextManager.getter('message', 'actorDamage') }
    static get actorRecovery() { return TextManager.getter('message', 'actorRecovery') }
    static get actorGain() { return TextManager.getter('message', 'actorGain') }
    static get actorLoss() { return TextManager.getter('message', 'actorLoss') }
    static get actorDrain() { return TextManager.getter('message', 'actorDrain') }
    static get actorNoDamage() { return TextManager.getter('message', 'actorNoDamage') }
    static get actorNoHit() { return TextManager.getter('message', 'actorNoHit') }
    static get enemyDamage() { return TextManager.getter('message', 'enemyDamage') }
    static get enemyRecovery() { return TextManager.getter('message', 'enemyRecovery') }
    static get enemyGain() { return TextManager.getter('message', 'enemyGain') }
    static get enemyLoss() { return TextManager.getter('message', 'enemyLoss') }
    static get enemyDrain() { return TextManager.getter('message', 'enemyDrain') }
    static get enemyNoDamage() { return TextManager.getter('message', 'enemyNoDamage') }
    static get enemyNoHit() { return TextManager.getter('message', 'enemyNoHit') }
    static get evasion() { return TextManager.getter('message', 'evasion') }
    static get magicEvasion() { return TextManager.getter('message', 'magicEvasion') }
    static get magicReflection() { return TextManager.getter('message', 'magicReflection') }
    static get counterAttack() { return TextManager.getter('message', 'counterAttack') }
    static get substitute() { return TextManager.getter('message', 'substitute') }
    static get buffAdd() { return TextManager.getter('message', 'buffAdd') }
    static get debuffAdd() { return TextManager.getter('message', 'debuffAdd') }
    static get buffRemove() { return TextManager.getter('message', 'buffRemove') }
    static get actionFailure() { return TextManager.getter('message', 'actionFailure') }
}