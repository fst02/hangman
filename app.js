/* global $ */

let words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];
let randomWord;
let lives;
let wrongLetters = [];
const placeholders = [];
let status;
let score;
let winCount = window.localStorage.getItem('winCountKey') || 0;
let lossCount = window.localStorage.getItem('lossCountKey') || 0;

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
  resetScore() {
    winCount = 0;
    window.localStorage.setItem('winCountKey', 0);
    lossCount = 0;
    window.localStorage.setItem('lossCountKey', 0);
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
        const signInFeedback = document.getElementById('signInFeedback');
        if (!data.token) {
          document.getElementById('register').classList.remove('d-none');
          signInFeedback.classList.remove('d-none');
          signInFeedback.innerHTML = data.error;
        } else {
          window.localStorage.setItem('token', data.token);
          window.localStorage.setItem('nickname', data.user.nickname);
          window.localStorage.setItem('userId', data.user.id);
          document.getElementById('buttonSignIn').classList.add('d-none');
          document.getElementById('buttonSignOut').classList.remove('d-none');
          document.getElementById('saveScoreFeedback').classList.add('d-none');
          $('#signIn').modal('hide');
          document.getElementById('welcomeUser').innerHTML = `Welcome ${data.user.nickname} !`;
        }
      });
  },

  logOut() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('nickname');
    window.localStorage.removeItem('userId');
    document.getElementById('saveScoreFeedback').classList.remove('d-none');
    document.getElementById('buttonSignIn').classList.remove('d-none');
    document.getElementById('buttonSignOut').classList.add('d-none');
    document.getElementById('welcomeUser').classList.add('d-none');
  },

  sendToLeaderboard() {
    const token = window.localStorage.getItem('token');
    if (token) {
      fetch('http://fullstack.braininghub.com:3000/api/saveScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: 1, score,
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
    view.renderScore();
    const nickname = window.localStorage.getItem('nickname');
    const token = window.localStorage.getItem('token');
    if (token) {
      fetch('http://fullstack.braininghub.com:3000/api/verifyToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.response === 'ok') {
            document.getElementById('welcomeUser').innerHTML = `Welcome ${nickname}!`;
            document.getElementById('buttonSignIn').classList.add('d-none');
            document.getElementById('saveScoreFeedback').classList.add('d-none');
            document.getElementById('buttonSignOut').classList.remove('d-none');
          } else {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('nickname');
          }
        });
    }

    document.getElementById('login-button').addEventListener('click', controller.logIn);

    document.getElementById('buttonSignOut').addEventListener('click', controller.logOut);

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
