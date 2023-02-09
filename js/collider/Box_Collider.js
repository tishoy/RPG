import Polygon_Collider from './Polygon_Collider'
import Point from '../core/point'

export default class Box_Collider extends Polygon_Collider {
    constructor(width, height, ox, oy, options) {
        super();
        this.initialize(width, height, ox, oy, options)
    }
    initialize(width, height, ox, oy, options) {
        var points = [
            new Point(0, 0),
            new Point(width, 0),
            new Point(width, height),
            new Point(0, height)
        ];
        super.initialize(points, width, height, ox, oy, options);
    }

    initMembers(width, height, ox, oy, options) {
        super.initMembers(0, 0);
        ox = ox === undefined ? 0 : ox;
        oy = oy === undefined ? 0 : oy;
        options = options === undefined ? {} : options;
        this._offset = new Point(ox, oy);
        this._pivot = options.pivot || new Point(width / 2, height / 2);
        this._scale = options.scale || this._scale;
        this._radian = options.radian || this._radian;
        this._position = options.position || this._position;
    };

    isPolygon() {
        return false;
    };

    isBox() {
        return true;
    };

    containsPoint(x, y) {
        if (this._radian === 0) {
            var xMin = this._xMin + this.x + this.ox;
            var xMax = this._xMax + this.x + this.ox;
            var yMin = this._yMin + this.y + this.oy;
            var yMax = this._yMax + this.y + this.oy;
            var insideX = x >= xMin && x <= xMax;
            var insideY = y >= yMin && y <= yMax;
            return insideX && insideY;
        } else {
            return super.containsPoint(x, y);
        }
    };

    moveTo(x, y) {
        super.moveTo(x, y);
    }
}