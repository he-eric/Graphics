"use strict";

var gl;
var positions =[];

var numPositions = 5000;

function lineLength(a, b) {
    return Math.sqrt(Math.pow(b[0] - a[0], 2) + Math.pow(b[1] - a[1], 2)); 
}

function iterations(i) {
    var segments = 3;
    while (i != 0) {
        segments = (segments * 4) + segments;
        --i;
    }
    return segments;
}

function myRotate(a, b, angle) {
    angle = radians(angle);
    var x = Math.cos(angle); // 0
    var y = Math.sin(angle); // 1
    var v = vec2(b[0] - a[0], b[1] - a[1]);
    var rotatedX = v[0] * x + v[1] * y;
    var rotatedY = v[1] * x - v[0] * y;
    return vec2(b[0] + rotatedX, b[1] + rotatedY);
}

window.onload = function init()
{
    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available" );

    //
    //  Initialize our data for the Sierpinski Gasket
    //
    var counter = iterations(0);
    var queue = [];

    queue.push(
        [vec2(-0.5, -0.5), vec2(0.5, -0.5)]
            );

    queue.push(
        [vec2(0.5, -0.5), vec2(0, Math.sqrt(3) / 4)]
            );
    queue.push(
        [vec2(0, Math.sqrt(3) / 4), vec2(-0.5, -0.5)]
            );

    //
    // loop for as many line segments as necessary
    //
    while (counter > 0) {
        var lineSegment = queue.shift();
        var pt1 = lineSegment[0];
        var pt2 = mix(lineSegment[0], lineSegment[1], 1/3);
        var pt4 = mix(lineSegment[0], lineSegment[1], 2/3);
        var pt3 = myRotate(pt2, pt4, 120);
        var pt5 = lineSegment[1];
       
        var segment1 = [pt1, pt2];
        var segment2 = [pt2, pt3];
        var segment3 = [pt3, pt4];
        var segment4 = [pt4, pt5];

        queue.push(segment1);
        queue.push(segment2);
        queue.push(segment3);
        queue.push(segment4);
        --counter;
    }

    //
    // push all points into positions
    //
    while (queue.length > 0) {
        var lineSegment = queue.shift();
        positions.push(lineSegment[0]);
        positions.push(lineSegment[1]);
    }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays(gl.LINES, 0, positions.length);
}
