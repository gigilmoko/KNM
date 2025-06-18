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
      "/showrrom.glb",
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
                ? "bg-[#ed003f] text-white"
                : "bg-gray-200"
            }`}
            style={{ borderColor: "#ed003f" }}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              className={`px-4 py-1 border rounded-lg ${
                selectedCategory === category._id
                  ? "bg-[#ed003f] text-white"
                  : "bg-gray-200"
              }`}
              style={{ borderColor: "#ed003f" }}
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
                style={{ border: "1px solid #ed003f" }}
                onClick={() => navigateToProduct(product._id)}
              >
                <div className="flex items-center gap-4 w-full">
                  <img
                    src={product.images?.[0]?.url || "/noimage.png"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                    style={{ border: "1px solid #ed003f" }}
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
    "6801b6d3a4c07e92ad23de08": { position: [2.9, 2.0, -12.89], rotation: [9.86, -64.32, 0.0] }, //Green and Gold
    "6801b7c7a4c07e92ad23dfe8": { position: [-3.94, 2.00, -11.64], rotation: [18.74, 52.33, 0.0] }, //Plain bright Gold
    "6801b85da4c07e92ad23e013": { position: [-2.87, 2.00, -14.70], rotation: [12.32, 51.35, 0.0] }, //Red with Gold Floral Parol 
    "6801b931a4c07e92ad23e042": { position: [3.17, 2.00, -10.99], rotation: [23.72, -77.50, 0.0] }, // Blue with Gold Patterned Parol
    "6801b9cda4c07e92ad23e072": { position: [-3.94, 2.00, -3.67], rotation: [16.16, 64.86, 0.00] }, //Red Patterned Parol
    "6801bb8ca4c07e92ad23e0a4": { position: [-3.94, 2.00, -9.68], rotation: [19.72, 20.23, 0.00] }, //Light Green with Gold Floral Parol
    "6801bbf9a4c07e92ad23e0da": { position: [4.00, 2.00, -12.76], rotation: [15.82, 294.27, 0.0] }, //Gold Pattern Parol
    "6801bd02a4c07e92ad23e111": { position: [-3.44, 2.00, -2.76], rotation: [21.73, 96.03, 0.00] }, //White Patterned Parol
    "6801bd63a4c07e92ad23e14e": { position: [1.97, 2.00, -11.72], rotation: [0.19, 278.66, 0.00] }, //Glossy Red Parol
    "6801bdb5a4c07e92ad23e18b": { position: [2.75, 2.00, -11.94], rotation: [-0.73, 283.19, 0.0] }, //Glossy Light Blue Parol
    "6801bdf5a4c07e92ad23e1ce": { position: [2.75, 2.00, -11.94], rotation: [-17.79, 273.28, 0.0] }, //Glossy Purple Parol
    "6801bf2aa4c07e92ad23e211": { position: [-3.60, 2.00, -13.26], rotation: [15.93, 34.49, 0.00] }, //Tie Dye Parol
    "6801bf65a4c07e92ad23e25a": { position: [-3.94, 2.00, -13.09], rotation: [22.67, 437.66, 0.0] }, //Red with White Pattern Parol
    "6801bfc4a4c07e92ad23e2a3": { position: [-3.94, 2.00, -12.55], rotation: [18.09, 430.50, 0.0] }, //Light Blue With Gold Pattern Parol
    "6801c012a4c07e92ad23e2f0": { position: [-3.94, 2.00, -12.16], rotation: [-30.96, 441.62, 0.0] }, //Red Glitters Parol
    "6801c5c0a4c07e92ad23e3f6": { position: [-2.81, 2.00, -12.97], rotation: [-20.42, 780.12, 0.00] }, //Glossy Violet Parol
    "6801c7cfa4c07e92ad23e4a4": { position: [-4.00, 2.00, -13.13], rotation: [19.57, 648.63, 0.00] }, //Light Gold Pattern Parol
    "6801ca27a4c07e92ad23e670": { position: [-2.59, 2.00, -17.48], rotation: [5.14, 382.78, 0.00] }, //Gold Diamond Shaped Parol
    "6801ca60a4c07e92ad23e6ce": { position: [-1.04, 2.00, -8.69], rotation: [37.57, 317.00, 0.00] }, //Red Patterned Christmas Balls
    "6801ca87a4c07e92ad23e72d": { position: [-1.59, 2.00, -8.13], rotation: [31.95, 360.09, 0.00] }, //Gold Patterned Christmas Balls
    "6801cadba4c07e92ad23e78e": { position: [-3.94, 2.00, -4.27], rotation: [26.11, 393.32, 0.00] }, //Blue Patterned Christmas Balls
    "6801cafca4c07e92ad23e7ef": { position: [4.00, 2.00, -6.65], rotation: [22.44, 569.22, 0.00] }, //White Patterned Christmas Balls
    "6801d163e1f5d14aeb9f750c": { position: [-3.94, 2.00, -9.40], rotation: [1.59, 825.90, 0.00] }, //Yellow Tropical Pattern Sling Bag
    "6801d1bbe1f5d14aeb9f7572": { position: [-3.04, 2.00, -8.62], rotation: [-14.45, 794.16, 0.00] }, //Yellow Tropical Pattern Dress Bundle

  };

  const navigateToProduct = (productId) => {
    const product = productPositions[productId];
    if (product && cameraRef.current) {
      const { position, rotation } = product;
 
      cameraRef.current.position.set(...position);
      cameraRef.current.rotation.set(
        THREE.MathUtils.degToRad(rotation[0]),
        THREE.MathUtils.degToRad(rotation[1]),
        THREE.MathUtils.degToRad(rotation[2])
      );
      setCameraStats({
        position,
        rotation,
      });
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
      <div className="w-full h-[calc(100%-80px)] border border-[#ed003f] rounded-lg overflow-hidden relative">
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
            className="absolute top-4 right-4 bg-[#ed003f] text-white px-4 py-2 rounded"
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
      <div className="h-[60px] bg-white px-5 rounded-lg flex justify-between items-center border border-[#ed003f]">
        <div className="text-[#ed003f] font-mono text-xs">
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