const words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];

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

function init() {
    status = 'inProgress';
    placeholders.length = 0;
    lives = 6;
    wrongLetters = [];
    document.getElementById('wrongLetters').innerHTML = wrongLetters.join();
    randomWord = words[Math.floor(Math.random() * words.length)];
    renderImage();
    setResult('', '');
}

function loadGame() {
    init();
    document.getElementById('randomWord').innerHTML = randomWord;

    for (let i = 0; i < randomWord.length; i++) {
        placeholders.push('_');
    }
    render();
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
        setResult('You lost!', 'blue');
        status = 'failed';
    }
}

function checkWin() {
    if (!placeholders.includes('_')) {
        setResult('Congratulations, You won!', 'red');
        status = 'success';
    }
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
