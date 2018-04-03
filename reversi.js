const {
  gridLength,
} = require('./setting.json');

const drawJpg = require('./reversi.jpg');

const uri = process.env.uri || '.';
const boardLength = gridLength + 2;
const allLength = gridLength * gridLength;
const deltas = [
  -1,
  +1,
  -1 * boardLength,
  1 * boardLength,
  -1 * (boardLength + 1),
  1 * (boardLength + 1),
  -1 * (boardLength - 1),
  1 * (boardLength - 1),
];

class Game {
  constructor(groupId) {
    this.turn = 'black';
    this.player = {};
    this.pieces = [];
    this.pieces[44] = 'white';
    this.pieces[55] = 'white';
    this.pieces[54] = 'black';
    this.pieces[45] = 'black';

    this.picture = `${uri}/init.jpg`;
    this.groupId = groupId;
  }

  nextPlayer() {
    if (this.turn === 'black') {
      this.turn = 'white';
    } else {
      this.turn = 'black';
    }
  }

  async draw() {
    const picture = await drawJpg(this.pieces, this.groupId);
    this.picture = picture;
    return picture;
  }

  async put(x, y) {
    if (x < 1 || x >= gridLength + 1 || y < 1 || y >= gridLength + 1) {
      console.log(x, y);
      throw '嘿，你不能下在那！';
    }
    const { pieces, turn } = this;
    const n = (x * boardLength) + y;
    if (pieces[n]) {
      throw '那裡已經有棋子了！';
    }

    let path = [];
    deltas.forEach((delta) => {
      let nextN = n + delta;
      let deltaPath = [];
      while (true) {
        const nextPieces = pieces[nextN];
        if (!nextPieces) {
          deltaPath = [];
          break;
        } else if (nextPieces === turn) {
          break;
        } else {
          deltaPath.push(nextN);
          nextN += delta;
        }
      }
      path = path.concat(deltaPath);
    });

    if (path.length === 0) {
      throw '嘿，你不能下在那！';
    }

    path.forEach((delta) => { pieces[delta] = turn; });
    pieces[n] = turn;

    this.nextPlayer();
    await this.draw();
  }

  checkWinner() {
    const { pieces } = this;
    const blackLength = pieces.filter(color => color === 'black').length;
    if (blackLength === 0) { return 'white'; }

    const whiteLength = pieces.filter(color => color === 'white').length;
    if (whiteLength === 0) { return 'black'; }

    if (pieces.filter(x => x).length !== allLength) { return undefined; }

    return blackLength > whiteLength ? 'black' : 'white';
  }
}

module.exports = Game;
