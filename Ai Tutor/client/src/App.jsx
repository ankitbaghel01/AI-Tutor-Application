import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mic, Volume2, CheckCircle } from 'lucide-react';
const App = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/questions')
      .then((response) => {
        setQuestions(response.data);
        setAnswers(new Array(response.data.length).fill(''));
      })
      .catch((error) => console.error('Error fetching questions:', error));
  }, []);

  const handleInputChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    // Map answers to include questionId
    const formattedAnswers = answers.map((answer, index) => ({
      questionId: questions[index].id,
      answer: answer,
    }));

    axios.post('http://localhost:5000/api/submit', { answers: formattedAnswers })
      .then((response) => {
        setScore(response.data.score);
        setShowPopup(true);
        console.log(`Submitted answers: ${JSON.stringify(formattedAnswers)}`);
        console.log(`Score received: ${response.data.score}`);

        // Clear all answer fields after submission
        setAnswers(new Array(answers.length).fill(''));
      })
      .catch((error) => console.error('Error submitting answers:', error));
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'en-US';
      window.speechSynthesis.speak(speech);
    } else {
      alert('Text-to-Speech not supported in this browser.');
    }
  };

  const startSpeechRecognition = (index) => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        handleInputChange(index, speechResult);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.start();
    } else {
      alert('Speech-to-Text not supported in this browser.');
    }
  };

  const isFormValid = () => {
    return answers.every(answer => answer.trim() !== '');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="m-8 p-8 border border-gray-900 shadow-lg rounded-lg w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-900">Quiz</h1>
        {questions.length > 0 ? (
          <div>
            {questions.map((question, index) => (
              <div key={index} className="mb-6">
                <p className="text-lg font-semibold text-gray-900">
                  {index + 1}. {question.text}
                </p>
                {question.question_type === 'mcq' && (
                  <div className="mt-2 space-y-2">
                    {JSON.parse(question.options).map((option, i) => (
                      <label key={i} className="block text-gray-900">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={answers[index] === option}
                          onChange={() => handleInputChange(index, option)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                {question.question_type === 'fill_in_blank' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Your answer"
                      className="mt-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                      value={answers[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                    <button
                      className="ml-2 border border-gray-400 text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
                      onClick={() => startSpeechRecognition(index)}
                    >
                      <Mic />
                    </button>
                  </div>
                )}
                {question.question_type === 'descriptive' && (
                  <div className="flex items-center space-x-2">
                    <textarea
                      maxLength="50"
                      placeholder="Type your answer here..."
                      className="mt-2 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
                      value={answers[index]}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                    />
                    <button
                      className="ml-2 border border-gray-400 text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
                      onClick={() => startSpeechRecognition(index)}
                    >
                      <Mic />
                    </button>
                  </div>
                )}
                <button
                  className="mt-2 border border-gray-400 text-gray-600 px-3 py-1 rounded hover:bg-gray-200"
                  onClick={() => speak(question.text)}
                >
                  <Volume2 />
                </button>
              </div>
            ))}
            <button
              onClick={handleSubmit}
              disabled={!isFormValid()}
              className={`w-full py-3 rounded mt-4 transition duration-200 ${isFormValid() ? 'bg-green-500 text-white hover:bg-green-700' : 'bg-gray-400 text-gray-300 cursor-not-allowed'}`}
            >
              Submit
            </button>
          </div>
        ) : (
          <p className="text-center text-green-600">Loading questions...</p>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 max-w-sm text-center animate-fadeIn">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Successfully Submitted!</h2>
            <p className="text-lg">Your Score: {score}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



export default App;
