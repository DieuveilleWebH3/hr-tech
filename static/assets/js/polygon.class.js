export default class Polygon { 

    constructor(canvas) {
        this.canvas = canvas;
        this.pointArray = new Array();
        this.lineArray = new Array();
        this.activeShape = false;
        this.activeLine = null;
        this.origin = null;
    }

    reset(){
        $.each(this.pointArray,function(index,point){
            this.canvas.remove(point);
        });
        $.each(this.lineArray,function(index,line){
            this.canvas.remove(line);
        });
        if (this.activeShape)
            this.canvas.remove(this.activeShape);
        if(this.activeLine)
            this.canvas.remove(this.activeLine);
        this.activeLine = null;
        this.activeShape = null;
        this.pointArray = [];
        this.lineArray = [];
    }

    addPoint(options) {
        var pointer = this.canvas.getPointer(options.e);
        
        var min = 99;
        var max = 999999;
        var random = Math.floor(Math.random() * (max - min + 1)) + min;
        var id = new Date().getTime() + random;
        var circle = new fabric.Circle({
            radius: 5/this.canvas.getZoom(),
            fill: '#008000',
            stroke: '#333333',
            strokeWidth: 0.5/this.canvas.getZoom(),
            left: pointer.x,
            top: pointer.y,
            selectable: false,
            hasBorders: false,
            hasControls: false,
            /*originX: 'left',
            originY: 'top',*/
            originX:'center',
            originY:'center',
            id:id,
            //objectCaching:false
        });
        if(this.pointArray.length == 0){
            this.origin = pointer;
            circle.set({
                fill:'red'
            })
        }
        var points = [pointer.x, pointer.y, pointer.x, pointer.y];
        var line = new fabric.Line(points, {
            strokeWidth: 0.5,
            fill: '#2FE5A8',
            stroke: '#2FE5A8',
            class:'line',
            originX:'center',
            originY:'center',
            opacity: 0.5,
            /*originX: 'left',
            originY: 'top',*/
            selectable: false,
            hasBorders: false,
            hasControls: false,
            evented: false,
            //objectCaching:false
        });
        if(this.activeShape){
            var pos = this.canvas.getPointer(options.e);
            var points = this.activeShape.get("points");
            points.push({
                x: pos.x,
                y: pos.y
            });
            var polygon = new fabric.Polygon(points,{
                stroke:'#333333',
                strokeWidth:1,
                fill: '#8196A9',
                opacity: 0.3,
                selectable: false,
                hasBorders: false,
                hasControls: false,
                evented: false,
                objectCaching:false
            });
            this.canvas.remove(this.activeShape);
            this.canvas.add(polygon);
            this.activeShape = polygon;
            this.canvas.renderAll();
        }
        else{
            var polyPoint = [{x: pointer.x, y: pointer.y}];
            var polygon = new fabric.Polygon(polyPoint,{
                stroke:'#333333',
                strokeWidth:1,
                fill: '#cccccc',
                opacity: 0.3,
                selectable: false,
                hasBorders: false,
                hasControls: false,
                evented: false,
                objectCaching:false
            });
            this.activeShape = polygon;
            this.canvas.add(polygon);
        }
        this.activeLine = line;

        this.pointArray.push(circle);
        this.lineArray.push(line);

        this.canvas.add(line);
        this.canvas.add(circle);
        this.canvas.selection = false;
    }

    generatePolygon (){
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
        this.canvas.remove(this.activeShape).remove(this.activeLine);
        this.activeLine = null;
        this.activeShape = null;
        this.canvas.selection = false;
        this.pointArray = [];
        this.lineArray = [];
        return points
    }

    undo(){
        var point = this.pointArray.pop();
        var line = this.lineArray.pop();
        this.canvas.remove(point);
        this.canvas.remove(line);
        line = this.lineArray.pop();
        this.canvas.remove(line);
        this.activeShape.get('points').pop();
        this.canvas.renderAll();
    }
}
        