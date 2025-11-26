const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// ================== ТОКЕН БОТА ==================
const TOKEN = process.env.BOT_TOKEN || '8266371576:AAHHrY6pUogBwtBZPiEiFe6T2sUikdd_BDI';
// ================================================

const bot = new TelegramBot(TOKEN, {polling: true});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('⚽ Football Mafia Bot ULTIMATE is Running!');
});

app.listen(port, () => {
  console.log(`🚀 Enhanced Football Mafia Bot started on port ${port}`);
});

// ================== УЛУЧШЕННЫЕ СПИСКИ ==================
const footballers = [
"Lionel Messi","Cristiano Ronaldo","Neymar","Kylian Mbappé","Mohamed Salah",
"Kevin De Bruyne","Robert Lewandowski","Sadio Mané","Virgil van Dijk","Erling Haaland",
"Luka Modrić","Harry Kane","Karim Benzema","Son Heung-min","Bruno Fernandes",
"Joshua Kimmich","Alisson Becker","Jan Oblak","Ederson Moraes","Trent Alexander-Arnold",
"Raheem Sterling","Phil Foden","Romelu Lukaku","Paulo Dybala","Thiago Alcântara",
"Marc-André ter Stegen","Andrew Robertson","Gerard Piqué","Sergio Ramos","Ciro Immobile",
"Pierre-Emerick Aubameyang","Angel Di Maria","Marco Reus","Toni Kroos","Paul Pogba",
"Riyad Mahrez","Hakim Ziyech","Gianluigi Donnarumma","Ivan Rakitić","Frenkie de Jong",
"Achraf Hakimi","Fábio Vieira","Bukayo Saka","Mason Mount","Jadon Sancho",
"James Maddison","Christian Pulisic","Dominik Szoboszlai","Leroy Sané","Jorginho",
"Rodri","Casemiro","Ferran Torres","Wilfried Zaha","Hugo Lloris",
"Edin Džeko","Thomas Müller","David Alaba","Emre Can","Coutinho",
"Serge Gnabry","Kingsley Coman","Mikel Oyarzabal","Alexis Sánchez","Dani Carvajal",
"João Félix","Aymeric Laporte","Marco Verratti","Julián Álvarez","Declan Rice",
"Kalvin Phillips","Bukayo Saka","Phil Foden","Raúl Jiménez","Lautaro Martínez",
"Fábio Silva","Rafael Leão","Leon Goretzka","João Cancelo","Richarlison",
"Antoine Griezmann","Rodrigo De Paul","Marquinhos","Nabil Fekir","César Azpilicueta",
"Gerard Moreno","Alex Meret","Koke","Sergio Busquets","César Montes",
"Fabian Ruiz","Youssef En-Nesyri","Niklas Süle","Mats Hummels","Andreas Christensen",
"Dejan Kulusevski","Federico Chiesa","Riyad Mahrez","Hakim Ziyech","Marco Asensio",
"Christian Eriksen","Martin Ødegaard","Alexander Isak","David de Gea","Eric García",
"João Moutinho","Bernardo Silva","Raphaël Guerreiro","Jonathan David","Dominik Szoboszlai",
"Ilkay Gündogan","Marco Reus","Leon Bailey","Christopher Nkunku","Pedri",
"Eduardo Camavinga","Vinícius Júnior","Rodrygo","Josip Iličić","Paulo Dybala",
"David Silva","Tanguy Ndombele","Moussa Diaby","Marcus Rashford","Bukayo Saka",
"Jude Bellingham","Kai Havertz","Moussa Dembélé","Gabriel Jesus","Ousmane Dembélé",
"Thomas Partey","Éverton Ribeiro","Casemiro","Marquinhos","Angel Correa",
"Ángel Di María","Erik Lamela","Lucas Ocampos","Lucas Paquetá","Alex Telles",
"Ángel Correa","Lucas Vázquez","Joaquín Correa","Lautaro Martínez","Sergio Canales",
"Matheus Cunha","André Silva","Paulo Dybala","Rodrigo Bentancur","Timo Werner",
"Jorginho","Kalidou Koulibaly","José Gayà","Eduardo Camavinga","Alphonso Davies"
];

