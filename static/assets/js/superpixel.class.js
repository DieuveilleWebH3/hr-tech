
export default class SuperPixel{

    constructor(points, idx){
        this.points = points;
        this.idx = idx;
    }

    draw(type){
        var shapes = [];
        if (this.points  != undefined && this.points != null && this.points.length>0){
            for (var i = 0 ; i< this.points.length; i++ ) {
                /*var shape = new fabric.Rect({
                    left: this.points[i].point_1.x,
                    top: this.points[i].point_1.y,
                    originX: 'left',
                    originY: 'top',
                    width:  this.points[i].w,
                    height:  this.points[i].h,
                    angle: 0,
                    class: type,
                    fill: 'rgba(255,0,0,0.5)',
                    selectable: false
                });*/
                var shape = new fabric.Rect({
                    left: this.points[i].x,
                    top: this.points[i].y,
                    originX: 'left',
                    originY: 'top',
                    width:  1,
                    height:  1,
                    angle: 0,
                    class: type,
                    fill: 'rgba(255,0,0,0.5)',
                    selectable: false
                });
                shapes.push(shape);
            }
        }
        return shapes;
    }

}
