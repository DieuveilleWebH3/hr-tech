
import ShapeType from './shape_type.class.js';
import Shape from './shape.class.js';
import Utility from './utility.class.js';
export default class Transformation{
    
    constructor(canvas ) {
        this.canvas = canvas;
    }

    dist(p1, p2){
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    transform(obj, unit){
        var factor =  this.canvas.item(0).width / this.canvas.width;
        if(obj.class && obj.class != 'background' ){
            switch(obj.class) {
                case ShapeType.SHAPE_POLYGON:
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
                    area *= factor * factor;
                    perimeter *= factor;
                    centroid.x *= factor;
                    centroid.y *= factor;
                    obj.set({
                        area : area,
                        perimeter : perimeter,
                        centroid : centroid
                    });
                    var s = Shape.from_object(obj);
                    s.add_row_to_menu(unit);
                    break;
                case ShapeType.SHAPE_RECTANGLE: 
                    var area = (obj.getScaledWidth())*(obj.getScaledHeight());
                    var perimeter = (obj.getScaledWidth() + obj.getScaledHeight()) * 2;
                    var centroid = obj.getCenterPoint();
                    area *= factor * factor;
                    perimeter *= factor ;
                    centroid.x *= factor ;
                    centroid.y *= factor ;
                    obj.set({
                        area : area,
                        perimeter : perimeter,
                        centroid : centroid
                    });
                    var s = Shape.from_object(obj);
                    s.add_row_to_menu(unit);
                    break;
                case ShapeType.SHAPE_CIRCLE: 
                    var area = Math.PI* obj.getRadiusX()* obj.getRadiusY();
                    var perimeter = (obj.getRadiusX()+  obj.getRadiusY()) * Math.PI;
                    var centroid = obj.getCenterPoint();
                    area *= factor * factor;
                    perimeter  *= factor ;
                    centroid.x *= factor ;
                    centroid.y *= factor ;
                    obj.set({
                        area : area,
                        perimeter : perimeter,
                        centroid : centroid
                    });
                    var s = Shape.from_object(obj);
                    s.add_row_to_menu(unit);
                    break;
                case ShapeType.SHAPE_FLOOD: 
                    break;
            }
        }
    }
}

