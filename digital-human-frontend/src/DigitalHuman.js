// import React, { useEffect } from 'react';
// import { useGLTF } from '@react-three/drei';
// import { useThree } from '@react-three/fiber';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

// function DigitalHuman() {
//   window.createImageBitmap = undefined
//   const { scene, materials, textures, isLoading, error } = useGLTF('/models/untitled.glb', true); // Ensure the second argument is true for loading optimally

//   useEffect(() => {
//     if (error) {
//       console.error('Error loading model:', error);
//     }
//     if (isLoading) {
//       console.log('Loading model...');
//     }
//     if (scene) {
//       console.log('Model loaded:', scene);
//       console.log('Materials:', materials);
//       console.log('Textures:', textures);
//     }
//   }, [scene, materials, textures, isLoading, error]);

//   if (error) {
//     return <p>Error loading model.</p>;
//   }
//   if (isLoading) {
//     return <p>Loading model...</p>;
//   }
//   return <primitive object={scene} scale={0.1} position={[0, -1.5, 0]} />;
// }

// export default DigitalHuman;


// function DigitalHuman() {
//   const { scene } = useThree();
//   const loader = new FBXLoader();

//   useEffect(() => {
//     loader.load('/models/xiaohei.fbx', (fbx) => {
//       scene.add(fbx);
//     });
//   }, [loader, scene]);

//   return null; // 因为您直接将模型添加到场景中，所以返回 null 或空的 fragment
// }

// export default DigitalHuman;

import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

function DigitalHuman() {
  const { scene } = useThree();
  const videoRef = useRef(null);

  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/models/1.mp4';  // 这里替换成你的 MP4 文件路径
    video.crossOrigin = 'anonymous';
    video.loop = true;  // 设置视频循环
    video.muted = true;  // 如果需要可以静音
    video.play();  // 自动播放

    const texture = new THREE.VideoTexture(video);
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);

    // 调整平面的尺寸和位置
    plane.scale.set(1, 1, 1);  // 根据需要调整比例
    plane.position.set(0, 0, -5);  // 根据需要调整位置

    scene.add(plane);

    // 清理函数
    return () => {
      video.pause();
      scene.remove(plane);
      texture.dispose();
    };
  }, [scene]);

  return null;
}

export default DigitalHuman;