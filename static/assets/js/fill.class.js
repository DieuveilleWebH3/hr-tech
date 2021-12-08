/**
 * https://jsfiddle.net/av01d/dfvp9j2u/
 */
export default class Fill {
    constructor(fcanvas, color, tolerance) {
        this.fcanvas = fcanvas;
        this.fillColor = color;
        this.fillTolerance = tolerance;
    }
	// The actual flood fill implementation
	fill(imageData, getPointOffsetFn, point, color, target, tolerance, width, height)
	{
	    var directions = [[1, 0], [0, 1], [0, -1], [-1, 0]],
			coords = [],
            points = [point],
			seen = {},
			key,
			x,
			y,
			offset,
			i,
			x2,
			y2,
			minX = -1,
			maxX = -1,
			minY = -1,
			maxY = -1;

		// Keep going while we have points to walk
		while (!!(point = points.pop())) {
			x = point.x;
			y = point.y;
			offset = getPointOffsetFn(x, y);

			// Move to next point if this pixel isn't within tolerance of the color being filled
			if (!this.withinTolerance(imageData, offset, target, tolerance)) {
				continue;
			}

			if (x > maxX) { maxX = x; }
			if (y > maxY) { maxY = y; }
			if (x < minX || minX == -1) { minX = x; }
			if (y < minY || minY == -1) { minY = y; }

			// Update the pixel to the fill color and add neighbours onto stack to traverse
			// the fill area
			i = directions.length;
			while (i--) {
				// Use the same loop for setting RGBA as for checking the neighbouring pixels
				if (i < 4) {
					imageData[offset + i] = color[i];
					coords[offset+i] = color[i];
				}

				// Get the new coordinate by adjusting x and y based on current step
				x2 = x + directions[i][0];
				y2 = y + directions[i][1];
				key = x2 + ',' + y2;

				// If new coordinate is out of bounds, or we've already added it, then skip to
				// trying the next neighbour without adding this one
				if (x2 < 0 || y2 < 0 || x2 >= width || y2 >= height || seen[key]) {
					continue;
				}

				// Push neighbour onto points array to be processed, and tag as seen
				points.push({ x: x2, y: y2 });
				seen[key] = true;
			}
		}

		return {
			x: minX,
			y: minY,
			width: maxX-minX,
			height: maxY-minY,
			coords: coords
		}
    } // End FloodFill
    
    withinTolerance(array1, offset, array2, tolerance){
		var length = array2.length,
			start = offset + length;
		tolerance = tolerance || 0;

		// Iterate (in reverse) the items being compared in each array, checking their values are
		// within tolerance of each other
		while(start-- && length--) {
			if(Math.abs(array1[start] - array2[length]) > tolerance) {
				return false;
			}
		}
		return true;
    }
    
    hexToRgb(hex, opacity) {
        opacity = Math.round(opacity * 255) || Math.round(0.2 * 255) ;
        hex = hex.replace('#', '');
        var rgb = [], re = new RegExp('(.{' + hex.length/3 + '})', 'g');
        hex.match(re).map(function(l) {
            rgb.push(parseInt(hex.length % 2 ? l+l : l, 16));
        });
        return rgb.concat(opacity);
    }

