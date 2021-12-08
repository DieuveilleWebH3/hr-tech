import Paint from './paint.class.js';
import Tool from './tool.class.js'; 
import Proxy from './proxy.class.js'; 
import Utility from './utility.class.js'; 
import Layer from './layer.class.js';

export function init(id, path, layer_url, xScale, yScale, wScale, hScale, x1Unit, y1Unit, x2Unit, y2Unit, unit , meters){
    var first_load = true;
    var calib_object = {
        x1 : xScale,
        y1: yScale,
        width : wScale,
        height : hScale,
        lx1 : x1Unit,
        ly1: y1Unit,
        lx2: x2Unit,
        ly2: y2Unit,
        unit : unit,
        meters : meters
    }
    var url_refresh = window.location.origin+''+ layout_tool_url;
    $("#echelle").html(parseInt(calib_object.unit));
    $("#mNumber").html(calib_object.meters);
    $("#menu-shapes").html('');
    let main_canvas = new fabric.Canvas('canvas' , {selection: false});
    let initialized = false;
    let paint  = new Proxy(id, "proxy", ".main", path.trim(), Object.assign({},  calib_object));
    paint.init();
    document.querySelector("[data-command='back']").addEventListener("click", (e) => {
        $('#back-form').submit();
    });
    $('#submit-btn').click(function(e){
        $("#save-state-btn").removeAttr('disabled')
        $("#menu-shapes").html('');
        var feature_id = $('#feature option').filter(':selected').val();
        var module_id  = $('#module-name option').filter(':selected').val();
        var deck_id    = $('#deck-name option').filter(':selected').val();
        $('#fLabel').html($('#feature option').filter(':selected').html())
        $('#dLabel').html($('#deck-name option').filter(':selected').html())
        $('#mLabel').html($('#module-name option').filter(':selected').html())
        var url = layer_url.replace('feature_9999', feature_id);
        url = url.replace('deck_9999', deck_id);
        url = url.replace('module_9999', module_id);
        var newurl = `${url_refresh}?deck=${deck_id}&module=${module_id}&feature=${feature_id}`
        //window.location = `${url_refresh}?deck=${deck_id}&module=${module_id}&feature=${feature_id}`;
        window.history.pushState({path:newurl},'',newurl);
        Utility.get_request(url, (response) => { 
            var data = response.layer; 
            var layer = new Layer(data.id, id, data.deck_id, data.deck_name, data.module_id, data.module_name, data.feature_id, data.feature_name, data.serialization, data.width , data.height, data.perimeter, data.area, data.centroid_x, data.centroid_y, data.nb_objects );
            main_canvas.clear();
            main_canvas.viewportTransform = [1,0,0,1,0,0];
            paint.close();
            calib_object = {
                x1 : data.x1,
                y1: data.y1,
                width : data.c_width,
                height : data.c_height,
                lx1 : data.lx1,
                ly1: data.ly1,
                lx2: data.lx2,
                ly2: data.ly2,
                unit : data.unit,
                meters : data.meters
            }
            paint  = new Paint(layer, main_canvas, ".main", path.trim(), Object.assign({},  calib_object));
            paint.init();
            paint.activeTool = Tool.TOOL_POINTER;
            paint.lineWidth = 2;
            if(!initialized){
                document.querySelectorAll("[data-layer-cmd]").forEach(
                    (el) => {
                        el.addEventListener("click", (e) =>{
                            var cmd = el.getAttribute("data-layer-cmd");
                            if ( cmd == "invisible" ) {
                                $('[data-layer-cmd="invisible"]').remove("active");
                                var x =  $('[data-layer-cmd="invisible"] img').attr("src");
                                const regex = RegExp('.*invisible.*' , "gi");
                                if (regex.test(x) == true) {
                                    paint.visiblity = false;
                                    $('[data-layer-cmd="invisible"] img').attr("src" , x.replace(/invisible/gi , "visible") );
                                    $('[data-layer-cmd="invisible"]').attr("title" , "Make all shapes visible" );
                                }else {
                                    paint.visiblity = true;
                                    $('[data-layer-cmd="invisible"] img').attr("src" , x.replace(/visible/gi , "invisible") );
                                    $('[data-layer-cmd="invisible"]').attr("title" , "Make all shapes hidden" );
                                }
                            }
                        });
                    }
                );

                document.querySelectorAll("[data-poly]").forEach(
                    (el) => {
                        el.addEventListener("click", (e) =>{
                            paint.updatePoly();
                        });
                    }
                );

                $('#btn-calibration').click((e)=>{
                    paint.save_calibration();
                })
                document.querySelectorAll("[data-command]").forEach( (el) => {
                    el.addEventListener("click", (e) => {
                        let command = el.getAttribute('data-command');
                        if(command == 'undo'){
                            paint.undoPaint();
                        } if(command == 'redo'){
                            paint.redoPaint();
                        }else if(command == 'download'){
                            paint.download();
                        } else if (command == 'rescale'){
                            paint.rescale();
                        } else if (command == 'rotation'){
                            paint.rotate(90);
                        } else if (command == 'reset-all'){
                            paint.reset_all();
                        } else if (command == 'cancel'){
                            paint.cancel();
                        } else if (command == 'save'){
                            paint.save();
                        }
                    });
                });

                document.querySelectorAll("[data-line-width]").forEach(
                    (el) => {
                        el.addEventListener("click", (e) =>{
                            document.querySelector("[data-line-width].active").classList.toggle("active");
                            el.classList.toggle("active");
                            paint.lineWidth = el.getAttribute("data-line-width");
                        });
                    }
                );

                document.querySelectorAll("[data-calibration]").forEach( (el) => {
                    el.addEventListener("click", (e) => {
                        document.querySelector("[data-calibration].active").classList.toggle("active");
                        el.classList.toggle("active");
                        let command = el.getAttribute('data-calibration');
                        if(command == 'validate'){
                            paint.save_calibration();
                        } else if(command == 'smove'){
                            paint.calibration_mode = 'move';
                        } else if(command == 'sdraw'){
                            paint.calibration_mode = 'draw';
                        } 
                    });
                });

                document.querySelectorAll("[data-tool]").forEach(
                    (el) => {
                        el.addEventListener("click", (e) => {
                            document.querySelector("[data-tool].active").classList.toggle("active");
                            el.classList.toggle("active");
                            let selectedTool = el.getAttribute("data-tool");
                            paint.activeTool = selectedTool;
                            if (paint.polygon){
                                paint.polygon.reset();
                                paint.polygon = null;
                            } 
                            $('#body-msg').hide();
                            switch(selectedTool) {
                                case Tool.TOOL_POINTER:
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.drawingMode = true;
                                    paint.cursor = 'grab';
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = false;
                                    //paint.segment = false;
                                    break;
                                case Tool.TOOL_MOVE:
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.drawingMode = false;
                                    paint.cursor = 'move';
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = false;
                                    //paint.segment = false;
                                    break;
                                case Tool.TOOL_LINE:
                                case Tool.TOOL_RECTANGLE:
                                case Tool.TOOL_CIRCLE:
                                case Tool.TOOL_TRIANGLE:
                                case Tool.TOOL_POLYGON:
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.drawingMode = true;
                                    paint.cursor = 'crosshair';
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = false;
                                    //paint.segment = false;
                                    break;
                                
                                case Tool.TOOL_PENCIL:
                                    document.querySelector(".group.pencil").style.display = "block";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.drawingMode = true;
                                    paint.cursor = 'crosshair';
                                    paint.activate_pencil = true;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = false;
                                    break;
                                
                                case Tool.TOOL_ERASER:
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.drawingMode = true;
                                    paint.cursor = 'url("/static/images/mini-eraser.png") 16 16, auto';
                                    paint.drawingMode = false;
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    //paint.segment = false;
                                    break;
                                
                                case Tool.TOOL_PAINT_BUCKET:
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "block";
                                    paint.cursor = 'crosshair';
                                    paint.drawingMode = true;
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.mesure_tool = false;
                                    paint.gravity_center = false;
                                    //paint.segment = false;
                                    break;
                                case Tool.TOOL_PIXEL:
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.drawingMode = true;
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = false;
                                    //paint.segment = true;
                                    break;
                                case Tool.TOOL_ZOOM_IN:
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.cursor = 'zoom-in';
                                    paint.drawingMode = true;
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = false;
                                    break;
                                case Tool.TOOL_ZOOM_OUT :
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.cursor = 'zoom-out';
                                    paint.drawingMode = true;
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    break;
                                case Tool.TOOL_INFO :
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.cursor = 'help';
                                    paint.drawingMode = false;
                                    paint.activate_pencil = false;
                                    paint.gravity_center = false;
                                    paint.calibrate = false;
                                    paint.mesure_tool = false;
                                    break;
                                case Tool.TOOL_CALIBRATE :
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.cursor = 'crosshair';
                                    paint.drawingMode = true;
                                    paint.activate_pencil = false;
                                    paint.calibrate = true;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = false;
                                    //paint.calibrate();
                                    break;
                                case Tool.TOOL_GRAVITY :
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.cursor = 'auto';
                                    paint.drawingMode = true;
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = true;
                                    paint.mesure_tool = false;
                                    //paint.calibrate();
                                    break;
                                case Tool.TOOL_MESURE:
                                    paint.cursor = 'crosshair';
                                    paint.drawingMode = true;
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = true;
                                    break;
                                default:
                                    document.querySelector(".group.pencil").style.display = "none";
                                    document.querySelector(".group.slider").style.display = "none";
                                    paint.drawingMode = true;
                                    paint.activate_pencil = false;
                                    paint.calibrate = false;
                                    paint.gravity_center = false;
                                    paint.mesure_tool = false;
                                    //paint.segment = false;
                            }
                        });
                    }
                );

                document.querySelectorAll("[data-color]").forEach(
                    (el) => {
                        el.addEventListener("click", (e) =>{
                            document.querySelector("[data-color].active").classList.toggle("active");
                            el.classList.toggle("active");
                            paint.selectedColor = el.getAttribute("data-color");
                        });
                    }
                );
                initialized = true;
            }
            
        });
    });

    var urlParams = new URLSearchParams(window.location.search);
    if(first_load && urlParams.has('deck') && urlParams.has('module') && urlParams.has('feature')){
        console.log(first_load);
        var deck_id = urlParams.get('deck'); 
        var module_id = urlParams.get('module'); 
        var feature_id = urlParams.get('feature');
        $("#deck-name option").each(function() {
            if( $(this).prop('value') == deck_id ) { $(this).prop('selected','selected'); }
        }); 
        $("#module-name option").each(function() {
            if( $(this).prop('value') == module_id ) { $(this).prop('selected','selected'); }
        });
        $("#feature option").each(function() {
            if( $(this).prop('value') == feature_id ) { $(this).prop('selected','selected'); }
        }); 
        $('#submit-btn').click();
        first_load= false;
    }
    



    
    

    
    /*let mini_paint = null;
    let image_data = null;
    // Set defaults
    paint.activeTool = Tool.TOOL_POINTER;
    paint.lineWidth = '2';
    paint.brushSize = '4';
    paint.selectedColor = "#ff0000";
    paint.selectedLayer = 1;
    paint.set_opacity = 0.6;
    // initialize paint
    paint.init();

    
    document.querySelectorAll("[data-command]").forEach(
        (el) => {
            el.addEventListener("click", (e) => {
                let command = el.getAttribute('data-command');
                if(command == 'undo'){
                    paint.undoPaint();
                } else if(command == 'download'){
                    paint.download();
                } else if (command == 'zoomin'){
                    paint.zoomIn();
                } else if (command == 'zoomout'){
                    paint.zoomOut();
                } else if (command == 'save'){
                    if(parseFloat($('#deck-height').html()) == 0 && $('#deck').html() == "Unknown deck") {
                        $('#modal-header').html("Deck name and height not found");
                        $('#modal-body').html('Please provide the deck height and  the deck name on the top left side of your screen like the image bellow : <br> <br> <img src="/static/img/name_height.png" />');
                        $('#dialogue').click();
                    } else if( $('#deck').html() == "Unknown deck"){
                        $('#modal-header').html("Deck name not found");
                        $('#modal-body').html('Please provide the deck name on the top left side of your screen like the image bellow : <br> <br> <img src="/static/img/name.png" />');
                        $('#dialogue').click();
                    } else if(parseFloat($('#deck-height').html()) == 0) {
                        $('#modal-header').html("Deck height not found");
                        $('#modal-body').html('Please provide the deck height on the top left side of your screen like the image bellow : <br> <br> <img src="/static/img/height.png" />');
                        $('#dialogue').click();
                    }else{
                        if( paint.current_layer.shapes.length > 0 ){
                            $('div.spinner').show();
                            paint.rescale();
                            var formdata = new FormData();
                            var canvas = paint.current_layer.canvas;
                            var image = new Image();
                            canvas.toBlob(function(blob) {
                                image.onload = function() {
                                    URL.revokeObjectURL(this.url);
                                };
                                image.src = URL.createObjectURL(blob);
                                formdata.append("image", blob, "test");
                                formdata.append("wImg", paint.bg_layer.image.width);
                                formdata.append("hImg", paint.bg_layer.image.height);
                                formdata.append("shapes", JSON.stringify({shapes : paint.current_layer.shapes}));
                                var mNumber = parseInt($("#mNumber").html());
                                var echelle = parseInt($("#echelle").html());
                                var unit = echelle / mNumber;
                                Utility.post_request('/layout/deck/'+id+'/layer/'+ paint.current_layer.name +'/unit/'+unit, formdata,
                                 (data)=>{ 
                                     setTimeout(() => $('div.spinner').hide() , 200);
                                 },
                                 (jqXHR, textStatus, errorThrown)=>{ 
                                    $('#modal-header').html("Saving layer failed");
                                    $('#modal-body').html('Sorry! saving layer failed. please try again.');
                                    $('#dialogue').click();
                                    $('div.spinner').hide();
                                 }
                                );
                            }, "image/jpeg", 0.7);
                        } else {
                            $('#modal-header').html("Nothing to save");
                            $('#modal-body').html('Sorry there is nothing to save from this layer!');
                            $('#dialogue').click();
                        }
                    } 
                } else if (command == 'save-all') {

                    if(parseFloat($('#deck-height').html()) == 0 && $('#deck').html() == "Unknown deck") {
                        $('#modal-header').html("Deck name and height not found");
                        $('#modal-body').html('Please provide the deck height and  the deck name on the top left side of your screen like the image bellow : <br> <br> <img src="/static/img/name_height.png" />');
                        $('#dialogue').click();
                    } else if( $('#deck').html() == "Unknown deck"){
                        $('#modal-header').html("Deck name not found");
                        $('#modal-body').html('Please provide the deck name on the top left side of your screen like the image bellow : <br> <br> <img src="/static/img/name.png" />');
                        $('#dialogue').click();
                    } else if(parseFloat($('#deck-height').html()) == 0) {
                        $('#modal-header').html("Deck height not found");
                        $('#modal-body').html('Please provide the deck height on the top left side of your screen like the image bellow : <br> <br> <img src="/static/img/height.png" />');
                        $('#dialogue').click();
                    }else{
                        var mNumber = parseInt($("#mNumber").html());
                        var echelle = parseInt($("#echelle").html());
                        var unit = echelle / mNumber;
                        paint.rescale();
                        paint.layers_list.forEach( e => {
                                if(e.name != "superpixel_layer" && e.name != "visualisation_layer" && e.name != "boundary_layer" && e.shapes.length > 0){
                                    $('div.spinner').show();
                                    var canvas = e.canvas;
                                    var image = new Image();
                                    canvas.toBlob(function(blob) {
                                        image.onload = function() {
                                            URL.revokeObjectURL(this.url);
                                        };
                                        image.src = URL.createObjectURL(blob);
                                        var formdata = new FormData();
                                        formdata.append("image", blob, "test");
                                        formdata.append("wImg", paint.bg_layer.image.width);
                                        formdata.append("hImg", paint.bg_layer.image.height);
                                        formdata.append("shapes", JSON.stringify({shapes : e.shapes}));
                                        Utility.post_request('/layout/deck/'+id+'/layer/'+ e.name +'/unit/'+unit, formdata, 
                                            (data)=>{ 
                                                setTimeout(() => $('div.spinner').hide() , 200);
                                            },
                                            (jqXHR, textStatus, errorThrown)=>{ 
                                                $('#modal-header').html("Saving layers failed");
                                                $('#modal-body').html('Sorry! saving layers failed. please try again.');
                                                $('#dialogue').click();
                                                $('div.spinner').hide();
                                            }
                                        );
                                    }, "image/jpeg", 0.7);
                                }
                        });
                    }
                } else if (command == 'back'){
                    $('#back-form').submit();
                } else if (command == 'rescale'){
                    paint.rescale();
                } else if (command == 'rest-all'){
                    paint.rest_all_layer();
                    location.reload(true);
                } else if (command == 'refresh-layer'){
                    paint.rest_curent_layer();
                    // make request to remove the layer.
                }  else if (command == 'rotation-right'){
                    paint.rotate(1);
                    // make request to remove the layer.
                } else if (command == 'rotation-left'){
                    paint.rotate(-1);
                    // make request to remove the layer.
                }


            });
        }
    );

/*
    document.querySelectorAll("[data-tool]").forEach(
        (el) => {
            el.addEventListener("click", (e) => {
                document.querySelector("[data-tool].active").classList.toggle("active");
                el.classList.toggle("active");
                let selectedTool = el.getAttribute("data-tool");
                paint.activeTool = selectedTool;
                switch(selectedTool) {
                    case Tool.TOOL_LINE:
                    case Tool.TOOL_RECTANGLE:
                    case Tool.TOOL_CIRCLE:
                    case Tool.TOOL_TRIANGLE:
                    case Tool.TOOL_PENCIL:
                    case Tool.TOOL_POLYGON:
                        document.querySelector(".group.pencil").style.display = "block";
                        document.querySelector(".group.checkbox").style.display = "block";
                        document.querySelector(".group.brush").style.display = "none";
                        document.querySelector(".group.superpixel").style.display = "none";
                        document.querySelector(".group.slider").style.display = "none";
                        paint.segment = false;
                        break;
                    case Tool.TOOL_ERASER:
                        document.querySelector(".group.pencil").style.display = "none";
                        document.querySelector(".group.checkbox").style.display = "none";
                        document.querySelector(".group.brush").style.display = "block";
                        document.querySelector(".group.superpixel").style.display = "none";
                        document.querySelector(".group.slider").style.display = "none";
                        paint.segment = false;
                        break;
                    case Tool.TOOL_POINTER:
                        document.querySelector(".group.pencil").style.display = "none";
                        document.querySelector(".group.checkbox").style.display = "none";
                        document.querySelector(".group.brush").style.display = "none";
                        document.querySelector(".group.superpixel").style.display = "none";
                        document.querySelector(".group.slider").style.display = "none";
                        paint.segment = false;
                        break;
                    case Tool.TOOL_PAINT_BUCKET:
                        document.querySelector(".group.pencil").style.display = "none";
                        document.querySelector(".group.checkbox").style.display = "none";
                        document.querySelector(".group.brush").style.display = "none";
                        document.querySelector(".group.superpixel").style.display = "none";
                        document.querySelector(".group.slider").style.display = "block";
                        paint.segment = false;
                        break;
                    case Tool.TOOL_PIXEL:
                        document.querySelector(".group.pencil").style.display = "none";
                        document.querySelector(".group.checkbox").style.display = "none";
                        document.querySelector(".group.brush").style.display = "none";
                        document.querySelector(".group.superpixel").style.display = "block";
                        document.querySelector(".group.slider").style.display = "none";
                        paint.segment = true;
                        break;
                    default:
                        document.querySelector(".group.pencil").style.display = "none";
                        document.querySelector(".group.checkbox").style.display = "none";
                        document.querySelector(".group.brush").style.display = "none";
                        document.querySelector(".group.superpixel").style.display = "none";
                        document.querySelector(".group.slider").style.display = "none";
                        paint.segment = false;
                }
                
            });
        }
    );

    document.querySelectorAll("[data-line-width]").forEach(
        (el) => {
            el.addEventListener("click", (e) =>{
                document.querySelector("[data-line-width].active").classList.toggle("active");
                el.classList.toggle("active");
                paint.lineWidth = el.getAttribute("data-line-width");
            });
        }
    );

    document.querySelectorAll("[data-line-width]").forEach(
        (el) => {
            el.addEventListener("click", (e) =>{
                document.querySelector("[data-line-width].active").classList.toggle("active");
                el.classList.toggle("active");
                paint.lineWidth = el.getAttribute("data-line-width");
            });
        }
    );

    document.querySelectorAll("[data-brush-size]").forEach(
        (el) => {
            el.addEventListener("click", (e) =>{
                document.querySelector("[data-brush-size].active").classList.toggle("active");
                el.classList.toggle("active");
                paint.brushSize = el.getAttribute("data-brush-size");
            });
        }
    );

    document.querySelectorAll("[data-color]").forEach(
        (el) => {
            el.addEventListener("click", (e) =>{
                document.querySelector("[data-color].active").classList.toggle("active");
                el.classList.toggle("active");
                paint.selectedColor = el.getAttribute("data-color");
            });
        }
    );

    document.querySelectorAll("[data-layer]").forEach(
        (el) => {
            el.addEventListener("click", (e) =>{
                
                    if (document.querySelector("[data-layer].active") != null)
                        document.querySelector("[data-layer].active").classList.toggle("active");
                    el.classList.toggle("active");
                    if (document.querySelector('[data-layer-cmd="background"].active') != null)
                        document.querySelector('[data-layer-cmd="background"].active').classList.toggle("active");
                    paint.selectedLayer = el.getAttribute("data-layer");
                    paint.init();
               // }
            });
        }
    );


    document.querySelectorAll("[data-layer-cmd]").forEach(
        (el) => {
            el.addEventListener("click", (e) =>{
                var cmd = el.getAttribute("data-layer-cmd");
                if ( cmd == "background" ) {
                    paint.selectedLayer = 0;
                    paint.init();
                    if (document.querySelector("[data-layer].active") != null)
                        document.querySelector("[data-layer].active").classList.toggle("active");
                    el.classList.add("active");
                }
                if ( cmd == "invisible" ) {
                    $('#canvas').toggle();
                    $('[data-layer-cmd="invisible"]').remove("active");
                    var x =  $('[data-layer-cmd="invisible"] img').attr("src");
                    const regex = RegExp('.*invisible.*' , "gi");
                    if (regex.test(x) == true) {
                        $('[data-layer-cmd="invisible"] img').attr("src" , x.replace(/invisible/gi , "visible") );
                        $('[data-layer-cmd="invisible"]').attr("title" , "Make background visible" );
                    }else {
                        $('[data-layer-cmd="invisible"] img').attr("src" , x.replace(/visible/gi , "invisible") );
                        $('[data-layer-cmd="invisible"]').attr("title" , "Make background hidden" );
                    }
                }
            });
        }
    );

    document.querySelectorAll("[data-superpixel]").forEach(
        (el) => {
            el.addEventListener("click", (e) => {
                let command = el.getAttribute('data-superpixel');
                if(command == 'minus'){
                    paint.finerSuperPixel();
                } else if(command == 'plus') {
                    paint.coarserSuperPixel();
                }
            });
        });

    
    $('#slider').on('change', _.debounce(function() {
        paint.set_opacity =  $(this).val() /10 ;
        $('code').text($(this).val()/10);
      }, 250));

    $('#deck').on('input', _.debounce(function() {
        Utility.get_request('/layout/deck/'+id+'/name/'+ $('#deck').html(), (data)=>{ console.log(data); });
    }, 250));


    $('#deck-height').on('input', _.debounce(function() {
        try {
            parseFloat($('#deck-height').html());
            Utility.get_request('/layout/deck/'+id+'/height/'+ $('#deck-height').html(), (data)=>{ console.log(data); });
        }
        catch(error) {
            console.error(error);
        }
    }, 250));

    $('input:checkbox#autofill').change(
        function(){
            if ($(this).is(':checked')) {
                paint.fill = true;
            }else {
                paint.fill = false;
            }
        });


    $('.btn-calibration').on('click',function() {
        if ($('.dropdown-content').css("display" ) == "none"){
            $('.dropdown-content').css("display" , "block");
            if (image_data == null){
                mini_paint  = new MiniPaint("mini-canvas", path);
                // Set defaults
                var cvH = mini_paint.current_layer.canvas.height;
                var cvW = mini_paint.current_layer.canvas.width;
                var imH = mini_paint.current_layer.image.height;
                var imW = mini_paint.current_layer.image.width;
                mini_paint.activeTool = Tool.TOOL_POINTER;
                mini_paint.lineWidth = '1';
                var shape = new Shape('rectangle');
                shape.w=wScale * cvW / imW - (xScale * cvW / imW);
                shape.h=hScale * cvH / imH - (yScale * cvH / imH);
                shape.color = "#ff0000";
                shape._opacity = 0.6;
                shape.fill = true;
                shape.points.push(new Point(xScale * cvW / imW  , yScale* cvH / imH));

                var line = new Shape('line');
                line._opacity = 0.6;
                line.color = "#0000ff";
                line.fill = true;
                line.points.push(new Point( x1Unit * cvW / imW , y1Unit * cvH / imH));
                line.points.push(new Point(x2Unit * cvW / imW, y2Unit * cvH / imH));
                // initialize paint
                mini_paint.init(shape, line);

            }else{
                mini_paint.bg_layer.imageData = image_data;
            }
        }else {
            $('.dropdown-content').css("display" , "none");
        }

        document.querySelectorAll("[data-mini-cmd]").forEach(
            (el) => {
                el.addEventListener("click", (e) =>{
                    var cmd = el.getAttribute("data-mini-cmd");
                    if(cmd == "hand"){
                        document.querySelector("[data-mini-cmd].active").classList.toggle("active");
                        el.classList.toggle("active");
                        let selectedTool = el.getAttribute("data-mini-cmd");
                        mini_paint.activeTool = selectedTool;
                    }else if (cmd == "rectangle"){
                        document.querySelector("[data-mini-cmd].active").classList.toggle("active");
                        el.classList.toggle("active");
                        let selectedTool = el.getAttribute("data-mini-cmd");
                        mini_paint.activeTool = selectedTool;
                        mini_paint.selectedColor = "#ff0000";
                        mini_paint.bg_layer.reset_layer();
                    }else if (cmd == "line"){
                        document.querySelector("[data-mini-cmd].active").classList.toggle("active");
                        el.classList.toggle("active");
                        let selectedTool = el.getAttribute("data-mini-cmd");
                        mini_paint.activeTool = selectedTool;
                        mini_paint.selectedColor = "#0000ff";
                        //
                    }else if (cmd == "zoomin"){
                        mini_paint.zoomIn();
                    }else if (cmd == "zoomout"){
                        mini_paint.zoomOut();
                    }else if (cmd == "reset"){
                        mini_paint  = new MiniPaint("mini-canvas", path);
                        mini_paint.activeTool = Tool.TOOL_POINTER;
                        mini_paint.lineWidth = '1';
                        mini_paint.brushSize = '4';
                        mini_paint.selectedColor = "#ff0000";
                        var shape = new Shape('rectangle');
                        shape.w=wScale;
                        shape.h=hScale;
                        shape.size = mini_paint.lineWidth;
                        shape.color = "#ff0000";
                        shape.points.push(new Point(xScale, yScale));
                        // initialize paint
                        mini_paint.init(shape);
                    } else if (cmd = "validate" ){
                        if(mini_paint.bg_layer.shapes.length > 1 ){
                            var shape = mini_paint.current_layer.shapes[0];
                            var line_shape = mini_paint.current_layer.shapes[1];
                            var rectangle = shape.get_rectangle();
                            var line = line_shape.get_line();
                            var formdata = new FormData();
                            var cvH = mini_paint.current_layer.canvas.height;
                            var cvW = mini_paint.current_layer.canvas.width;
                            var imH = mini_paint.current_layer.image.height;
                            var imW = mini_paint.current_layer.image.width;
                            var mNumber = parseInt($("#mNumber").html());
                            var unite_res = Math.max(Math.abs((line.point_2.x * imW / cvW)- (line.point_1.x* imW / cvW)), Math.abs((line.point_2.y * imH / cvH)- (line.point_1.y * imH / cvH))) ;
                            $("#echelle").html(parseInt(unite_res));
                            formdata.append("img_path", path);
                            formdata.append("x1", (rectangle.point_1.x * imW / cvW )  );
                            formdata.append("y1", (rectangle.point_1.y * imH / cvH));
                            formdata.append("x2", ((rectangle.point_1.x + rectangle.w) * imW / cvW  ));
                            formdata.append("y2", ((rectangle.point_1.y + rectangle.h)* imH / cvH));
                            formdata.append("lx1", line.point_1.x  );
                            formdata.append("ly1", line.point_1.y);
                            formdata.append("lx2", line.point_2.x);
                            formdata.append("ly2", line.point_2.y);
                            formdata.append("unit", unite_res/mNumber);
                            formdata.append("deck_id", id);
                            Utility.post_request('/layout/calibrate', formdata, (data)=>{ console.log(data)});
                            $('.dropdown-content').css("display" , "none");
                        } else {
                            $('#modal-header').html("No scale selected in the layout");
                            $('#modal-body').html('Please provide the layout scale before!');
                            $('#dialogue').click();
                        }
                    }
                    image_data = mini_paint.bg_layer.imageData;
                    mini_paint.bg_layer.redraw(mini_paint.bg_layer.context, mini_paint.bg_layer.canvas.width, mini_paint.bg_layer.canvas.height, mini_paint.bg_layer.image);
                });
            }
        );
    });

    $('.fermer').on('click',function() {
        $('.dropdown-content').css("display" , "none");
    });    */
}
