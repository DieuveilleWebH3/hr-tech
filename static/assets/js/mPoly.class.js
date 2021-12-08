import Shape from './shape.class.js';
import Utility from './utility.class.js';
export default class PolyManagement{
    constructor(canvas, polygon, unit) {
        this.polygon = polygon;
        this.canvas = canvas;
        this.factor =  this.canvas.item(0).width / this.canvas.width;
        this.unit = unit;
    }

    // define a function that can locate the controls.
    // this function will be used both for drawing and for interaction.
    polygonPositionHandler(dim, finalMatrix, fabricObject) {
        var mCanvas = fabricObject.canvas.viewportTransform;
        var mObject = fabricObject.calcTransformMatrix();
        var mTotal = fabric.util.multiplyTransformMatrices(mCanvas, mObject);
        var x = (fabricObject.points[this.pointIndex].x - fabricObject.pathOffset.x),
            y = (fabricObject.points[this.pointIndex].y - fabricObject.pathOffset.y);
        return fabric.util.transformPoint(
            { x: x, y: y }, mTotal
        );
    }

    // define a function that will define what the control does
    // this function will be called on every mouse move after a control has been
    // clicked and is being dragged.
    // The function receive as argument the mouse event, the current trasnform object
    // and the current position in canvas coordinate
    // transform.target is a reference to the current object being transformed,
    /*Added
    var mCanvas = this_.canvas.viewportTransform;
    var mObject = fabricObject.calcTransformMatrix();
    var mTotal = fabric.util.multiplyTransformMatrices(mCanvas, mObject);
    /************* */
    actionHandler(eventData, transform, x, y) {
        var polygon = transform.target,
            currentControl = polygon.controls[polygon.__corner],
            mouseLocalPosition = polygon.toLocalPoint(new fabric.Point(x, y), 'center', 'center'),
                size = polygon._getTransformedDimensions(0, 0),
                finalPointPosition = {
                    x: mouseLocalPosition.x * polygon.width / size.x + polygon.pathOffset.x,
                    y: mouseLocalPosition.y * polygon.height / size.y + polygon.pathOffset.y
                };
        polygon.points[currentControl.pointIndex] = finalPointPosition;
        return true;
    }

    // define a function that can keep the polygon in the same position when we change its
    // width/height/top/left.
    anchorWrapper(anchorIndex, fn) {
        var this_ = this;
        return function(eventData, transform, x, y) {
            var fabricObject = transform.target;
            
            var absolutePoint = fabric.util.transformPoint({
                    x: (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x),
                    y: (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y),
                }, fabricObject.calcTransformMatrix());
            var actionPerformed = fn(eventData, transform, x, y);
            var newDim = fabricObject._setPositionDimensions({});
            var newX = (fabricObject.points[anchorIndex].x - fabricObject.pathOffset.x) / fabricObject.width,
                    newY = (fabricObject.points[anchorIndex].y - fabricObject.pathOffset.y) / fabricObject.height;
            fabricObject.setPositionByOrigin(absolutePoint, newX + 0.5, newY + 0.5);
            this_.updateData(fabricObject);
            return actionPerformed;
        }
    }

    dist(p1, p2){
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    updateData(obj){
        var matrix = obj.calcTransformMatrix();
        var transformedPoints = obj.get("points").map(function(p){
            return new fabric.Point(p.x-obj.pathOffset.x, p.y-obj.pathOffset.y);
        }).map(function(p){
            return fabric.util.transformPoint(p, matrix);
        });
        var points = transformedPoints.map((x) => x);
        var area = 0;
        points[points.length]=points[0]
        for (let i=0; i< points.length-1; i++){ 
            var a=  (points[i].x*points[i+1].y) - (points[i+1].x*points[i].y);
            area +=a; 
        }
        //var centroid = obj.getCenterPoint();
        var centroid = Utility.get_polygon_centroid(points)
        var perimeter = 0.0; 
        for (var i = 0; i < points.length -1; i++) {   // Find the distance between adjacent points 
            perimeter += this.dist(points[i], points[i + 1]); 
        } 
        perimeter += this.dist(points[0], points[points.length - 1]); // Add the distance between first and last point
        area = Math.abs(area/2);
        area *= this.factor * this.factor;
        perimeter *= this.factor;
        centroid.x *= this.factor;
        centroid.y *= this.factor;
        obj.set({
            area : area,
            perimeter : perimeter,
            centroid : centroid
        });
        var s = Shape.from_object(obj);
        s.add_row_to_menu(this.unit);
    }

    activate(){
        var this_ = this
        // clone what are you copying since you
        // may want copy and paste on different moment.
        // and you do not want the changes happened
        // later to reflect on the copy.
        var poly = this.polygon;
        var lastControl = poly.points.length - 1;
        poly.cornerStyle = 'circle';
        poly.controls = poly.points.reduce(function(acc, point, index) {
            acc['p' + index] = new fabric.Control({
                positionHandler: this_.polygonPositionHandler,
                actionHandler: this_.anchorWrapper(index > 0 ? index - 1 : lastControl, this_.actionHandler),
                actionName: 'modifyPoligon',
                pointIndex: index
            });
            return acc;
        }, { });
        poly.hasBorders =false;
        this.canvas.requestRenderAll();
    }
}