import Utility from './utility.class.js';
export default class Calibration{
    
    constructor(canvas, calib_object) {
      this.calib_object = calib_object;
      this.value = calib_object.unit;
      this.canvas = canvas;
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
          //objectCaching:false
        });
        this.canvas.add(this.box);
        this.canvas.renderAll();
      }
      this.line = null;
      if (this.calib_object.unit != 0){
        var points = [calib_object.lx1, calib_object.ly1, calib_object.lx2, calib_object.ly2];
        if(this.line) this.canvas.remove(this.line);
        this.line = new fabric.Line(points, {
          strokeWidth: '2',
          fill: 'blue',
          opacity: 1,
          stroke: 'blue',
          originX: 'left',
          originY: 'top',
          class : 'calibration',
          selectable : false
        });
        this.canvas.add(this.line);
        this.canvas.renderAll();
      }
      
    }

    set calib_mode(mode){
      this.mode = mode;
      if(this.mode == 'move'){
        this.canvas.hoverCursor = 'move'
        if(this.line){
          this.line.set({
            selectable : true,
            hasControls : true,
            hasBorders : false,
            lockRotation : false,
            lockScalingX : true,
            lockScalingY : true,
            lockMovementX : false,
            lockMovementY : false,
            transparentCorners: false,
            cornerColor: 'yellow',
            cornerStrokeColor: 'blue',
            borderColor: 'blue',
            cornerSize: 10,
            padding: 4,
            cornerStyle: 'square',
            borderDashArray: [3, 3]
          }).setCoords();
        }
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
        //this.canvas.off('object:modified');
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
            //evented: false
          });
        }
      }
    }

    mesure(opt){
      if(this.mode =='draw'){
        if(this.line) this.canvas.remove(this.line);
        var pointer = this.currentPos = this.canvas.getPointer(opt.e);
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];
        this.line = new fabric.Line(points, {
          strokeWidth: 1,
          fill: 'blue',
          opacity: 1,
          stroke: 'blue',
          originX: 'left',
          originY: 'top',
          class : 'calibration',
          excludeFromExport : true,
          selectable : false
        });
        this.canvas.add(this.line);
        this.canvas.renderAll();
      }      
    }

    update(opt, ){
      if(this.mode =='draw'){
        var pointer = this.currentPos = this.canvas.getPointer(opt.e);
        var evt = opt.e;
        if((evt.altKey === false ) && this.line){
          this.line.set({ x2: pointer.x, y2: pointer.y });
          this.canvas.renderAll();
        }
      }if(this.line){
        var factor =  this.canvas.item(0).width / this.canvas.width
        this.value = Math.max(Math.abs(this.line.x2-this.line.x1), Math.abs(this.line.y2-this.line.y1)) * factor
        $('#echelle').html(Math.round(this.value, 0))
        this.calib_object.unit = this.value;
      }
      
    }

    hide(){
      if(this.box) this.canvas.remove(this.box);
      if(this.line) this.canvas.remove(this.line);
      this.canvas.renderAll();
    }

    init(){
      if(this.box){
        var found = false;
        var o = null, objects = this.canvas.getObjects();
        for (var i = 0, len = this.canvas.size(); i < len; i++) {
            o = objects[i];
            if(o.class == 'box')
              this.canvas.remove(o);
        }
        //if(found) this.canvas.remove(o);
      }
      if(this.line){
        var found = false;
        var o = null, objects = this.canvas.getObjects();
        for (var i = 0, len = this.canvas.size(); i < len; i++) {
            o = objects[i];
            if(o.class == 'calibration') {
              found = true;
              this.canvas.remove(o);
            }
         //if (found) this.canvas.remove(o);     
              
        }
      }
      if(this.box) this.canvas.add(this.box);
      if(this.line) this.canvas.add(this.line);
      this.canvas.renderAll();
    }

    save(id , callback){
      $('div.spinner').show()
      var scale = parseFloat($("#echelle").html());
      if(this.line || scale  ){
        var factor =  this.canvas.item(0).width / this.canvas.width
        var lx1 = this.line && this.line.x1 * factor || this.calib_object.lx1;
        var lx2 = this.line && this.line.x2 * factor || this.calib_object.lx2;
        var ly1 = this.line && this.line.y1 * factor || this.calib_object.ly1;
        var ly2 = this.line && this.line.y2 * factor || this.calib_object.ly2;
        var x1 = this.box && this.box.left * factor || this.calib_object.x1;;
        var width = this.box && this.box.width * factor || this.calib_object.width;;
        var y1 = this.box && this.box.top * factor || this.calib_object.y1;;
        var height = this.box && this.box.height * factor || this.calib_object.height;
        var mNumber = parseFloat($("#mNumber").html());
        this.calib_object.meters = mNumber;
        this.calib_object.unit = this.value;
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
}