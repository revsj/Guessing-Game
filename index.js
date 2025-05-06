const minNum = 0;
const maxNum = 100; 
const answer = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;

let attempts = 0;

const guessInput = document.getElementById('guessInput');
const submitGuess = document.getElementById('submitGuess');
const correctNumber = document.getElementById('correct-number');
const resetButton = document.getElementById('resetButton');

submitGuess.addEventListener('click', () => {
    let guess = Number(guessInput.value);

    if (isNaN(guess)) {
        alert("Please enter a valid number.");
    } else if (guess < minNum || guess > maxNum) {
        alert(`Please enter a number between ${minNum} and ${maxNum}.`);
    } else {
        attempts++;
        if (guess < answer) {
            alert("Oops! Too low. Try again.");
        } else if (guess > answer) {
            alert("Oops! Too high. Try again.");
        } else {
            correctNumber.textContent = answer;
            correctNumber.classList.remove('hidden');
            guessInput.disabled = true;
            submitGuess.disabled = true;
            alert(`Congratulations! You guessed it in ${attempts} attempts.`);
    
            // Show the reset button
            resetButton.classList.remove('hidden');
            resetButton.addEventListener('click', () => {
                location.reload(); // reload ng page
            });
        }
    }

    guessInput.value = "";
    guessInput.focus();
});