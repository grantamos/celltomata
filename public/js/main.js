var camera, scene, renderer, geometry, material, mesh;

var sprites = new Array();
var spriteMesh;

//Inputs
var size = 16;
var tileSize = 16;
var color = "#F00";
var border = false;

//Kill and grow should be 0 - 9
var killCount = 4;
var growCount = 1;
var iterations = 4;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.z = 50;
  scene.add(camera);

  var sprite = generateSprite(tileSize / 2, tileSize);
  spriteMesh = generateSpriteMesh(sprite, true);

  scene.add(spriteMesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  spriteMesh.rotation.x += 0.005;
  spriteMesh.rotation.y += 0.003;

  renderer.render(scene, camera);
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

function generateAnimatableSprite(xSize, ySize) {
  var spriteFrames = {};
  var sprite = createSprite(xSize, ySize);
  sprite = seedSprite(sprite);
  for (var i = 0; i < iterations; i++) {
    spriteFrames.firstFrame = sprite;
    sprite = tick(sprite);
  }
  spriteFrames.lastFrame = sprite;

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