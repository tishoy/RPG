import Scene_File from './Scene_File';
import TextManager from '../managers/TextManager';
import DataManager from '../managers/DataManager';
export default class Scene_Save extends Scene_File {
    constructor() {
        super();
    }

    mode() {
        return 'save';
    }

    helpWindowText() {
        return TextManager.saveMessage;
    }

    firstSavefileIndex() {
        return DataManager.lastAccessedSavefileId() - 1;
    }

    onSavefileOk() {
        super.onSavefileOk();
        GameGlobal.$gameSystem.onBeforeSave();
        if (DataManager.saveGame(this.savefileId())) {
            this.onSaveSuccess();
        } else {
            this.onSaveFailure();
        }
    }

    onSaveSuccess() {
        SoundManager.playSave();
        StorageManager.cleanBackup(this.savefileId());
        this.popScene();
    }

    onSaveFailure() {
        SoundManager.playBuzzer();
        this.activateListWindow();
    }
}