import * as THREE from 'https://esm.sh/three@0.160.0';
import { EffectComposer } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const container = document.getElementById('canvas-container');

// Scene setup
const scene = new THREE.Scene();
// No background color set here to keep it transparent, controlled by CSS
// But Bloom needs a dark background to pop. We will rely on the body bg color showing through if we keep alpha true
// However, unreal bloom works better if we render black background.
scene.background = new THREE.Color(0x0a0a0a);
// Add some fog to blend the cube into the background
scene.fog = new THREE.Fog(0x0a0a0a, 2, 15);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // optimize
container.appendChild(renderer.domElement);

// Create The Cube
// We want a wireframe neon look. 
// Method: A black box to hide lines behind it, and a wireframe box slightly larger.

const geometry = new THREE.BoxGeometry(2, 2, 2);

// 1. Inner Black Core (Occludes the back lines)
const coreMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const coreCube = new THREE.Mesh(geometry, coreMaterial);
scene.add(coreCube);

// 2. Glowing Edges
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const wireframe = new THREE.LineSegments(edges, lineMaterial);
coreCube.add(wireframe);

// 3. Inner details (smaller cube spinning opposite way)
const innerGeo = new THREE.BoxGeometry(1, 1, 1);
const innerEdges = new THREE.EdgesGeometry(innerGeo);
const innerMaterial = new THREE.LineBasicMaterial({ color: 0x8b0000 }); // darker red
const innerWireframe = new THREE.LineSegments(innerEdges, innerMaterial);
scene.add(innerWireframe);


// Post-processing for Neon Glow (Bloom)
const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
);
bloomPass.strength = 2.0;
bloomPass.radius = 0.5;
bloomPass.threshold = 0; // Bloom everything that isn't black

const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Lights (Optional for BasicMaterial but good if we add solid objects later)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Animation Loop
let time = 0;

function animate() {
    requestAnimationFrame(animate);

    time += 0.005;

    // Rotate main cube
    coreCube.rotation.x += 0.005;
    coreCube.rotation.y += 0.01;

    // Rotate inner cube opposite direction and faster
    innerWireframe.rotation.x -= 0.01;
    innerWireframe.rotation.y -= 0.02;
    innerWireframe.rotation.z = Math.sin(time) * 0.5;

    // Pulse effect
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    coreCube.scale.set(pulse, pulse, pulse);

    // Glitch effect occasionally
    if (Math.random() > 0.98) {
        coreCube.position.x = (Math.random() - 0.5) * 0.2;
        bloomPass.strength = 4.0;
    } else {
        coreCube.position.x = 0;
        bloomPass.strength = 2.0;
    }

    composer.render();
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

// Interactive: Mouse influence
document.addEventListener('mousemove', (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Subtle look-at
    camera.position.x += (mouseX - camera.position.x) * 0.05;
    camera.position.y += (mouseY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
});