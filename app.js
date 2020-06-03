let words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];
let randomWord;
let lives;
let wrongLetters = [];
const placeholders = [];
let status;
let score;
let winCount = window.localStorage.getItem('winCountKey');
let lossCount = window.localStorage.getItem('lossCountKey');

function isCharacterValid(event) {
  const key = event.keyCode;
  return key >= 65 && key <= 90;
}

const model = {
  init() {
    status = 'inProgress';
    placeholders.length = 0;
    lives = 6;
    wrongLetters = [];
    document.getElementById('wrongLetters').innerHTML = wrongLetters.join();
    randomWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById('randomWord').style.display = 'none';
  },
};

const view = {
  renderScore() {
    document.getElementById('userScore').innerHTML = `Your wins: ${winCount}<br>Your losses: ${lossCount}`;
  },
  renderImage() {
    const gallowSrc = `images/gallow${lives}.png`;
    document.getElementById('gallowTree').src = gallowSrc;
  },
  renderPlaceholders() {
    document.getElementById('placeholders').innerHTML = placeholders.join(' ');
  },
  switchButtonName() {
    switch (status) {
      case 'inProgress':
        document.getElementById('newGame').innerHTML = 'Restart';
        break;
      default:
        document.getElementById('newGame').innerHTML = 'New game';
        break;
    }
  },
  setResult(message, color) {
    document.getElementById('resultMessage').innerHTML = message;
    document.getElementById('resultMessage').style.color = color;
  },
};

const controller = {
  init() {
    model.init();
    view.renderImage();
    view.switchButtonName();
    view.setResult('', '');
  },
  loadGame() {
    if (document.getElementById('newGame').innerHTML !== 'New game') {
      if (!window.confirm('Are you sure you want to restart your game?')) {
        return;
      }
      controller.setStatus('failed');
    }
    controller.init();
    document.getElementById('randomWord').innerHTML = randomWord;
    for (let i = 0; i < randomWord.length; i++) {
      placeholders.push('_');
    }
    view.renderPlaceholders();
  },
  setStatus(newStatus) {
    switch (newStatus) {
      case 'success':
        winCount++;
        window.localStorage.setItem('winCountKey', winCount);
        view.setResult('Congratulations, You won!', 'red');
        status = 'success';
        break;
      case 'failed':
        lossCount++;
        window.localStorage.setItem('lossCountKey', lossCount);
        view.setResult('You lost!', 'blue');
        status = 'failed';
        document.getElementById('randomWord').style.display = 'block';
        break;
      default:
        break;
    }
    view.renderScore();
  },
  checkWin() {
    if (!placeholders.includes('_')) {
      controller.setStatus('success');
      score = lives * 10;
      controller.sendToLeaderboard();
    }

    view.switchButtonName();
  },
  checkLose() {
    if (lives === 0) {
      controller.setStatus('failed');
    }
    score = lives * 10;
    view.switchButtonName();
  },
  getValueOrDefault(message, defaultValue) {
    const temp = prompt(message, defaultValue);
    if (temp == null) {
      return defaultValue;
    }
    return temp;
  },
  resetScore() {
    winCount = 0;
    window.localStorage.setItem('winCountKey', 0);
    lossCount = 0;
    window.localStorage.setItem('lossCountKey', 0);
  },
  setUser() {
    let player = window.localStorage.getItem('userName');
    if (player == null) {
      player = controller.getValueOrDefault('Please choose a name: ', 'Anonymous');
    } else {
      player = controller.getValueOrDefault('Please change your name, if you wish: ', player);
      if (player !== window.localStorage.getItem('userName')) {
        controller.resetScore();
      }
    }
    window.localStorage.setItem('userName', player);
    document.getElementById('welcomeUser').innerHTML = `Welcome ${player} !`;
    if (winCount == null || lossCount == null) {
      controller.resetScore();
    }
    view.renderScore();
  },

  logIn() {
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    fetch('http://fullstack.braininghub.com:3000/api/authenticateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.token) {
          document.getElementById('register').classList.remove('d-none');
        } else {
          window.localStorage.setItem('token', data.token);
        }
      });
  },

  sendToLeaderboard() {
    const numberOfRounds = winCount + lossCount;
    const player = window.localStorage.getItem('userName');
    const token = window.localStorage.getItem('token');
    if (!token) {
      document.getElementById('saveScoreFeedback').classList.remove('d-none');
    } else {
      fetch('http://fullstack.braininghub.com:3000/api/saveScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: player, game: 'Hangman', topScore: score, numberOfRounds,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.id) {
            document.getElementById('saveScoreFeedback').classList.remove('d-none');
            document.getElementById('saveScoreFeedback').innerHTML = 'Score saved successfully';
          } else {
            document.getElementById('saveScoreFeedback').classList.remove('d-none');
            document.getElementById('saveScoreFeedback').innerHTML = data.message;
          }
        });
    }
  },

  start() {
    fetch('https://random-word-api.herokuapp.com/word?number=512')
      .then((response) => response.json())
      .then((data) => {
        words = data;
      });

    controller.setUser();
    document.getElementById('login-button').addEventListener('click', controller.logIn);

    document.getElementById('newGame').addEventListener('click', controller.loadGame);

    document.addEventListener('keydown', (event) => {
      const letter = event.key.toLowerCase();
      if (!isCharacterValid(event) || status !== 'inProgress' || wrongLetters.includes(letter)) {
        return;
      }

      const guess = randomWord.includes(letter);
      if (guess) {
        let letterIndex = randomWord.indexOf(letter);
        while (letterIndex !== -1) {
          placeholders[letterIndex] = letter;
          letterIndex = randomWord.indexOf(letter, letterIndex + 1);
        }
        view.renderPlaceholders();
        controller.checkWin();
      } else {
        lives -= 1;
        wrongLetters.push(letter);
        document.getElementById('wrongLetters').innerHTML = wrongLetters.join();
        view.renderImage();
        controller.checkLose();
      }
    });
  },
};

controller.start();
