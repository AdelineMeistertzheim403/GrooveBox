import { useEffect, useRef } from "react";
import * as THREE from "three";
import { getFFT } from "../../audio/analyser";

export default function ThreeVisualizer() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const palette = {
      deep: new THREE.Color(0x050912),
      sky: new THREE.Color(0x5aa8ff),
      aqua: new THREE.Color(0x47ffd6),
      lime: new THREE.Color(0x89ff62),
      magenta: new THREE.Color(0xff6bd6),
    };
    scene.fog = new THREE.FogExp2(palette.deep, 0.12);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(0, 0.6, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xbad6ff, 0.55));
    const dir = new THREE.DirectionalLight(0xffffff, 0.7);
    dir.position.set(0, 2.5, 6);
    scene.add(dir);

    const group = new THREE.Group();
    scene.add(group);

    // Particules principales
    const particleCount = 320;
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.2 + Math.random() * 3.4;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      positions[i * 3 + 2] = -Math.random() * 16 - 2;
      speeds[i] = 0.06 + Math.random() * 0.1;
    }
    const particlesGeom = new THREE.BufferGeometry();
    particlesGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: palette.sky,
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particlesGeom, particlesMat);
    group.add(particles);

    // Globe léger
    const globeGeom = new THREE.IcosahedronGeometry(0.9, 2);
    const globeMat = new THREE.MeshStandardMaterial({
      color: palette.magenta,
      emissive: palette.sky,
      emissiveIntensity: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    globe.position.z = -4.2;
    group.add(globe);

    // Sparks rapides
    const sparkCount = 60;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = new Float32Array(sparkCount * 3);
    function seedSpark(i) {
      const r = 0.2 + Math.random() * 1.3;
      const a = Math.random() * Math.PI * 2;
      sparkPositions[i * 3] = Math.cos(a) * r;
      sparkPositions[i * 3 + 1] = (Math.random() - 0.5) * 1.1;
      sparkPositions[i * 3 + 2] = -Math.random() * 4 - 2;
      sparkVelocities[i * 3] = (Math.random() - 0.5) * 0.03;
      sparkVelocities[i * 3 + 1] = 0.03 + Math.random() * 0.05;
      sparkVelocities[i * 3 + 2] = 0.06 + Math.random() * 0.1;
    }
    for (let i = 0; i < sparkCount; i++) seedSpark(i);
    const sparksGeom = new THREE.BufferGeometry();
    sparksGeom.setAttribute("position", new THREE.BufferAttribute(sparkPositions, 3));
    const sparksMat = new THREE.PointsMaterial({
      color: palette.magenta,
      size: 0.1,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparks = new THREE.Points(sparksGeom, sparksMat);
    group.add(sparks);

    const clock = new THREE.Clock();
    let nextPalette = clock.getElapsedTime() + 6;
    let lastBassKick = 0;

    function randomPalette() {
      const baseHue = Math.random();
      const sky = new THREE.Color().setHSL(baseHue, 0.85, 0.66);
      const aqua = new THREE.Color().setHSL((baseHue + 0.12) % 1, 0.95, 0.65);
      const lime = new THREE.Color().setHSL((baseHue + 0.28) % 1, 0.9, 0.64);
      const magenta = new THREE.Color().setHSL((baseHue + 0.44) % 1, 0.95, 0.64);
      palette.sky.copy(sky);
      palette.aqua.copy(aqua);
      palette.lime.copy(lime);
      palette.magenta.copy(magenta);

      particles.material.color.copy(palette.sky);
      sparks.material.color.copy(palette.magenta);
    }

    randomPalette();
    let animationId;

    function resize() {
      const { clientWidth, clientHeight } = container;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    }
    window.addEventListener("resize", resize);
    resize();

    function animate() {
      animationId = requestAnimationFrame(animate);
      const fft = getFFT();
      const bass = fft?.[2] ?? -140;
      const mid = fft?.[16] ?? -140;
      const treble = fft?.[32] ?? -140;
      const bassLevel = Math.max(0, (bass + 120) / 30);
      const midLevel = Math.max(0, (mid + 120) / 30);
      const trebleLevel = Math.max(0, (treble + 120) / 30);
      const beatPulse = bassLevel > 1.6 ? 1 : 0;

      const t = clock.getElapsedTime();

      if (t >= nextPalette) {
        randomPalette();
        nextPalette = t + 5 + Math.random() * 5;
      }

      if (beatPulse && t - lastBassKick > 0.2) {
        lastBassKick = t;
        for (let i = 0; i < sparkCount; i += 4) {
          seedSpark(i);
          sparkVelocities[i * 3 + 1] += 0.06;
          sparkVelocities[i * 3 + 2] += 0.1;
        }
      }

      // Particules principales
      const pos = particles.geometry.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        let z = pos.getZ(i);
        z += speeds[i] * (1 + bassLevel * 0.7);
        if (z > 2) {
          z = -18 - Math.random() * 4;
        }
        pos.setZ(i, z);
        const angle = (z + t * 3) * 0.42;
        const radius = pos.getX(i) !== 0 || pos.getZ(i) !== 0 ? Math.sqrt(pos.getX(i) ** 2 + pos.getY(i) ** 2) : 1;
        pos.setX(i, Math.cos(angle) * radius * (1 + midLevel * 0.15));
        pos.setY(i, Math.sin(angle * 1.2) * 0.7 + Math.sin(angle) * 0.25 + Math.cos(t * 0.5) * 0.1);
      }
      pos.needsUpdate = true;
      particles.material.opacity = 0.4 + trebleLevel * 0.55;

      // Sparks
      const spPos = sparks.geometry.attributes.position;
      for (let i = 0; i < sparkCount; i++) {
        let sx = spPos.getX(i);
        let sy = spPos.getY(i);
        let sz = spPos.getZ(i);
        sx += sparkVelocities[i * 3] * (1 + trebleLevel * 0.6);
        sy += sparkVelocities[i * 3 + 1] * (1 + midLevel * 0.4);
        sz += sparkVelocities[i * 3 + 2] * (1 + bassLevel * 0.5);
        if (sy > 1.4 || sz > 1.2) {
          seedSpark(i);
          sx = sparkPositions[i * 3];
          sy = sparkPositions[i * 3 + 1];
          sz = sparkPositions[i * 3 + 2];
        }
        spPos.setXYZ(i, sx, sy, sz);
      }
      spPos.needsUpdate = true;
      sparks.material.opacity = 0.5 + trebleLevel * 0.4;
      sparks.material.size = 0.1 + trebleLevel * 0.04;

      // Mouvement global
      // Globe mouvement
      globe.scale.setScalar(1 + bassLevel * 0.25 + trebleLevel * 0.15);
      globe.rotation.y += 0.01 + midLevel * 0.01;
      globe.rotation.x -= 0.008 + trebleLevel * 0.008;
      globe.material.opacity = 0.18 + trebleLevel * 0.35;
      globe.material.emissiveIntensity = 0.8 + midLevel * 0.5;

      group.rotation.y = Math.sin(t * 0.18) * 0.06;
      group.rotation.x = Math.cos(t * 0.08) * 0.04;
      camera.position.x = Math.sin(t * 0.5) * 0.05 * (1 + bassLevel * 0.15);
      camera.position.y = 0.6 + Math.cos(t * 0.6) * 0.04 * (1 + midLevel * 0.15);
      camera.lookAt(0, 0, -4.5);

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      container.removeChild(renderer.domElement);
      particlesGeom.dispose();
      particlesMat.dispose();
      sparksGeom.dispose();
      sparksMat.dispose();
      globeGeom.dispose();
      globeMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="visualizer-3d-canvas" />;
}
