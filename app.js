const words = ['wonderful', 'impossible', 'beautiful', 'adventurous', 'absurd', 'nice', 'book'];

let randomWord = words[Math.floor(Math.random() * words.length)];

let placeholders = '';
for (let i = 0; i < randomWord.length; i++) {
    placeholders += '_ ';
}
document.getElementById('placeholders').innerHTML = placeholders;
