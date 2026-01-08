import * as THREE from 'three';

export function initCube(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Cube Group
    const group = new THREE.Group();
    scene.add(group);

    // 1. The Black Core Cube
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x000000 
    });
    const cube = new THREE.Mesh(geometry, material);
    group.add(cube);

    // 2. The Glowing Edges (Red)
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ 
        color: 0xff0033,
        linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    group.add(edges);

    // 3. Outer Wireframe (Subtle)
    const outerGeo = new THREE.BoxGeometry(2.5, 2.5, 2.5);
    const outerEdgesGeo = new THREE.EdgesGeometry(outerGeo);
    const outerMat = new THREE.LineBasicMaterial({ 
        color: 0x333333,
        transparent: true,
        opacity: 0.3
    });
    const outerWire = new THREE.LineSegments(outerEdgesGeo, outerMat);
    group.add(outerWire);

    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    
    // Add subtle interactivity
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);

        // Auto rotation
        group.rotation.x += 0.003;
        group.rotation.y += 0.005;

        // Mouse influence
        group.rotation.x += mouseY * 0.01;
        group.rotation.y += mouseX * 0.01;

        // Pulse effect
        const time = Date.now() * 0.002;
        const scale = 1 + Math.sin(time) * 0.02;
        edges.scale.set(scale, scale, scale);

        renderer.render(scene, camera);
    }

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}