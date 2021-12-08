import CLineTool from './cline.class.js';
export default class Mesurement{
    
    constructor(canvas) {
      this.canvas = canvas;
      this.pointArray = new Array();
      this.lineArray = new Array();
      this.activeLine = null;
      this.cline = null;
      this.mode='draw';
    }

    mesure(opt, unit){
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
            class: 'lineM',
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
            this.done(unit);
            return false;
        }
      }  
      return true;    
    }

    update(opt){
      var pointer = this.currentPos = this.canvas.getPointer(opt.e);
      if(this.mode =='draw'){
          if(this.activeLine && this.activeLine.class == "lineM"){
          this.activeLine.set({ x2: pointer.x, y2: pointer.y });
          this.canvas.renderAll();
        }
      }
      
    }


    done(unit){
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
        var value = (this.cline.getLength() * factor / unit).toFixed(2);
        swal('The distance mesured is: '+value+ ' m');
    }

    hide(){
        if(this.cline) this.cline.reset();
        this.canvas.renderAll();
    }
}