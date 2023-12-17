document.addEventListener('DOMContentLoaded', function () {
  const questionElement = document.getElementById('question');
  const optionsElement = document.getElementById('options');
  const timeLeftElement = document.getElementById('time-left');
  const userScoreElement = document.getElementById('user-score');

  let currentLevel = 1; // Initial level
  let correctAnswers = 0;
  let timer;
  let timeLeft = 60; // Set the initial time to 180 seconds (3 minutes)
  let userScore = 0;
  let currentQuestionNumber = 0;

  function fetchQuestion() {
    console.log(`Fetching question from: http://localhost:3000/get-question?level=${currentLevel}`);
    fetch(`http://localhost:3000/get-question?level=${currentLevel}`)
      .then(response => {
        console.log('Response:', response);
        if (!response.ok) {
          throw new Error(`Network response was not ok, status: ${response.status}`);
        }
        return response.json();
      })
      .then(question => {
        console.log('Question:', question);
        currentQuestionNumber++; // Increment the question number
        displayQuestion(question, currentQuestionNumber);
        clearInterval(timer); // Clear any existing timer
        startTimer(); // Start the timer for the new question
      })
      .catch(error => console.error('Error fetching question:', error));
  }
  
  
  

  function displayQuestion(question, questionNumber) {
    questionElement.textContent = `${questionNumber}. ${question.question_text}`;
  
    // Clear previous options
    optionsElement.innerHTML = '';
  
    // Display new options as buttons with numbers
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.textContent = `${index + 1}. ${option}`;
      button.className = 'option-button';
      button.addEventListener('click', () => handleAnswer(option, question.correct_option, button));
      optionsElement.appendChild(button);
  
      // Add a line break after each button
      optionsElement.appendChild(document.createElement('br'));
    });
  }

  function handleAnswer(selectedOption, correctOption, selectedButton) {
    document.querySelectorAll('.option-button').forEach(button => button.disabled = true);
  
    if (selectedOption === correctOption) {
      correctAnswers++;
      userScore++;
      selectedButton.classList.add('correct');
    } else {
      selectedButton.classList.add('incorrect');
      document.querySelectorAll('.option-button').forEach(button => {
        if (button.textContent.includes(correctOption)) {
          button.classList.add('correct');
        }
      });
    }
  
    // Update the user's score in the HTML immediately
    userScoreElement.textContent = userScore;
  
    if (correctAnswers === 3) { // Check if the user has answered 3 questions correctly
      currentLevel++;
      correctAnswers = 0; // Reset correctAnswers for the new level
    }
  
    if (correctAnswers === 5) { // Stop the game after 5 correct answers
      clearInterval(timer);
      showScore();
    } else {
      setTimeout(() => {
        clearInterval(timer);
        fetchQuestion();
      }, 2000);
    }
  }
  

  function incrementLevel() {
    currentLevel++;
    correctAnswers = 0;
  }

  
  
  function showScore() {
    const modal = document.getElementById('myModal');
    const modalScore = document.getElementById('modal-score');
    modalScore.textContent = userScore;
    modal.style.display = 'block';
  
    document.getElementById('play-again-btn').addEventListener('click', () => {
      modal.style.display = 'none';
      playAgain();
    });
  }
  
  function startTimer() {
    timer = setInterval(function () {
      timeLeftElement.textContent = formatTime(timeLeft);
  
      if (timeLeft <= 0 || currentQuestionNumber === 5) {
        clearInterval(timer);
        showScore();
      }
  
      timeLeft--; 
    }, 1000);
  }
  

  function playAgain() {
    currentLevel = 1;
    correctAnswers = 0;
    userScore = 0;
    currentQuestionNumber = 0;
    fetchQuestion();
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }

 
  

  fetchQuestion();
});
