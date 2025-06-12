    import { HemisphereLight, Vector2 } from "three";
    import { RenderPass, UnrealBloomPass, EffectComposer } from "three/examples/jsm/Addons.js";
    
export default function lighting(camera, renderer, scene)
{
    // Render Pass and Unreal Bloom
    const rendPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 100);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.6;
    bloomPass.radius = 0.85;
    bloomPass.exposure = 0.1;
    const composer = new EffectComposer(renderer);
    composer.addPass(rendPass);
    composer.addPass(bloomPass);

    const hemiLight = new HemisphereLight(0x00bbff, 0xaa00ff);
    scene.add(hemiLight);

    return composer;
}