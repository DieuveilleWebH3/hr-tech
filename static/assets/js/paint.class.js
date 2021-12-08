import Tool from './tool.class.js';
import Segmentation from './segmentation.js'
import Generator from './generator.class.js'; 
import Utility from './utility.class.js';
import Polygon from './polygon.class.js';
import Shape from './shape.class.js';
import ShapeType from './shape_type.class.js';
import Fill from './fill.class.js';
import Calibration from './calibration.class.js';
import Mesurement from './mesurement.class.js';
import Transformation from './transformation.class.js';
import PolyManagement from './mPoly.class.js';

export default class Paint { 

    constructor(layer, canvas, main_container, url_img, calib_object) {
        this.layer = layer;
        var this_ = this;
        this.url_image = url_img;
        this.segmentation =  null;
        this.initialized=false;
        this.calibration = null;
        this.calib_object = calib_object;
        /**
         * Instanciate Fabric js
         */
        this.main_container = $(main_container);
        var mainW = this.main_container.width();
        var mainH = this.main_container.height();
        this.canvas = this.__canvas = canvas//, renderOnAddRemove: false});
        var this_ = this;
        this.layer.canvas = this.canvas;      
        //this.cMask = new fabric.StaticCanvas("mask" );
        this.container = $('.canvas-container');
        this.container.width(mainW-80);
        this.container.height(mainH - 80);
        var cW = this.cW =  this.container.width();
        var cH = this.cH = this.container.height();
        this.transformation = new Transformation(this.canvas)
        //this.cMask.setDimensions({width:cW, height:cH});
        this.canvas.setDimensions({width:cW, height:cH});
        this.canvas.on('object:modified', (o)=>{
            var obj = o.target
            this.transformation.transform(obj, this.calib_object.unit/this.calib_object.meters);
        });
        this.canvas.on('selection:created', function(o){
            var obj = o.target;
            if(obj.class =='polygon'){
                $('div[data-poly].item').removeClass('disabled');
            }
        });

        this.canvas.on('selection:cleared', function(o){
            $('div[data-poly].item').addClass('disabled');
        });

        fabric.Canvas.prototype.scale_objects = function() {
            var target = null,
                objects = this.getObjects();
            var scaleMultiplierW = 1;
            var scaleMultiplierH = 1;
            var new_objs = [];
            for (var i = 0, len = this.size(); i < len; i++) {
                target = objects[i];
                this_.generator.change(target.class)
                if (!this_.initialized && target.class == 'background'){
                    var oImg = this.item(0);
                    oImg.set({selectable : false})
                    this_.setCanavsDimentions(oImg, cW, cH);
                    this.initialized=true;
                    scaleMultiplierW =  this.width / this.item(0).width;
                    scaleMultiplierH =  this.height / this.item(0).height;
                    this_.calib_object.x1 *= scaleMultiplierW;
                    this_.calib_object.width *= scaleMultiplierW;
                    this_.calib_object.lx1 *= scaleMultiplierW;
                    this_.calib_object.lx2 *= scaleMultiplierW;
                    this_.calib_object.y1 *= scaleMultiplierH;
                    this_.calib_object.height *= scaleMultiplierH;
                    this_.calib_object.ly1 *= scaleMultiplierH;
                    this_.calib_object.ly2 *= scaleMultiplierH;
                }
                if(objects[i].class && ( objects[i].class == 'rectangle' || objects[i].class == 'polygon' || objects[i].class == 'circle' || objects[i].class == 'flood')){
                    new_objs.push(fabric.util.object.clone(objects[i]));
                    this_.canvas.remove(objects[i])
                }
            }
            for(let i = 0; i< new_objs.length; i++){
                layer.scale(new_objs[i], scaleMultiplierW, scaleMultiplierH, this_.calib_object.unit/this_.calib_object.meters);
            }
            this_.addVisibleListner();
            this.renderAll();
            return target;
        };
        this.generator = new Generator();
        if (layer.serialization && layer.serialization != ''){
            this.canvas.loadFromJSON(layer.serialization, ()=>{
                this.canvas.scale_objects();
            });
        }else{
            fabric.Image.fromURL(url_img + '?' + (new Date()).getTime(), (oImg) => {
                oImg.set({
                    class: 'background',
                    originX: "left",
                    originY: "top",
                    selectable: false
                });
                
                this.setCanavsDimentions(oImg, cW, cH);
                var scaleMultiplierW  =  this.canvas.width / oImg.width;
                var scaleMultiplierH =  this.canvas.height / oImg.height;
                this.calib_object.x1 *= scaleMultiplierW;
                this.calib_object.width *= scaleMultiplierW;
                this.calib_object.lx1 *= scaleMultiplierW;
                this.calib_object.lx2 *= scaleMultiplierW;
                this.calib_object.y1 *= scaleMultiplierH;
                this.calib_object.height *= scaleMultiplierH;
                this.calib_object.ly1 *= scaleMultiplierH;
                this.calib_object.ly2 *= scaleMultiplierH;
                
                //this.canvas.sendToBack(oImg);
                this.canvas.add(oImg);
                //var options = { method: "pff", regionSize: 10 };
                //this_.segmentation = new Segmentation(url_img, this.cMask, options);
                this.canvas.renderAll();

            });
        }  
        /**
         * Drawing attribute
         */
        this.shape = null;
        this.old_cursor = '';
        this.change_cursor = false;
        this.obj = null;
        this.rect = null;
        this.isDown = false;
        this.isDrawingShapeMode = false;
        this.startPos = null;
        this.currentPos = null;
        this.color = "#ff0000";
        this._lineWidth = 2;
        this.superPixelValue = 20;
        this.tool = null;
        this.polygon = null;
        this.fill = null;
        this.calibration = null;
        var set = this.set = new Set();
        var isRedoing = this.isRedoing = false;
        var h = this.h = [];
        this.mesurement = new Mesurement(this.canvas);
        this.canvas.on('object:added',function(){
            if(!isRedoing){
              h = [];
            }
            isRedoing = false;
        });
        $('#refresh-menu-btn').click((e)=>{
            this.refresh_menu();
        });
        $("#checkall").click(function () {
            var this_ = $(this);
            if (this_.is(':checked')) {
                this_.closest('table').find('input[type=checkbox]:not(#checkall)').each(function () {
                    $(this).prop("checked", true);
                    var id = $(this).data('id');
                    set.add(id);
                    if (set.size > 0) {
                        $('#delete-shape-btn').removeAttr('disabled');
                        $('#hide-shape-btn').removeAttr('disabled');
                        $('#show-shape-btn').removeAttr('disabled');
                        $('#result-shape-btn').removeAttr('disabled');
                    }else {
                        $('#delete-shape-btn').attr('disabled', '');
                        $('#hide-shape-btn').attr('disabled', '');
                        $('#show-shape-btn').attr('disabled', '');
                        $('#result-shape-btn').attr('disabled', '');
                    }
                });
            } else {
                this_.closest('table').find('input[type=checkbox]:not(#checkall)').each(function () {
                    $(this).prop("checked", false);
                    var id = $(this).data('id');
                    set.delete(id);
                    if (set.size > 0) {
                        $('#delete-shape-btn').removeAttr('disabled');
                        $('#hide-shape-btn').removeAttr('disabled');
                        $('#show-shape-btn').removeAttr('disabled');
                        $('#result-shape-btn').removeAttr('disabled');
                    }else {
                        $('#delete-shape-btn').attr('disabled', '');
                        $('#hide-shape-btn').attr('disabled', '');
                        $('#show-shape-btn').attr('disabled', '');
                        $('#result-shape-btn').attr('disabled', '');
                    }
                });
            }
        });

        $('#delete-shape-btn').click((e)=>{
            var this_ = this;
            swal({
                title: "Are you sure?",
                text: "Once deleted, you will not be able to recover this action!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
              })
              .then((willDelete) => {
                if (willDelete) {
                    var arr  = Array.from(set);
                    for(let i = 0 ; i< arr.length; i++){
                        var o = this_.getObject(arr[i]);
                        var s = Shape.from_object(o);
                        set.delete(arr[i]);
                        s.remove_row_from_menu(this_.canvas);
                        this_.canvas.remove(o);
                        this_.addVisibleListner();
                    }
                    $('#checkall').prop("checked", false);
                    $('#delete-shape-btn').attr('disabled', '');
                    $('#hide-shape-btn').attr('disabled', '');
                    $('#show-shape-btn').attr('disabled', '');
                    $('#result-shape-btn').attr('disabled', '');
                    this.canvas.renderAll();
                }
            });
        });

        $('#hide-shape-btn').click((e)=>{
            var arr  = Array.from(set);
            for(let i = 0 ; i< arr.length; i++){
                var o = this.getObject(arr[i]);
                var this_ = $('a.eye-link[data-id='+arr[i]+']');
                var state = this_.data('state');
                if( state == 'show'){
                    $(this_).find($(".fas")).removeClass('fa-eye').addClass('fa-eye-slash');
                    var shape = Shape.from_object(o)
                    shape.hide(this.canvas);
                    $(this_).data('state', 'hide');
                }
            }
            this.canvas.renderAll();
        });

        $('#show-shape-btn').click((e)=>{
            var arr  = Array.from(set);
            for(let i = 0 ; i< arr.length; i++){
                var o = this.getObject(arr[i]);
                var this_ = $('a.eye-link[data-id='+arr[i]+']');
                var state = this_.data('state');
                if( state == 'hide'){
                    $(this_).find($(".fas")).removeClass('fa-eye-slash').addClass('fa-eye');
                    var shape = Shape.from_object(o)
                    shape.show(this.canvas);
                    $(this_).data('state', 'show');
                }
            }
            this.canvas.renderAll();
        });

        $('#result-shape-btn').click((e)=>{
            var arr  = Array.from(set);
            var area = 0;
            var perimeter = 0;
            for(let i = 0 ; i< arr.length; i++){
                var o = this.getObject(arr[i]);
                if(o.class !== undefined){
                    area += o.area;
                    perimeter += o.perimeter;
                }
            }
            var unit = this.calib_object.unit/this.calib_object.meters
            area /= Math.pow(unit,2);
            perimeter /= unit;
            $('#area-span').html(area.toFixed(2));
            $('#perimeter-span').html(perimeter.toFixed(2));
        });
    }

