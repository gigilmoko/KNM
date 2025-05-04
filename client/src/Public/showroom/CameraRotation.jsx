import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";




const CameraRotation = ({ target }) => {
  const { camera } = useThree();
  const rotation = useRef({ x: 0, y: 0 });
  const isMouseDown = useRef(false);
  const isTransitioning = useRef(false);
  const targetRotation = useRef(null);




  useEffect(() => {
    if (target) {
      isTransitioning.current = true;
      targetRotation.current = {
        x: target.rotation[1] * Math.PI / 180,
        y: target.rotation[0] * Math.PI / 180
      };
      rotation.current = {
        x: camera.rotation.y,
        y: camera.rotation.x
      };
    }
  }, [target]);




  useEffect(() => {
    if (target && target.rotation) {
      isTransitioning.current = true;
      targetRotation.current = {
        x: (target.rotation[1] * Math.PI) / 180,
        y: (target.rotation[0] * Math.PI) / 180,
      };
      rotation.current = {
        x: camera.rotation.y,
        y: camera.rotation.x,
      };
    }
  }, [target]);




  useFrame(() => {
    if (isTransitioning.current && targetRotation.current) {
      const lerpFactor = 0.05;
 
      rotation.current.x = THREE.MathUtils.lerp(
        rotation.current.x,
        targetRotation.current.x,
        lerpFactor
      );
      rotation.current.y = THREE.MathUtils.lerp(
        rotation.current.y,
        targetRotation.current.y,
        lerpFactor
      );
 
      if (
        Math.abs(rotation.current.x - targetRotation.current.x) < 0.001 &&
        Math.abs(rotation.current.y - targetRotation.current.y) < 0.001
      ) {
        isTransitioning.current = false;
        targetRotation.current = null;
      }
 
      camera.rotation.x = rotation.current.y;
      camera.rotation.y = rotation.current.x;
    }
  });




  return null;
};




export default CameraRotation;







