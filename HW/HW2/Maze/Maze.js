"use strict";

//// TODO: how to conclude game?
//// TODO: fix 1x1 maze generation
//// TODO: testing

class Graph {
    // defining vertex array and
    // adjacent list
    constructor(n, m)
    {
        this.nodes = [];
        this.AdjList = new Map();
        this.rows = n;
        this.cols = m;

        var startX = (-Math.floor(m/2)) * PIXELS + (PIXELS/2);
        if (m % 2 == 1)
        {
          startX -= PIXELS;
        }
        var startY = Math.floor(n/2) * PIXELS - (PIXELS/2);
        if (n % 2 == 1)
        {
          startY += PIXELS;
        }

        for (var i = 0; i < n; i++)
        {
          for (var j = 0; j < m; j++)
          {
            var cellID = (i*m) + j;
            var center = vec2(startX + j*PIXELS, startY - i*PIXELS);
            var node = new Node(center, cellID, n, m);
            this.nodes.push(node);
            this.AdjList.set(cellID, []);
          }
        }

        // entrance
        this.nodes[0].walls[0] = 0;
        // exit
        this.nodes[n*m - 1].walls[2] = 0;
    }

    printGraph()
    {
      for (var i in this.nodes)
      {
        var node = this.nodes[i];
        console.log("cell num: " + node.cellNum + " center: " + node.center);
        //console.log("cell: " + node.cellNum + " walls: " + node.walls);
      }
    }

    printNeighbors()
    {
      for (var i in this.nodes)
      {
        for (var neighbor in this.nodes[i].possibleNeighbors)
        {
          console.log(this.nodes[i].possibleNeighbors[neighbor]);
        }
        console.log("");
      }
    }

    stackDFS()
    {
      var visited = new Array(this.nodes.length).fill(0);
      visited[0] = 1;

      var stack = [];
      stack.push( [this.nodes[1], 0] );
      stack.push( [this.nodes[this.cols], 0] );

      while (stack.length > 0)
      {
        // Pop next node
        var pair = stack.pop();
        var node = pair[0];
        //console.log(node);
        var parentCellNum = pair[1];
        var allNeighbors = [];

        // Set visited array
        if (visited[node.cellNum] == 1)
        {
          continue;
        }
        visited[node.cellNum] = 1;
        //console.log(parentCellNum + "->" + node.cellNum);

        this.AdjList.get(node.cellNum).push(parentCellNum);
        this.AdjList.get(parentCellNum).push(node.cellNum);

        //console.log(node.cellNum + " " + direction);
        var parentNode = this.nodes[parentCellNum];

        // Identify which walls need to be set to 0
        //0 left
        //1 top
        //2 right
        //3 bottom
        var nodeWall = 0;
        var parentWall = 0;
        if (parentCellNum == node.cellNum - 1)
        {
          nodeWall = 0;
          parentWall = 2;
        }
        else if (parentCellNum == node.cellNum + 1)
        {
          nodeWall = 2;
          parentWall = 0;
        }
        else if (parentCellNum == node.cellNum + this.cols)
        {
          nodeWall = 3;
          parentWall = 1;
        }
        else
        {
          nodeWall = 1;
          parentWall = 3;
        }

        // Set the walls to 0
        node.walls[nodeWall] = 0;
        //console.log(parentNode);
        parentNode.walls[parentWall] = 0;

        // Gather unvisited neighbors
        for (var n = 0; n < 4; n++)
        {
          var neighbor = node.possibleNeighbors[n];
          if (neighbor != -1 && visited[neighbor] != 1)
          {
            allNeighbors.push(neighbor);
          }
        }

        // Push unvisited neighbors into stack at random
        // Push as [Node node, int parentCellID]
        while (allNeighbors.length > 0)
        {
          var randomIndex = Math.floor(Math.random() * allNeighbors.length);
          //console.log("node: " + allNeighbors[randomIndex] );
          stack.push( [this.nodes[allNeighbors[randomIndex]], node.cellNum] );
          allNeighbors.splice(randomIndex, 1);
        }

      }
    }

