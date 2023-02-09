import Window_Selectable from '../windows/Window_Selectable'
export default class Window_ShopBuy extends Window_Selectable {
    constructor(x, y, height, shopGoods) {
        super(x, y, 0, 0);
        this.initialize(x, y, height, shopGoods);
    }

    initialize(x, y, height, shopGoods) {
        super.initialize(x, y, this.windowWidth(), height);
        this._shopGoods = shopGoods;
        this._money = 0;
        this.refresh();
        this.select(0);
    }

    windowWidth() {
        return 456;
    }

    maxItems() {
        return this._data ? this._data.length : 1;
    }

    item() {
        return this._data[this.index()];
    }

    setMoney(money) {
        this._money = money;
        this.refresh();
    }

    isCurrentItemEnabled() {
        return this.isEnabled(this._data[this.index()]);
    }

    price(item) {
        return this._price[this._data.indexOf(item)] || 0;
    }

    isEnabled(item) {
        return (item && this.price(item) <= this._money &&
            !GameGlobal.$gameParty.hasMaxItems(item));
    }

    refresh() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    }

    makeItemList() {
        this._data = [];
        this._price = [];
        this._shopGoods.forEach(function (goods) {
            var item = null;
            switch (goods[0]) {
                case 0:
                    item = GameGlobal.$dataItems[goods[1]];
                    break;
                case 1:
                    item = GameGlobal.$dataWeapons[goods[1]];
                    break;
                case 2:
                    item = GameGlobal.$dataArmors[goods[1]];
                    break;
            }
            if (item) {
                this._data.push(item);
                this._price.push(goods[2] === 0 ? item.price : goods[3]);
            }
        }, this);
    }

    drawItem(index) {
        var item = this._data[index];
        var rect = this.itemRect(index);
        var priceWidth = 96;
        rect.width -= this.textPadding();
        this.changePaintOpacity(this.isEnabled(item));
        this.drawItemName(item, rect.x, rect.y, rect.width - priceWidth);
        this.drawText(this.price(item), rect.x + rect.width - priceWidth,
            rect.y, priceWidth, 'right');
        this.changePaintOpacity(true);
    }

    setStatusWindow(statusWindow) {
        this._statusWindow = statusWindow;
        this.callUpdateHelp();
    }

    updateHelp() {
        this.setHelpWindowItem(this.item());
        if (this._statusWindow) {
            this._statusWindow.setItem(this.item());
        }
    }
}