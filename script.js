// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Pointer Lock Controls
const controls = new THREE.PointerLockControls(camera, renderer.domElement);
const blocker = document.getElementById('blocker');

<<<<<<< HEAD:Script.js
// Click-to-Start
blocker.addEventListener('click', (event) => {
    event.preventDefault();
    controls.lock();
});

// Key-to-Start (Spacebar)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !controls.isLocked) {
        event.preventDefault();
        controls.lock();
    }
});

controls.addEventListener('lock', () => {
    blocker.style.opacity = '0';
    setTimeout(() => blocker.style.display = 'none', 500);
});

controls.addEventListener('unlock', () => {
    blocker.style.display = 'flex';
    blocker.style.opacity = '1';
});

// Error Handling
document.addEventListener('pointerlockerror', () => {
    alert("Pointer lock failed. Please try again or use a compatible browser.");
=======
// Robust Click-to-Start
instructions.addEventListener('click', () => {
    console.log("Initiating pointer lock");
    controls.lock();
});

controls.addEventListener('lock', () => {
    console.log("Pointer locked successfully");
    blocker.style.opacity = '0';
    setTimeout(() => blocker.style.display = 'none', 500); // Smooth fade-out
});

controls.addEventListener('unlock', () => {
    console.log("Pointer unlocked");
    blocker.style.display = 'flex';
    blocker.style.opacity = '1';
});

// Error Handling for Accessibility
document.addEventListener('pointerlockerror', () => {
    console.error("Pointer lock failed");
    alert("Pointer lock unavailable. Please try again or explore in a compatible browser (e.g., Chrome, Firefox).");
>>>>>>> 258f0a4168261685e7238e0e2cbe7a9bc173a5ae:script.js
});

// Epic Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0x00ffcc, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Cosmic Room
const roomSize = 10;
const wallGeometry = new THREE.PlaneGeometry(roomSize, roomSize);
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x001a33, side: THREE.DoubleSide });
const walls = [
<<<<<<< HEAD:Script.js
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial),
    new THREE.Mesh(wallGeometry, wallMaterial)
=======
    new THREE.Mesh(wallGeometry, wallMaterial), // Front
    new THREE.Mesh(wallGeometry, wallMaterial), // Back
    new THREE.Mesh(wallGeometry, wallMaterial), // Left
    new THREE.Mesh(wallGeometry, wallMaterial), // Right
    new THREE.Mesh(wallGeometry, wallMaterial), // Ceiling
    new THREE.Mesh(wallGeometry, wallMaterial)  // Floor
>>>>>>> 258f0a4168261685e7238e0e2cbe7a9bc173a5ae:script.js
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

// Interactive Content Planes
const planeGeometry = new THREE.PlaneGeometry(2, 2);
const planeMaterials = [
<<<<<<< HEAD:Script.js
    new THREE.MeshBasicMaterial({ color: 0xff0066 }),
    new THREE.MeshBasicMaterial({ color: 0x00ffcc }),
    new THREE.MeshBasicMaterial({ color: 0x6600ff }),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
=======
    new THREE.MeshBasicMaterial({ color: 0xff0066 }), // Home
    new THREE.MeshBasicMaterial({ color: 0x00ffcc }), // About
    new THREE.MeshBasicMaterial({ color: 0x6600ff }), // Projects
    new THREE.MeshBasicMaterial({ color: 0xffff00 })  // Contact
>>>>>>> 258f0a4168261685e7238e0e2cbe7a9bc173a5ae:script.js
];
const contentPlanes = [
    new THREE.Mesh(planeGeometry, planeMaterials[0]),
    new THREE.Mesh(planeGeometry, planeMaterials[1]),
    new THREE.Mesh(planeGeometry, planeMaterials[2]),
    new THREE.Mesh(planeGeometry, planeMaterials[3])
];
contentPlanes[0].position.set(0, 0, -roomSize / 2 + 0.1);
contentPlanes[1].position.set(-roomSize / 2 + 0.1, 0, 0);
contentPlanes[1].rotation.y = Math.PI / 2;
contentPlanes[2].position.set(roomSize / 2 - 0.1, 0, 0);
contentPlanes[2].rotation.y = -Math.PI / 2;
contentPlanes[3].position.set(0, 0, roomSize / 2 - 0.1);
contentPlanes[3].rotation.y = Math.PI;
contentPlanes.forEach(plane => scene.add(plane));

// Content Divs
const contentDivs = [
    document.getElementById('homeContent'),
    document.getElementById('aboutContent'),
    document.getElementById('projectsContent'),
    document.getElementById('contactContent')
];

// Trippy Particle System
const particleCount = 1500;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * roomSize * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * roomSize * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * roomSize * 2;
}
particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particleMaterial = new THREE.PointsMaterial({ 
    color: 0x00ffcc, 
    size: 0.05, 
    transparent: true,
    blending: THREE.AdditiveBlending 
});
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Initial Camera Position
camera.position.y = 1;

// Movement Controls
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
const onKeyDown = (event) => {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward = true; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = true; break;
        case 'ArrowDown': case 'KeyS': moveBackward = true; break;
        case 'ArrowRight': case 'KeyD': moveRight = true; break;
    }
};
const onKeyUp = (event) => {
    switch (event.code) {
        case 'ArrowUp': case 'KeyW': moveForward = false; break;
        case 'ArrowLeft': case 'KeyA': moveLeft = false; break;
        case 'ArrowDown': case 'KeyS': moveBackward = false; break;
        case 'ArrowRight': case 'KeyD': moveRight = false; break;
    }
};
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

// Animation Loop
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let prevTime = performance.now();
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    if (controls.isLocked) {
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();
        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;
        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

<<<<<<< HEAD:Script.js
=======
        // Dynamic particle animation
>>>>>>> 258f0a4168261685e7238e0e2cbe7a9bc173a5ae:script.js
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3 + 1] += Math.sin(time * 0.001 + i) * 0.01;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }

<<<<<<< HEAD:Script.js
=======
    // Content Plane Interaction
>>>>>>> 258f0a4168261685e7238e0e2cbe7a9bc173a5ae:script.js
    contentPlanes.forEach((plane, index) => {
        const distance = camera.position.distanceTo(plane.position);
        contentDivs[index].style.display = distance < 2 ? 'block' : 'none';
    });

    renderer.render(scene, camera);
    prevTime = time;
}
animate();

// Window Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
