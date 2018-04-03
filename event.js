const Game = require('./reversi');

const checkIsRoom = (context) => {
  const { type } = context.session;
  if (type !== 'room') { return false; }

  return context.session.room || context.session.group;
};

const checkGameIsExist = (context, store) => {
  const { id: groupId } = context.session.room || context.session.group;
  if (!store[groupId]) { return false; }

  return store[groupId];
};

const Penguin = {
  name: 'Penguin',
  rule: /^72/,
  resolve: async (context) => {
    const url = 'https://i.imgur.com/8OBLFwV.jpg';
    await context.sendImage(url, url);
  },
};

const ShutUp = {
  name: 'ShutUp',
  rule: /^閉嘴/,
  resolve: async (context) => {
    await context.sendText('你才閉嘴啦');
  },
};

const Put = {
  name: 'Put',
  rule: /^put/,
  resolve: async (context, store) => {
    const room = checkIsRoom(context);
    if (!room) { return; }

    const game = checkGameIsExist(context, store);
    if (!game) {
      await context.sendText('遊戲尚未開始\n若要開始遊戲\n請使用「黑白棋 start」');
      return;
    }

    const { id, displayName } = context.session.user;
    const { turn } = game;

    if (!game.player[turn]) {
      game.player[turn] = id;
      const color = turn === 'black' ? '黑' : '白';
      await context.sendText(`${color}棋玩家為：${displayName}`);
    }

    if (game.player[turn] === id) {
      const { text: text0 } = context.event;
      const text1 = /put(.+)/.exec(text0)[1] || '';
      const text2 = /([A-Z|a-z])([1-8])/.exec(text1);
      if (!text2) {
        await context.sendText('參數錯誤');
        return;
      }
      const x = text2[1].toUpperCase().charCodeAt() - 64;
      const y = parseInt(text2[2], 10);

      try {
        await game.put(x, y);
        const winner = game.checkWinner();
        if (winner) {
          await context.sendText(`${displayName}是贏家～`);
        }
      } catch (e) {
        await context.sendText(e.toString());
        return;
      }
    } else {
      await context.sendText('下...下一局一定有你');
      return;
    }

    const { picture } = game;
    await context.sendImage(picture, picture);
  },
};

const Show = {
  name: 'Show',
  rule: /^show$/,
  resolve: async (context, store) => {
    const room = checkIsRoom(context);
    if (!room) { return; }

    const game = checkGameIsExist(context, store);
    if (!game) {
      await context.sendText('遊戲尚未開始\n若要開始遊戲\n請使用「黑白棋 start」');
      return;
    }

    const { picture } = game;
    console.log(picture);
    await context.sendImage(picture, picture);
  },
};


const Start = {
  name: 'Start',
  rule: /^start$/,
  resolve: async (context, store) => {
    const room = checkIsRoom(context);
    if (!room) { return; }

    const { id } = room;
    if (store[id]) {
      await context.sendText('遊戲已經開始囉\n若要重新開始\n請使用「黑白棋 restart」');
    } else {
      store[id] = new Game(id); // eslint-disable-line
      await context.sendText('遊戲開始');
      const { picture } = store[id];
      await context.sendImage(picture, picture);
    }
  },
};

const Restart = {
  name: 'Restart',
  rule: /restart$/,
  resolve: async (context, store) => {
    const room = checkIsRoom(context);
    if (!room) { return; }

    const { id } = room;
    if (store[id]) {
      store[id] = new Game(id); // eslint-disable-line      
      await context.sendText('遊戲已重新開始');
      const { picture } = store[id];
      await context.sendImage(picture, picture);
    } else {
      await Start.resolve(context, store);
    }
  },
};

const Log = {
  name: 'Log',
  rule: true,
  resolve: async (context) => {
    const result = {};
    const { type, user } = context.session;
    const { text } = context.event;
    Object.assign(result, { type, text });
    if (type === 'group' && context.session.group) {
      const { id: group } = context.session.group;
      Object.assign(result, { group });
    }
    if (type === 'room' && context.session.room) {
      const { id: room } = context.session.room;
      Object.assign(result, { room });
    }
    if (user) {
      const { userId: id, displayName, pictureUrl } = user;
      Object.assign(result, { user: { id, displayName, pictureUrl } });
    }
    console.log(result);
  },
};

const Reversi = {
  name: 'Reversi',
  rule: /^黑白棋(.+)/,
  resolve: async (context) => {
    const room = checkIsRoom(context);
    if (!room) {
      await context.sendText('你不在群組裡喔，請把我拉進群組裡面');
    }
  },
  cons: [Start, Restart, Show, Put],
};


const Index = {
  name: 'Index',
  rule: true,
  cons: [ShutUp, Log, Penguin, Reversi],
};

const execRule = (rule, text) => {
  if (typeof rule === 'function') {
    return rule(text);
  } else if (rule instanceof RegExp) {
    return rule.exec(text);
  }
  return rule;
};

const exec = async (node, context, store, text) => {
  const { rule, resolve = () => {}, cons = [] } = node;
  const test = execRule(rule, text || context.event.text);

  if (test !== null) {
    await resolve(context, store);
    if (Array.isArray(test) && test[1]) {
      text = test[1].trim(); // eslint-disable-line 
    }
    await Promise.all(cons.map(nextNode => exec(nextNode, context, store, text)));
  }
};

module.exports = exec.bind(null, Index);

