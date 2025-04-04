"use client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import CameraMovement from "./CameraMovement";
import CameraRotation from "./CameraRotation";
import FreeCameraControls from "./FreeCameraControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";
import * as THREE from "three";
import { SRGBColorSpace } from 'three'; 

const Model = () => {
  const [scene, setScene] = useState(null);


  useEffect(() => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/"); // Path to Draco decoder


    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);


    loader.load(
      "/v10.glb",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            if (child.material.map) {
              child.material.map.encoding = SRGBColorSpace;
              child.material.map.flipY = false;
            }
            child.material.needsUpdate = true;
          }
        });
    
        setScene(gltf.scene);
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the model:", error);
      }
    );


    return () => {
      dracoLoader.dispose();
    };
  }, []);


  return scene ? <primitive object={scene} /> : null;
};


const Scene = () => {
  const [cameraStats, setCameraStats] = useState({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  });


  return (
    <div className="w-full h-screen bg-white p-5 flex flex-col gap-5 rounded-lg">
      <div className="w-full h-[calc(100%-80px)] border border-[#e01d47] rounded-lg overflow-hidden relative">
        <Canvas
          camera={{ fov: 75, near: 0.1, far: 500, position: [0, 2, 2] }}
          gl={{ outputEncoding: THREE.SRGBColorSpace }}
          onCreated={({ scene }) => {
            const exrLoader = new EXRLoader();
            exrLoader.load("/b1.exr", (texture) => {
              texture.mapping = THREE.EquirectangularReflectionMapping; // Ensure correct mapping
              scene.background = texture; // Set the EXR as the background
              scene.environment = texture; // Use it for reflections
            });
          }}
        >
          {/* Add proper lighting */}
          <ambientLight intensity={1.0} /> {/* Increase intensity for baked lighting */}
          <directionalLight position={[10, 10, 10]} intensity={0.5} />
          <hemisphereLight intensity={0.3} />


          {/* Load the model */}
          <Model />


          {/* Camera controls */}
          <FreeCameraControls onStatsUpdate={setCameraStats} />
          <CameraMovement onStatsUpdate={setCameraStats} />
          <CameraRotation />
        </Canvas>
      </div>


      <div className="h-[60px] bg-white px-5 rounded-lg flex justify-between items-center border border-[#e01d47]">
        <div className="text-[#e01d47] font-mono text-xs">
          <div>
            Position: X:{cameraStats.position[0].toFixed(2)} Y:
            {cameraStats.position[1].toFixed(2)} Z:
            {cameraStats.position[2].toFixed(2)}
          </div>
          <div>
            Rotation: X:
            {cameraStats.rotation[0].toFixed(2)} Y:
            {cameraStats.rotation[1].toFixed(2)} Z:
            {cameraStats.rotation[2].toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};


export default Scene;

