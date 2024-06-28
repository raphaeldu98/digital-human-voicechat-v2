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

//   return null; // ��Ϊ��ֱ�ӽ�ģ����ӵ������У����Է��� null ��յ� fragment
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
    video.src = '/models/1.mp4';  // �����滻����� MP4 �ļ�·��
    video.crossOrigin = 'anonymous';
    video.loop = true;  // ������Ƶѭ��
    video.muted = true;  // �����Ҫ���Ծ���
    video.play();  // �Զ�����

    const texture = new THREE.VideoTexture(video);
    const geometry = new THREE.PlaneGeometry(20, 20);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);

    // ����ƽ��ĳߴ��λ��
    plane.scale.set(1, 1, 1);  // ������Ҫ��������
    plane.position.set(0, 0, -5);  // ������Ҫ����λ��

    scene.add(plane);

    // ������
    return () => {
      video.pause();
      scene.remove(plane);
      texture.dispose();
    };
  }, [scene]);

  return null;
}

export default DigitalHuman;