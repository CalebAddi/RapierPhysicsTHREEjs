export default function handleWindowResize(camera, renderer, composer = null)
{
    function resizeHandler() 
    {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        if (composer)
        {
            composer.setSize(window.innerWidth, window.innerHeight);
        }
    };

    window.addEventListener('resize', resizeHandler, false);

    return () => {
        window.removeEventListener('resize', resizeHandler);
    };
}