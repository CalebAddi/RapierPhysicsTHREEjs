export default function mouseEventHandle(position)
{
    function mouseMoveHandler(e)
    {
        position.x = (e.clientX / window.innerWidth) * 2 - 1;
        position.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    document.addEventListener('mousemove', mouseMoveHandler, false);

    return () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
    }
}