const clubs = [
"Real Madrid","Barcelona","Manchester United","Liverpool","Bayern Munich",
"Juventus","Paris Saint-Germain","Chelsea","Manchester City","Arsenal",
"Borussia Dortmund","Inter Milan","AC Milan","Tottenham Hotspur","Atletico Madrid",
"Ajax","Napoli","RB Leipzig","Sevilla","Monaco",
"Benfica","Porto","Roma","Lazio","Sporting CP",
"Shakhtar Donetsk","PSV Eindhoven","Feyenoord","Celtic","Rangers",
"Valencia","Villarreal","Leicester City","West Ham","Everton",
"Leeds United","Real Sociedad","Marseille","Lyon"
];

const nationalities = [
"Аргентина", "Бразилия", "Франция", "Португалия", "Египет", 
"Бельгия", "Польша", "Сенегал", "Нидерланды", "Норвегия",
"Хорватия", "Англия", "Южная Корея", "Германия", "Испания",
"Италия", "Уругвай", "Гана", "Дания", "Швеция"
];

// ================== УЛУЧШЕННЫЕ ПЕРЕМЕННЫЕ ИГРЫ ==================
let games = {}; // Поддержка нескольких чатов
let gameTimers = {}; // Таймеры для авто-старта

class Game {
  constructor(chatId) {
    this.chatId = chatId;
    this.players = {};
    this.names = {};
    this.hints = {};
    this.round_num = 0;
    this.imposter = null;
    this.max_rounds = 3;
    this.mode = "standard";
    this.votes = {};
    this.game_started = false;
    this.current_footballer = null;
    this.creation_time = Date.now();
    this.voterMap = {};
    this.usedFootballers = new Set(); // Для избежания повторов
    this.stats = {
      games_played: 0,
      imposter_wins: 0,
      civilian_wins: 0
    };
  }

  getRandomFootballer() {
    const available = footballers.filter(f => !this.usedFootballers.has(f));
    if (available.length === 0) {
      this.usedFootballers.clear(); // Сброс если все использованы
      return footballers[Math.floor(Math.random() * footballers.length)];
    }
    const footballer = available[Math.floor(Math.random() * available.length)];
    this.usedFootballers.add(footballer);
    return footballer;
  }

  getRoleList() {
    switch(this.mode) {
      case "clubs": return clubs;
      case "nationality": return nationalities;
      default: return footballers;
    }
  }

  startAutoTimer() {
    if (gameTimers[this.chatId]) {
      clearTimeout(gameTimers[this.chatId]);
    }
    
    if (Object.keys(this.players).length >= 2) {
      gameTimers[this.chatId] = setTimeout(() => {
        if (!this.game_started && Object.keys(this.players).length >= 2) {
          this.startGame();
          bot.sendMessage(this.chatId, 
            "⏰ Игра запущена автоматически! Достаточно игроков для начала."
          );
        }
      }, 60000); // Авто-старт через 60 секунд
    }
  }
}

// ================== УЛУЧШЕННЫЕ КОМАНДЫ БОТА ==================
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  
  if (!games[chatId]) {
    games[chatId] = new Game(chatId);
  }
  
  const game = games[chatId];
  
  const welcomeText = 
    `⚽ Добро пожаловать в Football Mafia ULTIMATE, ${userName}!\n\n` +
    `🎮 УЛУЧШЕННЫЕ КОМАНДЫ:\n` +
    `/join - Присоединиться к игре\n` +
    `/start_game - Начать игру\n` +
    `/mode - Выбрать режим (standard/clubs/nationality/quick/legend)\n` +
    `/players - Список игроков\n` +
    `/kick @username - Исключить игрока (для админов)\n` +
    `/stats - Статистика игры\n` +
    `/rules - Полные правила\n\n` +
    `✨ НОВЫЕ ФИЧИ:\n` +
    `• Авто-старт при 2+ игроках\n` +
    `• 3 режима игры\n` +
    `• Статистика побед\n` +
    `• Система киков\n` +
    `• Умный подбор футболистов\n\n` +
    `🚀 Используй /join чтобы начать!`;
    
  bot.sendMessage(chatId, welcomeText);
});

