import TilingSprite from '../core/tilingSprite'

export default class MultiLayerTilingSprite extends TilingSprite{
    constructor(bitmap) {
        super(bitmap);
        bitmap.addLoadListener(function () {
            this.move(0, 0, bitmap.width, bitmap.height);
        }.bind(this));
    }

    t = 0

    // Converts a coordinate on the map to the corresponding coordinate on the screen.
    rx(x, scrollRate) {
        if (scrollRate == null) {
            scrollRate = GameGlobal.$gameMap.tileWidth();
        }

        if (scrollRate === 0) {
            return x;
        } else {
            return GameGlobal.$gameMap.adjustX(x / scrollRate) * scrollRate;
        }
    }

    ry(y, scrollRate) {
        if (scrollRate == null) {
            scrollRate = GameGlobal.$gameMap.tileHeight();
        }

        if (scrollRate === 0) {
            return y;
        } else {
            return GameGlobal.$gameMap.adjustY(y / scrollRate) * scrollRate;
        }
    }

    update() {
        ++this.t;
        this._updater(this.t, GameGlobal.$gameSwitches, GameGlobal.$gameVariables);
    }

    _updater() {
        this.x = this.rx(0);
        this.y = this.ry(0);
        this.z = 16;
        this.opacity = 255;
        this.loop = false;
    }

    assignSettings(settings) {
        var code = '';
        for (var key in settings) {
            var value = settings[key];
            if (typeof (value) === 'string') {
                // this.x = (formula);
                // this.scale.x = (formula); // key is "scale.x"
                code += 'this.' + key + ' = (' + value + ');\n';
            } else {
                // if key is "scale.x"
                // keys is ["scale", "x"]
                var keys = key.split('.');
                // set key to "x"
                key = keys.pop();

                var target = this;
                keys.forEach(function (k) {
                    if (typeof (target) !== 'object') {
                        target[k] = {};
                    }
                    target = target[k];
                });

                target[key] = value;
            }
        }
        // You may log the code for debugging purpose.
        // this._updater = new Function('t', 's', 'v', code);
    }

    get x() { return -this.origin.x; }
    set x(x) { this.origin.x = -x; }

    get y() { return -this.origin.y; }
    set y(y) { this.origin.y = -y; }
}
