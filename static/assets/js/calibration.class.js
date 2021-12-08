import CLineTool from './cline.class.js';
import Utility from './utility.class.js';
export default class Calibration{
    
    constructor(canvas, calib_object) {
      this.calib_object = calib_object;
      this.value = calib_object.unit;
      this.canvas = canvas;
      this.pointArray = new Array();
      this.lineArray = new Array();
      this.activeLine = null;
      this.cline = null;
      this.box = null;
      this.mode='draw';
      if(this.calib_object.x1 && this.calib_object.width && this.calib_object.y1 && this.calib_object.height){
        this.box = new fabric.Rect({
          left: this.calib_object.x1,
          top: this.calib_object.y1,
          originX: 'left',
          originY: 'top',
          excludeFromExport : true,
          width: this.calib_object.width,
          height: this.calib_object.height,
          angle: 0,
          opacity : 0.3,
          stroke: 'red',
          fill : 'red',
          strokeWidth: 1,
          selectable: true,
          class : 'box',
        });
        this.canvas.add(this.box);
        this.canvas.renderAll();
      }
      if (this.calib_object.unit != 0){
        var points = [new fabric.Point(calib_object.lx1, calib_object.ly1), new fabric.Point(calib_object.lx2, calib_object.ly2)];
        if(this.cline) this.cline.reset();
        this.cline = new CLineTool(this.canvas);
        this.cline.draw(points);
        var factor =  this.canvas.item(0).width / this.canvas.width
        this.value = this.cline.getLength() * factor;
        $('#echelle').html(Math.round(this.value, 0))
      }
    }

    mesure(opt){
      if(this.mode =='draw'){
        if(this.cline) this.cline.reset();
        if(this.pointArray.length == 0){
            var pointer = this.startPos = this.canvas.getPointer(opt.e);
            var circle = new fabric.Circle({
              radius: 2/this.canvas.getZoom(),
              fill: 'red',
              stroke: '#333333',
              strokeWidth: 0.5/this.canvas.getZoom(),
              left: pointer.x,
              top: pointer.y,
              selectable: false,
              hasBorders: false,
              hasControls: false,
              originX:'center',
              originY:'center',
            });
          var points = [pointer.x, pointer.y, pointer.x, pointer.y];
          var line = new fabric.Line(points, {
            strokeWidth: 0.5,
            fill: '#2FE5A8',
            stroke: '#2FE5A8',
            class: 'linecal',
            originX:'center',
            originY:'center',
            opacity: 1,
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false,
          });
          this.activeLine = line;
          this.pointArray.push(circle);
          this.lineArray.push(line);
          this.canvas.add(line);
          this.canvas.add(circle);
          this.canvas.renderAll();
        } else if(this.pointArray.length == 1){
            var pointer = this.startPos = this.canvas.getPointer(opt.e);
            var circle = new fabric.Circle({
              radius: 2/this.canvas.getZoom(),
              fill: 'red',
              stroke: '#333333',
              strokeWidth: 0.5/this.canvas.getZoom(),
              left: pointer.x,
              top: pointer.y,
              selectable: false,
              hasBorders: false,
              hasControls: false,
              originX:'center',
              originY:'center',
            });
            this.pointArray.push(circle);
            this.canvas.add(circle);
            this.canvas.renderAll();
            this.activeLine = null;
            this.done();
            return false;
        }
      }  
      return true;    
    }

    update(opt){
      var pointer = this.currentPos = this.canvas.getPointer(opt.e);
      if(this.mode =='draw'){
          if(this.activeLine && this.activeLine.class == "linecal"){
          this.activeLine.set({ x2: pointer.x, y2: pointer.y });
          this.canvas.renderAll();
        }
      }
      if(this.cline){
        var factor =  this.canvas.item(0).width / this.canvas.width
        this.value = this.cline.getLength() * factor;
        $('#echelle').html(Math.round(this.value, 0))
      }
      
    }


    done(){
        var points = new Array();
        $.each(this.pointArray,function(index,point){
          points.push({
            x:point.left,
            y:point.top
          });
          this.canvas.remove(point);
        });
        $.each(this.lineArray,function(index,line){
            this.canvas.remove(line);
        });
        this.pointArray = [];
        this.lineArray = [];
        this.cline = new CLineTool(this.canvas);
        this.cline.draw(points);
        var factor =  this.canvas.item(0).width / this.canvas.width
        this.value = this.cline.getLength() * factor;
        $('#echelle').html(Math.round(this.value, 0))
    }