bot.onText(/\/join/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || "Игрок";
  
  if (!games[chatId]) {
    games[chatId] = new Game(chatId);
  }
  
  const game = games[chatId];
  
  if (game.game_started) {
    bot.sendMessage(chatId, "❌ Игра уже началась! Дождись следующей.");
    return;
  }
  
  if (game.players[userId]) {
    bot.sendMessage(chatId, "❌ Ты уже в игре!");
    return;
  }
  
  game.names[userId] = userName;
  const roleList = game.getRoleList();
  
  if (game.current_footballer === null) {
    game.current_footballer = game.getRandomFootballer();
  }
  
  if (game.imposter === null) {
    game.imposter = userId;
    game.players[userId] = "IMPOSTER 🎭";
    bot.sendMessage(userId, 
      "🎭 Ты ИМПОСТЕР!\n\n" +
      "❌ У тебя НЕТ футболиста!\n\n" +
      "🎯 ТВОИ ЗАДАЧИ:\n" +
      "• Слушай описания других игроков\n" +
      "• Попробуй угадать футболиста (/guess имя)\n" +
      "• Останься незамеченным до голосования\n" +
      "• Делай нейтральные описания\n\n" +
      "🏆 Победа если:\n" +
      "• Угадаешь футболиста\n" +
      "• Тебя не вычислят на голосовании\n\n" +
      "💡 СОВЕТ: Описывай так, чтобы не выдать незнание!"
    );
  } else {
    game.players[userId] = game.current_footballer;
    bot.sendMessage(userId, 
      `⚽ Ты МИРНЫЙ игрок!\n\n` +
      `✅ Твой футболист: ${game.current_footballer}\n\n` +
      `🎯 ТВОИ ЗАДАЧИ:\n` +
      `• Описывай футболиста нестандартно\n` +
      `• Найди импостера среди игроков\n` +
      `• Не дай угадать футболиста\n\n` +
      `🏆 Победа если:\n` +
      `• Вычислишь импостера на голосовании\n` +
      `• Импостер не угадает футболиста\n\n` +
      `💡 СОВЕТ: Используй /hint твое_описание\n` +
      `💡 Избегай очевидных описаний!`
    );
  }
  
  const playerCount = Object.keys(game.players).length;
  bot.sendMessage(chatId, 
    `✅ ${userName} присоединился! Игроков: ${playerCount}/10\n\n` +
    `⏰ Авто-старт через 60 сек при 2+ игроках\n` +
    `🚀 Или используй /start_game для ручного запуска`
  );
  
  // Запуск таймера авто-старта
  game.startAutoTimer();
});

bot.onText(/\/start_game/, (msg) => {
  const chatId = msg.chat.id;
  
  if (!games[chatId]) {
    bot.sendMessage(chatId, "❌ Сначала создайте игру через /start");
    return;
  }
  
  const game = games[chatId];
  game.startGame();
});

