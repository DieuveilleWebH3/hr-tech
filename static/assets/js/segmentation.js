/** Image segmentation factory.
 *
 *  var segm = segmentation.create(imageData);
 *  var segmentData = segm.result;  // imageData with numSegments.
 *
 *  segm.finer();
 *  segm.coarser();
 *
 * Copyright 2015  Kota Yamaguchi 
 */
 
import PFF from './segmentation/pff.js';
import SLIC from './segmentation/slic.js';
import SLICO from './segmentation/slico.js';
import Utility from './utility.class.js';      
import Point from './point.class.js';  

var methods = {
  pff: PFF, 
  slic: SLIC,
  slico: SLICO 
};

methods.create = function (imageData, options) {
  options = options || {};
  options.method = options.method || "slic";
  if (!methods[options.method])
    throw "Invalid method: " + options.method;
  return new methods[options.method](imageData, options);
};

export default class Segmentation{
  
  constructor(img, cMask, options){
    var canvas = document.createElement('canvas')
    canvas.width = cMask.width;
    canvas.height = cMask.height;
    var ctx = this.ctx = canvas.getContext('2d');
    /*var body = document.getElementsByTagName("body")[0];
    body.appendChild(tmpCanvas);*/
    var image = new Image();
    
    image.onload =  () => {
      this.ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
      this.canvas = canvas;
      this.cMask = cMask;
      this.shapes = []
      this.pixelIndex = [];
      this.ctxMask = cMask.getContext('2d');
      var imageData = this.imageData =  this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      var maskData= this.ctxMask.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this.segmentation = methods.create(imageData, options);
      imageData.data.set(this.segmentation.result.data)
      this.ctx.putImageData(imageData, 0, 0);
      var data = this._computeEdgemap(imageData , {});
      this.ctxMask.putImageData(data, 0, 0);
      this._createPixelIndex(this.segmentation.result.numSegments, this.segmentation.result.data, imageData.width);
      var body = document.getElementsByTagName("body")[0];
      body.appendChild(canvas);
    };
    image.src = img;
  }


  async _createPixelIndex (numSegments, data, width) {
    //$("#echelle").html(numSegments);
    console.log(numSegments)
    var pixelIndex = new Array(numSegments),
        i;
    for (i = 0; i < numSegments; ++i)
      pixelIndex[i] = [];
    this.pixelIndex = [];
    for (i = 0; i < numSegments; ++i)
      this.pixelIndex[i] = [];
    for (i = 0; i < data.length; i += 4) {
      var index = data[i] | (data[i + 1] << 8) | (data[i + 2] << 16);
      var x = (i/4) % width;
      var y =  Math.floor((i / 4) / width);
      pixelIndex[index].push(new Point(x,y));
    }

    /*for (i = 0; i < pixelIndex.length; i++) {
        this.pixelIndex[i] = this.generate_rectangles(pixelIndex[i]);
        this.shapes = [];
    }*/
    this.pixelIndex = pixelIndex;
    console.log(this.pixelIndex);
  }


   _computeEdgemap(imageData, options) {
    if (typeof options === "undefined") options = {};
    var data = imageData.data,
        width = imageData.width,
        height = imageData.height,
        edgeMap = new Uint8Array(imageData.data),
        foreground = options.foreground || [0, 0, 255,100],
        background = options.background || [0, 0, 0, 0],
        i, j, k;
    for (i = 0; i < height; ++i) {
      for (j = 0; j < width; ++j) {
        var offset = 4 * (i * width + j),
            index = data[4 * (i * width + j)],
            isBoundary = (i === 0 ||
                          j === 0 ||
                          i === (height - 1) ||
                          j === (width - 1) ||
                          index !== data[4 * (i * width + j - 1)] ||
                          index !== data[4 * (i * width + j + 1)] ||
                          index !== data[4 * ((i - 1) * width + j)] ||
                          index !== data[4 * ((i + 1) * width + j)]);
        if (isBoundary) {
          for (k = 0; k < foreground.length; ++k)
            edgeMap[offset + k] = foreground[k];
        }
        else {
          for (k = 0; k < background.length; ++k)
            edgeMap[offset + k] = background[k];
        }
      }
    }
    data.set(edgeMap);
    return imageData;
  }

