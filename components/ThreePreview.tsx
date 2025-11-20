import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreePreviewProps {
  objData: string;
}

/**
 * A simplified OBJ parser to avoid heavy dependency on three/examples/jsm/loaders/OBJLoader
 * for this specific environment constraint, ensuring "handful of files" rule is strict.
 * Parses v (vertex) and f (face) lines.
 */
const simpleParseOBJ = (text: string) => {
  const vertices: number[] = [];
  const indices: number[] = [];

  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('v ')) {
      const parts = line.split(/\s+/);
      // v x y z
      vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
    } else if (line.startsWith('f ')) {
      const parts = line.split(/\s+/);
      // f v1 v2 v3 (simplest case, no texture/normal indices handled for this lightweight demo)
      // OBJ indices are 1-based
      for (let i = 1; i <= 3; i++) {
        let idxStr = parts[i];
        if (idxStr.includes('/')) idxStr = idxStr.split('/')[0];
        indices.push(parseInt(idxStr) - 1);
      }
      // Handle quads (split into two triangles)
      if (parts.length === 5) {
        let idxStr = parts[1]; if (idxStr.includes('/')) idxStr = idxStr.split('/')[0];
        indices.push(parseInt(idxStr) - 1);
        
        idxStr = parts[3]; if (idxStr.includes('/')) idxStr = idxStr.split('/')[0];
        indices.push(parseInt(idxStr) - 1);
        
        idxStr = parts[4]; if (idxStr.includes('/')) idxStr = idxStr.split('/')[0];
        indices.push(parseInt(idxStr) - 1);
      }
    }
  }

  return { vertices: new Float32Array(vertices), indices: indices };
};

export const ThreePreview: React.FC<ThreePreviewProps> = ({ objData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current || !objData) return;

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let frameId: number;
    let mesh: THREE.Mesh;

    try {
      // Setup
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1e293b); // slate-800

      camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      camera.position.y = 2;
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      mountRef.current.innerHTML = ''; // Clear previous
      mountRef.current.appendChild(renderer.domElement);

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 7.5);
      scene.add(directionalLight);

      // Parse Geometry
      const { vertices, indices } = simpleParseOBJ(objData);
      
      if (vertices.length === 0) {
        throw new Error("No vertices found in OBJ data.");
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      // Material
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x6366f1, // Indigo 500
        roughness: 0.5,
        metalness: 0.2,
        side: THREE.DoubleSide,
        wireframe: false
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Center geometry
      geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      geometry.boundingBox?.getCenter(center);
      mesh.position.sub(center);

      // Animation Loop
      const animate = () => {
        frameId = requestAnimationFrame(animate);
        if (mesh) {
          mesh.rotation.y += 0.01;
          mesh.rotation.x += 0.005;
        }
        renderer.render(scene, camera);
      };
      animate();

    } catch (err) {
      console.error("Three.js Error:", err);
      setError("Could not render 3D model. The geometry might be invalid.");
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      if (renderer) renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [objData]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-400 p-4 text-center bg-slate-900 rounded-xl border border-red-900/50">
        {error}
      </div>
    );
  }

  return <div ref={mountRef} className="w-full h-full rounded-xl overflow-hidden shadow-inner bg-slate-900" />;
};
