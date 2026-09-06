'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { BufferAttribute } from 'three';

interface STLViewerProps {
  source: string; // raw STL text (ASCII) or base64 binary
}

export const STLViewer: React.FC<STLViewerProps> = ({ source }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const render = async () => {
      try {
        const THREE = await import('three');
        const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        if (!mountRef.current || cancelled) return;

        const width = mountRef.current.clientWidth || 600;
        const height = 350;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(
          document.documentElement.classList.contains('dark') ? 0x0d1117 : 0xf8fafc,
        );

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        // Grid helper
        const grid = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
        scene.add(grid);

        // Load STL
        const loader = new STLLoader();
        const geometry = loader.parse(new TextEncoder().encode(source).buffer as ArrayBuffer);
        geometry.computeVertexNormals();

        // Center geometry
        geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        geometry.boundingBox?.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        // Scale to fit
        const box = new THREE.Box3().setFromBufferAttribute(
          geometry.attributes.position as BufferAttribute,
        );
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 3 / maxDim;
        geometry.scale(scaleFactor, scaleFactor, scaleFactor);

        const material = new THREE.MeshPhongMaterial({
          color: 0x6366f1,
          specular: 0x333333,
          shininess: 30,
          flatShading: false,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Animate
        let animId: number;
        const animate = () => {
          animId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // Responsive: update renderer + camera when container resizes
        resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry) return;
          const newWidth = entry.contentRect.width;
          if (newWidth === 0) return;
          renderer.setSize(newWidth, height);
          camera.aspect = newWidth / height;
          camera.updateProjectionMatrix();
        });
        if (mountRef.current) resizeObserver.observe(mountRef.current);

        cleanupRef.current = () => {
          cancelAnimationFrame(animId);
          resizeObserver?.disconnect();
          renderer.dispose();
          controls.dispose();
          geometry.dispose();
          material.dispose();
        };

        if (!cancelled) setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'STL render failed');
          setLoading(false);
        }
      }
    };

    if (source) render();

    return () => {
      cancelled = true;
      cleanupRef.current();
    };
  }, [source]);

  if (error) {
    return (
      <div className="p-3 my-2 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-md font-mono">
        STL render failed: {error}
      </div>
    );
  }

  return (
    <div className="my-4 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-2 py-1 bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
        <span>stl 3d</span>
        <span className="text-slate-400">drag to rotate · scroll to zoom</span>
      </div>
      {loading && (
        <div className="flex items-center justify-center p-6 text-xs text-slate-400 gap-2">
          <div className="h-3 w-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          Loading 3D model…
        </div>
      )}
      <div ref={mountRef} style={{ display: loading ? 'none' : 'block' }} />
    </div>
  );
};