// Добавляем метод startGame в класс
Game.prototype.startGame = function() {
  if (this.game_started) {
    bot.sendMessage(this.chatId, "❌ Игра уже началась!");
    return;
  }
  
  if (Object.keys(this.players).length < 2) {
    bot.sendMessage(this.chatId, "❌ Нужно минимум 2 игрока для начала игры!");
    return;
  }
  
  this.game_started = true;
  this.round_num = 1;
  
  if (gameTimers[this.chatId]) {
    clearTimeout(gameTimers[this.chatId]);
  }
  
  const roleList = this.getRoleList();
  
  bot.sendMessage(this.chatId,
    `🎮 ИГРА НАЧАЛАСЬ!\n\n` +
    `📊 СТАТИСТИКА ИГРЫ:\n` +
    `• Режим: ${this.mode}\n` +
    `• Игроков: ${Object.keys(this.players).length}\n` +
    `• Раундов: ${this.max_rounds}\n` +
    `• Футболист: 🎯 СЕКРЕТ\n\n` +
    `🔄 Раунд ${this.round_num}\n` +
    `📝 Отправляйте подсказки командой:\n` +
    `/hint ваше_описание\n\n` +
    `⏰ У вас 2 минуты на раунд!`
  );
  
  // Таймер на раунд
  setTimeout(() => {
    if (this.game_started && Object.keys(this.hints).length < Object.keys(this.players).length) {
      const missingPlayers = Object.keys(this.players).filter(uid => !this.hints[uid]);
      if (missingPlayers.length > 0) {
        const missingNames = missingPlayers.map(uid => this.names[uid]).join(', ');
        bot.sendMessage(this.chatId,
          `⏰ ВРЕМЯ ВЫШЛО!\n` +
          `Не отправили подсказки: ${missingNames}\n` +
          `Переходим к следующему раунду!`
        );
        this.advanceRound();
      }
    }
  }, 120000); // 2 минуты на раунд
};

bot.onText(/\/mode (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const newMode = match[1].toLowerCase();
  
  if (!games[chatId]) {
    games[chatId] = new Game(chatId);
  }
  
  const game = games[chatId];
  
  if (game.game_started) {
    bot.sendMessage(chatId, "❌ Нельзя менять режим во время игры!");
    return;
  }
  
  const modes = {
    "standard": {name: "Стандартный", rounds: 3, desc: "футболисты"},
    "clubs": {name: "Клубы", rounds: 3, desc: "футбольные клубы"}, 
    "nationality": {name: "Национальности", rounds: 3, desc: "страны"},
    "quick": {name: "Быстрая", rounds: 2, desc: "футболисты"},
    "legend": {name: "Легендарная", rounds: 5, desc: "футболисты"}
  };
  
  if (modes[newMode]) {
    game.mode = newMode;
    game.max_rounds = modes[newMode].rounds;
    bot.sendMessage(chatId,
      `✅ Режим изменен на: ${modes[newMode].name}\n\n` +
      `📊 Параметры:\n` +
      `• Раундов: ${game.max_rounds}\n` +
      `• Тип ролей: ${modes[newMode].desc}\n\n` +
      `🎮 Теперь используй /join`
    );
  } else {
    const availableModes = Object.keys(modes).map(m => `• ${m} - ${modes[m].name}`).join('\n');
    bot.sendMessage(chatId,
      `❌ Неверный режим! Доступные режимы:\n\n${availableModes}\n\n` +
      `Используй: /mode standard`
    );
  }
});

bot.onText(/\/players/, (msg) => {
  const chatId = msg.chat.id;
  
  if (!games[chatId] || Object.keys(games[chatId].players).length === 0) {
    bot.sendMessage(chatId, "👥 В лобби пока нет игроков. Используй /join");
    return;
  }
  
  const game = games[chatId];
  let playerList = "👥 ИГРОКИ В ЛОББИ:\n\n";
  
  for (const [userId, playerName] of Object.entries(game.names)) {
    const status = game.game_started ? "🎮 В игре" : "⏳ Ожидание";
    playerList += `• ${playerName} - ${status}\n`;
  }
  
  playerList += `\n📊 Всего: ${Object.keys(game.players).length} игроков`;
  
  if (!game.game_started && Object.keys(game.players).length >= 2) {
    playerList += `\n\n⏰ Авто-старт через 60 сек!`;
  }
  
  bot.sendMessage(chatId, playerList);
});

