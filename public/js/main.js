var camera, scene, renderer, geometry, material, mesh;

init();
animate();

function init() {


    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 500;
    scene.add(camera);

    geometry = new THREE.CubeGeometry(200, 200, 200);
    material = new THREE.MeshNormalMaterial();

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
}

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    renderer.render(scene, camera);
    
}

//All the
var sprites = new Array();

//Inputs
var size = 16;
var tileSize = 16;
var color = "#F00";
var border = false;
var param1 = 1;
var param2 = 2;
var param3 = 3;

function generate() {
  
}

function tick(sprite) {
  var newSprite = createSprite(
    sprite.pixels.length,
    sprite.pixels[0].length)
  
  
}

function createSprite(xSize, ySize) {
  var sprite = {};
  sprite.pixels = new Array();
  
  for (var x = 0; x < xSize; x++) {
    newSprite.pixels.push(0);
    for (var y = 0; y < ySize; y++) {
      newSprite.pixels[x].push(0);
    }
  }
  
  return sprite;
}