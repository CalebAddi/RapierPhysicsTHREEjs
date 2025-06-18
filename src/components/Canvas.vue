<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { getBody, getMousePointer } from "/src/components/three/physicsObjects";
import handleWindowResize from '/src/components/three/windowResizer.js';
import lighting from '/src/components/three/lighting.js';
import mouseEventHandle from '/src/components/three/mouseEventHandle.js';

const scene = new THREE.Scene();
const threeContainer = ref(null);
let animationID = null;
let renderer = null;
let cleanMouseEvents = null;
let cleanupResize = null;
let isDestroyed = false;
let world = null;

// Performance Monitoring
let lastTime = 0;
const targFrameTime = 1000 / 60;

onMounted(async () => {
    try 
    {
        // Rapier Physics
        await RAPIER.init({});
        const gravity = new RAPIER.Vector3(0.0, -0.9, 0.0);
        world = new RAPIER.World(gravity);

        const width = window.innerWidth;
        const height = window.innerHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 8);

        // Renderer
        renderer = new THREE.WebGLRenderer({antialias: false, powerPreference: 'high-performance'});
        renderer.setSize(width, height);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        // Lighting
        const composer = lighting(camera, renderer, scene);

        // Scene Objects
        const numObj = 70;
        const bodies = [];
        for (let i = 0; i < numObj; i++)
        {
            const body = getBody(RAPIER, world);
            bodies.push(body);
            scene.add(body.mesh);
        }

        // Mouse Pointer
        const mousePointer = getMousePointer(RAPIER, world);
        scene.add(mousePointer.mesh);
        let mousePos = new THREE.Vector2();

        // Canvas Container
        if (threeContainer.value) 
        {
            threeContainer.value.appendChild(renderer.domElement);
        }

        // Animate
        function animate(currTime)
        {
            if (isDestroyed) return;

            //Frame rate limiting
            if (currTime - lastTime < targFrameTime)
            {
                // RAF call for skipped frames
                animationID = requestAnimationFrame(animate);
                return;
            }
            lastTime = currTime;

            world.step();
            mousePointer.update(mousePos);
            for (let i = 0; i < bodies.length; i++) bodies[i].update();
            composer.render();
            animationID = requestAnimationFrame(animate);
        }
        animate(0);

        // Resize Window
        cleanupResize = handleWindowResize(camera, renderer, composer);

        // Mouse Events
        cleanMouseEvents = mouseEventHandle(mousePos);
    } 
    catch (error) 
    {
        console.error('Failed to initialize 3D scene: ', error);
        isDestroyed = true;
    }
});

onUnmounted(() => {
    try
    {
        isDestroyed = true;

        animationID && cancelAnimationFrame(animationID);
        world?.free();
        renderer?.dispose();
        cleanMouseEvents?.();
        cleanupResize?.();
        scene.clear();

        [animationID, world, renderer, cleanMouseEvents, cleanupResize] = Array(5).fill(null);
    }
    catch (error)
    {
        console.warn('Error during unmount: ', error);
    }
});

</script>

<template>
    <div ref="threeContainer" class="three-container"></div>
</template>

<style scoped>
    .three-container
    {
        overflow: hidden;
    }
</style>