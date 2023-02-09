import Point from '../core/point'
import Polygon_Collider from './Polygon_Collider'

export default class Circle_Collider extends Polygon_Collider {
    constructor(width, height, ox, oy, options) {
        super();
        this.initialize(width, height, ox, oy, options);
    }

    initialize(width, height, ox, oy, options) {
        this._radius = new Point(width / 2, height / 2);
        var points = [];
        for (var i = 7; i >= 0; i--) {
            var rad = Math.PI / 4 * i + Math.PI;
            var x = this._radius.x + this._radius.x * Math.cos(rad);
            var y = this._radius.y + this._radius.y * -Math.sin(rad);
            points.push(new Point(x, y));
        }
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


    get x() {
        return this._radius.x;
    }

    set x(x) {
        this._radius.x = x;
    }

    isPolygon() {
        return false;
    };

    isCircle() {
        return true;
    };

    scale(zX, zY) {
        super.scale(zX, zY);
        this._radius.x *= zX;
        this._radius.y *= zY;
    };

    circlePosition(radian) {
        var x = this.radiusX * Math.cos(radian);
        var y = this.radiusY * -Math.sin(radian);
        var dist = Math.sqrt(x * x + y * y);
        radian -= this._radian;
        x = dist * Math.cos(radian);
        y = dist * -Math.sin(radian);
        return new Point(this.center.x + x, this.center.y + y);
    };

    intersects(other) {
        if (this.height === 0 || this.width === 0) return false;
        if (other.height === 0 || other.width === 0) return false;
        if (this.containsPoint(other.center.x, other.center.y)) return true;
        if (other.containsPoint(this.center.x, this.center.y)) return true;
        var x1 = this.center.x;
        var x2 = other.center.x;
        var y1 = this.center.y;
        var y2 = other.center.y;
        var rad = Math.atan2(y1 - y2, x2 - x1);
        rad += rad < 0 ? 2 * Math.PI : 0;
        var pos = this.circlePosition(rad);
        if (other.containsPoint(pos.x, pos.y)) return true;
        if (other.isCircle()) {
            rad = Math.atan2(y2 - y1, x1 - x2);
            rad += rad < 0 ? 2 * Math.PI : 0;
            pos = other.circlePosition(rad);
            if (this.containsPoint(pos.x, pos.y)) return true;
        }
        var i, j;
        for (i = 0, j = other._vertices.length; i < j; i++) {
            x1 = other._vertices[i].x;
            y1 = other._vertices[i].y;
            if (this.containsPoint(x1, y1)) return true;
        }
        for (i = 0, j = this._vertices.length; i < j; i++) {
            x1 = this._vertices[i].x;
            y1 = this._vertices[i].y;
            if (other.containsPoint(x1, y1)) return true;
        }
        return false;
    };


    moveTo(x, y) {
        super.moveTo(x, y);
    }
}