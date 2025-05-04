import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";


const CameraMovement = ({ onStatsUpdate, target }) => {
  const { camera } = useThree();
  const movementSpeed = 0.1;
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  const isTransitioning = useRef(false);
  const targetPosition = useRef(null);


  useEffect(() => {
    if (target && target.position) {
      isTransitioning.current = true;
      targetPosition.current = new THREE.Vector3(...target.position);
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


    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);


    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);


  useFrame(() => {
    if (isTransitioning.current && targetPosition.current) {
      const lerpFactor = 0.05;
      camera.position.lerp(targetPosition.current, lerpFactor);
 
      if (camera.position.distanceTo(targetPosition.current) < 0.01) {
        isTransitioning.current = false;
        targetPosition.current = null;
      }
    } else {
      // Allow free movement when no transition is active
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();
 
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();
 
      velocity.current.set(0, 0, 0);
 
      if (keys.current.forward) velocity.current.add(forward.multiplyScalar(movementSpeed));
      if (keys.current.backward) velocity.current.add(forward.multiplyScalar(-movementSpeed));
      if (keys.current.right) velocity.current.add(right.multiplyScalar(movementSpeed));
      if (keys.current.left) velocity.current.add(right.multiplyScalar(-movementSpeed));
 
      camera.position.add(velocity.current);
    }
  });
  return null;
};


export default CameraMovement;