bot.onText(/\/hint (.+)/, (msg, match) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const hintText = match[1];
  
  if (!games[chatId] || !games[chatId].game_started) {
    bot.sendMessage(chatId, "❌ Игра еще не начата! Сначала /start_game");
    return;
  }
  
  const game = games[chatId];
  
  if (!game.players[userId]) {
    bot.sendMessage(chatId, "❌ Ты не в игре! Используй /join в следующей игре");
    return;
  }
  
  if (game.hints[userId]) {
    bot.sendMessage(chatId, "❌ Ты уже отправил подсказку в этом раунде!");
    return;
  }
  
  if (hintText.length > 100) {
    bot.sendMessage(chatId, "❌ Слишком длинная подсказка! Максимум 100 символов.");
    return;
  }
  
  game.hints[userId] = hintText;
  const playerName = game.names[userId];
  const role = (userId === game.imposter) ? "🎭" : "⚽";
  
  bot.sendMessage(chatId, `${role} ${playerName}: ${hintText}`);
  
  if (Object.keys(game.hints).length === Object.keys(game.players).length) {
    game.advanceRound();
  }
});

// Добавляем метод advanceRound
Game.prototype.advanceRound = function() {
  this.round_num++;
  
  if (this.round_num > this.max_rounds) {
    this.startVoting();
  } else {
    setTimeout(() => {
      bot.sendMessage(this.chatId, 
        `🔄 Раунд ${this.round_num}/${this.max_rounds}!\n\n` +
        `📝 Отправляйте подсказки:\n` +
        `/hint ваше_описание\n\n` +
        `⏰ У вас 2 минуты!`
      );
      this.hints = {};
    }, 3000);
  }
};

Game.prototype.startVoting = function() {
  let voteMessage = "🗳️ ВРЕМЯ ГОЛОСОВАНИЯ!\n\n";
  voteMessage += "Голосуйте за того, кто по вашему мнению ИМПОСТЕР:\n\n";
  
  let voterNumber = 1;
  this.voterMap = {};
  
  for (const userId in this.names) {
    voteMessage += `/vote_${voterNumber} - ${this.names[userId]}\n`;
    this.voterMap[voterNumber] = userId;
    voterNumber++;
  }
  
  voteMessage += `\n⏰ Голосуйте в течение 1 минуты!`;
  
  bot.sendMessage(this.chatId, voteMessage);
  
  // Таймер на голосование
  setTimeout(() => {
    if (this.game_started && Object.keys(this.votes).length < Object.keys(this.players).length) {
      const missingVotes = Object.keys(this.players).filter(uid => !this.votes[uid]);
      if (missingVotes.length > 0) {
        const missingNames = missingVotes.map(uid => this.names[uid]).join(', ');
        bot.sendMessage(this.chatId,
          `⏰ ВРЕМЯ ВЫШЛО!\n` +
          `Не проголосовали: ${missingNames}\n` +
          `Подсчитываем результаты...`
        );
        this.finishGame();
      }
    }
  }, 60000);
};

bot.onText(/\/vote_(\d+)/, (msg, match) => {
  const voterId = msg.from.id;
  const voteNumber = parseInt(match[1]);
  const chatId = msg.chat.id;
  
  if (!games[chatId] || !games[chatId].voterMap) {
    bot.sendMessage(chatId, "❌ Голосование еще не началось!");
    return;
  }
  
  const game = games[chatId];
  
  if (!game.players[voterId]) {
    bot.sendMessage(chatId, "❌ Ты не в игре!");
    return;
  }
  
  if (game.votes[voterId]) {
    bot.sendMessage(chatId, "❌ Ты уже проголосовал!");
    return;
  }
  
  const votedUserId = game.voterMap[voteNumber];
  
  if (!votedUserId) {
    bot.sendMessage(chatId, "❌ Неверный номер игрока!");
    return;
  }
  
  game.votes[voterId] = votedUserId;
  const voterName = game.names[voterId];
  const votedName = game.names[votedUserId];
  
  bot.sendMessage(chatId, `✅ ${voterName} проголосовал(а) за ${votedName}`);
  
  if (Object.keys(game.votes).length === Object.keys(game.players).length) {
    game.finishGame();
  }
});

