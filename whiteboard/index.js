const canvas = document.querySelector('#canvas');

const ctx = canvas.getContext('2d');

const resize = () => {
    ctx.canvas.height = window.innerHeight;
    ctx.canvas.width = window.innerWidth;
}
resize();

const position = {
    x: 0,
    y: 0
}

const mousePosition = (e) => {
    position.x = e.clientX;
    position.y = e.clientY;

}

const draw = (e) => {
    if (e.buttons !== 1) return
    const color = document.querySelector("#colorPicker").value;
    const lWidth = document.querySelector("#range").value;
    ctx.beginPath();
    ctx.lineWidth = lWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;

    ctx.moveTo(position.x, position.y);
    mousePosition(e);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
}
window.addEventListener("resize", resize)
canvas.addEventListener("mousedown", mousePosition)
canvas.addEventListener("mouseenter", mousePosition)
canvas.addEventListener("mousemove", draw)