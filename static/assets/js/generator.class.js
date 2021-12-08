import ShapeType from './shape_type.class.js';
export default class Generator{

    constructor(){
        this.cpt_line = 1;
        this.cpt_rect = 1;
        this.cpt_circle = 1;
        this.cpt_polygon = 1;
        this.cpt_block = 1;
    }

    generate_id(){
        var min = 99;
        var max = 999999;
        var random = Math.floor(Math.random() * (max - min + 1)) + min;
        var id = new Date().getTime() + random;
        return id
    }

    get_line_name(){
        var name =  'Line_' + this.cpt_line;
        this.cpt_line +=1;
        return name;
    }

    get_rect_name(){
        var name =  'Rect_' + this.cpt_rect;
        this.cpt_rect +=1;
        return name;
    }

    get_circle_name(){
        var name =  'Circle_' + this.cpt_circle;
        this.cpt_circle +=1;
        return name;
    }

    get_polygon_name(){
        var name =  'Poly_' + this.cpt_polygon;
        this.cpt_polygon +=1;
        return name;
    }

    get_block_name(){
        var name =  'Block_' + this.cpt_block;
        this.cpt_block +=1;
        return name;
    }

    change(type_){
        switch(type_){
            case ShapeType.SHAPE_POLYGON:
                this.cpt_polygon+=1;
                break;
            case ShapeType.SHAPE_LINE:
                this.cpt_line+=1;
                break;
            case ShapeType.SHAPE_RECTANGLE: 
                this.cpt_rect+=1;
                break;
            case ShapeType.SHAPE_CIRCLE: 
                this.cpt_circle+=1;
                break;
            case ShapeType.SHAPE_FLOOD:
                this.cpt_block+=1; 
                break;
        }
    }
}
    