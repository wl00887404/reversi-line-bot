const fs = require('fs');
const {
  gridLength,
  gridWidth,
  paddingWidth,
  pieceWidth,
  lineWidth,
} = require('./setting.json');
const { createCanvas } = require('canvas-prebuilt');

const boardLength = gridLength + 2;
const boardWidth = (gridWidth * gridLength) + (paddingWidth * 2);
const uri = process.env.uri || './';

const drawBoard = (ctx) => {
  ctx.fillStyle = '#ffc34d';
  ctx.fillRect(0, 0, boardWidth, boardWidth);
  ctx.fillStyle = '#000000';
  ctx.font = '24px Arial';
  for (let i = 1; i <= gridLength; i += 1) {
    ctx.fillText(i, paddingWidth * 0.35, (gridWidth * i) + (paddingWidth * 0.8));
    ctx.fillText(String.fromCharCode(64 + i),
      (gridWidth * i) + (paddingWidth * 0.3),
      paddingWidth * 0.8);
  }
};

const drawLines = (ctx) => {
  const length = boardWidth - (paddingWidth * 2);
  const lineLength = gridLength + 1;
  ctx.strokeStyle = '#000000';
  ctx.strokeWidth = lineWidth;
  ctx.beginPath();
  for (let i = 0; i < lineLength; i += 1) {
    const start = (gridWidth * i) + paddingWidth;
    ctx.moveTo(paddingWidth, start);
    ctx.lineTo(paddingWidth + length, start);
    ctx.moveTo(start, paddingWidth);
    ctx.lineTo(start, paddingWidth + length);
  }
  ctx.stroke();
};

const drawPiece = (ctx, i) => {
  const x = Math.floor(i / boardLength);
  const y = i % boardLength;
  const fix = paddingWidth - (gridWidth / 2);
  const radius = (pieceWidth / 2) - lineWidth;

  ctx.beginPath();
  ctx.arc((gridWidth * x) + fix, (gridWidth * y) + fix, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();
};

const drawJpg = async (pieces, id) => {
  const canvas = createCanvas(boardWidth, boardWidth);
  const ctx = canvas.getContext('2d');

  drawBoard(ctx);
  drawLines(ctx);

  ctx.fillStyle = 'black';
  pieces.forEach((color, i) => {
    if (color === 'black') {
      drawPiece(ctx, i);
    }
  });

  ctx.fillStyle = 'white';
  pieces.forEach((color, i) => {
    if (color === 'white') {
      drawPiece(ctx, i);
    }
  });

  const fileName = `${id || (new Date()).getTime()}.jpg`;
  const dist = `./static/${fileName}`;
  const input = canvas.jpegStream({ bufsize: 4096, quality: 100, progressive: true });
  const output = fs.createWriteStream(dist);
  input.pipe(output);
  await new Promise(resolve => output.on('finish', resolve));

  return `${uri}${fileName}?t=${(new Date()).getTime()}`;
};

module.exports = drawJpg;

// const a = [];
// a[44] = 'white';
// a[55] = 'white';
// a[45] = 'black';
// a[54] = 'black';
// drawJpg(a);
