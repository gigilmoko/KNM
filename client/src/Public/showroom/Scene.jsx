"use client";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import CameraMovement from "./CameraMovement";
import CameraRotation from "./CameraRotation";
import FreeCameraControls from "./FreeCameraControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";
import * as THREE from "three";
import axios from "axios";




const Model = () => {
  const [scene, setScene] = useState(null);




  useEffect(() => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");




    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);




    loader.load(
      "/SHOWROOM FINAL.glb",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            if (child.material.map) {
              child.material.map.encoding = THREE.SRGBColorSpace;
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




const RightDrawer = ({
  isOpen,
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  onClose,
  navigateToProduct,
}) => {
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);




  return (
    <div
      className={`absolute top-0 right-0 h-full bg-white shadow-lg transition-transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } w-80 z-50`}
    >
      <button
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        onClick={onClose}
      >
        &times;
      </button>
      <div className="p-4 h-full overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Categories</h2>
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            className={`px-4 py-1 border rounded-lg ${
              selectedCategory === "All"
                ? "bg-[#e01d47] text-white"
                : "bg-gray-200"
            }`}
            style={{ borderColor: "#e01d47" }}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              className={`px-4 py-1 border rounded-lg ${
                selectedCategory === category._id
                  ? "bg-[#e01d47] text-white"
                  : "bg-gray-200"
              }`}
              style={{ borderColor: "#e01d47" }}
              onClick={() => setSelectedCategory(category._id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        <h2 className="text-xl font-bold mb-4">Products</h2>
        {filteredProducts.length > 0 ? (
          <ul>
            {filteredProducts.map((product) => (
              <li
                key={product._id}
                className="mb-4 flex items-center gap-4 rounded-lg p-3 cursor-pointer"
                style={{ border: "1px solid #e01d47" }}
                onClick={() => navigateToProduct(product._id)}
              >
                <div className="flex items-center gap-4 w-full">
                  <img
                    src={product.images?.[0]?.url || "/noimage.png"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                    style={{ border: "1px solid #e01d47" }}
                  />
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-gray-600">₱{product.price}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No products available.</p>
        )}
      </div>
    </div>
  );
};




const Scene = () => {
const [cameraTarget, setCameraTarget] = useState(null)
  const [cameraStats, setCameraStats] = useState({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");




  const cameraRef = useRef();




  const productPositions = {
    "6801b6d3a4c07e92ad23de08": { position: [2.9, 2.0, -12.89], rotation: [9.86, -64.32, 0.0] },
    "68024b294b8062ead528e8f5": { position: [4.0, 2.0, -2.34], rotation: [16.62, -91.15, 0.0] },
    "6801b85da4c07e92ad23e013": { position: [-2.12, 2.0, -14.3], rotation: [13.76, 30.38, 0.0] },
    "6801b931a4c07e92ad23e042": { position: [3.23, 2.0, -10.69], rotation: [22.36, -64.78, 0.0] },
  };




  const navigateToProduct = (productId) => {
    const product = productPositions[productId];
    if (product && cameraRef.current) {
      const { position, rotation } = product;
 
      // Set camera position
      cameraRef.current.position.set(...position);
 
      // Apply rotation directly in radians
      cameraRef.current.rotation.set(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2])
      );
 
      // Update camera stats
      setCameraStats({
        position,
        rotation,
      });
 
      // Set camera target for controls to use
      setCameraTarget({
        position,
        rotation,
      });
    } else {
      console.error(`Product ID ${productId} not found in productPositions`);
    }
  };


useEffect(() => {
  if (isDrawerOpen) {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API}/api/product/all`
        );
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };




    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API}/api/category/all`
        );
        if (response.data.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };




    fetchProducts();
    fetchCategories();
  }
}, [isDrawerOpen]);




  return (
    <div className="w-full h-screen bg-white p-5 flex flex-col gap-5 rounded-lg">
      <div className="w-full h-[calc(100%-80px)] border border-[#e01d47] rounded-lg overflow-hidden relative">
      <Canvas
        camera={{
          fov: 75,
          near: 0.1,
          far: 500,
          position: cameraStats.position,
          rotation: cameraStats.rotation,
        }}
        gl={{ outputEncoding: THREE.SRGBColorSpace }}
        onCreated={({ camera, scene }) => {
          cameraRef.current = camera;
          const exrLoader = new EXRLoader();
          exrLoader.load("/b1.exr", (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
            scene.environment = texture;
          });
        }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 10, 10]} intensity={0.5} />
        <hemisphereLight intensity={0.3} />
        <Model />
        <FreeCameraControls onStatsUpdate={setCameraStats} target={cameraTarget} />
        <CameraMovement onStatsUpdate={setCameraStats} target={cameraTarget} />
        <CameraRotation target={cameraTarget} />
      </Canvas>
        {!isDrawerOpen && (
          <button
            className="absolute top-4 right-4 bg-[#e01d47] text-white px-4 py-2 rounded"
            onClick={() => setIsDrawerOpen(true)}
          >
            ☰
          </button>
        )}
        <RightDrawer
          isOpen={isDrawerOpen}
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onClose={() => setIsDrawerOpen(false)}
          navigateToProduct={navigateToProduct}
        />
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







