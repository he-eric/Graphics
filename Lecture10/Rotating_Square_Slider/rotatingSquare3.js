"use strict";

var gl;

var theta = 0.0;
var thetaLoc;
var angleLoc;

var speed = 100;
var angle = 0.0

var center = vec2(0,0);
var vertices = [];
var maze = [];

var program;

var objects = [];
var allPoints = [];
var n = 4;
var cells = [];

var rowMap = [];
var colMap = [];

var currentCell = 0;

//0 right
//1 left
//2 up
//3 down
var direction = 0;

var PIXELS = 0.2;

class Graph {
    // defining vertex array and
    // adjacent list
    constructor(noOfVertices)
    {
        this.noOfVertices = noOfVertices;
        this.AdjList = new Map();
    }

    // functions to be implemented

    // addVertex(v)
    // addEdge(v, w)
    // printGraph()

    // bfs(v)
    // dfs(v)
}

window.onload = function init()
{
    var g = new Graph(5);
    console.log(g.noOfVertices);
    generateMaze(n);
    //maze = [vec2(0.3,0.3), vec2(0.4, 0.3), vec2(0.3, 0.6), vec2(0.4, 0.6)];
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');

    objects = [gl.TRIANGLE_STRIP, gl.LINES];

    if (!gl) alert("WebGL 2.0 isn't available");

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //
    // Load shaders and initialzie attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram( program );

    var x = cells[0][0];
    var y = cells[0][1];
    vertices = [
        vec2(x-(PIXELS/5),  y-(PIXELS/2)),
        vec2(x-(PIXELS/5),  y+(PIXELS/2)),
        vec2(x+PIXELS/2,  y),
    ];

    center = vec2(x, y);

    allPoints = [vertices, maze];

    draw(objects, allPoints);
    // load(vertices);
    // render(gl.TRIANGLE_STRIP, 3);
    // load(maze);
    // render(gl.LINES, maze.length);

    // Initialize event handlers

    document.getElementById("slider").onchange = function(event) {
        speed = 100 - event.target.value;
    };


    document.getElementById("Controls").onclick = function( event) {
        switch(event.target.index) {
          case 0:

            break;

         case 1:
            speed /= 2.0;
            break;

         case 2:
            speed *= 2.0;
            break;
       }
    };

    window.onkeydown = function(event) {
        //var key = String.fromCharCode(event.keyCode);
        switch( event.keyCode ) {
          case 37:
            //set direction
            //0 right
            //1 left
            //2 up
            //3 down
            if (direction == 0) {
              direction = 3;
            }
            else if (direction == 1) {
              direction = 2;
            }
            else if (direction == 2) {
              direction = 0;
            }
            else {
              direction = 1;
            }
            // console.log("current cell = " + currentCell);
            var x = cells[currentCell][0];
            var y = cells[currentCell][1];
            var s = parseFloat(Math.sin(radians(-90)).toFixed(3));
            var c = parseFloat(Math.cos(radians(-90)).toFixed(3));
            var newCenter = vec2(-s*y + c*x, s*x + c*y);
            // console.log(newCenter);
            // console.log(center);
            var diff = subtract(center, newCenter);
            //console.log(center);
            for (var i = 0; i < vertices.length; i++) {
              //console.log(vertices[i]);
              x = vertices[i][0];
              y = vertices[i][1];
              vertices[i][0] = (-s*y + c*x) + diff[0];
              vertices[i][1] = ( s*x + c*y) + diff[1];
            }
            // load(vertices);
            // render(gl.TRIANGLE_STRIP, 3);
            draw(objects, allPoints);
            break;

          case 38:
            if (direction == 0) {
              if (!move())
                break;
              currentCell+=1;
              center = cells[currentCell];
              for (var i = 0; i < vertices.length; i++) {
                //vertices[i][0] =
                vertices[i][0] += PIXELS;
              }
            }
            else if (direction == 1) {
              if (!move())
                break;
              currentCell-=1;
              center = cells[currentCell];
              for (var i = 0; i < vertices.length; i++) {
                //vertices[i][0] =
                vertices[i][0] -= PIXELS;
              }
            }
            else if (direction == 2) {
              if (!move())
                break;
              currentCell-=n;
              center = cells[currentCell];
              for (var i = 0; i < vertices.length; i++) {
                //vertices[i][0] =
                vertices[i][1] += PIXELS;
              }
            }
            else {
              if (!move())
                break;
              currentCell+=n;
              center = cells[currentCell];
              for (var i = 0; i < vertices.length; i++) {
                //vertices[i][0] =
                vertices[i][1] -= PIXELS;
              }
            }
            // load(vertices);
            // render(gl.TRIANGLE_STRIP, 3);
            draw(objects, allPoints);
            break;

          case 39:
            speed *= 2.0;
            break;

          case 40:
            speed *= 2.0;
            break;
        }
    };
};