  updateSuperpixels (output_layer) {
    this.output_layer = output_layer;
    var imageData = this.superpixel_layer.imageData;
     imageData.data.set(this.segmentation.result.data);
     this.superpixel_layer.imageData = imageData;
     this._createPixelIndex(this.segmentation.result.numSegments);
     //let image_data = Utility.getMaskedImageData(this.superpixel_layer.context, this.surface_layer.imageData.data, true);
     //this.superpixel_layer.imageData = image_data;
     //this.boundary_layer.imageData = image_data;
     this.boundary_layer.imageData  = Utility.copyImageData(this.superpixel_layer.context,this.superpixel_layer.imageData );
     var data = this._computeEdgemap(this.boundary_layer.imageData , {});
     this.boundary_layer.imageData = data;
     this.superpixel_layer.alpha = 0;
     this.boundary_layer.alpha = 0;
     //this.boundary_layer.imageData = Utility.getMaskedImageData(this.boundary_layer.context, this.surface_layer.imageData.data, true);
     this.output_layer.alpha = 100;
     $("#canvas_9").hide();
     this.output_layer.redraw_only_shape();

  }

  update(){
    this.boundary_layer.imageData = this.superpixel_layer.imageData;
    var data = this._computeEdgemap(this.boundary_layer.imageData , {});
    this.boundary_layer.imageData = data;
    this.superpixel_layer.alpha = 0;
    this.output_layer.alpha = 0;
    $("#canvas_9").hide();
    
  }

  
  _getEncodedLabel(array, offset) {
      return array[offset] | (array[offset + 1] << 8) | (array[offset + 2] << 16);
  }
  

  select_segment(pos){
    var offset = 4 * (Math.round(pos.y) * this.canvas.width + Math.round(pos.x));
    var superpixelData =  this.segmentation.result.data,
    superpixelIndex = this._getEncodedLabel(superpixelData, offset);
    return superpixelIndex;
  }

  get_pixels(idx){
    return this.pixelIndex[idx];
  }


  
  generate_rectangles(points){
    if (points.length == 0 ) return this.shapes;
    var point = points[Math.floor(Math.random() * points.length)];
    //var point = points[0];
    points = points.filter(elem => point.x != elem.x || point.y != elem.y)
    var w = 1;
    var h = 1;
    var shape = new Rectangle(new Point(point.x, point.y), w, h);
    var addG = true;
    var addD = true;
    var addH = true;
    var addB = true;
    

    while (addH){
      for(var i = 0; i < w; i ++ ){
        if ( !points.find( elem => shape.point_1.x+i == elem.x && shape.point_1.y-1 == elem.y )){
          addH = false;
          break;
        }
      }
      if (addH){
          
          points = points.filter(elem => shape.point_1.x > elem.x || shape.point_1.x+shape.w <= elem.x || shape.point_1.y-1 != elem.y)
          shape = new Rectangle(new Point(shape.point_1.x, shape.point_1.y-1), shape.w, shape.h+1);
         // console.log("ajouté H")
      } 
    }
    while (addB){
      for(var i = 0; i < w; i ++ ){
        if ( !points.find( elem => shape.point_1.x+i == elem.x && shape.point_1.y+shape+h == elem.y )){
          addB = false;
          break;
        }
      }
      if (addB){
          
          points = points.filter(elem => shape.point_1.x > elem.x || shape.point_1.x+shape.w <= elem.x || shape.point_1.y + shape.h  != elem.y)
          shape = new Rectangle(shape.point_1, shape.w, shape.h+1);
          //console.log("ajouté B")
      } 
    }

    while (addG){
      for(var i = 0; i < h; i ++ ){
        if ( !points.find( elem => shape.point_1.x-1 == elem.x && shape.point_1.y+i == elem.y )){
          addG = false;
          break;
        }
      }
      if (addG){
          
          points = points.filter(elem => shape.point_1.y > elem.y || shape.point_1.y+shape.h <= elem.y || shape.point_1.x -1  != elem.x)
          shape = new Rectangle(new Point(shape.point_1.x-1, shape.point_1.y), shape.w+1, shape.h);
         // console.log("ajouté G")
      } 
    }

    while (addD){
      for(var i = 0; i < h; i ++ ){
        if ( !points.find( elem => shape.point_1.x+shape.w == elem.x && shape.point_1.y+i == elem.y )){
          addD = false;
          break;
        }
      }
      if (addD){
         
          points = points.filter(elem => shape.point_1.y > elem.y || shape.point_1.y+shape.h <= elem.y || shape.point_1.x + shape.w  != elem.x)
          shape = new Rectangle(shape.point_1, shape.w+1, shape.h);
         // console.log("ajouté D")
      } 
    }
   
    this.shapes.push(shape);

    return this.generate_rectangles(points);
  }
}

