// app.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const session = require('express-session');

const app = express();
const port = 3000;

// Set up session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password
  database: 'quiz'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Serve start.html
app.get('/start', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Serve index.html
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/start.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/start.html'));
});

app.get('/play-quiz', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/quizplay.html'));
});

app.post('/save-question', (req, res) => {
  const { questionText, optionA, optionB, optionC, level, correctOption } = req.body;

  const query = `
    INSERT INTO questions (question_text, option_a, option_b, option_c, level, correct_option)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [questionText, optionA, optionB, optionC, level, correctOption], (err, result) => {
    if (err) {
      res.status(500).send('Error saving question');
    } else {
      res.redirect('/start.html');
    }
  });
});

app.post('/login-and-play', (req, res) => {
  const { name, phone } = req.body;

  // Check if the phone number already exists
  const checkQuery = `
    SELECT * FROM users
    WHERE phone_number = ?
  `;

  db.query(checkQuery, [phone], (checkErr, checkResult) => {
    if (checkErr) {
      res.status(500).send('Error checking phone number');
    } else {
      if (checkResult.length > 0) {
        req.session.user = { name, phone }; // Save user data to session
        res.status(200).send('Welcome!');
      } else {
        // Phone number doesn't exist, save it to the database
        const saveQuery = `
          INSERT INTO users (name, phone_number)
          VALUES (?, ?)
        `;

        db.query(saveQuery, [name, phone], (saveErr, saveResult) => {
          if (saveErr) {
            res.status(500).send('Error saving user information');
          } else {
            req.session.user = { name, phone }; // Save user data to session
            res.status(200).send('Welcome!');
          }
        });
      }
    }
  });
});


app.get('/get-question', (req, res) => {
  const { level } = req.query;

  // Use a prepared statement to prevent SQL injection
  const query = `
    SELECT * FROM questions
    WHERE level = ?
    ORDER BY RAND()
    LIMIT 1
  `;

  db.query(query, [level], (err, results) => {
    if (err) {
      console.error('Error fetching question:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      if (results.length > 0) {
        const question = results[0];
        const options = [question.option_a, question.option_b, question.option_c];

        // Send the question data to the client
        res.json({
          question_text: question.question_text,
          options: options,
          correct_option: question.correct_option === 'A' ? question.option_a :
                          question.correct_option === 'B' ? question.option_b :
                          question.correct_option === 'C' ? question.option_c : null,
        });
      } else {
        // No questions found for the given level
        res.status(404).json({ error: 'No questions found' });
      }
    }
  });
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