//0 right
//1 left
//2 up
//3 down
function move()
{
  var nextCol = (currentCell % n)+1;
  if (direction == 0 && nextCol < n) {
    if (colMap[Math.floor(currentCell/n)][nextCol] != 1)
      return true;
    return false;
  }

  var prevCol = (currentCell % n)-1;
  if (direction == 1 && prevCol >= 0) {
    if (colMap[Math.floor(currentCell/n)][prevCol+1] != 1)
      return true;
    return false;
  }

  var nextRow = Math.floor(currentCell/n);
  if (direction == 3 && nextRow+1 < n) {
    if (rowMap[Math.floor(nextRow+1)][currentCell%n] != 1)
      return true;
    return false;
  }

  var prevRow = Math.floor(currentCell/n) - 1;
  if (direction == 2 && prevRow >= 0) {
    if (rowMap[Math.floor(currentCell/n)][currentCell%n] != 1)
      return true;
    return false;
  }
  return false;
}

function addWalls(center, length)
{
  var percentage = 0.0;
  var walls      = [];
  var pts        = [];
  var HALF       = length/2;
  pts.push(vec2(center[0]-HALF, center[1]+HALF));
  pts.push(vec2(center[0]+HALF, center[1]+HALF));
  pts.push(vec2(center[0]+HALF, center[1]-HALF));
  pts.push(vec2(center[0]-HALF, center[1]-HALF));
  // if (Math.random() > percentage) {
  //   walls.push(pts[0]); walls.push(pts[1]);
  // }
  // else {
  //   walls.push(pts[0]); walls.push(pts[0]);
  // }
  // if (Math.random() > percentage) {
  //   walls.push(pts[1]); walls.push(pts[2]);
  // }
  // else {
  //   walls.push(pts[0]); walls.push(pts[0]);
  // }
  // if (Math.random() > percentage) {
  //   walls.push(pts[2]); walls.push(pts[3]);
  // }
  // else {
  //   walls.push(pts[0]); walls.push(pts[0]);
  // }
  // if (Math.random() > percentage) {
  //   walls.push(pts[3]); walls.push(pts[0]);
  // }
  // else {
  //   walls.push(pts[0]); walls.push(pts[0]);
  // }
  // [ [line] [line] [line] [line] ]
  walls.push([pts[0], pts[1]]);
  walls.push([pts[1], pts[2]]);
  walls.push([pts[2], pts[3]]);
  walls.push([pts[3], pts[0]]);
  // for (var i in pts) {
  //   console.log(pts[i]);
  // }
  //console.log(walls[0]);
  return walls;
}

// [[[] [] [] []] [[] [] [] []] [[] [] [] []]]
function deleteWalls(walls)
{
    var n = Math.sqrt(walls.length);

    // delete inner middle
    for (var i = 1; i < n-1; i++) {
      for (var j = 1; j < n-1; j++) {
        for (var w = 0; w < 4; w++) {
          if (Math.random() > 0.25) {
            walls[i*n + j][w] = [vec2(0,0), vec2(0,0)];
            if (w == 0) {
              walls[i*n + j - n][2] = [vec2(0,0), vec2(0,0)];
            }
            else if (w == 1) {
              walls[i*n + j +1][3] = [vec2(0,0), vec2(0,0)];
            }
            else if (w == 2) {
              walls[i*n + j +n][0] = [vec2(0,0), vec2(0,0)];
            }
            else {
              walls[i*n + j - 1][1] = [vec2(0,0), vec2(0,0)];
            }
          }
        }
      }
    }

    // delete first row
    for (var i = 1; i < n-1; i++) {
      if (Math.random() > 0.9) {
        walls[i][1] = [vec2(0,0), vec2(0,0)];
        walls[i+1][3] = [vec2(0,0), vec2(0,0)];
      }
      if (Math.random() > 0.9) {
        walls[i][3] = [vec2(0,0), vec2(0,0)];
        walls[i-1][1] = [vec2(0,0), vec2(0,0)];
      }
    }

    // delete last row
    for (var i = n*n-n+1; i < n*n-1; i++) {
      if (Math.random() > 0.9) {
        walls[i][1] = [vec2(0,0), vec2(0,0)];
        walls[i+1][3] = [vec2(0,0), vec2(0,0)];
      }
      if (Math.random() > 0.9) {
        walls[i][3] = [vec2(0,0), vec2(0,0)];
        walls[i-1][1] = [vec2(0,0), vec2(0,0)];
      }
    }

    //delete first column
    for (var i = 1; i < n-1; i++) {
      if (Math.random() > 0.5) {
        walls[i*n][0] = [vec2(0,0), vec2(0,0)];
        walls[i*n-n][2] = [vec2(0,0), vec2(0,0)];
      }
      // if (Math.random() > 0) {
      //   walls[i*n][2] = [vec2(0,0), vec2(0,0)];
      //   walls[i*n+n][0] = [vec2(0,0), vec2(0,0)];
      // }
    }

    // delete last column
    for (var i = 1; i < n-1; i++) {
      if (Math.random() > 0.75) {
        walls[i*n+n-1][0] = [vec2(0,0), vec2(0,0)];
        walls[i*n-1][2] = [vec2(0,0), vec2(0,0)];
      }
      // if (Math.random() > 0) {
      //   walls[i*n+n-1][2] = [vec2(0,0), vec2(0,0)];
      //   walls[i*n+n-1][0] = [vec2(0,0), vec2(0,0)];
      // }
    }

    //entrance at cell 1
    walls[0][3] = [vec2(0,0), vec2(0,0)];
    walls[0][1] = [vec2(0,0), vec2(0,0)];
    walls[0][2] = [vec2(0,0), vec2(0,0)];
    walls[1][3] = [vec2(0,0), vec2(0,0)];
    walls[n][0] = [vec2(0,0), vec2(0,0)];
    //exit
    walls[n*n-1][1] = [vec2(0,0), vec2(0,0)];
    walls[n*n-1][3] = [vec2(0,0), vec2(0,0)];
    walls[n*n-1][0] = [vec2(0,0), vec2(0,0)];
    walls[n*n-2][1] = [vec2(0,0), vec2(0,0)];
    walls[n*n-1-n][2] = [vec2(0,0), vec2(0,0)];
    return walls;
}