    setCanavsDimentions(oImg, cW, cH){
        var canvas = this.canvas;
        canvas.width = cW;
        canvas.height = cH;
        var a = oImg.width / oImg.height;
        var x = a * cH;
        if( x > cW){
            oImg.scaleToWidth(this.canvas.width);
            var hScaled = oImg.getScaledHeight();
            //this.cMask.setDimensions({width:cW, height:hScaled});
            this.canvas.setDimensions({width:Math.round(cW,0), height:Math.round(hScaled,0)});
            this.container.width(Math.round(cW,0));
            this.container.height(Math.round(hScaled,0));
            var lowercv = this.canvas.lowerCanvasEl 
            var uppercv = this.canvas.upperCanvasEl 
            /*lowercv.setAttribute('width', Math.round(cW,0));
            lowercv.setAttribute('height', Math.round(hScaled,0));
            uppercv.setAttribute('width', Math.round(cW,0));
            uppercv.setAttribute('height', Math.round(hScaled,0));*/
        } else {
            oImg.scaleToHeight(this.canvas.height);
            var wScaled = oImg.getScaledWidth();
           // this.cMask.setDimensions({width:wScaled, height:cH});
            this.canvas.setDimensions({width:Math.round(wScaled,0), height:Math.round(cH,0)});
            this.container.width(Math.round(wScaled,0));
            this.container.height(Math.round(cH,0));
            var lowercv = this.canvas.lowerCanvasEl 
            var uppercv = this.canvas.upperCanvasEl 
            /*lowercv.setAttribute('width', Math.round(wScaled,0));
            lowercv.setAttribute('height', Math.round(cH,0));
            uppercv.setAttribute('width', Math.round(wScaled,0));
            uppercv.setAttribute('height', Math.round(cH,0));*/
        }
        this.canvas.centerObject(oImg);
    }

