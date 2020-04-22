function render() {
    document.getElementById('placeholders').innerHTML = placeholders.join(' ');
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
const words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];

let randomWord = words[Math.floor(Math.random() * words.length)];
document.getElementById('randomWord').innerHTML = randomWord;

let placeholders = [];
for (let i = 0; i < randomWord.length; i++) {
    placeholders.push('_');
}
render();

let lives = 6;
let letters = [];
document.addEventListener('keydown', event => {
    let letter = event.key;
   
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
    } else {
        lives -= 1;
        letters.push(letter);
        document.getElementById('letters').innerHTML = letters.join(); 
        renderImage();
    }
})
