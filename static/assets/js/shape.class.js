import ShapeType from './shape_type.class.js';
import Point from './point.class.js';
import Utility from './utility.class.js';
import Fill from './fill.class.js';

export default class Shape{
    
    constructor(id, name, type_, color, strokeWidth, options){
        this.id = id;
        this.name = name;
        this.type_ = type_;
        this.color = color;
        this.strokeWidth = strokeWidth;
        this.options = options || {};
        this.obj = null;
        this.opacity = 0.2;
        this.area = 0;
        this.perimeter = 0;
        this.centroid = null;
        this.circle = null;
        this.points = null;
    }

    custom_controls() {
        this.obj.set({
            transparentCorners: false,
            cornerColor: 'yellow',
            cornerStrokeColor: 'blue',
            borderColor: 'blue',
            cornerSize: 12,
            padding: 10,
            cornerStyle: 'square',
            borderDashArray: [3, 3]
        });
    }


    disable(canvas) {
        this.obj.set({
            selectable : false,
            hasControls : false,
            hasBorders : false,
            lockRotation : true,
            lockScalingX : true,
            lockScalingY : true,
            lockMovementX : true,
            lockMovementY : true,
            //evented: false
        });
        if(canvas != null)
            canvas.renderAll();
    }

    activate(canvas) {
        this.obj.set({
            selectable : true,
            hasControls : true,
            hasBorders : true,
            lockRotation : false,
            lockScalingX : false,
            lockScalingY : false,
            lockMovementX : false,
            lockMovementY : false,
            //evented: true
        }).setCoords();
        if(canvas != null)
            canvas.renderAll();
    }

    hide(canvas){
        this.disable(null);
        this.obj.set({
            visible : false
        });
        canvas.renderAll();
    }

    show(canvas){
        this.activate(null);
        this.obj.set({
            visible : true
        });
        canvas.renderAll();
    }

    get_shape(id){
        //new Shape()
    }

    static from_object(obj){
        var shape  = new Shape(obj.id, obj.name, obj.color, obj.strokeWidth, {})
        shape.area = obj.area;
        shape.perimeter = obj.perimeter;
        shape.centroid = obj.centroid;
        shape.obj = obj;
        shape.type_ = obj.class;
        return shape;
    }

    dist(p1, p2){
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }
    
