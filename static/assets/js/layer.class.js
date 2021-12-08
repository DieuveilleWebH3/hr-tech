import Utility from './utility.class.js';
import ShapeType from './shape_type.class.js';
import Shape from './shape.class.js';
export default class Layer{
    
    constructor(id, layout_id, deck_id, deck_name, module_id, module_name, feature_id, feature_name, serialization, width , height, perimeter, area, centroid_x, centroid_y, nb_objects ) {
        this.id = id;
        this.layout_id =  layout_id;
        this.deck_id = deck_id;
        this.deck_name =  deck_name;
        this.module_id = module_id;
        this.module_name =  module_name;
        this.feature_id= feature_id;
        this.feature_name = feature_name;
        this.serialization = serialization;
        this.width =  width;
        this.height= height;
        this.perimeter = perimeter;
        this.area = area;
        this.centroid_x = centroid_x;
        this.centroid_y = centroid_y;
        this.nb_objects =  nb_objects;
        this.canvas = null;
        this.gravity = null;
    }


    scale(target, scaleMultiplierW, scaleMultiplierH, unit){
        switch(target.class) {
            case ShapeType.SHAPE_POLYGON:
                var points=target.get('points');
                console.log(points)
                var new_points=[];
                for(let i = 0; i<points.length;i++){
                    let x= points[i].x * scaleMultiplierW;
                    let y= points[i].y * scaleMultiplierH;
                    new_points.push(new fabric.Point(x,y));
                }
                var obj= new Shape( target.id, target.name, ShapeType.SHAPE_POLYGON, target.fill, target.strokeWidth , {});
                obj.draw(this.canvas, new_points, unit);     
                break;
            case ShapeType.SHAPE_RECTANGLE: 
                var obj= new Shape( target.id, target.name, ShapeType.SHAPE_RECTANGLE, target.fill, target.strokeWidth , {});
                var data = {
                    x : target.left * scaleMultiplierW,
                    y : target.top * scaleMultiplierH,
                    w : target.width * scaleMultiplierW,
                    h : target.height * scaleMultiplierH, 
                    a : target.angle
                }
                obj.draw(this.canvas, data, unit);   
                break;
            case ShapeType.SHAPE_CIRCLE: 
                var obj= new Shape( target.id, target.name, ShapeType.SHAPE_CIRCLE, target.fill, target.strokeWidth , {});
                var data = {
                    x : target.left * scaleMultiplierW,
                    y : target.top * scaleMultiplierH,
                    r : target.radius * scaleMultiplierH,
                    a : target.angle
                }
                obj.draw(this.canvas, data, unit);     
                break;
            case ShapeType.SHAPE_FLOOD: 
                var canvas = this.canvas;
                var color = this.color;
                target.set({
                    left : target.left * scaleMultiplierW  ,
                    top : target.top * scaleMultiplierH,
                    height : target.height  * scaleMultiplierH,
                    width  : target.width * scaleMultiplierW ,
                })
                var data = {
                    img : target,
                    area : target.area * scaleMultiplierW * scaleMultiplierH,
                    perimeter : target.perimeter * scaleMultiplierW,
                    centroid : { x : target.centroid.x * scaleMultiplierW, y : target.centroid.y * scaleMultiplierH}
                };
                var shape = new Shape( target.id, target.name, ShapeType.SHAPE_FLOOD, color , 0 , {});
                shape.draw(canvas, data, unit);
                /*var img = new Image();
                img.onload = function() {
                    var fImg = new fabric.Image( img, {
                        left : target.left * scaleMultiplierW,
                        top : target.top * scaleMultiplierH,
                        height : target.height * scaleMultiplierH,
                        width  : target.width * scaleMultiplierW,
                        selectable: false
                    });
                    var data = {
                        img : fImg,
                        area : target.area * scaleMultiplierW * scaleMultiplierH,
                        perimeter : target.perimeter * scaleMultiplierW,
                        centroid : { x : target.centroid.x * scaleMultiplierW, y : target.centroid.y * scaleMultiplierH}
                    };
                    var shape = new Shape( target.id, target.name, ShapeType.SHAPE_FLOOD, color , 0 , {});
                    shape.draw(canvas, data, unit);
                };
                img.src = target.src; */
                break;
        }
        //target.setCoords();
    }