    addVisibleListner(){
        var this_ = this
        $('a.eye-link').unbind('click').bind( 'click', function(e){
            var id = $(this).data('id');
            var state = $(this).data('state');
            var obj = this_.getObject(id);
            if( state == 'show'){
                $(this).find($(".fas")).removeClass('fa-eye').addClass('fa-eye-slash');
                var shape = Shape.from_object(obj)
                shape.hide(this_.canvas);
                $(this).data('state', 'hide');
                this_.canvas.renderAll();
                return;
            }else{
                $(this).find($(".fas")).removeClass('fa-eye-slash').addClass('fa-eye');
                var shape = Shape.from_object(obj)
                shape.show(this_.canvas);
                $(this).data('state', 'show');
                this_.canvas.renderAll();
                return;
            }
        });
        $("table#shape-table input[type=checkbox].checkthis").click(function (e) {
            var id = $(this).data('id');
            if ($(this).is(':checked')) {
                var nb_check = $('table#shape-table input[type=checkbox].checkthis').length;
                this_.set.add(id);
                if(nb_check == this_.set.size ){
                    $('#checkall').prop("checked", true);
                }
                if (this_.set.size > 0) {
                    $('#delete-shape-btn').removeAttr('disabled');
                    $('#hide-shape-btn').removeAttr('disabled');
                    $('#show-shape-btn').removeAttr('disabled');
                    $('#result-shape-btn').removeAttr('disabled');
                }else {
                    $('#delete-shape-btn').attr('disabled', '');
                    $('#hide-shape-btn').attr('disabled', '');
                    $('#show-shape-btn').attr('disabled', '');
                    $('#result-shape-btn').attr('disabled', '');
                }
            }else{
                this_.set.delete(id);
                $('#checkall').prop("checked", false);
                if (this_.set.size > 0) {
                    $('#delete-shape-btn').removeAttr('disabled');
                    $('#hide-shape-btn').removeAttr('disabled');
                    $('#show-shape-btn').removeAttr('disabled');
                    $('#result-shape-btn').removeAttr('disabled');
                }else {
                    $('#delete-shape-btn').attr('disabled', '');
                    $('#hide-shape-btn').attr('disabled', '');
                    $('#show-shape-btn').attr('disabled', '');
                    $('#result-shape-btn').attr('disabled', '');
                }
            }
        });
    }