    floodFill(e, color){
        var fcanvas = this.fcanvas;
        this.fillColor = color || this.fillColor ;
        var orig_mouse = this.fcanvas.getPointer(e.e);
        var mCanvas = this.fcanvas.viewportTransform;
        var mInverse = fabric.util.invertTransform(mCanvas);
        var mouse  =  fabric.util.transformPoint(orig_mouse, mCanvas);
        var mouseX = Math.round(mouse.x), mouseY = Math.round(mouse.y),
            canvaslower = fcanvas.lowerCanvasEl,
            context = canvaslower.getContext('2d'),
            parsedColor = this.hexToRgb(this.fillColor);
        var imageData = context.getImageData(0, 0, canvaslower.width, canvaslower.height),
            getPointOffset = function(x,y) {
                return 4 * (y * imageData.width + x)
            },
            getPoint = function(offset) {
                var ind = offset/4
                var x = ind % imageData.width;
                var y = Math.trunc(ind/ imageData.width) ;
                return new fabric.Point(x,y);
            },
            targetOffset = getPointOffset(mouseX, mouseY),
            target = imageData.data.slice(targetOffset, targetOffset + 4);
        if (this.withinTolerance(target, 0, parsedColor, this.fillTolerance)) {
            // Trying to fill something which is (essentially) the fill color
            
            return new Promise( (resolve, reject) => {
                reject('Ignore... same color');
            });
        }

        // Perform flood fill
        var data = this.fill(
            imageData.data,
            getPointOffset,
            { x: mouseX, y: mouseY },
            parsedColor,
            target,
            this.fillTolerance,
            imageData.width,
            imageData.height
        );

        if (0 == data.width || 0 == data.height) {
            return new Promise( (resolve, reject) => {
                reject('No block found ...');
            });
        }
        /*for (let i = 0; i <data.coords.length; i++ ){
            var pt = getPoint(data.coords[]);
        }
        var result = data.coords.reduce((total, idx) =>{
            var pt = getPoint(idx);
            return {
                x : total.x + pt.x,
                y: total.y + pt.y 
            }
        }, { x:0, y:0});
        var centroid = new fabric.Point(result.x / data.coords.length, result.y / data.coords.length);
        console.log("centroid");
        console.log(centroid);*/
        var total = { x : 0, y : 0 };
        var cpt =0;
        data.coords.forEach((elem,idx,arr)=>{
            var pt = getPoint(idx);
            total.x += pt.x;
            total.y += pt.y; 
            cpt++;
        });
        var centroid = new fabric.Point(total.x / cpt, total.y / cpt);
        var area = cpt / 4;
        var perimeter = 0
        // A supprimer
        /*var tmpCv = document.createElement('canvas'), 
        tmpCt = tmpCv.getContext('2d');
        tmpCv.width = canvaslower.width;
        tmpCv.height = canvaslower.height;
        tmpCt.putImageData(imageData, 0, 0)
        var id = tmpCt.getImageData(0, 0, canvaslower.width, canvaslower.height);
        id.data.set(data)
        tmpCt.putImageData(id, 0, 0)
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(tmpCv); */

        var tmpCanvas = document.createElement('canvas'), 
            tmpCtx = tmpCanvas.getContext('2d');
			tmpCanvas.width = canvaslower.width;
			tmpCanvas.height = canvaslower.height;

        var palette = tmpCtx.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height); // x, y, w, h
        palette.data.set(new Uint8ClampedArray(data.coords)); // Assuming values 0..255, RGBA
        tmpCtx.putImageData(palette, 0, 0); // Repost the data.
        var imgData = tmpCtx.getImageData(data.x, data.y, data.width, data.height); // Get cropped image
        tmpCanvas.width = data.width;
        tmpCanvas.height = data.height;
        tmpCtx.putImageData(imgData,0,0);

        return new Promise( resolve => {
            const img = new Image()
            img.onload = function() {
                var fImg = new fabric.Image( img, {
                    left: data.x,
                    top: data.y,
                    selectable: false
                
                });
                var currentT = fImg.calcTransformMatrix();
                var mT = fabric.util.multiplyTransformMatrices(mInverse, currentT );
                var options = fabric.util.qrDecompose(mT);
                var newCenter = { x: options.translateX, y: options.translateY };
                fImg.flipX = false;
                fImg.flipY = false;
                fImg.set(options);
                fImg.setPositionByOrigin(newCenter, 'center', 'center');
                centroid  =  fabric.util.transformPoint(centroid, mInverse);
                resolve({
                    img : fImg,
                    area : area*fImg.scaleX*fImg.scaleY,
                    perimeter : perimeter,
                    centroid : centroid
                });
            };
            img.src = tmpCanvas.toDataURL('image/png'); 
        })
        
    }
}