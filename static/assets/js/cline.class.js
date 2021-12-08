

export default class CLineTool{
    constructor(canvas) {
        this.canvas = canvas;
        var objUUID = this.objUUID = 0;

        // --- EXTENSIONS --- //

        /*fabric.Object.prototype.toObject = (function (toObject) {
            return function () {
              return fabric.util.object.extend(toObject.call(this), {
                id: this.id,
                referenceId: this.referenceId
              });
            };
        })(fabric.Object.prototype.toObject);*/
          
        fabric.Point.prototype.angleRelativeFrom = function (startpoint) {
              return Math.atan2(this.y - startpoint.y, this.x - startpoint.x) * 180 / Math.PI;
        };
          
        fabric.StaticCanvas.prototype.getObjectById = function (id) {
              var obj = undefined;  
              this.getObjects().some(function (o) {
                if (o.hasOwnProperty("id")) {
                  if (o.id === id) {
                    obj = o;
                  return true;
                }
              }    
              return false;
            });  
            return obj;
        };
          
        fabric.ConnectorLine = fabric.util.createClass(fabric.Line, {
          
              type: "connectorLine",
          
              initialize: function (x1, y1, x2, y2, zoom, options) {  
            
                options = options || {};
            
                this.id = options.id || objUUID++;
            
              this.callSuper('initialize', [x1, y1, x2, y2], fabric.util.object.extend({
                  stroke: 'green',
                  strokeWidth: 2 / zoom,
                  originX: "center",
                  originY: "center",
                  selectable: true,
                  lockScalingX: true,
                  lockScalingY: true,
                  lockRotation: true,
                  hasBorders: false,
                  hasControls: false,
                  perPixelTargetFind: true
              }, options));
            }
        });
          
        fabric.ConnectorLine.fromObject = function (obj) {
              return new fabric.ConnectorLine(obj.x1, obj.y1, obj.x2, obj.y2, obj);
        };
          
        fabric.ConnectorHandle = fabric.util.createClass(fabric.Rect, {
          
              type: "connectorHandle",
          
              initialize: function (left, top, zoom, options) {
            
                options = options || {};
            
                this.id = options.id || objUUID++;
            
                this.callSuper('initialize', fabric.util.object.extend({
                left: left,
                top: top,
                width: 3 / zoom,
                height: 40 / zoom,
                originX: "center",
                originY: "center",
                selectable: true,
                lockScalingX: true,
                lockScalingY: true,
                lockRotation: true,
                hasBorders: false,
                hasControls: false,     	
                fill: "black",
                opacity: 0.5,
                stroke: "black"
              }, options));
            }
        });
          
        fabric.ConnectorHandle.fromObject = function (obj) {
              return new fabric.ConnectorHandle(obj.left, obj.top, obj);
        };
          
        fabric.ConnectorHandleStart = fabric.util.createClass(fabric.ConnectorHandle, {
          
              type: "connectorHandleStart",
          
              initialize: function (left, top, zoom, options) {
              this.callSuper('initialize', left, top, zoom, fabric.util.object.extend({
                  originX: "right",
                stroke: "red"
              }, options));
              
            }
        });
          
        fabric.ConnectorHandleStart.fromObject = function (obj) {
              return new fabric.ConnectorHandleStart(obj.left, obj.top, obj);
        };
          
        fabric.ConnectorHandleEnd = fabric.util.createClass(fabric.ConnectorHandle, {
              type: "connectorHandleEnd",
              initialize: function (left, top, zoom, options) {
              this.callSuper('initialize', left, top, zoom,fabric.util.object.extend({
                  originX: "left",
                  stroke: "blue"
              }, options));
            }
        });
          
        fabric.ConnectorHandleEnd.fromObject = function (obj) {
              return new fabric.ConnectorHandleEnd(obj.left, obj.top, obj);
        };
    }

    renderLineProps () {
        console.log(this.getLength());
    }