    getObject(id){
        var objs = this.canvas.getObjects();
        var obj = null;
        for(let i =0 ; i<= objs.length; i++){
            if(objs[i].id == id) return objs[i];
        }
    }
    

    init() {
        $('div[data-command="cancel"].item ').addClass('disabled');
        $('div[data-poly].item').addClass('disabled');
        $('div[data-calibration].item ').addClass('disabled');
        document.querySelector("[data-tool].active").classList.toggle("active");
        document.querySelector("[data-tool='hand']").classList.toggle("active");
        this.drawingMode = true;
        this.cursor = 'grab';
        this.activate_pencil = false;
        this.calibrate = false;
        this.gravity_center = false;
        this.lineWidth = 2;
        this.color = "#ff0000";
        this.canvas.on('mouse:down', (e) => this.onMouseDown(e));
        this.canvas.on('mouse:move', (e) => this.onMouseMove(e));
        this.canvas.on('mouse:up', (e) => this.onMouseUp(e));
        this.canvas.on('mouse:wheel', (e) => this.handleScroll(e));
        document.onkeydown = (e) => this.onkeydown(e);
        document.onkeyup = (e) => this.onkeyup(e);
    }

    close() {
        this.canvas.off('mouse:down');
        this.canvas.off('mouse:move');
        this.canvas.off('mouse:up');
        this.canvas.off('mouse:wheel');
        //this.canvas.off('object:added');
        document.onkeydown = null;
    }

    rescale(){
        this.canvas.viewportTransform = [1,0,0,1,0,0];
        this.canvas.requestRenderAll();
    }

    download(){
        const dataURL = this.canvas.toDataURL({
            width: this.canvas.width,
            height: this.canvas.height,
            left: 0,
            top: 0,
            format: 'png',
       });
       const link = document.createElement('a');
       link.download = 'image.png';
       link.href = dataURL;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
    }

    rotate (degrees) {
        var canvas = this.canvas;
        let canvasCenter = new fabric.Point(canvas.getWidth() / 2, canvas.getHeight() / 2) // center of canvas
        let radians = fabric.util.degreesToRadians(degrees)
        canvas.getObjects().forEach((obj) => {
            
            let objectOrigin = new fabric.Point(obj.left, obj.top)
            let new_loc = fabric.util.rotatePoint(objectOrigin, canvasCenter, radians)
            obj.top = new_loc.y
            obj.left = new_loc.x
            obj.angle += degrees //rotate each object by the same angle
            obj.setCoords()
            if(obj.class == 'background'){
                this.setCanavsDimentions(obj, this.cW, this.cH);
            }
        });
        canvas.renderAll()
    }

    save(){
        this.canvas.viewportTransform = [1,0,0,1,0,0];
        this.canvas.requestRenderAll();
        if(this.calib_object.unit == 0 ) {
            swal("Please calibrate your layout before.");
            return; 
        }
        if(this.calibration) this.calibration.hide();
        setTimeout(()=>{
           this.layer.save(this.calib_object.unit/this.calib_object.meters,(data)=>{
                if(this.tool == Tool.TOOL_CALIBRATE){
                    if(this.calibration) this.calibration.init();
                }
           });
        },100)
        
    }

    save_calibration(){
        if(this.calibration)
            this.calibration.save(this.layer.layout_id, (unit)=>{
                var o = null,
                objects = this.canvas.getObjects();
                for (var i = 0, len = this.canvas.size(); i < len; i++) {
                    o = objects[i];
                    if( o.class && (o.class == 'rectangle' || o.class == 'polygon' || o.class == 'circle' || o.class == 'flood')){
                        var shape = Shape.from_object(o)
                        shape.add_row_to_menu(unit);
                        this.addVisibleListner();
                    }
                }
            });
    }
    

    cancel(){
        if(this.polygon){
            this.polygon.reset();
            $('div[data-command="cancel"].item ').addClass('disabled');
        }
    }

