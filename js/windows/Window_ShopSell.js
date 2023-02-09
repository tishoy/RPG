import Window_ItemList from './Window_ItemList'
export default class Window_ShopSell extends Window_ItemList {
    constructor(x, y, width, height) {
        super(x, y, width, height);
    }

    isEnabled(item) {
        return item && item.price > 0;
    }
}