    show_gravity(unit){
        if(this.gravity) this.canvas.remove(this.gravity);
        var json = this.canvas.toJSON(['class', 'name', 'id', 'area' , 'perimeter', 'centroid', 'type_']);
        this.area = 0;
        for (let i=0; i <json.objects.length;i++ ){
            if (json.objects[i].class != 'background' && json.objects[i].area && json.objects[i].visible==true  ){
                this.area += json.objects[i].area;
            }
        }
        this.centroid_x = 0;
        this.centroid_y = 0;
        for (let i=0; i <json.objects.length; i++ ){
            if (json.objects[i].class != 'background' && json.objects[i].class != 'line' && json.objects[i].class != 'box' && json.objects[i].class != 'calibration' && json.objects[i].class != 'gravity' && json.objects[i].visible==true){
                this.centroid_x += json.objects[i].centroid.x*json.objects[i].area;
                this.centroid_y += json.objects[i].centroid.y*json.objects[i].area;
            }
        }
        if(this.area != 0){
            this.centroid_x /= this.area;
            this.centroid_y /= this.area;
        }
        var scaleMultiplierW = this.canvas.width /  this.canvas.item(0).width ;
        var scaleMultiplierH = this.canvas.height / this.canvas.item(0).height ;
        this.gravity  = new fabric.Circle({
            radius: 6 / this.canvas.getZoom(),
            fill: 'green',
            stroke: '#000',
            opacity : 1,
            strokeWidth: 0.5,
            left: this.centroid_x * scaleMultiplierW,
            top: this.centroid_y * scaleMultiplierH,
            selectable : false,
            hasControls : false,
            hasBorders : false,
            lockRotation : true,
            lockScalingX : true,
            lockScalingY : true,
            lockMovementX : true,
            lockMovementY : true,
            /*originX: 'left',
            originY: 'top',*/
            originX:'center',
            originY:'center',
            class: 'gravity',
            objectCaching:false
        });
        this.canvas.add(this.gravity)
        this.canvas.renderAll();
        $('#gx-field').html(this.centroid_x.toFixed(0));
        $('#gy-field').html(this.centroid_y.toFixed(0));
        $('#gx-field-m').html((this.centroid_x/unit).toFixed(2));
        $('#gy-field-m').html((this.centroid_y/unit).toFixed(2));
        $('#body-msg-gravity').show();
    }


