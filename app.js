function render() {
    document.getElementById('placeholders').innerHTML = placeholders.join(' ');
}
const words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];

let randomWord = words[Math.floor(Math.random() * words.length)];

let placeholders = [];
for (let i = 0; i < randomWord.length; i++) {
    placeholders.push('_');
}
render();

let letters = [];
document.addEventListener('keydown', event => {
    let letter = event.key;
    letters.push(letter);
    document.getElementById('letters').innerHTML = letters.join();

    let guess = randomWord.includes(letter);
    if (guess) {
        let letterIndex = randomWord.indexOf(letter);
        placeholders[letterIndex] = letter;
        render();
    }
})
