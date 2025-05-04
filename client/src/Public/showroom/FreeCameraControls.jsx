import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";


const FreeCameraControls = ({ onStatsUpdate, target }) => {
  const { camera, gl } = useThree();
  const movementSpeed = 0.1;
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  const isMouseDown = useRef(false);
  const mouseDelta = useRef({ x: 0, y: 0 });
  const isTransitioning = useRef(false);
  const targetRotation = useRef(null);


  // Define camera boundaries
  const boundaries = {
    xMin: -3.94,
    xMax: 4.0,
    zMin: -19.0,
    zMax: -0.74,
    yMin: 2,
    yMax: 2,
  };


  useEffect(() => {
    if (target && target.rotation) {
      isTransitioning.current = true;
      targetRotation.current = {
        x: THREE.MathUtils.degToRad(target.rotation[0]),
        y: THREE.MathUtils.degToRad(target.rotation[1]),
        z: THREE.MathUtils.degToRad(target.rotation[2]),
      };
    }
  }, [target]);


  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.code) {
        case "KeyW":
          keys.current.forward = true;
          break;
        case "KeyS":
          keys.current.backward = true;
          break;
        case "KeyA":
          keys.current.left = true;
          break;
        case "KeyD":
          keys.current.right = true;
          break;
        default:
          break;
      }
    };


    const handleKeyUp = (event) => {
      switch (event.code) {
        case "KeyW":
          keys.current.forward = false;
          break;
        case "KeyS":
          keys.current.backward = false;
          break;
        case "KeyA":
          keys.current.left = false;
          break;
        case "KeyD":
          keys.current.right = false;
          break;
        default:
          break;
      }
    };


    const handleMouseDown = () => {
      isMouseDown.current = true;
    };


    const handleMouseUp = () => {
      isMouseDown.current = false;
    };


    const handleMouseMove = (event) => {
      if (isMouseDown.current && !isTransitioning.current) {
        mouseDelta.current.x -= event.movementX * 0.002;
        mouseDelta.current.y -= event.movementY * 0.002;


        // Clamp vertical rotation to avoid flipping
        mouseDelta.current.y = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseDelta.current.y));
      }
    };


    gl.domElement.addEventListener("mousedown", handleMouseDown);
    gl.domElement.addEventListener("mouseup", handleMouseUp);
    gl.domElement.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);


    return () => {
      gl.domElement.removeEventListener("mousedown", handleMouseDown);
      gl.domElement.removeEventListener("mouseup", handleMouseUp);
      gl.domElement.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl]);


  useFrame(() => {
    if (isTransitioning.current && targetRotation.current) {
      const lerpFactor = 0.05;
 
      // Smoothly transition to the target rotation
      camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation.current.x, lerpFactor);
      camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotation.current.y, lerpFactor);
      camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRotation.current.z, lerpFactor);
 
      // Check if the transition is complete
      if (
        Math.abs(camera.rotation.x - targetRotation.current.x) < 0.001 &&
        Math.abs(camera.rotation.y - targetRotation.current.y) < 0.001 &&
        Math.abs(camera.rotation.z - targetRotation.current.z) < 0.001
      ) {
        isTransitioning.current = false;
        targetRotation.current = null;
 
        // Reset mouseDelta to the current camera rotation
        mouseDelta.current.x = camera.rotation.y;
        mouseDelta.current.y = camera.rotation.x;
      }
    } else {
      // Apply mouse-based rotation when not transitioning
      camera.rotation.y = mouseDelta.current.x;
      camera.rotation.x = mouseDelta.current.y;
      camera.rotation.order = "YXZ";
    }
 
    // Handle WASD movement
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0; // Lock movement to the XZ plane
    forward.normalize();
 
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0; // Lock movement to the XZ plane
    right.normalize();
 
    velocity.current.set(0, 0, 0);
 
    if (keys.current.forward) velocity.current.add(forward.multiplyScalar(movementSpeed));
    if (keys.current.backward) velocity.current.add(forward.multiplyScalar(-movementSpeed));
    if (keys.current.right) velocity.current.add(right.multiplyScalar(movementSpeed));
    if (keys.current.left) velocity.current.add(right.multiplyScalar(-movementSpeed));
 
    camera.position.add(velocity.current);
 
    // Clamp camera position within boundaries
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, boundaries.xMin, boundaries.xMax);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, boundaries.yMin, boundaries.yMax);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, boundaries.zMin, boundaries.zMax);
 
    // Update stats if needed
    if (onStatsUpdate) {
      onStatsUpdate({
        position: [camera.position.x, camera.position.y, camera.position.z],
        rotation: [
          (camera.rotation.x * 180) / Math.PI,
          (camera.rotation.y * 180) / Math.PI,
          (camera.rotation.z * 180) / Math.PI,
        ],
      });
    }
  });


  return null;
};


export default FreeCameraControls;


