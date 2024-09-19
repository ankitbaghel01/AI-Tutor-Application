const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'quiz_db'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API to fetch questions
app.get('/api/questions', (req, res) => {
  const query = 'SELECT * FROM questions';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      res.status(500).json({ error: 'Error fetching questions' });
      return;
    }
    res.json(results);
  });
});

// API to submit answers and calculate score
// API to submit answers and calculate score
app.post('/api/submit', (req, res) => {
  const { answers } = req.body;

  // Fetch questions from the database
  const query = 'SELECT * FROM questions';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err);
      res.status(500).json({ error: 'Error fetching questions' });
      return;
    }

    const correctAnswers = results.map(question => ({
      questionId: question.id,
      correctAnswer: question.correct_answer,
      questionType: question.question_type
    }));

    let score = 0;

    answers.forEach((answer) => {
      const correctAnswer = correctAnswers.find(q => q.questionId === answer.questionId);
      
      if (correctAnswer) {
        // Handling MCQ and fill_in_blank questions
        if (correctAnswer.questionType === 'mcq' || correctAnswer.questionType === 'fill_in_blank') {
          if (answer.answer.trim().toLowerCase() === correctAnswer.correctAnswer.trim().toLowerCase()) {
            score++;
          }
        }
        
        // Handling descriptive question
        else if (correctAnswer.questionType === 'descriptive') {
          if (answer.answer.trim() !== '') {  // Give a point for any non-empty answer
            score++;
          }
        }
      }
    });

    // Log final score and send response
    console.log(`Final Score: ${score}`);
    res.json({ score });
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
