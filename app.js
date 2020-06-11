/* global $ */

let words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];
let randomWord;
let lives;
let wrongLetters = [];
const placeholders = [];
let status;
let score;
let winCount;
let lossCount;

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
    winCount = window.localStorage.getItem('winCountKey');
    lossCount = window.localStorage.getItem('lossCountKey');
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
        document.getElementById('newGame').classList.add('d-none');
        document.getElementById('restart').classList.remove('d-none');
        break;
      default:
        document.getElementById('restart').classList.add('d-none');
        document.getElementById('newGame').classList.remove('d-none');
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
        view.setResult('Congratulations, You won!', 'red');
        status = 'success';
        break;
      case 'failed':
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
    score = lives * 10;
    if (lives === 0) {
      controller.setStatus('failed');
      controller.sendToLeaderboard();
    }
    view.switchButtonName();
  },
  logIn() {
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    fetch('http://fullstack.braininghub.com:3000/api/authenticateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, gameId: 1 }),
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
          window.localStorage.setItem('winCountKey', data.numberOfWins);
          window.localStorage.setItem('lossCountKey', data.numberOfRounds - data.numberOfWins);
          document.getElementById('buttonSignIn').classList.add('d-none');
          document.getElementById('buttonSignOut').classList.remove('d-none');
          document.getElementById('saveScoreFeedback').classList.add('d-none');
          $('#signIn').modal('hide');
          document.getElementById('welcomeUser').classList.remove('d-none');
          document.getElementById('welcomeUser').innerHTML = `Welcome ${data.user.nickname} !`;
          view.renderScore();
        }
      });
  },

  logOut() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('nickname');
    window.localStorage.removeItem('userId');
    window.localStorage.removeItem('winCountKey');
    window.localStorage.removeItem('lossCountKey');
    document.getElementById('saveScoreFeedback').classList.remove('d-none');
    document.getElementById('buttonSignIn').classList.remove('d-none');
    document.getElementById('buttonSignOut').classList.add('d-none');
    document.getElementById('welcomeUser').classList.add('d-none');
    document.getElementById('saveScoreFeedback').innerHTML = '';
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
            window.localStorage.setItem('winCountKey', data.numberOfWins);
            window.localStorage.setItem('lossCountKey', data.numberOfRounds - data.numberOfWins);
            view.renderScore();
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
            view.renderScore();
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

    document.getElementById('yesButton').addEventListener('click', () => {
      $('#restart-modal').modal('hide');
      lives = 0;
      this.setStatus('failed');
      this.checkLose();
      controller.loadGame();
    });

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