    calculateWalls(pixels)
    {
      var allPoints = [];
      for (var i in this.nodes)
      {
        var lineSegments = this.nodes[i].calculateWalls(pixels);
        //console.log(lineSegments);
        for (var j = 0; j < lineSegments.length; j++)
        {
          //console.log(lineSegments[j]);
          var lineSegment = lineSegments[j];
          allPoints.push(lineSegment[0]);
          allPoints.push(lineSegment[1]);
        }
      }
      return allPoints;
    }
}

class Node {
  constructor(center, cellNum, n, m)
  {
    this.cellNum = cellNum;
    this.center = center;
    this.walls = [1,1,1,1];
    this.possibleNeighbors = [-1,-1,-1,-1];

    this.directions = [
                      [[-1, 1], [-1, -1]], //left
                      [[-1, 1], [1, 1]],   //top
                      [[1, 1], [1, -1]],   //right
                      [[1, -1], [-1, -1]]  //bottom
                    ];

    var col = cellNum % m; // 3
    var row = Math.floor(cellNum / m); // 2
    // console.log("generate neighbors for cell " + cellNum);
    if (col - 1 >= 0)
      this.possibleNeighbors[0] = cellNum - 1;
    if (row - 1 >= 0)
      this.possibleNeighbors[1] = cellNum - m;
    if (col + 1 < m)
      this.possibleNeighbors[2] = cellNum + 1;
    if (row + 1 < n)
    {
      this.possibleNeighbors[3] = cellNum + m;
    }
    // for (var i = 0; i < 4; i++)
    // {
    //   console.log(typeof this.possibleNeighbors[i])
    // }
    // console.log("");
  }

  static calculateWall(index, pixels, walls, center, directions)
  {
    var lineSegment = [];
    if (walls[index] == 1)
    {
      var dir = directions[index];
      var dir1 = dir[0];
      var dir2 = dir[1];
      var x1 = center[0] + (pixels * dir1[0]);
      var y1 = center[1] + (pixels * dir1[1]);
      var x2 = center[0] + (pixels * dir2[0]);
      var y2 = center[1] + (pixels * dir2[1]);
      var pt1 = vec2(x1, y1);
      var pt2 = vec2(x2, y2);
      lineSegment.push(pt1);
      lineSegment.push(pt2);
      return lineSegment;
    }
    return [vec2(0,0), vec2(0,0)];
  }

  calculateWalls(pixels)
  {
    var lineSegments = [];
    for (var i = 0; i < 4; i++)
    {
      var lineSegment = Node.calculateWall(i, pixels, this.walls, this.center, this.directions);
      lineSegments.push(lineSegment);
    }
    return lineSegments;
  }
}

class Rat {
  constructor(center, cellID, pixels, rows, cols)
  {
    this.rows = rows; this.cols = cols;
    this.cellID = cellID;
    this.center = center;
    this.pixels = pixels;
    var x1 = center[0] + pixels/2;
    var y1 = center[1];
    var x2 = center[0] - (pixels/4);
    var y2 = center[1] + pixels/2;
    var x3 = center[0] - (pixels/4);
    var y3 = center[1] - pixels/2;
    this.pts = [
      vec2(x1, y1),
      vec2(x2, y2),
      vec2(x3, y3)
    ];

    //0 -> 4 ... left to right ... clockwise
    this.faceDirection = 2;
  }

