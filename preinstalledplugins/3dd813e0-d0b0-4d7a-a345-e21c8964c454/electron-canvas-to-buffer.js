/*
The MIT License (MIT) Copyright (c) 2015 Matt DesLauriers

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var nativeImage = require('electron').nativeImage
var types = ['image/png', 'image/jpg', 'image/jpeg']

module.exports = function canvasBuffer (canvas, type, quality) {
  type = type || 'image/png'
  quality = typeof quality === 'number' ? quality : 0.9
  if (types.indexOf(type) === -1) {
    throw new Error('unsupported image type ' + type)
  }

  var data = canvas.toDataURL(type, quality)
  var img = typeof nativeImage.createFromDataURL === 'function'
    ? nativeImage.createFromDataURL(data) // electron v0.36+
    : nativeImage.createFromDataUrl(data) // electron v0.30
  if (/^image\/jpe?g$/.test(type)) {
    return img.toJpeg(Math.floor(quality * 100))
  } else {
    return img.toPng()
  }
}