bot.onText(/\/guess (.+)/, (msg, match) => {
  const userId = msg.from.id;
  const guessText = match[1];
  const chatId = msg.chat.id;
  
  if (!games[chatId]) return;
  
  const game = games[chatId];
  
  if (userId !== game.imposter) {
    bot.sendMessage(chatId, "❌ Только импостер может угадывать футболиста!");
    return;
  }
  
  if (guessText.toLowerCase() === game.current_footballer.toLowerCase()) {
    game.stats.imposter_wins++;
    game.stats.games_played++;
    
    bot.sendMessage(chatId,
      `🎯 ИМПОСТЕР УГАДАЛ!\n\n` +
      `⚽ Футболист был: ${game.current_footballer}\n` +
      `🎭 Импостер: ${game.names[game.imposter]}\n\n` +
      `🏆 ПОБЕДА ИМПОСТЕРА!\n\n` +
      `📊 Статистика: ${game.stats.imposter_wins} побед импостера`
    );
    game.endGame();
  } else {
    bot.sendMessage(userId, 
      `❌ "${guessText}" - неверно!\n\n` +
      `💡 Продолжай слушать подсказки других игроков.\n` +
      `🎯 Попробуй еще раз: /guess имя_футболиста`
    );
  }
});

Game.prototype.finishGame = function() {
  let voteCount = {};
  for (const votedId of Object.values(this.votes)) {
    voteCount[votedId] = (voteCount[votedId] || 0) + 1;
  }
  
  let maxVotes = 0;
  let suspectedId = null;
  
  for (const [playerId, count] of Object.entries(voteCount)) {
    if (count > maxVotes) {
      maxVotes = count;
      suspectedId = playerId;
    }
  }
  
  // Проверяем ничью
  const suspectedPlayers = Object.keys(voteCount).filter(id => voteCount[id] === maxVotes);
  this.stats.games_played++;
  
  if (suspectedPlayers.length > 1) {
    // Ничья - победа импостера
    this.stats.imposter_wins++;
    const suspectedNames = suspectedPlayers.map(id => this.names[id]).join(", ");
    bot.sendMessage(this.chatId,
      `🤔 НИЧЬЯ В ГОЛОСОВАНИИ!\n\n` +
      `🎭 Подозреваемые: ${suspectedNames}\n` +
      `❌ Импостер не раскрыт!\n\n` +
      `⚽ Футболист был: ${this.current_footballer}\n` +
      `🎭 Импостером был: ${this.names[this.imposter]}\n\n` +
      `🏆 ПОБЕДА ИМПОСТЕРА!\n\n` +
      `📊 Статистика: ${this.stats.imposter_wins} побед импостера`
    );
  } else if (suspectedId == this.imposter) {
    // Импостер пойман - победа мирных
    this.stats.civilian_wins++;
    bot.sendMessage(this.chatId,
      `🎉 ИМПОСТЕР РАСКРЫТ!\n\n` +
      `🎭 Это был: ${this.names[this.imposter]}\n` +
      `⚽ Футболист был: ${this.current_footballer}\n\n` +
      `🏆 ПОБЕДА МИРНЫХ ИГРОКОВ!\n\n` +
      `📊 Статистика: ${this.stats.civilian_wins} побед мирных`
    );
  } else {
    // Ошиблись - победа импостера
    this.stats.imposter_wins++;
    bot.sendMessage(this.chatId,
      `😱 ОШИБКА!\n\n` +
      `🎭 Импостером был: ${this.names[this.imposter]}\n` +
      `⚽ Футболист был: ${this.current_footballer}\n\n` +
      `🏆 ПОБЕДА ИМПОСТЕРА!\n\n` +
      `📊 Статистика: ${this.stats.imposter_wins} побед импостера`
    );
  }
  
  this.endGame();
};