function mapWalls(walls)
{
  rowMap = [];
  colMap = [];
  for (var i = 0; i < n; i++) {
    rowMap.push([]);
    colMap.push([]);
    for (var j = 0; j < n+1; j++) {
      rowMap[i].push(1);
      colMap[i].push(1);
    }
  }
  //console.log(colMap);

  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n; j++) {
      if (mapWallsHelper(walls[i*n + j][0])) {
        rowMap[i][j] = 0;
      }
      if (mapWallsHelper(walls[i*n + j][3])) {
        // console.log(i + " " + j);
        colMap[i][j] = 0;
      }
    }
  }

  for (var i = 0; i < n; i++) {
    for (var j = 0; j < n+1; j++) {
      console.log(colMap[i][j] + " ");
    }
    console.log("");
  }
}

//is wall? given [vec2(x,y), vec2(x,y)]
function mapWallsHelper(wall)
{
  if (wall[0][0] == wall[1][0] && wall[0][1] == wall[1][1])
    return true;
  return false;
}

function generateMaze(n)
{
  //directions
  //assume pixel length/height of each cell is 20
  //generate cells
  var walls = [];
  var startXCoord = -PIXELS*n/2 + PIXELS/2;
  var startYCoord =  PIXELS*n/2 - PIXELS/2;
  for (var i = 0; i < n; i++)
  {
    for (var j = 0; j < n; j++)
    {
      var x = startXCoord + (j * PIXELS);
      var y = startYCoord - (i * PIXELS);
      walls.push(addWalls(vec2(x,y), PIXELS));
      //console.log(walls);
      //console.log(x + " " + y);
      cells.push(vec2(x, y));

      // for (var wall in walls) {
      //   maze.push(walls[wall]);
      // }
    }
  }

  walls = deleteWalls(walls);
  mapWalls(walls);
  for (var i = 0; i < walls.length; i++) {
    for (var j = 0; j < walls[i].length; j++) {
      maze.push(walls[i][j][0]);
      maze.push(walls[i][j][1]);
      // if (isVector(walls[i]))
      //   console.log("sdad")
    }
  }

  //console.log(maze[0]);
  //for (var i in maze)

  //generate segments for perimeter of maze
  // for (var i = 0; i < n; i++) {
  //   var topLeftPt  = vec2(cells[i][0] - PIXELS/2, cells[i][1] + PIXELS/2);
  //   var topRightPt = vec2(cells[i][0] + PIXELS/2, cells[i][1] + PIXELS/2);
  //
  //
  //   console.log(leftPt + " " + rightPt);
  //   maze.push(topLeftPt);
  //   maze.push(topRightPt);
  // }
}

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

  thetaLoc = gl.getUniformLocation(program, "uTheta");
  angleLoc = gl.getUniformLocation(program, "uAngle");

}

function render(type, n)
{
    //gl.clear( gl.COLOR_BUFFER_BIT );



    gl.uniform1f(thetaLoc, theta);
    gl.uniform1f(angleLoc, angle);

    gl.drawArrays(type, 0, n);

    // setTimeout(
    //     function () {requestAnimationFrame(render);},
    //     speed
    // );
    // requestAnimationFrame(render)
}

function draw(types, points)
{
    //gl.clear( gl.COLOR_BUFFER_BIT );
    for (var i = 0; i < types.length; i++)
    {
        load(points[i]);
        render(types[i], points[i].length);
    }
}