    hide(){
        if(this.box) this.canvas.remove(this.box);
        if(this.cline) this.cline.reset();
        this.canvas.renderAll();
        $('#echelle').html(Math.round(this.calib_object.unit, 0))
    }

    init(){
      if(this.box){
        var o = null, objects = this.canvas.getObjects();
        for (var i = 0, len = this.canvas.size(); i < len; i++) {
            o = objects[i];
            if(o.class == 'box')
              this.canvas.remove(o);
        }
        this.canvas.add(this.box);
      }
      if(this.cline){
        this.cline.reset();
        var points = [new fabric.Point(this.calib_object.lx1, this.calib_object.ly1), new fabric.Point(this.calib_object.lx2, this.calib_object.ly2)];
        this.cline.draw(points);
      } 
      this.canvas.renderAll();
    }

  save(id , callback){
    $('div.spinner').show()
    var scale = parseFloat($("#echelle").html());
    if(this.cline || scale  ){
      var factor =  this.canvas.item(0).width / this.canvas.width
      var lx1 = this.cline && this.cline.startPoint.x * factor || this.calib_object.lx1 * factor;
      var lx2 = this.cline && this.cline.endPoint.x * factor || this.calib_object.lx2 * factor;
      var ly1 = this.cline && this.cline.startPoint.y * factor || this.calib_object.ly1 * factor;
      var ly2 = this.cline && this.cline.endPoint.y * factor || this.calib_object.ly2 * factor;
      var x1 = this.box && this.box.left * factor || this.calib_object.x1 * factor;
      var width = this.box && this.box.width * factor || this.calib_object.width * factor;
      var y1 = this.box && this.box.top * factor || this.calib_object.y1 * factor;
      var height = this.box && this.box.height * factor || this.calib_object.height * factor;
      var mNumber = parseFloat($("#mNumber").html());
      this.calib_object.meters = mNumber;
      this.calib_object.unit = this.value;
      this.calib_object.lx1 = lx1 / factor;
      this.calib_object.lx2 = lx2 / factor;
      this.calib_object.ly1 = ly1 / factor;
      this.calib_object.ly2 = ly2 / factor;
      this.calib_object.x1 = x1 / factor;
      this.calib_object.y1 = y1 / factor;
      this.calib_object.width = width / factor;
      this.calib_object.height = height / factor;
      callback(this.value/mNumber);
      var formdata = new FormData();
      formdata.append("x1", x1 );
      formdata.append("y1", y1);
      formdata.append("width", width );
      formdata.append("height", height);
      formdata.append("lx1", lx1 );
      formdata.append("ly1", ly1);
      formdata.append("lx2", lx2);
      formdata.append("ly2", ly2);
      formdata.append("meters", mNumber);
      formdata.append("unit", this.value);
      formdata.append("layout_id", id);
      Utility.post_request('/layout/calibrate', formdata, (data)=>{ 
        console.log(data);
        setTimeout(() => $('div.spinner').hide() , 200);
      });
    } else{
      $('div.spinner').hide();
      swal("Please calibrate your layout before.");
      return;
    }
  }

  set calib_mode(mode){
    this.mode = mode;
    if(this.mode == 'move'){
      this.canvas.hoverCursor = 'move'
      this.box.set({
        selectable : true,
        hasControls : true,
        hasBorders : true,
        lockRotation : false,
        lockScalingX : false,
        lockScalingY : false,
        lockMovementX : false,
        lockMovementY : false,
        transparentCorners: false,
        cornerColor: 'yellow',
        cornerStrokeColor: 'blue',
        borderColor: 'blue',
        cornerSize: 12,
        padding: 10,
        cornerStyle: 'square',
        borderDashArray: [3, 3]
      }).setCoords();
    } else {
      this.canvas.hoverCursor = 'crosshair';
      if(this.box){
        this.box.set({
          selectable : false,
          hasControls : false,
          hasBorders : false,
          lockRotation : true,
          lockScalingX : true,
          lockScalingY : true,
          lockMovementX : true,
          lockMovementY : true,
        });
      }
    }
  }
}