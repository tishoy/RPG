import Window_Command from './Window_Command';
import TextManager from '../managers/TextManager';
import ConfigManager from '../managers/ConfigManager';
import Graphics from '../core/graphics';
import SoundManager from '../managers/SoundManager';
export default class Window_Options extends Window_Command {

    constructor() {
        super(0, 0);
        super.initialize();
        this.updatePlacement();
    }

    windowWidth() {
        return 400;
    }

    windowHeight() {
        return this.fittingHeight(Math.min(this.numVisibleRows(), 12));
    }

    updatePlacement() {
        this.x = (Graphics.boxWidth - this.width) / 2;
        this.y = (Graphics.boxHeight - this.height) / 2;
    }

    makeCommandList() {
        this.addGeneralOptions();
        this.addVolumeOptions();
    }

    addGeneralOptions() {
        this.addCommand(TextManager.alwaysDash, 'alwaysDash');
        this.addCommand(TextManager.commandRemember, 'commandRemember');
    }

    addVolumeOptions() {
        this.addCommand(TextManager.bgmVolume, 'bgmVolume');
        this.addCommand(TextManager.bgsVolume, 'bgsVolume');
        this.addCommand(TextManager.meVolume, 'meVolume');
        this.addCommand(TextManager.seVolume, 'seVolume');
    }

    drawItem(index) {
        var rect = this.itemRectForText(index);
        var statusWidth = this.statusWidth();
        var titleWidth = rect.width - statusWidth;
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, titleWidth, 'left');
        this.drawText(this.statusText(index), titleWidth, rect.y, statusWidth, 'right');
    }

    statusWidth() {
        return 120;
    }

    statusText(index) {
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if (this.isVolumeSymbol(symbol)) {
            return this.volumeStatusText(value);
        } else {
            return this.booleanStatusText(value);
        }
    }

    isVolumeSymbol(symbol) {
        return symbol.contains('Volume');
    }

    booleanStatusText(value) {
        return value ? 'ON' : 'OFF';
    }

    volumeStatusText(value) {
        return value + '%';
    }

    processOk() {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if (this.isVolumeSymbol(symbol)) {
            value += this.volumeOffset();
            if (value > 100) {
                value = 0;
            }
            value = value.clamp(0, 100);
            this.changeValue(symbol, value);
        } else {
            this.changeValue(symbol, !value);
        }
    }

    cursorRight(wrap) {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if (this.isVolumeSymbol(symbol)) {
            value += this.volumeOffset();
            value = value.clamp(0, 100);
            this.changeValue(symbol, value);
        } else {
            this.changeValue(symbol, true);
        }
    }

    cursorLeft(wrap) {
        var index = this.index();
        var symbol = this.commandSymbol(index);
        var value = this.getConfigValue(symbol);
        if (this.isVolumeSymbol(symbol)) {
            value -= this.volumeOffset();
            value = value.clamp(0, 100);
            this.changeValue(symbol, value);
        } else {
            this.changeValue(symbol, false);
        }
    }

    volumeOffset() {
        return 20;
    }

    changeValue(symbol, value) {
        var lastValue = this.getConfigValue(symbol);
        if (lastValue !== value) {
            this.setConfigValue(symbol, value);
            this.redrawItem(this.findSymbol(symbol));
            SoundManager.playCursor();
        }
    }

    getConfigValue(symbol) {
        return ConfigManager[symbol];
    }

    setConfigValue(symbol, volume) {
        ConfigManager[symbol] = volume;
    }
}