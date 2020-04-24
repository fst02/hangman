let words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];
let randomWord;
let lives;
let wrongLetters = [];
const placeholders = [];
let status;
let winCount = window.localStorage.getItem('winCountKey');
let lossCount = window.localStorage.getItem('lossCountKey');

function alphaOnly(event) {
  const key = event.keyCode;
  return ((key >= 65 && key <= 90));
}

function getValueOrDefault(message, defaultValue) {
  const temp = prompt(message, defaultValue);
  if (temp == null) {
    return defaultValue;
  }
  return temp;
}

function resetScore() {
  winCount = 0;
  window.localStorage.setItem('winCountKey', 0);
  lossCount = 0;
  window.localStorage.setItem('lossCountKey', 0);
}

function renderScore() {
  document.getElementById('userScore').innerHTML = `Your wins: ${winCount}<br>Your losses: ${lossCount}`;
}

function switchButtonName() {
  switch (status) {
    case 'inProgress':
      document.getElementById('newGame').innerHTML = 'Restart';
      break;
    default:
      document.getElementById('newGame').innerHTML = 'New game';
      break;
  }
}

function renderImage() {
  const gallowSrc = `images/gallow${lives}.png`;
  document.getElementById('gallowTree').src = gallowSrc;
}

function setResult(message, color) {
  document.getElementById('resultMessage').innerHTML = message;
  document.getElementById('resultMessage').style.color = color;
}

function init() {
  status = 'inProgress';
  switchButtonName();
  placeholders.length = 0;
  lives = 6;
  wrongLetters = [];
  document.getElementById('wrongLetters').innerHTML = wrongLetters.join();
  randomWord = words[Math.floor(Math.random() * words.length)];
  renderImage();
  setResult('', '');
  document.getElementById('randomWord').style.display = 'none';
}

function setStatus(newStatus) {
  switch (newStatus) {
    case 'success':
      winCount++;
      window.localStorage.setItem('winCountKey', winCount);
      setResult('Congratulations, You won!', 'red');
      status = 'success';
      break;
    case 'failed':
      lossCount++;
      window.localStorage.setItem('lossCountKey', lossCount);
      setResult('You lost!', 'blue');
      status = 'failed';
      document.getElementById('randomWord').style.display = 'block';
      break;
    default:
      break;
  }
  renderScore();
}

function render() {
  document.getElementById('placeholders').innerHTML = placeholders.join(' ');
}

function loadGame() {
  let needNewRound = true;
  if (document.getElementById('newGame').innerHTML !== 'New game') {
    needNewRound = window.confirm('Are you sure you want to restart your game?');
    if (needNewRound) {
      setStatus('failed');
    }
  }
  if (needNewRound) {
    init();
    document.getElementById('randomWord').innerHTML = randomWord;
    for (let i = 0; i < randomWord.length; i++) {
      placeholders.push('_');
    }
    render();
  }
}

function setUser() {
  let player = window.localStorage.getItem('userName');
  if (player == null) {
    player = getValueOrDefault('Please choose a name: ', 'Anonymous');
  } else {
    player = getValueOrDefault('Please change your name, if you wish: ', player);
    if (player !== window.localStorage.getItem('userName')) {
      resetScore();
    }
  }
  window.localStorage.setItem('userName', player);
  document.getElementById('welcomeUser').innerHTML = `Welcome ${player} !`;
  if (winCount == null || lossCount == null) {
    resetScore();
  }
  renderScore();
}

function checkLose() {
  if (lives === 0) {
    setStatus('failed');
  }
  switchButtonName();
}

function checkWin() {
  if (!placeholders.includes('_')) {
    setStatus('success');
  }
  switchButtonName();
}

fetch('https://random-word-api.herokuapp.com/word?number=512')
  .then((response) => response.json())
  .then((data) => {
    words = data;
  });

setUser();

document.getElementById('newGame').addEventListener('click', loadGame);

document.addEventListener('keydown', (event) => {
  const letter = event.key.toLowerCase();
  if (!alphaOnly(event) || status !== 'inProgress' || wrongLetters.includes(letter)) {
    return;
  }

  const guess = randomWord.includes(letter);
  if (guess) {
    let letterIndex = randomWord.indexOf(letter);
    while (letterIndex !== -1) {
      placeholders[letterIndex] = letter;
      letterIndex = randomWord.indexOf(letter, letterIndex + 1);
    }
    render();
    checkWin();
  } else {
    lives -= 1;
    wrongLetters.push(letter);
    document.getElementById('wrongLetters').innerHTML = wrongLetters.join();
    renderImage();
    checkLose();
  }
});