    reset_all(){
        var this_ = this;
        swal({
            title: "Are you sure?",
            text: "Once reset, you will not be able to recover this action!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
            })
            .then((willDelete) => {
            if (willDelete) {
                var oImg = this.canvas.item(0);
                this.canvas.clear();
                this.canvas.viewportTransform = [1,0,0,1,0,0];
                this.canvas.add(oImg);
                this.canvas.requestRenderAll();
                $("#menu-shapes").html('');
                this_.save();
            }
        });
        
    }


    undo(){
        if(this.canvas._objects.length>1){
            this.h.push(this.canvas._objects.pop());
            this.canvas.renderAll();
        }
    }
    redo(){
        if(this.h.length>0){
            this.isRedoing = true;
            this.canvas.add(this.h.pop());
        }
    }

    undoPaint(){
        //this.canvas.undo();
        this.undo();
        this.refresh_menu()
    }

    redoPaint(){
        //this.canvas.redo();
        this.redo();
        this.refresh_menu()
    }
    
    updatePoly(){
        var activeObject = this.canvas.getActiveObject()
        var mPoly = new PolyManagement(this.canvas, activeObject, this.calib_object.unit/this.calib_object.meters);
        mPoly.activate();
    }

    refresh_menu(){
        $("#menu-shapes").html('');
        var o = null,
        objects = this.canvas.getObjects();
        for (var i = 0, len = this.canvas.size(); i < len; i++) {
            o = objects[i];
            if( o.class && (o.class == 'rectangle' || o.class == 'polygon' || o.class == 'circle' || o.class == 'flood')){
                var shape = Shape.from_object(o)
                shape.add_row_to_menu(this.calib_object.unit/this.calib_object.meters);
                this.addVisibleListner();
            }
        }
    }
    

    onkeydown(e){
        
        switch (e.keyCode) {
            case 46:  /* Delete */
                if(this.canvas.getActiveObject()){
                    var obj = this.canvas.getActiveObject();
                    var shape = Shape.from_object(obj)
                    shape.remove_row_from_menu(this.canvas);
                    this.canvas.remove(obj);
                    this.addVisibleListner();
                }
                break;
            case 27 /* esc */:
                if(this.polygon){
                    this.polygon.reset();
                    $('div[data-command="cancel"].item ').addClass('disabled');
                }
                break;
            case 16 /* shift */:
                if(!this.change_cursor){
                    this.old_cursor = this.canvas.hoverCursor;
                    this.change_cursor = true;
                }
                this.canvas.hoverCursor = 'grab';
                break;
            case 8:  /* Delete */
                if(this.tool == Tool.TOOL_POLYGON && this.polygon){
                    this.polygon.undo();
                }
                break;
        }
    }

    onkeyup(e){
        var evtobj = window.event? event : e
        switch (e.keyCode) {
            case 16 /* shift */:
                if (this.old_cursor != ''){
                    this.canvas.hoverCursor = this.old_cursor;
                    this.old_cursor = "";
                    this.change_cursor = false;
                    if(this.tool == Tool.TOOL_CALIBRATE) this.isDown = false;
                }
            case 90 : // Check pressed button is Z - Ctrl+Z.
                if(evtobj.ctrlKey) this.canvas.undo();
                break;
            case  89:  // Check pressed button is Y - Ctrl+Y.
                if(evtobj.ctrlKey) this.canvas.redo()
                break;
        }
    }

    handleScroll(opt) {
        var delta = opt.e.deltaY;
        var zoom = this.canvas.getZoom();
        zoom = zoom - delta/200;
        if (zoom > 10) zoom = 10;
        if (zoom < 1) zoom = 1;
        this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        //this.cMask.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
        this.canvas.requestRenderAll();
    }

