"use client"

import { Canvas } from "@react-three/fiber"
import { useGLTF } from "@react-three/drei"
import { useEffect, useState } from 'react';
import { EffectComposer, Outline } from "@react-three/postprocessing"
import CameraMovement from "./CameraMovement"
import CameraRotation from "./CameraRotation"
import FreeCameraControls from "./FreeCameraControls"
import { Gift, Sparkles, Gem, Palette, Shirt, ShoppingBag, X } from "lucide-react"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
const Model = () => {
  const [scene, setScene] = useState(null);
 
  useEffect(() => {
    // Create a DRACOLoader instance
    const dracoLoader = new DRACOLoader();
    // Specify the path to the Draco decoder (you'll need these files in your public folder)
    dracoLoader.setDecoderPath('/draco/');
   
    // Create GLTFLoader and assign the DRACOLoader
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
   
    // Load your model
    loader.load('/SHOWROOM_BAKED_LATEST3.glb', (gltf) => {
      setScene(gltf.scene);
    }, undefined, (error) => {
      console.error('An error happened while loading the model:', error);
    });
  }, []);
 
  return scene ? <primitive object={scene} scale={1} /> : null;
};

const ProductDisplay = ({ category, onClose }) => {
  const products = {
    christmas: [
      { name: "Christmas Ornament", price: "₱299" },
      { name: "Holiday Wreath", price: "₱799" },
      { name: "Festive Candle Set", price: "₱499" },
    ],
    essentials: [
      { name: "Bamboo Toothbrush", price: "₱99" },
      { name: "Reusable Water Bottle", price: "₱399" },
      { name: "Organic Cotton Towel", price: "₱599" },
    ],
    accessories: [
      { name: "Handcrafted Earrings", price: "₱299" },
      { name: "Woven Bracelet", price: "₱199" },
      { name: "Beaded Necklace", price: "₱399" },
    ],
    beauty: [
      { name: "Natural Face Cream", price: "₱499" },
      { name: "Organic Lip Balm", price: "₱149" },
      { name: "Handmade Soap Bar", price: "₱199" },
    ],
    clothing: [
      { name: "Embroidered Blouse", price: "₱899" },
      { name: "Handwoven Scarf", price: "₱599" },
      { name: "Traditional Skirt", price: "₱1,299" },
    ],
    bags: [
      { name: "Woven Tote Bag", price: "₱799" },
      { name: "Bamboo Clutch", price: "₱599" },
      { name: "Rattan Backpack", price: "₱1,099" },
    ],
  }

  return (
    <div className="absolute top-0 right-0 h-full w-64 bg-white/90 p-4 shadow-lg overflow-y-auto">
      <button onClick={onClose} className="absolute top-2 right-2 text-[#e01d47]">
        <X size={24} />
      </button>
      <h3 className="text-xl font-bold text-[#e01d47] capitalize mb-4">{category}</h3>
      <div className="space-y-4">
        {products[category].map((product, index) => (
          <div key={index} className="flex items-center space-x-2">
            <img
              src={`https://placehold.co/100x100/e01d47/ffffff?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-[#e01d47]">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Scene = () => {
  const [cameraTarget, setCameraTarget] = useState(null)
  const [cameraStats, setCameraStats] = useState({
    position: [0, 50, 0],
    rotation: [0, 0, 0],
  })
  const [selectedCategory, setSelectedCategory] = useState(null)

  const locations = {
    christmas: {
      position: [-8.07, 5.00,5.40],
      rotation: [0.92, 180.83, 0.0],
      icon: Gift,
    },
    essentials: {
      position: [2.87, 5.0, 1.8],
      rotation: [-21.89, 55.92, 0.0],
      icon: Sparkles,
    },
    accessories: {
      position: [-7.02, 5.00, -7.66],
      rotation: [-8.48, -1.6, 0.0],
      icon: Gem,
    },
    beauty: {
      position: [-3.63, 5.0, -0.38],
      rotation: [-5.16, 86.4, 0.0],
      icon: Palette,
    },
    clothing: {
      position: [2.46, 5.00, 10.33]    ,
      rotation: [-19.94, 89.5, 0.0],
      icon: Shirt,
    },
    bags: {
      position: [7.91, 5.00, -6.31],
      rotation: [-19.94, 89.5, 0.0],
      icon: ShoppingBag,
    },
  }

  const handleCategoryClick = (category) => {
    setCameraTarget(locations[category])
    setSelectedCategory(category)
  }

  return (
    <div className="w-full h-screen bg-white p-5 flex flex-col gap-5 rounded-lg">
      <div className="w-full h-[calc(100%-80px)] border border-[#e01d47] rounded-lg overflow-hidden relative">
        <Canvas camera={{ fov: 75, near: 0.1, far: 1000 }}>
          <ambientLight intensity={5} />
          <directionalLight position={[0, 0, 0]} intensity={10} />
          <Model />
          <FreeCameraControls onStatsUpdate={setCameraStats} target={cameraTarget} />

          <CameraMovement onStatsUpdate={setCameraStats} target={cameraTarget} />
          <CameraRotation target={cameraTarget} />
        </Canvas>
        {selectedCategory && <ProductDisplay category={selectedCategory} onClose={() => setSelectedCategory(null)} />}
      </div>

      <div className="h-[60px] bg-white px-5 rounded-lg flex justify-between items-center border border-[#e01d47]">
        <div className="text-[#e01d47] font-mono text-xs">
          <div>
            Position: X:{cameraStats.position[0].toFixed(2)} Y:{cameraStats.position[1].toFixed(2)} Z:
            {cameraStats.position[2].toFixed(2)}
          </div>
          <div>
            Rotation: X:{cameraStats.rotation[0].toFixed(2)} Y:{cameraStats.rotation[1].toFixed(2)} Z:
            {cameraStats.rotation[2].toFixed(2)}
          </div>
        </div>

        <div className="flex gap-2">
          {Object.entries(locations).map(([location, data]) => {
            const IconComponent = data.icon
            return (
              <button
                key={location}
                onClick={() => handleCategoryClick(location)}
                className="px-3 py-2 bg-white text-[#e01d47] border border-[#e01d47] rounded-md cursor-pointer capitalize hover:bg-[#e01d47] hover:text-white transition-colors flex items-center gap-1"
              >
                <IconComponent size={16} />
                <span className="hidden sm:inline">{location}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Scene



