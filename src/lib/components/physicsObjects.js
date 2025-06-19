import { IcosahedronGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial, PointLight, Vector3 } from 'three';

const middleScene = new Vector3(0, 0, 0);

export function getBody(RAPIER, world)
{
    const size = 0.2 + Math.random() * 0.3;
    const range = 7;
    const density = size * 2.0;
    let x = Math.random() * range - range * 0.5;
    let y = Math.random() * range - range * 0.5 + 3;
    let z = Math.random() * range - range * 0.5;

    // Physics
    let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z);
    let rigid = world.createRigidBody(rigidBodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.ball(size).setDensity(density);
    world.createCollider(colliderDesc, rigid);

    // Geometry & Material
    const geometry = new IcosahedronGeometry(size, 1);
    const material = new MeshStandardMaterial({
        color: 0x0f964f,
        flatShading: true
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    const wireMat = new MeshBasicMaterial({
        color: 0xff444f,
        transparent: true,
        opacity: 0.3
    });
    const wireMesh = new Mesh(geometry, wireMat);
    wireMesh.scale.setScalar(1.001);
    mesh.add(wireMesh);

    // Random floating ball behavior
    const isFloating = Math.random() < 0.3;
    const floatDir = Math.random() < 0.5 ? 1 : -1;
    const floatSpeed = (size * 0.05) + Math.random() * 0.002; // Scale speed based on size
    let floatPhase = Math.random() * Math.PI * 2; // Random starting phase

    function update()
    {
        rigid.resetForces(true);
        let { x, y, z } = rigid.translation();
        
        if (isFloating)
        {
            // Float behavior
            floatPhase += 0.008 * floatSpeed;

            const floatForce = Math.sin(floatPhase) * 0.3 * floatDir;
            
            // Apply return force when far from center
            const returnStrength = Math.max(0, (Math.abs(y) - 5) * 0.25);
            const returnForce = y > 0 ? -returnStrength : returnStrength;
            
            rigid.addForce(new Vector3(0, floatForce + returnForce, 0), true);
            
            const centerPull = new Vector3(x, 0, z).normalize().multiplyScalar(-0.1);
            rigid.addForce(centerPull, true);
        }
        else
        {
            // Original magnetization behavior for non-floating balls
            let pos = new Vector3(x, y, z);
            let dir = pos.clone().sub(middleScene).normalize();
            rigid.addForce(dir.multiplyScalar(-0.5), true);
        }
        
        mesh.position.set(x, y, z);
    }

    return { mesh, rigid, update };
}

export function getMousePointer(RAPIER, world)
{
    const mouseSize = 0.35;
    const geometry = new IcosahedronGeometry(mouseSize, 8);
    const material = new MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff
    });
    const mouseLight = new PointLight(0xffffff, 5.5);
    const mouseMesh = new Mesh(geometry, material);
    mouseMesh.add(mouseLight);

    let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0);
    let mouseRigid = world.createRigidBody(bodyDesc);
    let dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 3.0);
    world.createCollider(dynamicCollider, mouseRigid);

    function update(mousePos)
    {
        mouseRigid.setTranslation({ x: mousePos.x * 5,  y: mousePos.y * 5, z: 0});
        let { x, y, z } = mouseRigid.translation();
        mouseMesh.position.set(x, y, z);
    }
    return { mesh: mouseMesh, update };
}