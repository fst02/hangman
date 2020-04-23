let words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];


function getValueOrDefault(message, defaultValue) {
    let temp = prompt(message, defaultValue);
    if (temp == null) {
        return defaultValue;
    }
    return temp;
}

let winCount = window.localStorage.getItem('winCountKey');
let lossCount = window.localStorage.getItem('lossCountKey');

function resetScore() {
        winCount = 0;
        window.localStorage.setItem('winCountKey', 0);
        lossCount = 0;
        window.localStorage.setItem('lossCountKey', 0);
}

function setUser() {
    let player = window.localStorage.getItem('userName');
    if (player == null) {
        player = getValueOrDefault('Please choose a name: ', 'Anonymous');
    }
    else {
        player = getValueOrDefault('Please change your name, if you wish: ', player);
        if (player != window.localStorage.getItem('userName')) {
            resetScore();
        }
    }
    window.localStorage.setItem('userName', player);
    document.getElementById('welcomeUser').innerHTML = 'Welcome ' + player + '!';
    if (winCount == null || lossCount == null) {
        resetScore();
    }
    renderScore();
}

function renderScore() {
    document.getElementById('userScore').innerHTML = 'Your wins: ' + winCount + '<br>Your losses: ' + lossCount;
}

function setStatus(newStatus){
    switch (newStatus){
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
        } 
    renderScore();
}
setUser();

fetch('https://random-word-api.herokuapp.com/word?number=512')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        words = data;
    });

/*var request = new XMLHttpRequest();
request.open('GET', 'https://random-word-api.herokuapp.com/word?number=50', true);
request.onload = function() {
  // Begin accessing JSON data here
  words = JSON.parse(this.response);
}
request.send();*/

let randomWord;
let lives;
let wrongLetters = [];
let placeholders = [];
let status;

function alphaOnly(event) {
    var key = event.keyCode;
    return ((key >= 65 && key <= 90));
};

function render() {
    document.getElementById('placeholders').innerHTML = placeholders.join(' ');
}

function switchButtonName() {
    switch (status) {
        case 'inProgress':
            document.getElementById('newGame').innerHTML = 'Restart';
            break;
        case 'success':
        case 'failed':
            document.getElementById('newGame').innerHTML = 'New game';
            break;
    }
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

function loadGame(){
    let needNewRound = true;
    if (document.getElementById('newGame').innerHTML != 'New game') {
        needNewRound = confirm('Are you sure you want to restart your game?');
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

function renderImage() {
    let gallowSrc = 'images/gallow' + lives + '.png';
    document.getElementById('gallowTree').src = gallowSrc;
    /*switch (lives) {
        case 5:
            document.getElementById('gallowTree').src = 'images/gallow5.png';
            break;
        case 4:
            document.getElementById('gallowTree').src = 'images/gallow4.png';
            break;
        case 3:
            document.getElementById('gallowTree').src = 'images/gallow3.png';
            break;
        case 2:
            document.getElementById('gallowTree').src = 'images/gallow2.png';
            break;
        case 1:
            document.getElementById('gallowTree').src = 'images/gallow1.png';
            break;
        case 0:
            document.getElementById('gallowTree').src = 'images/gallow0.png';
            break;     
    }*/
}

function checkLose() {
    if (lives == 0) {
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

function setResult(message, color) {
    document.getElementById('resultMessage').innerHTML = message;
    document.getElementById('resultMessage').style.color = color;
}

document.addEventListener('keydown', event => {
    // event.stopImmediatePropagation();
    let letter = event.key.toLowerCase();
    if (!alphaOnly(event) || status != 'inProgress' || wrongLetters.includes(letter)) {
        return false;
    }

    let guess = randomWord.includes(letter);
    if (guess) {
        let letterIndex = randomWord.indexOf(letter);
        while (letterIndex != -1) {
            placeholders[letterIndex] = letter;
            letterIndex = randomWord.indexOf(letter, letterIndex + 1);
        }
        /* Alternative of while
        for (let i = 0; i < randomWord.length; i++) {
            if(randomWord[i] == letter) {
                placeholders[i] = letter;
            }
        }*/

        render();
        checkWin();
    } else {
        lives -= 1;
        wrongLetters.push(letter);
        document.getElementById('wrongLetters').innerHTML = wrongLetters.join();
        renderImage();
        checkLose();
    }
})