  rotate(rotateDirection)
  {
    var angle = rotateDirection * 90;
    var x = this.center[0];
    var y = this.center[1];
    var s = parseFloat(Math.sin(radians(angle)).toFixed(3));
    var c = parseFloat(Math.cos(radians(angle)).toFixed(3));
    var newCenter = vec2(-s*y + c*x, s*x + c*y);
    var diff = subtract(this.center, newCenter);

    //Rotate
    for (var i = 0; i < this.pts.length; i++) {
      x = this.pts[i][0];
      y = this.pts[i][1];
      this.pts[i][0] = (-s*y + c*x);
      this.pts[i][1] = ( s*x + c*y);
    }
    //Translate
    Rat.translate(this.pts, diff[0], diff[1]);

    //Set new face direction
    if (rotateDirection == -1)
    {
      if (this.faceDirection == 3)
        this.faceDirection = 0;
      else
        this.faceDirection += 1;
    }
    else {
      if (this.faceDirection == 0)
        this.faceDirection = 3;
      else
        this.faceDirection -= 1;
    }
  }

  move(node)
  {
    if (this.faceDirection == 0)
    {
      if (node.walls[0] == 0)
      {
        Rat.translate(this.pts, -this.pixels, 0);
        this.cellID-=1;
        this.center[0] -= this.pixels;
      }
    }
    else if (this.faceDirection == 1)
    {
      if (node.walls[1] == 0)
      {
        Rat.translate(this.pts, 0, this.pixels);
        this.cellID-=this.cols;
        this.center[1] += this.pixels;
      }
    }
    else if (this.faceDirection == 2)
    {
      if (node.walls[2] == 0)
      {
        Rat.translate(this.pts, this.pixels, 0);
        this.cellID+=1;
        this.center[0] += this.pixels;
      }
    }
    else
    {
      if (node.walls[3] == 0)
      {
        Rat.translate(this.pts, 0, -this.pixels);
        this.cellID+=this.cols;
        this.center[1] -= this.pixels;
      }
    }
  }

  static translate(pts, xTranslate, yTranslate)
  {
    var x; var y;
    for (var i = 0; i < pts.length; i++) {
      x = pts[i][0];
      y = pts[i][1];
      pts[i][0] = x + xTranslate;
      pts[i][1] = y + yTranslate;
    }
  }
}

var canvas;
var gl;

var PIXELS = .1;
var rows = 3;
var cols = 3;

var positions = [];
var rat = [];

var program;
var types;
var points;

function printPositions()
{
  var i = 0;
  while (i < positions.length)
  {
    console.log(positions[i] + ", " + positions[i+1])
    i+=2;
  }
}

window.onload = function init()
{
    var g = new Graph(rows, cols);
    g.stackDFS();
    //g.printGraph();
    //g.printNeighbors();
    positions = g.calculateWalls(PIXELS/2);
    //printPositions();
    //console.log(positions);
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    // initial rat position
    //center, cellID, pixels, rows, cols
    var rat = new Rat(g.nodes[0].center, 0, PIXELS, rows, cols);

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    types = [gl.LINES, gl.TRIANGLE_STRIP];
    points = [positions, rat.pts];
    draw(types, points);

    window.onkeydown = function(event) {
      switch( event.keyCode ) {
        case 37:
          rat.rotate(-1);
          draw(types, points);
          break;
        case 39:
          rat.rotate(1);
          draw(types, points);
          break;
        case 38:
          rat.move(g.nodes[rat.cellID]);
          draw(types, points);
          break;
      }
    }

    document.getElementById("submit").onclick =
      function()
      {
        rows = parseInt(document.getElementById("row").value);
        cols = parseInt(document.getElementById("col").value);
        g = new Graph(rows, cols);
        g.stackDFS();
        rat = new Rat(g.nodes[0].center, 0, PIXELS, rows, cols)
        points[0] = g.calculateWalls(PIXELS/2);
        points[1] = rat.pts;
        draw(types, points);
      };
};

function load(pts)
{
  // Load the data into the GPU

  var bufferId = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pts), gl.STATIC_DRAW);

  // Associate out shader variables with our data buffer

  var positionLoc = gl.getAttribLocation( program, "aPosition" );
  gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray(positionLoc);
}

function render(type, n)
{
    gl.drawArrays(type, 0, n);
}

function draw(types, points)
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    for (var i = 0; i < types.length; i++)
    {
        load(points[i]);
        render(types[i], points[i].length);
    }
}
