import Scene_File from './Scene_File'
export default class Scene_Load extends Scene_File {

    constructor() {
        super();
        this._loadSuccess = false;
    }

    terminate() {
        super.terminate();
        if (this._loadSuccess) {
            GameGlobal.$gameSystem.onAfterLoad();
        }
    }

    mode() {
        return 'load';
    }

    helpWindowText() {
        return TextManager.loadMessage;
    }

    firstSavefileIndex() {
        return DataManager.latestSavefileId() - 1;
    }

    onSavefileOk() {
        super.onSavefileOk();
        if (DataManager.loadGame(this.savefileId())) {
            this.onLoadSuccess();
        } else {
            this.onLoadFailure();
        }
    }

    onLoadSuccess() {
        SoundManager.playLoad();
        this.fadeOutAll();
        this.reloadMapIfUpdated();
        SceneManager.goto(Scene_Map);
        this._loadSuccess = true;
    }

    onLoadFailure() {
        SoundManager.playBuzzer();
        this.activateListWindow();
    }

    reloadMapIfUpdated() {
        if (GameGlobal.$gameSystem.versionId() !== GameGlobal.$dataSystem.versionId) {
            GameGlobal.$gamePlayer.reserveTransfer(GameGlobal.$gameMap.mapId(), GameGlobal.$gamePlayer.x, GameGlobal.$gamePlayer.y);
            GameGlobal.$gamePlayer.requestMapReload();
        }
    }
}