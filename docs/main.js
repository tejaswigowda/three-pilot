// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Roof with curves (alternative to CapsuleGeometry)
function createCurvedRoof() {
    const roofGroup = new THREE.Group();

    // Main cylindrical part of the roof
    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue roof
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.rotation.z = Math.PI / 2; // Rotate to align with the car
    roofGroup.add(cylinder);

    // Rounded ends of the roof
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue roof

    const leftSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    leftSphere.position.set(-0.5, 0, 0); // Position at one end of the cylinder
    roofGroup.add(leftSphere);

    const rightSphere = leftSphere.clone();
    rightSphere.position.set(0.5, 0, 0); // Position at the other end of the cylinder
    roofGroup.add(rightSphere);

    return roofGroup;
}

// Create a procedural car
function createCar() {
    const car = new THREE.Group();

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red body
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.25;
    car.add(body);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.5, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black wheels

    const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    frontLeftWheel.rotation.z = Math.PI / 2;
    frontLeftWheel.position.set(-0.8, 0, 0.6);
    car.add(frontLeftWheel);

    const frontRightWheel = frontLeftWheel.clone();
    frontRightWheel.position.set(-0.8, 0, -0.6);
    car.add(frontRightWheel);

    const backLeftWheel = frontLeftWheel.clone();
    backLeftWheel.position.set(0.8, 0, 0.6);
    car.add(backLeftWheel);

    const backRightWheel = frontLeftWheel.clone();
    backRightWheel.position.set(0.8, 0, -0.6);
    car.add(backRightWheel);

    // Add the curved roof
    const roof = createCurvedRoof();
    roof.position.set(0, 0.8, 0);
    car.add(roof);

    // Headlights
    const headlightGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Yellow headlights

    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    leftHeadlight.position.set(-1.1, 0.3, 0.3);
    car.add(leftHeadlight);

    const rightHeadlight = leftHeadlight.clone();
    rightHeadlight.position.set(-1.1, 0.3, -0.3);
    car.add(rightHeadlight);

    // Tail lights
    const tailLightMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red tail lights

    const leftTailLight = new THREE.Mesh(headlightGeometry, tailLightMaterial);
    leftTailLight.position.set(1.1, 0.3, 0.3);
    car.add(leftTailLight);

    const rightTailLight = leftTailLight.clone();
    rightTailLight.position.set(1.1, 0.3, -0.3);
    car.add(rightTailLight);

    return car;
}

// Add the car to the scene
const car = createCar();
scene.add(car);

const lightPole = createLightPole();
scene.add(lightPole);

const tree = createTree();
scene.add(tree);

const floor = createFloor();
scene.add(floor);

// Set a gradient background for the horizon
const horizonColorTop = new THREE.Color(0x87CEEB); // Sky blue
const horizonColorBottom = new THREE.Color(0xFFFFFF); // White
const horizonGradient = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    vertexColors: true,
});

const horizonGeometry = new THREE.SphereGeometry(100, 32, 32);
const horizon = new THREE.Mesh(horizonGeometry, horizonGradient);
scene.add(horizon);

// Add lighting for better visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Add the traffic cone to the scene
const trafficCone = createTrafficCone();
trafficCone.position.set(1, 0, 1); // Position the cone near the car
scene.add(trafficCone);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Camera position
camera.position.z = 5;

// orbital controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;
controls.minDistance = 2;
controls.maxDistance = 10;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;
controls.target.set(0, 0, 0);
controls.update();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    //car.rotation.y += 0.01; // Rotate the car for a better view
    renderer.render(scene, camera);
}

animate();

function getGLB() {
    const exporter = new THREE.GLTFExporter();
    exporter.parse(scene, function (gltfJson) {
      console.log(gltfJson);
      // remove lights and cameras
        gltfJson.scenes[0].nodes = gltfJson.scenes[0].nodes.filter(node => {
            const object = gltfJson.nodes[node];
            console.log(object);
            return object && object.type !== 'DirectionalLight' && object.type !== 'Light' && object.type !== 'Camera';
        });
      const jsonString = JSON.stringify(gltfJson);
      console.log(jsonString);
  
      const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "scene.glb";
        a.click();
        URL.revokeObjectURL(url);

    }, { binary: false });
  }
  



  // Add a light pole next to the car
function createLightPole() {
    const lightPoleGroup = new THREE.Group();

    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 32);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Gray pole
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.set(2, 1.5, 0); // Position the pole next to the car
    lightPoleGroup.add(pole);

    // Light bulb
    const bulbGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const bulbMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00 }); // Yellow glowing bulb
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.set(2, 3, 0); // Position the bulb at the top of the pole
    lightPoleGroup.add(bulb);

    // Add a point light for the bulb
    const pointLight = new THREE.PointLight(0xffff00, 1, 10); // Yellow light
    pointLight.position.set(2, 3, 0);
    lightPoleGroup.add(pointLight);

    return lightPoleGroup;
}


function createTree() {
    const treeGroup = new THREE.Group();

    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 16);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown trunk
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(-2, 0.5, 0); // Position the trunk on the other side of the car
    treeGroup.add(trunk);

    // Tree foliage
    const foliageGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Green foliage
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.set(-2, 1.2, 0); // Position the foliage above the trunk
    treeGroup.add(foliage);

    return treeGroup;
}


function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 }); // Gray floor
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate to make it horizontal
    floor.position.y = 0; // Position the floor at ground level
    return floor;
}

function createTrafficCone() {
    const coneGroup = new THREE.Group();

    // Cone part
    const coneGeometry = new THREE.ConeGeometry(0.2, 0.5, 32); // Radius 0.2, height 0.5
    const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 }); // Orange cone
    const cone = new THREE.Mesh(coneGeometry, coneMaterial);
    cone.position.y = 0.25; // Position the cone above the base
    coneGroup.add(cone);

    // Base part
    const baseGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.05, 32); // Radius 0.25, height 0.05
    const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 }); // Black base
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0.025; // Position the base at ground level
    coneGroup.add(base);

    return coneGroup;
}

