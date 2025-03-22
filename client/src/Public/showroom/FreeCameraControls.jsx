import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const FreeCameraControls = ({ onStatsUpdate, target }) => {
  const { camera } = useThree();
  const movementSpeed = 0.5;
  const rotationSpeed = 0.002;
  const velocity = useRef(new THREE.Vector3());
  const rotation = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);
  const isTransitioning = useRef(false);
  const targetRef = useRef(null);

  const keys = useRef({ 
    forward: false, 
    backward: false, 
    left: false, 
    right: false 
  });

  // Handle target changes
  useEffect(() => {
    if (target) {
      isTransitioning.current = true;
      targetRef.current = {
        position: new THREE.Vector3(...target.position),
        rotation: {
          x: target.rotation[1] * Math.PI / 180,
          y: target.rotation[0] * Math.PI / 180
        }
      };
    }
  }, [target]);

  // Set initial camera position and rotation
  useEffect(() => {
    camera.position.set(17.84, 5.00, 2.45);
    camera.rotation.order = 'YXZ';
    rotation.current.x = camera.rotation.y;
    rotation.current.y = camera.rotation.x;
  }, [camera]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isTransitioning.current) return;
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          keys.current.forward = true;
          break;
        case "ArrowDown":
        case "KeyS":
          keys.current.backward = true;
          break;
        case "ArrowLeft":
        case "KeyA":
          keys.current.left = true;
          break;
        case "ArrowRight":
        case "KeyD":
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          keys.current.forward = false;
          break;
        case "ArrowDown":
        case "KeyS":
          keys.current.backward = false;
          break;
        case "ArrowLeft":
        case "KeyA":
          keys.current.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          keys.current.right = false;
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

  // Handle mouse controls
  useEffect(() => {
    const handleMouseDown = (event) => {
      if (event.button === 0 && !isTransitioning.current) {
        isMouseDown.current = true;
      }
    };

    const handleMouseUp = (event) => {
      if (event.button === 0) {
        isMouseDown.current = false;
      }
    };

    const handleMouseMove = (event) => {
      if (isMouseDown.current && !isTransitioning.current) {
        rotation.current.x -= event.movementX * rotationSpeed;
        rotation.current.y = Math.max(
          -Math.PI / 2,
          Math.min(Math.PI / 2, rotation.current.y - event.movementY * rotationSpeed)
        );
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useFrame(() => {
    if (isTransitioning.current && targetRef.current) {
      const lerpFactor = 0.05;
      
      camera.position.lerp(targetRef.current.position, lerpFactor);
      
      rotation.current.x = THREE.MathUtils.lerp(
        rotation.current.x,
        targetRef.current.rotation.x,
        lerpFactor
      );
      rotation.current.y = THREE.MathUtils.lerp(
        rotation.current.y,
        targetRef.current.rotation.y,
        lerpFactor
      );

      const positionDistance = camera.position.distanceTo(targetRef.current.position);
      const rotationDistance = 
        Math.abs(rotation.current.x - targetRef.current.rotation.x) +
        Math.abs(rotation.current.y - targetRef.current.rotation.y);

      if (positionDistance < 0.01 && rotationDistance < 0.01) {
        isTransitioning.current = false;
        targetRef.current = null;
      }
    }

    // Apply rotation before movement calculation
    camera.rotation.order = 'YXZ';
    camera.rotation.x = rotation.current.y;
    camera.rotation.y = rotation.current.x;

    if (!isTransitioning.current) {
      // Calculate movement direction based on current camera rotation
      const forward = new THREE.Vector3(0, 0, -1);
      forward.applyQuaternion(camera.quaternion);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3(1, 0, 0);
      right.applyQuaternion(camera.quaternion);
      right.y = 0;
      right.normalize();

      velocity.current.set(0, 0, 0);

      if (keys.current.forward) velocity.current.add(forward.multiplyScalar(movementSpeed));
      if (keys.current.backward) velocity.current.add(forward.multiplyScalar(-movementSpeed));
      if (keys.current.right) velocity.current.add(right.multiplyScalar(movementSpeed));
      if (keys.current.left) velocity.current.add(right.multiplyScalar(-movementSpeed));

      camera.position.add(velocity.current);
    }

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

export default FreeCameraControls;