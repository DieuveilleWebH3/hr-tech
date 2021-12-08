export default class Proxy { 

    constructor(deck_id, canvasId, main_container, url_img, calib_object) {
        this.deck_id = deck_id;
        this.url_image = url_img;
        /**
         * Instanciate Fabric js
         */
        this.main_container = $(main_container);
        var mainW = this.main_container.width();
        var mainH = this.main_container.height();
        this.canvas = this.__canvas =  new fabric.Canvas(canvasId , {selection: false});//, renderOnAddRemove: false});
        this.container = $('.canvas-container');
        this.container.width(mainW-80);
        this.container.height(mainH - 80);
        var cW = this.cW =  this.container.width();
        var cH = this.cH = this.container.height();
        this.canvas.setDimensions({width:cW, height:cH});
        var canvas = this.canvas;
        fabric.Image.fromURL(url_img + '?' + (new Date()).getTime(), (oImg) => {
            oImg.set({
                class: 'background',
                originX: "left",
                originY: "top",
                selectable: false
            });
            this.setCanavsDimentions(oImg, cW, cH);
            //canvas.sendToBack(oImg);
            canvas.add(oImg);
            canvas.renderAll();
        });
    }

    setCanavsDimentions(oImg, cW, cH){
        var canvas = this.canvas;
        canvas.width = cW;
        canvas.height = cH;
        var a = oImg.width / oImg.height;
        var x = a * cH;
        if( x > cW){
            oImg.scaleToWidth(canvas.width);
            var hScaled = oImg.getScaledHeight();
            this.canvas.setDimensions({width:cW, height:hScaled});
            this.container.width(cW);
            this.container.height(hScaled);
        } else {
            oImg.scaleToHeight(canvas.height);
            var wScaled = oImg.getScaledWidth();
            this.canvas.setDimensions({width:wScaled, height:cH});
            this.container.width(wScaled);
            this.container.height(cH);
        }
        canvas.centerObject(oImg);
    }

    init(){
        $('div.item').addClass('disabled');
        this.canvas.on('mouse:wheel', (e) => this.handleScroll(e));
        this.canvas.on('mouse:down', function(opt) {
            var evt = opt.e;
            this.isDragging = true;
            this.selection = false;
            this.lastPosX = evt.clientX;
            this.lastPosY = evt.clientY;
            
          });
          this.canvas.on('mouse:move', function(opt) {
            if (this.isDragging) {
              var e = opt.e;
              this.viewportTransform[4] += e.clientX - this.lastPosX;
              this.viewportTransform[5] += e.clientY - this.lastPosY;
              this.requestRenderAll();
              this.lastPosX = e.clientX;
              this.lastPosY = e.clientY;
            }
          });
          this.canvas.on('mouse:up', function(opt) {
            this.isDragging = false;
            this.selection = true;
          });
    }

    close(){
        this.canvas.off('mouse:wheel');
        this.canvas.off('mouse:down');
        this.canvas.off('mouse:move');
        this.canvas.off('mouse:up');
        //$('#proxy').css({pointerEvents: "0"})
        $('#proxy_container').remove();
        $('div.item').removeClass('disabled');
        
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
}