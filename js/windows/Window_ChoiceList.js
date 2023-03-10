import Window_Command from './Window_Command'
import Graphics from '../core/graphics'
import Input from '../core/input';
export default class Window_ChoiceList extends Window_Command {

    constructor(messageWindow) {
        super(0, 0);
        this.initialize(messageWindow);
    }

    initialize(messageWindow) {
        this._messageWindow = messageWindow;
        super.initialize(0, 0);
        this.openness = 0;
        this.deactivate();
        this._background = 0;
    }

    start() {
        this.updatePlacement();
        this.updateBackground();
        this.refresh();
        this.selectDefault();
        this.open();
        this.activate();
    }

    selectDefault() {
        this.select(GameGlobal.$gameMessage.choiceDefaultType());
    }

    updatePlacement() {
        var positionType = GameGlobal.$gameMessage.choicePositionType();
        var messageY = this._messageWindow.y;
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        switch (positionType) {
            case 0:
                this.x = 0;
                break;
            case 1:
                this.x = (Graphics.boxWidth - this.width) / 2;
                break;
            case 2:
                this.x = Graphics.boxWidth - this.width;
                break;
        }
        if (messageY >= Graphics.boxHeight / 2) {
            this.y = messageY - this.height;
        } else {
            this.y = messageY + this._messageWindow.height;
        }
        this.x = 0; 
        this.y = 0;
    }

    updateBackground() {
        this._background = GameGlobal.$gameMessage.choiceBackground();
        this.setBackgroundType(this._background);
    }

    windowWidth() {
        var width = this.maxChoiceWidth() + this.padding * 2;
        return Math.min(width, Graphics.boxWidth);
    }

    windowHeight() {
        return this.fittingHeight(this.numVisibleRows());
    }

    numVisibleRows() {
        var messageY = this._messageWindow.y;
        var messageHeight = this._messageWindow.height;
        var centerY = Graphics.boxHeight / 2;
        var choices = GameGlobal.$gameMessage.choices();
        var numLines = choices.length;
        var maxLines = 8;
        if (messageY < centerY && messageY + messageHeight > centerY) {
            maxLines = 4;
        }
        if (numLines > maxLines) {
            numLines = maxLines;
        }
        return numLines;
    }

    maxChoiceWidth() {
        var maxWidth = 96;
        var choices = GameGlobal.$gameMessage.choices();
        for (var i = 0; i < choices.length; i++) {
            var choiceWidth = this.textWidthEx(choices[i]) + this.textPadding() * 2;
            if (maxWidth < choiceWidth) {
                maxWidth = choiceWidth;
            }
        }
        return maxWidth;
    }

    textWidthEx(text) {
        return this.drawTextEx(text, 0, this.contents.height);
    }

    contentsHeight() {
        return this.maxItems() * this.itemHeight();
    }

    makeCommandList() {
        var choices = GameGlobal.$gameMessage.choices();
        for (var i = 0; i < choices.length; i++) {
            this.addCommand(choices[i], 'choice');
        }
    }

    drawItem(index) {
        var rect = this.itemRectForText(index);
        this.drawTextEx(this.commandName(index), rect.x, rect.y);
    }

    isCancelEnabled() {
        return GameGlobal.$gameMessage.choiceCancelType() !== -1;
    }

    isOkTriggered() {
        return Input.isTriggered('ok');
    }

    callOkHandler() {
        GameGlobal.$gameMessage.onChoice(this.index());
        this._messageWindow.terminateMessage();
        this.close();
    }

    callCancelHandler() {
        GameGlobal.$gameMessage.onChoice(GameGlobal.$gameMessage.choiceCancelType());
        this._messageWindow.terminateMessage();
        this.close();
    }
}
