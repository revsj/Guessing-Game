const minNum = 0;
const maxNum = 100; 
const numberAns = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

let attempts = 0;

const guessInput = document.getElementById('guessInput');
const submitGuess = document.getElementById('submitGuess');
const correctNumber = document.getElementById('correct-number');
const resetButton = document.getElementById('resetButton');
const nextButton = document.getElementById('nextButton');

function handleGuess() {
    let guess = Number(guessInput.value);

    if (isNaN(guess)) {
        alert("Please enter a valid number.");
    } else if (guess < minNum || guess > maxNum) {
        alert(`Please enter a number between ${minNum} and ${maxNum}.`);
    } else {
        attempts++;
        if (guess < numberAns) {
            alert("Oops! Too low. Try again.");
        } else if (guess > numberAns) {
            alert("Oops! Too high. Try again.");
        } else {
            correctNumber.textContent = numberAns;
            correctNumber.classList.remove('hidden');
            guessInput.disabled = true;
            submitGuess.disabled = true;
            alert(`Congratulations! You guessed it in ${attempts} attempts.`);

            // Show the reset button
            resetButton.classList.remove('hidden');
            resetButton.addEventListener('click', () => {
                location.reload();
            });
            // Show the next level button
            nextButton.classList.remove('hidden');
            nextButton.addEventListener('click', () => {
                window.location.href = "level2.html";
            });

            //remove the submit button
            submitGuess.classList.add('hidden');
        }
    }

    guessInput.value = "";
    guessInput.focus();
}

submitGuess.addEventListener('click', handleGuess);

guessInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleGuess();
    }
});