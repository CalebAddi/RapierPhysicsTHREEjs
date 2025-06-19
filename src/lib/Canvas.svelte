<script>
    // @ts-nocheck
    import { onMount, onDestroy } from "svelte";
    import * as THREE from "three";
    import RAPIER from "@dimforge/rapier3d-compat";
    import { getBody, getMousePointer } from "./components/physicsObjects";
    import lighting from "./components/lighting";
    import handleWindowResize from "./components/windowResizer";
    import mouseEventHandler from "./components/mouseEventHandler";

    const scene = new THREE.Scene();
    let container = null;
    let animationID = null;
    let renderer = null;
    let cleanMouseEvents = null;
    let cleanResizeEvents = null;
    let isDestroyed = false;
    let world = null;

    // Performance monitoring
    let lastTime = 0;
    const targetFPS = 1000 / 60;

    onMount(async () => {
        try
        {
            // Rapier
            await RAPIER.init();
            const gravity = new RAPIER.Vector3(0, -0.9, 0);
            world = new RAPIER.World(gravity);

            // Camera
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 10);

            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.outputColorSpace = THREE.SRGBColorSpace;

            // Lighting
            const composer = lighting(scene, camera, renderer);

            // Scene Objects
            const numObj = 80;
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
            let mousePosition = new THREE.Vector2();

            // Canvas Container
            if (container)
            {
                container.appendChild(renderer.domElement);
            }

            // Animate
            function animate(currTime)
            {
                if (isDestroyed) return;

                // Frame rate control
                if (currTime - lastTime < targetFPS)
                {
                    animationID = requestAnimationFrame(animate);
                    return;
                }
                lastTime = currTime;

                world.step();
                mousePointer.update(mousePosition);
                for (let i = 0; i < bodies.length; i++) bodies[i].update();
                composer.render();
                animationID = requestAnimationFrame(animate);
            }
            animate(0);

            // Resize Window
            cleanResizeEvents = handleWindowResize(camera, renderer, composer);

            // Mouse Events
            cleanMouseEvents = mouseEventHandler(mousePosition);
        }
        catch (error)
        {
            console.error("Failed to initialize scene: ", error);
            isDestroyed = true;
        }
    });

    onDestroy(() => {
        try
        {
            isDestroyed = true;

            animationID && cancelAnimationFrame(animationID);
            world?.free();
            renderer?.dispose();
            cleanMouseEvents?.();
            cleanResizeEvents?.();
            scene?.clear();

            [animationID, world, renderer, cleanMouseEvents, cleanResizeEvents, container] = Array(6).fill(null);
        }
        catch (error)
        {
            console.warn("Error during onDestroy: ", error);
        }
    });

</script>

<main>
    <div bind:this={container} class="canvas-container"></div>
</main>

<style>
    .canvas-container
    {
        overflow: hidden;
    }
</style>