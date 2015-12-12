var camera, scene, renderer, geometry, material, mesh;

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var isMouseDown = false;

var sprites = new Array();
var spriteMesh;
var seedObjects = new Array();

//Inputs
var size = 16;
var tileSize = 32;
var color = "#F00";
var border = false;

//Kill and grow should be 0 - 9
var killCount = 4;
var growCount = 1;
var iterations = 4;
var animFrames = 3;

init();
animate();

window.addEventListener( 'mousemove', onMouseMove, false );
window.addEventListener( 'mousedown', onMouseDown, false );
window.addEventListener( 'mouseup', onMouseUp, false );

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 80;
  scene.add(camera);

  var plane = createDrawingPlane(tileSize, tileSize);
  plane.name = "clickableCanvas";
  scene.add(plane);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  document.getElementById("generate").onclick = generateSpriteFromDrawnSeed;
}

function seedFromDrawings(sprite) {
  for (var i = 0; i < seedObjects.length; i++) {
    var pos = seedObjects[i].position;
    sprite[pos.x + tileSize / 2][pos.y + tileSize / 2] = 1;
  }
  return sprite;
}

function generateSpriteFromDrawnSeed() {
  if (spriteMesh != null) {
    scene.remove(spriteMesh);
  }

  spriteMesh = new THREE.Object3D();

  var spriteFrames = generateAnimatableSprite(animFrames, iterations, tileSize, tileSize, seedFromDrawings);
  for (var i = 0; i < spriteFrames.length; i++) {
    var meshFrame = generateSpriteMesh(spriteFrames[i], true);
    meshFrame.visible = false;
    spriteMesh.add(meshFrame);
  }

  spriteMesh.currentFrame = 0;
  scene.add(spriteMesh);

  for (var i = 0; i < seedObjects.length; i++) {
    scene.remove(seedObjects[i]);
  }
  seedObjects = new Array();
}

function createDrawingPlane(xSize, ySize) {
  var geometry = new THREE.PlaneGeometry(xSize, ySize, 1);
  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
  var plane = new THREE.Mesh( geometry, material );
  return plane;
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

var startTime = 0;
var frameLength = .1;
function render() {
  startTime += 1/60.0;
  if (startTime > frameLength && spriteMesh != null) {
    startTime = 0;

    var hideFrame = boundsFrame(spriteMesh.currentFrame, spriteMesh.children.length)
    var showFrame = boundsFrame(++spriteMesh.currentFrame, spriteMesh.children.length)

    spriteMesh.children[hideFrame].visible = false;
    spriteMesh.children[showFrame].visible = true;
  }

  drawCubes();

  renderer.render(scene, camera);
}

function drawCubes() {
  if (!isMouseDown)
    return;

  // update the picking ray with the camera and mouse position  
  raycaster.setFromCamera( mouse, camera ); 
  // calculate objects intersecting the picking ray
  var intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length == 0)
    return;
  if (intersects[0].object.name == "clickableCanvas") {
    var p = intersects[0].point;
    var cube = createCube(Math.round(p.x), Math.round(p.y), 0);
    scene.add(cube);
    seedObjects.push(cube);
  }
}

function onMouseMove( event ) {
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;   
}

function onMouseDown(event) {
  isMouseDown = true;
}

function onMouseUp( event ) {
  isMouseDown = false;
}

function createCube(x, y, z) {
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshNormalMaterial();
  var cube = new THREE.Mesh( geometry, material );
  cube.position.set(x, y, z);
  return cube;
}

function boundsFrame(num, length) {
  var value = Math.floor(num / length) % 2;
  var count = num % length;
  if (value == 1)
    return length - count - 1;
  return count;
}

function generateSpriteMesh(sprite, isSymmetric) {
  var xSize = sprite.length;
  var ySize = sprite[0].length;
  var xOffset = (xSize / 2);
  var yOffset = (ySize / 2)
  if (isSymmetric) {
    xSize /= 2;
    xOffset = 0;
    yOffset = 0;
  }

  var sprite3d = new THREE.Object3D();

  for (var x = 0; x < sprite.length; x++) {
    for (var y = 0; y < sprite[x].length; y++) {
      if (sprite[x][y] == 0)
        continue;

      var geometry = new THREE.BoxGeometry( 1, 1, 1 );
      var material = new THREE.MeshNormalMaterial();
      var cube = new THREE.Mesh( geometry, material );
      cube.position.set(x - xOffset, y - yOffset, 0);

      sprite3d.add(cube);

      if (isSymmetric) {
        cube = cube.clone();
        cube.position.set(-x, y, 0);
        sprite3d.add(cube);
      }
    }
  }
  
  return sprite3d;
}

function generateSprite(xSize, ySize) {
  var sprite = createSprite(xSize, ySize);
  sprite = seedSprite(sprite);
  for (var i = 0; i < iterations; i++) {
    sprite = tick(sprite);
  }

  return sprite;
}

function generateAnimatableSprite(numFrames, iterations, xSize, ySize, seedFunc) {
  var spriteFrames = new Array();
  var sprite = createSprite(xSize, ySize);
  sprite = seedFunc(sprite);
  for (var i = 0; i < iterations; i++) {
    sprite = tick(sprite);
    if ((iterations - numFrames) <= i) {
      spriteFrames.push(sprite);
    }
  }

  return spriteFrames;
}

function seedSprite(sprite) {
  for (var x = 0; x < sprite.length; x++) {
    for (var y = 0; y < sprite[x].length; y++) {
      sprite[x][y] = Math.round(Math.random(0, 1));
    }
  }

  return sprite;
}

function tick(sprite) {
  //Kill
  sprite = applyRule(sprite, killCount, 1, 0);
  //Grow
  sprite = applyRule(sprite, growCount, 0, 1);

  return sprite;
}

function createSprite(xSize, ySize) {
  var sprite = new Array();

  for (var x = 0; x < xSize; x++) {
    sprite.push(new Array());
    for (var y = 0; y < ySize; y++) {
      sprite[x].push(0);
    }
  }

  return sprite;
}

function getNeighborCount(sprite, x, y) {
  var count = 0;
  for (var xx = x - 1; xx < x + 1; xx++) {
    for (var yy = y - 1; yy < y + 1; yy++) {
      if (xx < 0 || yy < 0 || xx > sprite.length || yy > sprite[0].length)
        continue;
      if (sprite[xx][yy] != 0)
        count++;
    }
  }

  return count;
}

function applyRule(sprite, minLimit, requiredState, newState) {
  var newSprite = createSprite(sprite.length, sprite[0].length)
  for (var x = 0; x < sprite.length; x++) {
    for (var y = 0; y < sprite[0].length; y++) {
      newSprite[x][y] = sprite[x][y];
      if (sprite[x][y] != requiredState)
        continue;
      var count = getNeighborCount(sprite, x, y);
      if (count >= minLimit) {
        newSprite[x][y] = newState;
      }
    }
  }

  return newSprite;
}