    onMouseDown(opt) { 
        
        //if (! this.isDrawingShape) return; 
        var pointer = this.startPos = this.canvas.getPointer(opt.e);
        this.isDown = true;
        var evt = opt.e;
        if(this.tool == Tool.TOOL_POINTER || evt.shiftKey === true ){
            this.canvas.hoverCursor = "grabbing";
            this.canvas.isDragging = true;
            this.canvas.lastPosX = evt.clientX;
            this.canvas.lastPosY = evt.clientY;
            return;
        }
        if (this.tool == Tool.TOOL_CALIBRATE){
            this.isDown = this.calibration.mesure(opt);
            return;
        }
        if(this.tool == Tool.TOOL_MESURE){
            this.isDown = this.mesurement.mesure(opt, this.calib_object.unit/this.calib_object.meters);
            return;
        }
        switch(this.tool) {
            case Tool.TOOL_LINE:
                var points = [ pointer.x, pointer.y, pointer.x, pointer.y ];
                var id = this.generator.generate_id();
                var name = this.generator.get_line_name();
                this.shape = new Shape( id, name, ShapeType.SHAPE_LINE, this.color , this._lineWidth , {});
                this.shape.draw(this.canvas, points, this.calib_object.unit/this.calib_object.meters);
                break;
            case Tool.TOOL_RECTANGLE:
                var id = this.generator.generate_id();
                var name = this.generator.get_rect_name();
                this.shape = new Shape( id, name, ShapeType.SHAPE_RECTANGLE, this.color , this._lineWidth , {});
                this.shape.draw(this.canvas, {x: this.startPos.x , y: this.startPos.y, w:0, h:0, a:0} , this.calib_object.unit/this.calib_object.meters);
                break;
            case Tool.TOOL_CIRCLE:
                var id = this.generator.generate_id();
                var name = this.generator.get_circle_name();
                this.shape = new Shape( id, name, ShapeType.SHAPE_CIRCLE, this.color , this._lineWidth , {});
                this.shape.draw(this.canvas, {x: this.startPos.x , y: this.startPos.y, r:0, a:0} , this.calib_object.unit/this.calib_object.meters);
                break;
            case Tool.TOOL_POLYGON:
                if(this.polygon == null) this.polygon = new Polygon(this.canvas);
                var cond =  this.polygon.origin && this.polygon.origin.x +3 >= pointer.x && this.polygon.origin.x-3 <= pointer.x && this.polygon.origin.y +3 >= pointer.y && this.polygon.origin.y-3 <= pointer.y;
                if(this.polygon  && this.polygon.pointArray.length > 0 && cond ){
                    this.canvas.hoverCursor = 'crosshair';
                    var points = this.polygon.generatePolygon();
                    var id = this.generator.generate_id();
                    var name = this.generator.get_polygon_name();
                    this.shape = new Shape( id, name, ShapeType.SHAPE_POLYGON, this.color , this._lineWidth , {});
                    this.shape.draw(this.canvas, points, this.calib_object.unit/this.calib_object.meters);
                    this.polygon = null; 
                    this.isDown = false;
                    $('div[data-command="cancel"].item ').addClass('disabled');
                }else {
                    this.polygon.addPoint(opt);
                    $('div[data-command="cancel"].item ').removeClass('disabled');
                }
                break;
            
            case Tool.TOOL_PAINT_BUCKET:
                if(!this.fill){
                   this.fill = new Fill(this.canvas, this.color, 10);
                }
                var this_ = this;
                this.fill.floodFill(opt, this.color).then(img=>{
                    var id = this.generator.generate_id()
                    var name = this.generator.get_block_name();
                    this.shape = new Shape( id, name, ShapeType.SHAPE_FLOOD, this.color , this._lineWidth , {});
                    this.shape.draw(this.canvas, img, this.calib_object.unit/this.calib_object.meters);
                    this_.addVisibleListner();
                }).catch((error) => { 
                    console.log(error)
                      console.log("[WARNING] " + error);
                });
                break;
            case Tool.TOOL_ERASER:
                if(opt.target && opt.target.class != 'background' &&  opt.target.class != 'box'  &&  opt.target.class != 'calibration'){
                    opt.target.set({
                        hasControls : false,
                        hasBorders : false,
                        lockRotation : true,
                        lockScalingX : true,
                        lockScalingY : true,
                        lockMovementX : true,
                        lockMovementY : true,
                    })
                    var shape = Shape.from_object(opt.target)
                    shape.remove_row_from_menu(canvas);
                    this.canvas.remove(opt.target);
                    this.addVisibleListner();
                }
                break;
            case Tool.TOOL_ZOOM_IN :
                var zoom = this.canvas.getZoom();
                zoom = zoom + 0.5;
                if (zoom > 20) zoom = 20;
                this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                //this.cMask.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                opt.e.preventDefault();
                opt.e.stopPropagation();
                break;
            case Tool.TOOL_ZOOM_OUT :
                var zoom = this.canvas.getZoom();
                zoom = zoom - 0.5;
                if (zoom < 1) zoom = 1;
                this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                //this.cMask.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
                opt.e.preventDefault();
                opt.e.stopPropagation();
                break;
            case Tool.TOOL_INFO :
                if(opt.target && opt.target.class != 'background' && opt.target.class != 'box'  &&  opt.target.class != 'calibration'){
                    opt.target.set({
                        hasControls : false,
                        hasBorders : false,
                        lockRotation : true,
                        lockScalingX : true,
                        lockScalingY : true,
                        lockMovementX : true,
                        lockMovementY : true,
                    })
                    Shape.remove_centroids(this.canvas);
                    var shape = Shape.from_object(opt.target)
                    shape.show_info(this.calib_object.unit/this.calib_object.meters);
                    shape.show_centroid(this.canvas);
                    $('#body-msg').show();
                }else{
                    Shape.remove_centroids(this.canvas);
                    $('#body-msg').hide();
                }
                break;
            /*case Tool.TOOL_PIXEL:
                let pos = this.canvas.getPointer(opt.e)
                var idx = this.segmentation.select_segment(pos);
                var superPixel = new SuperPixel(this.segmentation.pixelIndex[idx], idx);
                var rects = superPixel.draw('superpixel');
                var group = new fabric.Group(rects, {
                    selectable: false
                  });
                this.canvas.add(group);
                break;*/
        }
        this.addVisibleListner();
        
    }

