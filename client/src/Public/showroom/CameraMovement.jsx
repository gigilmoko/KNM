import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const CameraMovement = ({ onStatsUpdate, target }) => {
  const { camera } = useThree();
  const movementSpeed = 0.5;
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  const isTransitioning = useRef(false);
  const targetPosition = useRef(null);

  useEffect(() => {
    if (target) {
      isTransitioning.current = true;
      targetPosition.current = new THREE.Vector3(...target.position);
    }
  }, [target]);

  // ... rest of your existing code ...

  useFrame(() => {
    if (isTransitioning.current && targetPosition.current) {
      const lerpFactor = 0.05;
      camera.position.lerp(targetPosition.current, lerpFactor);

      if (camera.position.distanceTo(targetPosition.current) < 0.01) {
        isTransitioning.current = false;
        targetPosition.current = null;
      }
    } else {
      // Recalculate movement direction based on current camera rotation
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();

      velocity.current.set(0, 0, 0);

      if (keys.current.forward) velocity.current.add(forward.multiplyScalar(movementSpeed));
      if (keys.current.backward) velocity.current.add(forward.multiplyScalar(-movementSpeed));
      if (keys.current.right) velocity.current.add(right.multiplyScalar(movementSpeed));
      if (keys.current.left) velocity.current.add(right.multiplyScalar(-movementSpeed));

      camera.position.add(velocity.current);
    }

    // Update camera stats
    if (onStatsUpdate) {
      onStatsUpdate({
        position: [
          parseFloat(camera.position.x.toFixed(2)),
          parseFloat(camera.position.y.toFixed(2)),
          parseFloat(camera.position.z.toFixed(2))
        ],
        rotation: [
          parseFloat((camera.rotation.x * 180 / Math.PI).toFixed(2)),
          parseFloat((camera.rotation.y * 180 / Math.PI).toFixed(2)),
          parseFloat((camera.rotation.z * 180 / Math.PI).toFixed(2))
        ]
      });
    }
  });

  return null;
};

export default CameraMovement;