    hide_gravity(){
        if(this.gravity){
            this.canvas.remove(this.gravity)
            this.canvas.renderAll();
            $('#body-msg-gravity').hide();
        }
    }
    save(unit, callback){
        $('div.spinner').show()
        var scaleMultiplierW = this.canvas.item(0).width / this.canvas.width;
        var scaleMultiplierH = this.canvas.item(0).height / this.canvas.height;
        var objects = this.canvas.getObjects();
        var old_objects=[];
        var new_objects= [];
        new_objects.push(fabric.util.object.clone(objects[0]));
        for (var i in objects) {
            old_objects.push(fabric.util.object.clone(objects[i]));
            if(objects[i].class && (objects[i].class == 'rectangle' || objects[i].class == 'polygon' || objects[i].class == 'circle' || objects[i].class == 'flood')){
                var object= fabric.util.object.clone(objects[i]);
                switch(object.class) {
                    case ShapeType.SHAPE_POLYGON:
                        var matrix = object.calcTransformMatrix();
                        var transformedPoints = object.get("points").map(function(p){
                            return new fabric.Point(p.x-object.pathOffset.x, p.y-object.pathOffset.y);
                        }).map(function(p){
                            return fabric.util.transformPoint(p, matrix);
                        });
                        var points = transformedPoints.map((p) => new fabric.Point(p.x*scaleMultiplierW, p.y * scaleMultiplierH));
                        object.set({
                            points: points,
                        });
                        //var poly_temp= new Shape( object.id, object.name, ShapeType.SHAPE_POLYGON, 'red', 1 , {});
                        //poly_temp.draw(this.canvas, new_points, unit );
                        //objects[i]= poly_temp.obj
                        break;
                    case ShapeType.SHAPE_LINE:
                        object.set({
                            top : object.top * scaleMultiplierW,
                            left : object.left * scaleMultiplierH,
                            width : object.width * scaleMultiplierW,
                            height : object.height * scaleMultiplierH,
                        });
                        break;
                    case ShapeType.SHAPE_RECTANGLE:    
                        object.set({
                            left : object.left * scaleMultiplierW,
                            top : object.top * scaleMultiplierH,
                            height : (object.getScaledHeight()) * scaleMultiplierH,
                            width  : (object.getScaledWidth()) * scaleMultiplierW
                        });

                        break;
                    case ShapeType.SHAPE_CIRCLE:
                        object.set({
                            left : object.left * scaleMultiplierW,
                            top : object.top * scaleMultiplierH,
                            radius : object.getRadiusX() * scaleMultiplierH
                        });
                        break;
                    case ShapeType.SHAPE_FLOOD:

                        
                        object.set({
                            left : object.left * scaleMultiplierW  ,
                            top : object.top * scaleMultiplierH,
                            height : object.height  * scaleMultiplierH,
                            width  : object.width * scaleMultiplierW 
                        })
                }
                new_objects.push(object);
           }
        }
        //////////////////////////////////////////////////////////////
        this.canvas.clear();
        for(let i=0; i<new_objects.length; i++){
            this.canvas.add(new_objects[i]);
        }
        var json = this.canvas.toJSON(['class','name','id', 'area' , 'perimeter', 'centroid', 'type_']);
        var json_str = JSON.stringify(json);
        this.canvas.clear();
        for(let i=0; i<old_objects.length; i++){
            this.canvas.add(old_objects[i]);
        }
        this.canvas.renderAll();
        console.log(json.objects);
        this.nb_objects = json.objects.length -1;
        this.area = 0;
        for (let i=0; i <json.objects.length;i++ ){
            if (json.objects[i].class != 'background' && json.objects[i].area != undefined ){
                this.area += json.objects[i].area;
            }
        }
        this.centroid_x = 0;
        this.centroid_y = 0;
        for (let i=0; i <json.objects.length; i++ ){
            if (json.objects[i].class && (json.objects[i].class == 'rectangle' || json.objects[i].class == 'polygon' || json.objects[i].class == 'circle' || json.objects[i].class == 'flood' )){
                this.centroid_x += json.objects[i].centroid.x*json.objects[i].area;
                this.centroid_y += json.objects[i].centroid.y*json.objects[i].area;
            }
        }
        if(this.area != 0){
            this.centroid_x /= this.area;
            this.centroid_y /= this.area;
        }
        var canvas  = this.canvas.lowerCanvasEl
        var image = new Image();
        canvas.toBlob((blob) => {
            image.onload = function() {
                URL.revokeObjectURL(this.url);
            };
            image.src = URL.createObjectURL(blob);
            var formdata = new FormData();
            formdata.append("image", blob, "test");
            formdata.append("serialization", json_str);
            formdata.append("width", canvas.width);
            formdata.append("height", canvas.height);
            formdata.append("nb_objects", this.nb_objects);
            formdata.append("area", this.area);
            formdata.append("perimeter", 2);
            formdata.append("centroid_x", this.centroid_x);
            formdata.append("centroid_y", this.centroid_y);
            Utility.post_request('/layout/layer/'+this.id+'/save', formdata, 
                (data)=>{ 
                    setTimeout(() => $('div.spinner').hide() , 200);
                    callback(1);
                },
                (jqXHR, textStatus, errorThrown)=>{ 
                    $('#modal-header').html("Saving workspace failed");
                    $('#modal-body').html('Sorry! saving workspace failed. please retry again.');
                    $('#dialogue').click();
                    $('div.spinner').hide();
                    callback(0);
                }
            );
        });
    }
}
