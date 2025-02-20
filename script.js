// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Background Stars
const starGeometry = new THREE.BufferGeometry();
const starCount = 1000;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 2000;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Interactive Cubes
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubes = [
    { mesh: new THREE.Mesh(cubeGeometry, new THREE.MeshPhongMaterial({ color: 0xff0066 })), position: [0, 0, -5], content: { title: "Home", text: "Welcome to my cosmic hub!" } },
    { mesh: new THREE.Mesh(cubeGeometry, new THREE.MeshPhongMaterial({ color: 0x00ffcc })), position: [-5, 0, 0], content: { title: "About", text: "A coder exploring the digital universe." } },
    { mesh: new THREE.Mesh(cubeGeometry, new THREE.MeshPhongMaterial({ color: 0x6600ff })), position: [5, 0, 0], content: { title: "Projects", text: "Creations born from starry inspiration." } },
    { mesh: new THREE.Mesh(cubeGeometry, new THREE.MeshPhongMaterial({ color: 0xffff00 })), position: [0, 0, 5], content: { title: "Contact", text: "Reach me across the cosmos!" } }
];
cubes.forEach(cube => {
    cube.mesh.position.set(...cube.position);
    scene.add(cube.mesh);
});

// Camera Position
camera.position.set(0, 2, 10);

// Raycaster for Clicking
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const infoPanel = document.getElementById('info-panel');
const infoTitle = document.getElementById('info-title');
const infoText = document.getElementById('info-text');

document.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(cubes.map(cube => cube.mesh));
    if (intersects.length > 0) {
        const clickedCube = cubes.find(cube => cube.mesh === intersects[0].object);
        infoTitle.textContent = clickedCube.content.title;
        infoText.textContent = clickedCube.content.text;
        infoPanel.style.display = 'block';
        setTimeout(() => infoPanel.style.display = 'none', 3000); // Hide after 3 seconds
    }
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    cubes.forEach(cube => {
        cube.mesh.rotation.x += 0.01;
        cube.mesh.rotation.y += 0.01;
    });
    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});