    onMouseMove(opt){
        if (!this.isDown) return;
        var pointer = this.currentPos = this.canvas.getPointer(opt.e);
        var evt = opt.e;
        var pointer = this.canvas.getPointer(opt.e);
        if(this.tool == Tool.TOOL_POINTER || evt.shiftKey === true ){
            if (this.canvas.isDragging) {
                var e = opt.e;
                this.canvas.viewportTransform[4] += e.clientX - this.canvas.lastPosX;
                this.canvas.viewportTransform[5] += e.clientY - this.canvas.lastPosY;
                this.canvas.requestRenderAll();
                this.canvas.lastPosX = e.clientX;
                this.canvas.lastPosY = e.clientY;
            }
            return;
        } 
        if (this.tool == Tool.TOOL_ERASER){
            if(opt.target && opt.target.class != 'background' && opt.target.class != 'box'  &&  opt.target.class != 'calibration'){
                var shape = Shape.from_object(opt.target)
                shape.remove_row_from_menu(canvas);
                this.canvas.remove(opt.target);
                this.addVisibleListner();
            }
            return;
        }

        if (this.tool == Tool.TOOL_CALIBRATE){
            this.calibration.update(opt);
            return;
        }

        if (this.tool == Tool.TOOL_MESURE){
            this.mesurement.update(opt);
            return;
        }

        if(this.shape || this.polygon  ){
            switch(this.tool) {
                case Tool.TOOL_LINE:
                    this.shape.update(this.canvas, { x2: pointer.x, y2: pointer.y }, this.calib_object.unit/this.calib_object.meters );
                    break;
                case Tool.TOOL_RECTANGLE:
                    this.shape.update(this.canvas, {sx: this.startPos.x, sy: this.startPos.y, x: this.currentPos.x , y: this.currentPos.y}, this.calib_object.unit/this.calib_object.meters);
                    break;
                case Tool.TOOL_CIRCLE:
                    this.shape.update(this.canvas, {sx: this.startPos.x, sy: this.startPos.y, x: this.currentPos.x , y: this.currentPos.y}, this.calib_object.unit/this.calib_object.meters);
                    break;
                case Tool.TOOL_POLYGON:
                    /*console.log(opt.target);
                    var point= this.polygon.pointArray[0];
                    var target_top=opt.target.top;
                    var target_left=opt.target.left;
                    var target_height=opt.target.height;
                    var target_width= opt.target.width;

                    var cond = (target_top == point.top)&& (target_left==point.left) ;
                    if(pointer.x  && this.polygon.pointArray.length > 0 &&  cond)//opt.target.id == this.polygon.pointArray[0].id)*/
                    var cond =  this.polygon.origin && this.polygon.origin.x +3 >= pointer.x && this.polygon.origin.x-3 <= pointer.x && this.polygon.origin.y +3 >= pointer.y && this.polygon.origin.y-3 <= pointer.y;
                    if(this.polygon  && this.polygon.pointArray.length > 0  && cond )//opt.target.id == this.polygon.pointArray[0].id)
                        this.canvas.hoverCursor = 'cell';
                    else this.canvas.hoverCursor = 'crosshair';
                    if(this.polygon.activeLine && this.polygon.activeLine.class == "line"){
                        this.polygon.activeLine.set({ x2: pointer.x, y2: pointer.y });
                        var points = this.polygon.activeShape.get("points");
                        points[this.polygon.pointArray.length] = {
                            x:pointer.x,
                            y:pointer.y
                        }
                        this.polygon.activeShape.set({
                            points: points
                        });
                        this.canvas.renderAll();
                    }
                    break;
            }
            this.canvas.renderAll();
        }
    }

