// styles.js

document.addEventListener("DOMContentLoaded", function() {
    const setQuestionBtn = document.getElementById('setQuestionBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const setQuestionModal = document.getElementById('setQuestionModal');
  
    setQuestionBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
  
    function openModal() {
      setQuestionModal.style.display = 'block';
    }
  
    function closeModal() {
      setQuestionModal.style.display = 'none';
    }
  });
  
  function checkPin() {
    const pinInput = document.getElementById('pinInput').value;
    if (pinInput === '1234') {
      window.location.href = '/start.html';
    } else {
      alert('Incorrect PIN. Please try again.');
    }
  }
  