    draw(pts){
        var p1 = pts[0];
        var p2 = pts[1];
        this.startPoint = new fabric.Point(p1.x, p1.y);
        this.endPoint = new fabric.Point(p2.x, p2.y);
        this.angle = this.getAngle();
        this.length = this.getLength();
        
        this._objects = {
            line : new fabric.ConnectorLine(p1.x, p1.y, p2.x, p2.y, this.canvas.getZoom()),
            //text :  new fabric.IText('Tap and Type', { left: p1.x + Math.abs(p1.x- p2.x)/3, top: p1.y-20, fontFamily: 'arial black', fill: 'red', fontSize: 10 }),
            startHandle : new fabric.ConnectorHandleStart(p1.x, p1.y, this.canvas.getZoom(), {angle:this.angle}),
            endHandle : new fabric.ConnectorHandleEnd(p2.x, p2.y, this.canvas.getZoom(), {angle:this.angle})
        };
        
        this._objects.line.on("moving", function () {
            //
            var _line = this._objects.line;
            var _canvas = _line.canvas;
            //
            var _oldCenterX = (_line.x1 + _line.x2) / 2;
            var _oldCenterY = (_line.y1 + _line.y2) / 2;
            var _deltaX = _line.left - _oldCenterX;
            var _deltaY = _line.top - _oldCenterY;
      
            this.updatePoints(
                _line.x1 + _deltaX,
                _line.y1 + _deltaY,
                _line.x2 + _deltaX,
                _line.y2 + _deltaY
            );
            _canvas.renderAll();
            this.renderLineProps();
        }.bind(this));
        
        this._objects.startHandle.on("moving", function () {
            //
          var _handle = this._objects.startHandle;
          var _line = this._objects.line;
          var _canvas = _handle.canvas;
      
          _canvas.setActiveObject(_line);
          
          this.updateStartPoint(_handle.left, _handle.top);
          
          _canvas.renderAll();
          this.renderLineProps();
        }.bind(this));
        
        this._objects.endHandle.on("moving", function () {
            //
          var _handle = this._objects.endHandle;
          var _line = this._objects.line;
          var _canvas = _handle.canvas;
      
          _canvas.setActiveObject(_line);
          
          this.updateEndPoint(_handle.left, _handle.top);
          
          _canvas.renderAll();
          this.renderLineProps();
        }.bind(this));
        for (var obj in this._objects) {
            if (this._objects.hasOwnProperty(obj)) {
              this.canvas.add(this._objects[obj]);
          }
        }
        this.canvas.renderAll();
        return this;
    }

    reset(){
        for (var obj in this._objects) {
            if (this._objects.hasOwnProperty(obj)) {
              this.canvas.remove(this._objects[obj]);
          }
        }
        this.canvas.renderAll();
    }

    updateStartPoint (x, y) {
        this._objects.line.set({
            x1: x,
            y1: y
        }).setCoords();
      
        this.startPoint.setXY(x, y);
      
        var angle = this.getAngle();
      
        this._objects.startHandle.set({
            left: x,
            top: y,
            angle: angle
        }).setCoords();
      
        this._objects.endHandle.set({
            angle: angle
        }).setCoords();
    }

    updateEndPoint (x, y) {

        this._objects.line.set({
            x2: x,
            y2: y
        }).setCoords();
      
      this.endPoint.setXY(x, y);
      
      var angle = this.getAngle();
      
      this._objects.startHandle.set({
          angle: angle
      }).setCoords();
      
      this._objects.endHandle.set({
          left: x,
        top: y,
          angle: angle
      }).setCoords();
    }


    updatePoints(x1, y1, x2, y2) {

        var _canvas = this._objects.line.canvas;
    
        this._objects.line.set({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2
        }).setCoords();
      
      this.startPoint.setXY(x1, y1);
      this.endPoint.setXY(x2, y2);
      
      var angle = this.getAngle();
      
      this._objects.startHandle.set({
            left: x1,
            top: y1,
            angle: angle
      }).setCoords();
      
      this._objects.endHandle.set({
            left: x2,
            top: y2,
            angle: angle
      }).setCoords();
      
      _canvas.renderAll();
    }

    getAngle () {
        return this.endPoint.angleRelativeFrom(this.startPoint);
    }

    getLength () {
        return this.endPoint.distanceFrom(this.startPoint);
    }
}


