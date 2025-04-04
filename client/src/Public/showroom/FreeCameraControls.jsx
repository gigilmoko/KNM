import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const FreeCameraControls = ({ onStatsUpdate }) => {
  const { camera } = useThree();
  const movementSpeed = 0.1; // Adjust movement speed as needed
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Define the movement boundaries
  const boundaries = {
    xMin: -3.94,
    xMax: 4.72,
    zMin: -17.85,
    zMax: -0.74,
    yMin: 2.0,
    yMax: 2.0,
  };

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

    // Update camera position
    camera.position.add(velocity.current);

    // Clamp the camera's position within the defined boundaries
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, boundaries.xMin, boundaries.xMax);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, boundaries.yMin, boundaries.yMax);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, boundaries.zMin, boundaries.zMax);

    if (onStatsUpdate) {
      onStatsUpdate({
        position: [
          parseFloat(camera.position.x.toFixed(2)),
          parseFloat(camera.position.y.toFixed(2)),
          parseFloat(camera.position.z.toFixed(2)),
        ],
        rotation: [
          parseFloat((camera.rotation.x * 180) / Math.PI.toFixed(2)),
          parseFloat((camera.rotation.y * 180) / Math.PI.toFixed(2)),
          parseFloat((camera.rotation.z * 180) / Math.PI.toFixed(2)),
        ],
      });
    }
  });

  return null;
};

export default FreeCameraControls;