// Set up scene, camera, renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up controls
const controls = new THREE.PointerLockControls(camera, renderer.domElement);
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

instructions.addEventListener('click', function () {
    controls.lock();
});

controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
});

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(directionalLight);

// Create the room
const roomSize = 10;
const wallGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
const walls = [
    new THREE.Mesh(wallGeometry, wallMaterial), // front
    new THREE.Mesh(wallGeometry, wallMaterial), // back
    new THREE.Mesh(wallGeometry, wallMaterial), // left
    new THREE.Mesh(wallGeometry, wallMaterial), // right
    new THREE.Mesh(wallGeometry, wallMaterial), // ceiling
    new THREE.Mesh(wallGeometry, wallMaterial)  // floor
];
walls[0].position.z = -roomSize / 2;
walls[1].position.z = roomSize / 2;
walls[1].rotation.y = Math.PI;
walls[2].position.x = -roomSize / 2;
walls[2].rotation.y = Math.PI / 2;
walls[3].position.x = roomSize / 2;
walls[3].rotation.y = -Math.PI / 2;
walls[4].position.y = roomSize / 2;
walls[4].rotation.x = Math.PI / 2;
walls[5].position.y = -roomSize / 2;
walls[5].rotation.x = -Math.PI / 2;
walls.forEach(wall => scene.add(wall));

// Create content planes
const planeGeometry = new THREE.PlaneGeometry(2, 2);
const planeMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xff0000 }), // home
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // about
    new THREE.MeshBasicMaterial({ color: 0x0000ff }), // projects
    new THREE.MeshBasicMaterial({ color: 0xffff00 })  // contact
];
const contentPlanes = [
    new THREE.Mesh(planeGeometry, planeMaterials[0]),
    new THREE.Mesh(planeGeometry, planeMaterials[1]),
    new THREE.Mesh(planeGeometry, planeMaterials[2]),
    new THREE.Mesh(planeGeometry, planeMaterials[3])
];
// Position the planes
contentPlanes[0].position.set(0, 0, -roomSize / 2 + 0.1); // front wall
contentPlanes[1].position.set(-roomSize / 2 + 0.1, 0, 0);
contentPlanes[1].rotation.y = Math.PI / 2;
contentPlanes[2].position.set(roomSize / 2 - 0.1, 0, 0);
contentPlanes[2].rotation.y = -Math.PI / 2;
contentPlanes[3].position.set(0, 0, roomSize / 2 - 0.1);
contentPlanes[3].rotation.y = Math.PI;
contentPlanes.forEach(plane => scene.add(plane));

// Get the content divs
const contentDivs = [
    document.getElementById('homeContent'),
    document.getElementById('aboutContent'),
    document.getElementById('projectsContent'),
    document.getElementById('contactContent')
];

// Add particle system for trippy effect
const particleCount = 1000;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * roomSize * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * roomSize * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * roomSize * 2;
}
particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Set initial camera position
camera.position.y = 1;

// Movement variables
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Event listeners for movement
const onKeyDown = function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
};
const onKeyUp = function (event) {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
};
document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

// Animation loop
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    if (controls.isLocked === true) {
        const delta = (time - prevTime) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
    }
    prevTime = time;
    // Check distance to content planes
    contentPlanes.forEach((plane, index) => {
        const distance = camera.position.distanceTo(plane.position);
        if (distance < 2) {
            contentDivs[index].style.display = 'block';
        } else {
            contentDivs[index].style.display = 'none';
        }
    });
    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});