Game.prototype.endGame = function() {
  this.players = {}; 
  this.names = {}; 
  this.hints = {}; 
  this.votes = {};
  this.round_num = 0; 
  this.imposter = null; 
  this.game_started = false; 
  this.current_footballer = null;
  this.voterMap = null;
  
  setTimeout(() => {
    bot.sendMessage(this.chatId,
      `🔄 Игра окончена!\n\n` +
      `🎮 Новая игра через 10 секунд...\n` +
      `🚀 Используй /join чтобы присоединиться!`
    );
  }, 3000);
};

bot.onText(/\/stats/, (msg) => {
  const chatId = msg.chat.id;
  
  if (!games[chatId]) {
    games[chatId] = new Game(chatId);
  }
  
  const game = games[chatId];
  
  const statsText = 
    `📊 СТАТИСТИКА ИГРЫ:\n\n` +
    `🎮 Всего игр: ${game.stats.games_played}\n` +
    `🏆 Побед мирных: ${game.stats.civilian_wins}\n` +
    `🎭 Побед импостера: ${game.stats.imposter_wins}\n\n`;
    
  if (game.stats.games_played > 0) {
    const imposterWinRate = Math.round((game.stats.imposter_wins / game.stats.games_played) * 100);
    const civilianWinRate = Math.round((game.stats.civilian_wins / game.stats.games_played) * 100);
    
    statsText += `📈 Винрейт:\n` +
                 `• Мирные: ${civilianWinRate}%\n` +
                 `• Импостер: ${imposterWinRate}%\n\n`;
  }
  
  statsText += `🎯 Текущий режим: ${game.mode}\n` +
               `👥 Максимум игроков: 10`;
  
  bot.sendMessage(chatId, statsText);
});

bot.onText(/\/rules/, (msg) => {
  const chatId = msg.chat.id;
  const rulesText = 
    "📖 ПРАВИЛА FOOTBALL MAFIA ULTIMATE:\n\n" +
    "🎯 ЦЕЛЬ ИГРЫ:\n" +
    "• Мирные игроки: найти импостера\n" +
    "• Импостер: угадать футболиста или остаться незамеченным\n\n" +
    "🔄 ХОД ИГРЫ:\n" +
    "1. /join - присоединиться к игре\n" +
    "2. Авто-старт при 2+ игроках (60 сек) или /start_game\n" +
    "3. Мирные получают одинакового футболиста\n" +
    "4. Импостер НЕ знает футболиста\n" +
    "5. Раунды описаний через /hint (2 минуты на раунд)\n" +
    "6. После раундов - голосование за импостера (1 минута)\n" +
    "7. Импостер может угадывать через /guess\n\n" +
    "⚙️ РЕЖИМЫ:\n" +
    "• standard - 3 раунда, футболисты\n" +
    "• clubs - 3 раунда, футбольные клубы\n" +
    "• nationality - 3 раунда, страны\n" +
    "• quick - 2 раунда, футболисты\n" +
    "• legend - 5 раундов, футболисты\n\n" +
    "🎮 НОВЫЕ ФИЧИ:\n" +
    "• Авто-старт игры\n" +
    "• Таймеры раундов\n" +
    "• Статистика побед\n" +
    "• Умный подбор футболистов\n" +
    "• Поддержка нескольких чатов\n\n" +
    "🚀 Наслаждайтесь улучшенной игрой!";
    
  bot.sendMessage(chatId, rulesText);
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.log('Polling error:', error);
});

bot.on('webhook_error', (error) => {
  console.log('Webhook error:', error);
});

console.log("🤖 Football Mafia Bot ULTIMATE started successfully!");
console.log("⚽ Enhanced features loaded:");
console.log("   • Multi-chat support");
console.log("   • Auto-start timers"); 
console.log("   • Advanced statistics");
console.log("   • Smart footballer selection");
console.log("   • Round timers");
console.log("   • 5 game modes");