    draw(canvas, args, unit){
        switch (this.type_) {
            case ShapeType.SHAPE_LINE:
                var points = Object.assign({}, points);
                this.obj = new fabric.Line(points, {
                    strokeWidth: this.strokeWidth,
                    fill: this.color,
                    opacity: 1,
                    stroke: this.color,
                    originX: 'center',
                    originY: 'center',
                    id : this.id,
                    name : this.name,
                    class : this.type_,
                    //objectCaching:false
                });
                this.area = 0;
                this.perimeter = Math.sqrt(Math.pow(this.obj.x2 - this.obj.x1, 2) + Math.pow(this.obj.y2 - this.obj.y1, 2));
                this.centroid = this.obj.getCenterPoint();
                var factor =  canvas.item(0).width / canvas.width
                this.area *= factor * factor ;
                this.perimeter *= factor ;
                this.centroid.x *= factor ;
                this.centroid.y *= factor ;
                this.obj.set({
                    area : this.area,
                    perimeter : this.perimeter,
                    centroid : this.centroid
                });
                this.custom_controls();
                this.disable(null)
                canvas.add(this.obj);
                break;
            
            case ShapeType.SHAPE_RECTANGLE:
                this.obj = new fabric.Rect({
                    left: args.x,
                    top: args.y,
                    originX: 'left',
                    originY: 'top',
                    width: args.w,
                    height: args.h,
                    angle: args.a,
                    fill:  this.color,
                    opacity: this.opacity,
                    stroke:this.color,
                    strokeWidth: 0,
                    selectable: true,
                    id : this.id,
                    name : this.name,
                    class : this.type_,
                    //objectCaching:false
                });
                this.area = this.obj.width*this.obj.height;
                this.perimeter = (this.obj.width + this.obj.height) * 2;
                this.centroid = this.obj.getCenterPoint();
                var factor =  canvas.item(0).width / canvas.width
                this.area *= factor * factor;
                this.perimeter *= factor ;
                this.centroid.x *= factor ;
                this.centroid.y *= factor ;
                this.obj.set({
                    area : this.area,
                    perimeter : this.perimeter,
                    centroid : this.centroid
                });
                this.custom_controls();
                this.disable(null)
                canvas.add(this.obj);
                console.log('Rect')
                console.log('viewportTransform')
                console.log(canvas.viewportTransform);
                console.log('calc')
                console.log(this.obj.calcTransformMatrix());
                break;
            
            case ShapeType.SHAPE_CIRCLE:
                this.obj = new fabric.Circle({
                    left: args.x,
                    top: args.y,
                    originX: 'left',
                    originY: 'top',
                    radius: args.r,
                    angle: args.a,
                    fill: this.color,
                    opacity: this.opacity,
                    stroke: this.color,
                    strokeWidth: 0,
                    id : this.id,
                    name : this.name,
                    class : this.type_,
                    //objectCaching:false
                });
                this.area = Math.PI* this.obj.radius* this.obj.radius;
                this.perimeter = this.obj.radius * 2 * Math.PI;
                this.centroid = this.obj.getCenterPoint();
                var factor =  canvas.item(0).width / canvas.width
                this.area *= factor * factor ;
                this.perimeter *= factor ;
                this.centroid.x *= factor ;
                this.centroid.y *= factor ;
                this.obj.set({
                    area : this.area,
                    perimeter : this.perimeter,
                    centroid : this.centroid
                });
                this.custom_controls();
                this.disable(null)
                canvas.add(this.obj);
                break;

            case ShapeType.SHAPE_POLYGON:
                this.obj = new fabric.Polygon(args,{
                    stroke: this.color,
                    strokeWidth: 0,
                    objectCaching: false,
                    transparentCorners: false,
                    cornerColor: 'blue',
                    //strokeWidth: this.strokeWidth,
                    fill: this.color,
                    opacity: this.opacity,
                    id : this.id,
                    name : this.name,
                    class : this.type_,
                    //objectCaching:false
                });
                var area = 0;
                var args_save = args.map((x) => x);
                args_save[args_save.length]=args_save[0]
                for (let i=0; i< args_save.length-1; i++){ 
                    var a=  (args_save[i].x*args_save[i+1].y) - (args_save[i+1].x*args_save[i].y);
                    area +=a; 
                }
                //this.centroid = this.obj.getCenterPoint();
                this.centroid = Utility.get_polygon_centroid(this.obj.get('points'))
                var perimeter = 0.0; 
                for (var i = 0; i < args_save.length -1; i++) {   // Find the distance between adjacent points 
                    perimeter += this.dist(args_save[i], args_save[i + 1]); 
                } 
                perimeter += this.dist(args_save[0], args_save[args_save.length - 1]); // Add the distance between first and last point
                this.perimeter = perimeter; 
                this.area = Math.abs(area/2);
                var factor =  canvas.item(0).width / canvas.width
                this.area *= factor * factor;
                this.perimeter *= factor ;
                this.centroid.x *= factor ;
                this.centroid.y *= factor ;
                this.obj.set({
                    area : this.area,
                    perimeter : this.perimeter,
                    centroid : this.centroid
                });
                this.custom_controls();
                this.disable(null);
                canvas.add(this.obj);
                break;
            case ShapeType.SHAPE_FLOOD:
                
                var fImg = args.img;
                this.obj = fImg;
                this.centroid = args.centroid;
                this.area = args.area;
                this.perimeter = args.perimeter;
                var factor =  canvas.item(0).width / canvas.width
                this.area *= factor * factor;
                this.perimeter *= factor ;
                this.centroid.x *= factor ;
                this.centroid.y *= factor ;
                this.obj.set({
                    area : this.area,
                    centroid : this.centroid,
                    perimeter : this.perimeter,
                    id : this.id,
                    name : this.name,
                    class : this.type_,
                })
                //this.custom_controls();
                this.disable(null);
                canvas.add(fImg);
                break; 
        }
        this.add_row_to_menu(unit);
        canvas.renderAll();
        return this.obj;
    }


