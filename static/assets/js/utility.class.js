import Point from './point.class.js';

export default class Utility{

    static getMouseCoordsOnCanvas(canvas, ctx,  e){
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        var p = ctx.transformedPoint(x,y);
        return new Point(p.x, p.y);
        
    }

    static calcHypotenuse(startPos, endPos){
        return Math.sqrt( Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2));
    }

    
    static hexToRgba(hex, opacity) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
          opacity
        ] : null;
      }

      static getPixel(context, x, y) {

        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
          return [-1, -1, -1, -1];  // impossible color
        } else {
          const offset = (y * imageData.width + x) * 4;
          return [imageData.data[offset + 0],
                  imageData.data[offset + 1],
                  imageData.data[offset + 2],
                  imageData.data[offset + 3]
                ]
        }
      }

      static getMaskedImageData(context, mask, inverse) {
        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        for (var i = 0; i < mask.length; i += 4) {
          if (inverse  == false) {
            if (mask[i] > 0 || mask[i +1] > 0 ||  mask[i + 2] > 0 ){
              imageData.data[i+3] =255;
            }else{
              imageData.data[i+3] = 0;
            }
          }else {
            if (mask[i] == 0 && mask[i +1] == 0 &&  mask[i + 2] == 0 ){
              imageData.data[i+3] = 255;
              imageData.data[i] = 0;
              imageData.data[i+1] = 0;
              imageData.data[i+2] = 0;
            }
          }
          
        }
        return imageData; 
      }
      
      static setPixel(context, x, y, color) {
        let imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        const offset = (y * imageData.width + x) * 4;
        imageData.data[offset + 0] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = color[0];
        context.putImageData(imageData, 0, 0);
      }
      
      static colorsMatch(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
      }

      static post_request(url, data, callback, error_callback){
        $.ajax({
            method: "POST",
            url: url,
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr, settings) {
                function getCookie(name) {
                    var cookieValue = null;
                    if (document.cookie && document.cookie != '') {
                        var cookies = document.cookie.split(';');
                        for (var i = 0; i < cookies.length; i++) {
                            var cookie = jQuery.trim(cookies[i]);
                            // Does this cookie string begin with the name we want?
                            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                }
                if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                    // Only send the token to relative URLs i.e. locally.
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            } 
          }).done(callback).fail(error_callback);
      }


      static get_request(url, callback, error_callback){
        $.ajax({
            method: "GET",
            url: url,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function(xhr, settings) {
                function getCookie(name) {
                    var cookieValue = null;
                    if (document.cookie && document.cookie != '') {
                        var cookies = document.cookie.split(';');
                        for (var i = 0; i < cookies.length; i++) {
                            var cookie = jQuery.trim(cookies[i]);
                            // Does this cookie string begin with the name we want?
                            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                break;
                            }
                        }
                    }
                    return cookieValue;
                }
                if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                    // Only send the token to relative URLs i.e. locally.
                    xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                }
            } 
          }).done(callback).fail(error_callback);
      }
      
      static convertToDataURLviaCanvas(url, callback, outputFormat){
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function(){
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var dataURL;
            canvas.height = this.height;
            canvas.width = this.width;
            ctx.drawImage(this, 0, 0);
            dataURL = ctx.getImageData(0,0,this.width,this.height);
            var data = dataURL.data;
            for (var i = 0; i < data.length; i += 4)
              if (data[i+0] <20 && data[i+1]<20 && data[i+2]<20)
                data[i+3] =0;
            callback(dataURL);
            canvas = null; 
        };
        img.src = url;
    }

    static copyImageData(ctx, src)
    {
        var dst = ctx.createImageData(src.width, src.height);
        dst.data.set(src.data);
        return dst;
    }

    static get_polygon_centroid(pts) {
      var first = pts[0], last = pts[pts.length-1];
      if (first.x != last.x || first.y != last.y) pts.push(first);
      var twicearea=0,
      x=0, y=0,
      nPts = pts.length,
      p1, p2, f;
      for ( var i=0, j=nPts-1 ; i<nPts ; j=i++ ) {
         p1 = pts[i]; p2 = pts[j];
         f = p1.x*p2.y - p2.x*p1.y;
         twicearea += f;          
         x += ( p1.x + p2.x ) * f;
         y += ( p1.y + p2.y ) * f;
      }
      f = twicearea * 3;
      return { x:x/f, y:y/f };
   }
}