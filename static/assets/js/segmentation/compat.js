/** Compatibility API.
 *
 * Copyright 2015  Kota Yamaguchi
 */

  // Internet Explorer doesn't support ImageData().


var compat = {
	createImageData : function (width, height) {
		var context = document.createElement("canvas").getContext("2d");
		return context.createImageData(width, height);
	}
};
export default compat ;