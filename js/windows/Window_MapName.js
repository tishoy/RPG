import Window_Base from './Window_Base'
export default class Window_MapName extends Window_Base {
    constructor() {
        super(0, 0, 360, 360);
        this.initialize();
    }

    initialize() {
        var wight = this.windowWidth();
        var height = this.windowHeight();
        super.initialize(0, 0, wight, height);
        this.opacity = 0;
        this.contentsOpacity = 0;
        this._showCount = 0;
        this.refresh();
    }

    windowWidth() {
        return 360;
    }

    windowHeight() {
        return this.fittingHeight(1);
    }

    update() {
        super.update();
        if (this._showCount > 0 && GameGlobal.$gameMap.isNameDisplayEnabled()) {
            this.updateFadeIn();
            this._showCount--;
        } else {
            this.updateFadeOut();
        }
    }

    updateFadeIn() {
        this.contentsOpacity += 16;
    }

    updateFadeOut() {
        this.contentsOpacity -= 16;
    }

    open() {
        this.refresh();
        this._showCount = 150;
    }

    close() {
        this._showCount = 0;
    }

    refresh() {
        this.contents.clear();
        console.log("name");
        if (GameGlobal.$gameMap.displayName()) {
            var width = this.contentsWidth();
            this.drawBackground(0, 0, width, this.lineHeight());
            this.drawText(GameGlobal.$gameMap.displayName(), 0, 0, width, 'center');
        }
    }

    drawBackground(x, y, width, height) {
        var color1 = this.dimColor1();
        var color2 = this.dimColor2();
        this.contents.gradientFillRect(x, y, width / 2, height, color2, color1);
        this.contents.gradientFillRect(x + width / 2, y, width / 2, height, color1, color2);
    }
}