const sensors = [
  { x: 79, y: 59 },
  { x: 455, y: 40 },
]

function main() {
  document.getElementById('file').addEventListener('change', e => {
    document.body.removeChild(document.querySelector('canvas'));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const cached = document.createElement('canvas');
    const cachedCtx = cached.getContext('2d');
    let graph;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      ctx.fillStyle = 'green';
      for (const sensor of sensors) {
        ctx.arc(sensor.x, sensor.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      cached.width = img.width;
      cached.height = img.height;
      cachedCtx.drawImage(canvas, 0, 0);

      const bitmap = getBitmap(canvas);

      let str = '';
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          str += bitmap[x][y];
        }
        str += '\n';
      }
      document.querySelector('#lol').value = str;

      graph = new Graph(bitmap, { diagonal: true });
    };
    img.src = URL.createObjectURL(e.target.files[0]);

    canvas.addEventListener('click', e => {
      ctx.drawImage(cached, 0, 0);
      ctx.fillStyle = 'red';
      ctx.fillRect(e.offsetX - 3, e.offsetY - 3, 6, 6);
      ctx.fillText(`x: ${e.offsetX}, y: ${e.offsetY}`, e.offsetX + 8, e.offsetY + 2);

      ctx.strokeStyle = 'purple';
      ctx.lineWidth = 1;
      for (const sensor of sensors) {
        const result = astar.search(graph, graph.grid[e.offsetX][e.offsetY], graph.grid[sensor.x][sensor.y])
        ctx.beginPath();
        ctx.moveTo(e.offsetX, e.offsetY);
        for (const { x, y } of result) {
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });

    document.body.appendChild(canvas);
  });
}

function getBitmap(canvas) {
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buffer = data.data;
  const len = buffer.length;

  const arrays = [];
  for (let w = 0; w < canvas.width; w++) {
    const newBuffer = new ArrayBuffer(canvas.height);
    const arr = new Uint8Array(newBuffer);
    arrays.push(arr);
  }

  for (let i = 0; i < len; i += 4) {
    // get approx. luma value from RGB
    const rgbToLuma = buffer[i] * 0.3 + buffer[i + 1] * 0.59 + buffer[i + 2] * 0.11;
    // test against some threshold
    const bit = rgbToLuma < 120 ? 1 : 0;

    const column = Math.floor((i / 4) / canvas.height);
    const row = (i / 4) % canvas.height;

    arrays[column][row] = bit;
  }
  return arrays;
}

document.addEventListener('DOMContentLoaded', main);