    update(canvas, args, unit){
        switch (this.type_) {
            case ShapeType.SHAPE_LINE:
                this.obj.set(args);
                this.area = 0;
                this.perimeter = Math.sqrt(Math.pow(this.obj.x2 - this.obj.x1, 2) + Math.pow(this.obj.y2 - this.obj.y1, 2));
                this.centroid = this.obj.getCenterPoint();
                var factor =  canvas.item(0).width / canvas.width
                this.area *= factor * factor ;
                this.perimeter *= factor ;
                this.centroid.x *= factor ;
                this.centroid.y *= factor ;
                this.obj.set({
                    area : this.area,
                    perimeter : this.perimeter,
                    centroid : this.centroid
                });
                break;
            case ShapeType.SHAPE_RECTANGLE:
                if(args.sx > args.x){
                    this.obj.set({ left: Math.abs(args.x) });
                }
                if(args.sy >args.y){
                    this.obj.set({ top: Math.abs(args.y) });
                }
                this.obj.set({ width: Math.abs(args.sx - args.x)});
                this.obj.set({ height: Math.abs(args.sy - args.y)});
                
                this.area = this.obj.width*this.obj.height;
                this.perimeter = (this.obj.width + this.obj.height) * 2;
                this.centroid = this.obj.getCenterPoint();
                var factor =  canvas.item(0).width / canvas.width
                this.area *= factor * factor;
                this.perimeter *= factor ;
                this.centroid.x *= factor ;
                this.centroid.y *= factor ;
                this.obj.set({
                    area : this.area,
                    perimeter : this.perimeter,
                    centroid : this.centroid
                });
                //this.circle.set({left:this.centroid.x, top: this.centroid.y})
                break;
            case ShapeType.SHAPE_CIRCLE:
                var radius = Math.max(Math.abs(args.sy - args.y),Math.abs(args.sx - args.x))/2;
                if (radius >  this.obj.strokeWidth) {
                    radius -=  this.obj.strokeWidth/2;
                }
                this.obj.set({ radius: radius});
                if(args.sx>args.x){
                    this.obj.set({originX: 'right' });
                } else {
                    this.obj.set({originX: 'left' });
                }
                if(args.sy>args.y){
                    this.obj.set({originY: 'bottom'  });
                } else {
                    this.obj.set({originY: 'top'  });
                }
                this.area = Math.PI* this.obj.radius* this.obj.radius;
                this.perimeter = this.obj.radius * 2 * Math.PI;
                this.centroid = this.obj.getCenterPoint();
                var factor =  canvas.item(0).width / canvas.width
                this.area *= factor * factor ;
                this.perimeter *= factor ;
                this.centroid.x *= factor ;
                this.centroid.y *= factor ;
                this.obj.set({
                    area : this.area,
                    perimeter : this.perimeter,
                    centroid : this.centroid
                });
                break;
        }
        this.add_row_to_menu(unit);
        canvas.renderAll();
    }
    
    show_centroid(canvas){
        var scaleMultiplierW = canvas.width /  canvas.item(0).width ;
        var scaleMultiplierH = canvas.height / canvas.item(0).height ;
        var circle = new fabric.Circle({
            radius: 5 / canvas.getZoom(),
            fill: 'blue',
            stroke: '#000',
            opacity : 1,
            strokeWidth: 0.5,
            left: this.centroid.x * scaleMultiplierW,
            top: this.centroid.y * scaleMultiplierH,
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
            class: 'centroid',
            excludeFromExport : true,
            //objectCaching:false
        });
        canvas.add(circle)
        canvas.renderAll();
    }

    static remove_centroids(canvas){
        var o = null,
            objects = canvas.getObjects();
        for (var i = 0, len = canvas.size(); i < len; i++) {
            o = objects[i];
            if( o.class == "centroid"){
                canvas.remove(o)
            }
        }
    }

    add_row_to_menu(unit){
        $("#menu-shapes").find('tr[data-id="'+this.id+'"]').remove();
        $("#menu-shapes").append(`
            <tr data-id="${this.id}">
                <th scope="row"><input data-id="${this.id}" data-idx="" type="checkbox" class="checkthis" /></th>
                <td class="text-center" ><a data-id="${this.id}" data-state='show' class="eye-link"><i class="fas fa-eye"></i></a></td>
                <td class="text-center" ><cite  contenteditable="true" style="outline:unset;">${this.name}</cite></td>
                <td class="text-center" >${(this.perimeter/unit).toFixed(2)}</td>
                <td class="text-center" >${(this.area/(unit*unit)).toFixed(2)}</td>
            </tr>
        `);
    }


    show_info(unit){
        $('#area-field').html((this.area/(unit*unit)).toFixed(2));
        $('#perimeter-field').html((this.perimeter/unit).toFixed(2));
        $('#x-field').html(this.centroid.x.toFixed(0));
        $('#y-field').html(this.centroid.y.toFixed(0));
        $('#x-field-m').html((this.centroid.x/unit).toFixed(2));
        $('#y-field-m').html((this.centroid.y/unit).toFixed(2));
    }

    remove_row_from_menu(){
        $("#menu-shapes").find('tr[data-id="'+this.id+'"]').remove();
    }
}










