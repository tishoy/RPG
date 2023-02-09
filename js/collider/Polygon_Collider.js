import Point from '../core/point'
import E8Plus from '../18ext/E8Plus'
import Movement from '../core/movement'
/**
 * create by 18tech
 */
export default class Polygon_Collider {
  constructor(points) {
    this.initialize(points);
  }

  initialize(points) {
    var args = [];
    for (var i = 1; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    this.initMembers.apply(this, args);
    this.makeVertices(points);
  }

  initMembers(x, y) {
    x = x !== undefined ? x : 0;
    y = y !== undefined ? y : 0;
    this._position = new Point(x, y);
    this._scale = new Point(1, 1);
    this._offset = new Point(0, 0);
    this._pivot = new Point(0, 0);
    this._radian = 0;
    this._note = '';
    this.meta = {};
    this.id = Polygon_Collider._counter++;
  }

  get note() {
    return this._note;
  }

  set note(note) {
    this._note = note;
    this.meta = E8Plus.getMeta(note);
  }

  get x() {
    return this._position.x;
  }

  set x(x) {
    this._position.x = x;
  }

  get y() {
    return this._position.y;
  }

  set y(y) {
    this._position.y = y;
  }

  get ox() {
    return this._offset.x + this._pivot.x;

  }

  set ox(value) {
    this._offset.x = value;
    this.refreshVertices();
  }

  get oy() {
    return this._offset.y + this._pivot.y;
  }
  set oy(value) {
    this._offset.y = value - this._pivot.y;
    this.refreshVertices();
  }



  isPolygon() {
    return true;
  };

  isBox() {
    return true;
  };

  isCircle() {
    return false;
  };

  makeVertices(points) {
    this._vertices = [];
    this._baseVertices = [];
    this._edges = [];
    this._vectors = [];
    this._xMin = null;
    this._xMax = null;
    this._yMin = null;
    this._yMax = null;
    for (var i = 0; i < points.length; i++) {
      var x = points[i].x - this._pivot.x;
      var y = points[i].y - this._pivot.y;
      var x2 = x + this.x + this.ox;
      var y2 = y + this.y + this.oy;
      this._vertices.push(new Point(x2, y2));
      this._baseVertices.push(new Point(x, y));
      if (i !== 0) {
        var prev = this._vertices[i - 1];
        this._edges.push({
          x1: prev.x, x2: x2,
          y1: prev.y, y2: y2
        })
      }
      if (i === points.length - 1) {
        var first = this._vertices[0];
        this._edges.push({
          x1: x2, x2: first.x,
          y1: y2, y2: first.y
        })
      }
      var radian = Math.atan2(y, x);
      radian += radian < 0 ? Math.PI * 2 : 0;
      var dist = Math.sqrt(x * x + y * y);
      this._vectors.push({ radian, dist });
      if (this._xMin === null || this._xMin > x) {
        this._xMin = x;
      }
      if (this._xMax === null || this._xMax < x) {
        this._xMax = x;
      }
      if (this._yMin === null || this._yMin > y) {
        this._yMin = y;
      }
      if (this._yMax === null || this._yMax < y) {
        this._yMax = y;
      }
    }
    this.width = Math.abs(this._xMax - this._xMin);
    this.height = Math.abs(this._yMax - this._yMin);
    var x1 = this._xMin + this.x + this.ox;
    var y1 = this._yMin + this.y + this.oy;
    this.center = new Point(x1 + this.width / 2, y1 + this.height / 2);
  };

  makeVectors() {
    this._vectors = this._baseVertices.map((function (vertex) {
      var dx = vertex.x - this._pivot.x;
      var dy = vertex.y - this._pivot.y;
      var radian = Math.atan2(dy, dx);
      radian += radian < 0 ? Math.PI * 2 : 0;
      var dist = Math.sqrt(dx * dx + dy * dy);
      return { radian, dist };
    }).bind(this));
  };

  setBounds() {
    this._xMin = null;
    this._xMax = null;
    this._yMin = null;
    this._yMax = null;
    for (var i = 0; i < this._baseVertices.length; i++) {
      var x = this._baseVertices[i].x;
      var y = this._baseVertices[i].y;
      if (this._xMin === null || this._xMin > x) {
        this._xMin = x;
      }
      if (this._xMax === null || this._xMax < x) {
        this._xMax = x;
      }
      if (this._yMin === null || this._yMin > y) {
        this._yMin = y;
      }
      if (this._yMax === null || this._yMax < y) {
        this._yMax = y;
      }
    }
    this.width = Math.abs(this._xMax - this._xMin);
    this.height = Math.abs(this._yMax - this._yMin);
    var x1 = this._xMin + this.x + this.ox;
    var y1 = this._yMin + this.y + this.oy;
    this.center = new Point(x1 + this.width / 2, y1 + this.height / 2);
  };

  refreshVertices() {
    this._edges = [];
    var i, j;
    for (i = 0, j = this._vertices.length; i < j; i++) {
      var vertex = this._vertices[i];
      vertex.x = this.x + this._baseVertices[i].x + this.ox;
      vertex.y = this.y + this._baseVertices[i].y + this.oy;
      if (i !== 0) {
        var prev = this._vertices[i - 1];
        this._edges.push({
          x1: prev.x, x2: vertex.x,
          y1: prev.y, y2: vertex.y
        })
      }
      if (i === j - 1) {
        var first = this._vertices[0];
        this._edges.push({
          x1: vertex.x, x2: first.x,
          y1: vertex.y, y2: first.y
        })
      }
    }
    this.setBounds();
  };

  sectorEdge() {
    var x1 = this._xMin + this.x + this.ox;
    var x2 = this._xMax + this.x + this.ox - 1;
    var y1 = this._yMin + this.y + this.oy;
    var y2 = this._yMax + this.y + this.oy - 1;
    x1 = Math.floor(x1 / 48);//ColliderManager._sectorSize);  //导致循环引入
    x2 = Math.floor(x2 / 48);//ColliderManager._sectorSize);
    y1 = Math.floor(y1 / 48);//ColliderManager._sectorSize);
    y2 = Math.floor(y2 / 48);//ColliderManager._sectorSize);
    return {
      x1: x1, x2: x2,
      y1: y1, y2: y2
    }
  };

  gridEdge() {
    var x1 = this._xMin + this.x + this.ox;
    var x2 = this._xMax + this.x + this.ox - 1;
    var y1 = this._yMin + this.y + this.oy;
    var y2 = this._yMax + this.y + this.oy - 1;
    x1 = Math.floor(x1 / Movement.tileSize);
    x2 = Math.floor(x2 / Movement.tileSize);
    y1 = Math.floor(y1 / Movement.tileSize);
    y2 = Math.floor(y2 / Movement.tileSize);
    return {
      x1: x1, x2: x2,
      y1: y1, y2: y2
    }
  };

  edge() {
    var x1 = this._xMin + this.x + this.ox;
    var x2 = this._xMax + this.x + this.ox - 1;
    var y1 = this._yMin + this.y + this.oy;
    var y2 = this._yMax + this.y + this.oy - 1;
    return {
      x1: x1, x2: x2,
      y1: y1, y2: y2
    }
  };

  setPivot(x, y) {
    this._pivot.x = x;
    this._pivot.y = y;
    this.makeVectors();
    this.rotate(0); // Resets base vertices
  };

  centerPivot() {
    this._pivot.x = this.width / 2;
    this._pivot.y = this.height / 2;
    this.makeVectors();
    this.rotate(0); // Resets base vertices
  };

  setRadian(radian) {
    radian = radian !== undefined ? radian : 0;
    this.rotate(radian - this._radian);
  };

  rotate(radian) {
    this._radian += radian;
    for (var i = 0; i < this._vectors.length; i++) {
      var vector = this._vectors[i];
      vector.radian += radian;
      var x = vector.dist * Math.cos(vector.radian);
      var y = vector.dist * Math.sin(vector.radian);
      this._baseVertices[i].x = Math.round(x);
      this._baseVertices[i].y = Math.round(y);
    }
    this.refreshVertices();
  };

  setScale(zX, zY) {
    zX = zX !== undefined ? zX : 1;
    zY = zY !== undefined ? zY : 1;
    this.scale(zX / this._scale.x, zY / this._scale.y);
  };

  scale(zX, zY) {
    this._scale.x *= zX;
    this._scale.y *= zY;
    for (var i = 0; i < this._vectors.length; i++) {
      var vector = this._vectors[i];
      var x = vector.dist * Math.cos(vector.radian);
      var y = vector.dist * Math.sin(vector.radian);
      x *= zX;
      y *= zY;
      vector.radian = Math.atan2(y, x);
      vector.radian += vector.radian < 0 ? Math.PI * 2 : 0;
      vector.dist = Math.sqrt(x * x + y * y);
      this._baseVertices[i].x = Math.round(x);
      this._baseVertices[i].y = Math.round(y);
    }
    this.refreshVertices();
  };

  moveTo(x, y) {
    if (x !== this.x || y !== this.y) {
      this.x = x;
      this.y = y;
      this.refreshVertices();
    }
  };

  intersects(other) {
    if (this.height === 0 || this.width === 0) return false;
    if (other.height === 0 || other.width === 0) return false;
    if (!other.isPolygon()) {
      if (this.containsPoint(other.center.x, other.center.y)) return true;
    }
    if (!this.isPolygon()) {
      if (other.containsPoint(this.center.x, this.center.y)) return true;
    }
    var i, j, x, y;
    for (i = 0, j = other._vertices.length; i < j; i++) {
      x = other._vertices[i].x;
      y = other._vertices[i].y;
      if (this.containsPoint(x, y)) return true;
    }
    for (i = 0, j = this._vertices.length; i < j; i++) {
      x = this._vertices[i].x;
      y = this._vertices[i].y;
      if (other.containsPoint(x, y)) return true;
    }
    // TODO add edge checking
    /*
    for (i = 0; i < this._edges.length; i++) {
      for (j = 0; j < other._edges.length; j++) {

      }
    }*/
    return false;
  };

  inside(other) {
    if (this.height === 0 || this.width === 0) return false;
    if (other.height === 0 || other.width === 0) return false;
    var i, j, x, y;
    for (i = 0, j = other._vertices.length; i < j; i++) {
      x = other._vertices[i].x;
      y = other._vertices[i].y;
      if (!this.containsPoint(x, y)) {
        return false;
      }
    }
    return true;
  };

  containsPoint(x, y) {
    var i;
    var j = this._vertices.length - 1;
    var odd = false;
    var poly = this._vertices;
    for (i = 0; i < this._vertices.length; i++) {
      if (poly[i].y < y && poly[j].y >= y || poly[j].y < y && poly[i].y >= y) {
        if (poly[i].x + (y - poly[i].y) / (poly[j].y - poly[i].y) * (poly[j].x - poly[i].x) < x) {
          odd = !odd;
        }
      }
      j = i;
    }
    return odd;
  };

  lineIntersection(lineA, lineB) {
    var a1 = lineA.y1 - lineA.y2;
    var b1 = lineA.x2 - lineA.x1;
    var a2 = lineB.y1 - lineB.y2;
    var b2 = lineB.x2 - lineB.x1;
    var det = a1 * b2 - a2 * b1;
    if (det == 0) {
      return false;
    }
    var c1 = a1 * lineA.x1 + b1 * lineA.y1;
    var c2 = a2 * lineB.x1 + b2 * lineB.y1;
    var x = (b2 * c1 - b1 * c2) / det;
    var y = (a1 * c2 - a2 * c1) / det;
    // incomplete
    // returns false if lines don't intersect
    // x/y will return where or when they will intersect
    return new Point(x, y);
  };

  // TODO Optimize this
  // Compaire other methods, example atan2 - atan2 or a dot product
  bestPairFrom(point) {
    var vertices = this._vertices;
    var radians = [];
    var points = [];
    for (var i = 0; i < vertices.length; i++) {
      var radian = Math.atan2(vertices[i].y - point.y, vertices[i].x - point.x);
      radian += radian < 0 ? 2 * Math.PI : 0;
      radians.push(radian);
      points.push(new Point(vertices[i].x, vertices[i].y));
    }
    var bestPair = [];
    var currI = 0;
    var max = -Math.PI * 2;
    while (points.length > 0) {
      var curr = points.shift();
      for (var i = 0; i < points.length; i++) {
        var dr = radians[currI] - radians[currI + i + 1];
        if (Math.abs(dr) > max) {
          max = Math.abs(dr);
          bestPair = [currI, currI + i + 1];
        }
      }
      currI++;
    }
    return bestPair;
  };

  // returns a new polygon
  stretchedPoly(radian, dist) {
    var dist2 = dist + Math.max(this.width, this.height);
    var xComponent = Math.cos(radian) * dist;
    var yComponent = Math.sin(radian) * dist;
    var x1 = this.center.x + Math.cos(radian) * dist2;
    var y1 = this.center.y + Math.sin(radian) * dist2;
    var bestPair = this.bestPairFrom(new Point(x1, y1));
    var vertices = this._vertices;
    var pointsA = [];
    var pointsB = [];
    var i;
    for (i = 0; i < vertices.length; i++) {
      var x2 = vertices[i].x - this.x;
      var y2 = vertices[i].y - this.y;
      pointsA.push(new Point(x2, y2));
      pointsB.push(new Point(x2 + xComponent, y2 + yComponent));
    }
    // TODO add the other vertices from collider
    var points = [];
    points.push(pointsA[bestPair[0]]);
    points.push(pointsB[bestPair[0]]);
    points.push(pointsB[bestPair[1]]);
    points.push(pointsA[bestPair[1]]);
    return new Polygon_Collider(points, this.x, this.y);
  };
}