    onMouseUp(opt){
        var evt = opt.e;
        if(this.tool == Tool.TOOL_POINTER || evt.shiftKey === true ){
            this.canvas.isDragging = false;
            this.canvas.hoverCursor = "grab";
            return;
        }
        if(this.tool != Tool.TOOL_POLYGON && this.tool != Tool.TOOL_CALIBRATE && this.tool != Tool.TOOL_MESURE){
            this.isDown = false;
        }
        if (this.shape){
            this.shape = null;
            this.addVisibleListner();
        }
        //this.isDrawingShape = false;
    }

    /**
     * Setters
     */

    set visiblity(mode){
        var canvas = this.canvas;
        if(mode == false){
            var o = null,
                objects = this.canvas.getObjects();
            for (var i = 0, len = this.canvas.size(); i < len; i++) {
                o = objects[i];
                if( o.class != "background"){
                    var shape = Shape.from_object(o)
                    shape.hide(canvas);
                }
            }
        }else {
            var o = null,
                objects = this.canvas.getObjects();
            for (var i = 0, len = this.canvas.size(); i < len; i++) {
                o = objects[i];
                if( o.class != "background"){
                    var shape = Shape.from_object(o)
                    shape.show(canvas);
                }
            }
        }
    }

    set drawingMode(mode){
        this.isDrawingShapeMode = mode;
        var canvas = this.canvas;
        if(mode == true){
            this.canvas.forEachObject(function(o) {
                var shape = Shape.from_object(o)
                shape.disable(canvas);
              }).selection = false;
        }else {
            this.canvas.forEachObject(function(o) {
                if(o.class && (o.class == 'line' || o.class == 'rectangle' || o.class == 'circle' || o.class == 'polygon')){
                    var shape = Shape.from_object(o)
                    shape.activate(canvas);
                    if(o.class != "polygon"){
                        o.cornerStyle = 'rect';
                        o.controls = fabric.Object.prototype.controls;
                        o.hasBorders = true;
                    }
                }
              }).selection = false;
            this.canvas.item(0).selectable = false;
        }
        this.canvas.renderAll();
    }

    set activeTool(tool) {
        this.tool = tool;
        if(this.tool != Tool.TOOL_INFO ){
            Shape.remove_centroids(this.canvas);
            $('#body-msg').hide();
        }
    }

    set activate_pencil(status){
        this.canvas.isDrawingMode = status;
        this.canvas.freeDrawingBrush.width = this._lineWidth;
        this.canvas.freeDrawingBrush.color = this.color;
    } 

    set selectedColor(color) {
        this.color = color;
        this.canvas.freeDrawingBrush.color = this.color;
    }

    set lineWidth(lineWidth) {
        this._lineWidth = parseInt(lineWidth);
        this.canvas.freeDrawingBrush.width = this._lineWidth;
    }
    // To set shapes and pencel stroke size
    

    // To set brush stroke size
    set brushSize(brushSize) {
        this._brushSize = brushSize;
        this.current_layer._brushSize = this._brushSize;
    }

    set cursor(cursor) {
        this.canvas.hoverCursor = cursor;
    }

    set calibrate(status){
        if(status){
            $('div[data-calibration].item ').removeClass('disabled');
            this.canvas.selection = false;
            this.canvas.isDrawingMode = false;
            this.canvas.renderOnAddRemove = false;
            this.canvas.forEachObject((o) =>{
                var shape = Shape.from_object(o);
                shape.disable(this.canvas);
              }).selection = false;
            if(!this.calibration) this.calibration = new Calibration(this.canvas, this.calib_object);
            if(this.calibration){
                this.calibration.init();
                this.calibration.calib_mode = 'draw';
                document.querySelector("[data-calibration].active").classList.toggle("active");
                document.querySelector("[data-calibration='sdraw']").classList.toggle("active");
            }
        }else {
            if(this.calibration){
                this.calibration.hide();
                $('div[data-calibration].item ').addClass('disabled');
            }
        }
    }

    set mesure_tool(status){
        if(status){
            this.canvas.forEachObject((o) =>{
                var shape = Shape.from_object(o);
                shape.disable(this.canvas);
              }).selection = false;
            if(!this.mesurement) this.mesurement = new Mesurement(this.canvas);
        } else {
            if(this.mesurement){
                this.mesurement.hide();
            }
        }
    }

    set gravity_center(status){
        if(status){
            this.layer.show_gravity(this.calib_object.unit/this.calib_object.meters);
        }else {
            this.layer.hide_gravity();
        }
    }

    set calibration_mode(mode){
        if(this.calibration) this.calibration.calib_mode = mode;
    }




}
