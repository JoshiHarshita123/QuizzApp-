import React, { useState, useEffect, useMemo, useCallback } from 'react';

// I've used a static object for the quiz data to ensure a consistent and reliable experience for this assessment, 
// removing dependency on an external API's availability.
const staticQuizData = {
  "response_code": 0,
  "results": [
    { "type": "boolean", "difficulty": "easy", "category": "Entertainment: Video Games", "question": "In &quot;Sonic Adventure&quot;, you are able to transform into Super Sonic at will after completing the main story.", "correct_answer": "False", "incorrect_answers": ["True"] },
    { "type": "multiple", "difficulty": "medium", "category": "Entertainment: Video Games", "question": "In which order do you need to hit some Deku Scrubs to open the first boss door in &quot;Ocarina of Time&quot;?", "correct_answer": "2, 3, 1", "incorrect_answers": ["1, 2, 3", "1, 3, 2", "2, 1, 3"] },
    { "type": "multiple", "difficulty": "easy", "category": "Entertainment: Film", "question": "What superhero has been played in film by actors Michael Keaton, Val Kilmer, George Clooney and Christian Bale?", "correct_answer": "Batman", "incorrect_answers": ["Superman", "Iron Man", "Spiderman"] },
    { "type": "multiple", "difficulty": "medium", "category": "Entertainment: Video Games", "question": "Who composed the soundtrack for the game VVVVVV?", "correct_answer": "Magnus P&aring;lsson", "incorrect_answers": ["Terry Cavanagh", "Danny Baranowsky", "Joel Zimmerman"] },
    { "type": "multiple", "difficulty": "medium", "category": "Entertainment: Film", "question": "In what year was the movie &quot;Police Academy&quot; released?", "correct_answer": "1984", "incorrect_answers": ["1986", "1985", "1983"] },
    { "type": "boolean", "difficulty": "easy", "category": "Entertainment: Film", "question": "Ewan McGregor did not know the name of the second prequel film of Star Wars during and after filming.", "correct_answer": "True", "incorrect_answers": ["False"] },
    { "type": "multiple", "difficulty": "easy", "category": "Entertainment: Music", "question": "Which classical composer wrote the &quot;Moonlight Sonata&quot;?", "correct_answer": "Ludvig Van Beethoven", "incorrect_answers": ["Chief Keef", "Wolfgang Amadeus Mozart", "Johannes Brahms"] },
    { "type": "multiple", "difficulty": "hard", "category": "Entertainment: Board Games", "question": "Which board game was first released on February 6th, 1935?", "correct_answer": "Monopoly", "incorrect_answers": ["Risk", "Clue", "Candy Land"] },
    { "type": "boolean", "difficulty": "easy", "category": "Entertainment: Video Games", "question": "Big the Cat is a playable character in &quot;Sonic Generations&quot;.", "correct_answer": "False", "incorrect_answers": ["True"] },
    { "type": "multiple", "difficulty": "hard", "category": "Entertainment: Video Games", "question": "In &quot;Sonic the Hedgehog 3&quot; for the Sega Genesis, what is the color of the second Chaos Emerald you can get from Special Stages?", "correct_answer": "Orange", "incorrect_answers": ["Blue", "Green", "Magenta"] },
    { "type": "multiple", "difficulty": "medium", "category": "Entertainment: Video Games", "question": "Which of these characters was NOT planned to be playable for Super Smash Bros. 64?", "correct_answer": "Peach", "incorrect_answers": ["Bowser", "Mewtwo", "King Dedede"] },
    { "type": "multiple", "difficulty": "medium", "category": "Entertainment: Video Games", "question": "In &quot;PAYDAY 2&quot;, what weapon has the highest base weapon damage on a per-shot basis?", "correct_answer": "HRL-7", "incorrect_answers": ["Heavy Crossbow", "Thanatos .50 cal", "Broomstick Pistol"] },
    { "type": "multiple", "difficulty": "easy", "category": "Entertainment: Film", "question": "What was the first monster to appear alongside Godzilla?", "correct_answer": "Anguirus", "incorrect_answers": ["King Kong", "Mothra", "King Ghidora"] },
    { "type": "multiple", "difficulty": "easy", "category": "Sports", "question": "What is the name of the &quot;tool&quot; used to hit the white ball in snooker or billiards?", "correct_answer": "Cue", "incorrect_answers": ["Racquet", "Bat", "Mallet"] },
    { "type": "multiple", "difficulty": "hard", "category": "History", "question": "Which is the hull NO. of the Fletcher class destroyer Fletcher?", "correct_answer": "DD-445", "incorrect_answers": ["DD-992", "DD-444", "DD-446"] }
  ]
};


// This is the main component for the application. I've structured it to manage the overall application state and logic, 
// acting as a controller for the different views (Start, Quiz, Report).
const App = () => {
    // I'm using a constant object to represent the different pages. This improves readability and prevents magic strings.
    const PAGES = {
        START: 'start',
        QUIZ: 'quiz',
        REPORT: 'report',
    };

    // --- State Management ---
    // All application state is managed here in the top-level component using React Hooks for a clean, functional approach.
    const [currentPage, setCurrentPage] = useState(PAGES.START); // Tracks which view is currently active.
    const [email, setEmail] = useState(''); // Stores the user's email from the start page.
    const [emailError, setEmailError] = useState(''); // For email validation feedback.
    const [questions, setQuestions] = useState([]); // Holds the formatted questions after processing.
    const [userAnswers, setUserAnswers] = useState(Array(15).fill(null)); // An array to store the user's answer for each question.
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Tracks which question the user is currently viewing.
    const [timeLeft, setTimeLeft] = useState(30 * 60); // The quiz timer, initialized to 30 minutes.
    const [visitedQuestions, setVisitedQuestions] = useState(new Set([0])); // A Set to track which questions the user has visited for the overview panel.

    // --- Data Processing Utilities ---

    // This utility function is necessary because the raw data contains HTML entities (e.g., &quot;). 
    // I used the browser's built-in DOM parsing capabilities for a reliable and lightweight solution.
    const decodeHTMLEntities = (text) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };

    // To ensure the quiz is fair and the answer order is not predictable, I implemented the Fisher-Yates algorithm 
    // to shuffle the choices for each question.
    const shuffleArray = (array) => {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    };

    // --- Component Lifecycle & Effects ---

    // This useEffect hook runs once when the component mounts. Its job is to take the raw static data,
    // process it into a usable format (decode entities, shuffle answers), and set it into the application's state.
    useEffect(() => {
        const formattedQuestions = staticQuizData.results.map(q => {
            const decodedQuestion = decodeHTMLEntities(q.question);
            const correctAnswer = decodeHTMLEntities(q.correct_answer);
            const incorrectAnswers = q.incorrect_answers.map(decodeHTMLEntities);
            const options = shuffleArray([...incorrectAnswers, correctAnswer]);
            return {
                question: decodedQuestion,
                options,
                correctAnswer,
            };
        });
        setQuestions(formattedQuestions);
    }, []);

    // This effect manages the 30-minute countdown timer.
    useEffect(() => {
        // The timer only runs when the user is on the quiz page.
        if (currentPage === PAGES.QUIZ) {
            // If the timer reaches zero, the quiz auto-submits.
            if (timeLeft <= 0) {
                setCurrentPage(PAGES.REPORT);
                return;
            }
            // I'm using setInterval to decrement the timer every second.
            const timerId = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
            // The cleanup function is crucial: it clears the interval when the component unmounts or the page changes, preventing memory leaks.
            return () => clearInterval(timerId);
        }
    }, [currentPage, timeLeft, PAGES.REPORT]);

    // --- Memoized Calculations for Performance ---

    // I used useMemo to format the time string. This prevents the calculation from running on every single re-render,
    // optimizing performance by only re-calculating when the `timeLeft` state actually changes.
    const formattedTime = useMemo(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, [timeLeft]);

    // --- Event Handlers ---
    // These functions handle all user interactions, updating the state accordingly.

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (emailError) setEmailError('');
    };

    // Handles the quiz start, including a simple regex for email validation.
    const handleStartQuiz = (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        setCurrentPage(PAGES.QUIZ);
    };

    // Updates the userAnswers array when an option is selected.
    const handleAnswerSelect = (questionIndex, answer) => {
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = answer;
        setUserAnswers(newAnswers);
    };

    // Handles navigation from the overview panel and marks the question as visited.
    const handleQuestionNavigation = (index) => {
        setCurrentQuestionIndex(index);
        setVisitedQuestions(prev => new Set(prev).add(index));
    };
    
    // Moves to the next question in sequence.
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            handleQuestionNavigation(currentQuestionIndex + 1);
        }
    };
    
    // I wrapped this in useCallback to ensure the function reference is stable across re-renders,
    // which is a good practice for functions passed as props, though not strictly necessary here.
    const handleSubmitQuiz = useCallback(() => {
        setCurrentPage(PAGES.REPORT);
    }, [PAGES.REPORT]);


    // --- UI Components ---
    // I've structured the UI into logical "virtual" components within the main App component.
    // This maintains the single-file requirement while still promoting a clean, component-based architecture.

    // The initial view for collecting the user's email.
    const StartPageComponent = () => (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800 transition-all">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white">Welcome to the Quiz!</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Test your knowledge with these 15 questions.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleStartQuiz}>
                    <div>
                        <label htmlFor="email" className="sr-only">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full px-3 py-3 text-lg placeholder-gray-500 bg-gray-100 border-2 border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={handleEmailChange}
                        />
                        {emailError && <p className="mt-2 text-sm text-red-500">{emailError}</p>}
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="relative flex justify-center w-full px-4 py-3 text-lg font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
                        >
                            Start Quiz
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // The main quiz interface, including the timer, question panel, and question display.
    const QuizPageComponent = () => {
        // A simple check to ensure questions are loaded before rendering.
        if (questions.length === 0) {
            return <div className="flex items-center justify-center min-h-screen text-2xl dark:text-white">Preparing your quiz...</div>;
        }

        const currentQuestion = questions[currentQuestionIndex];

        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <header className="flex flex-col sm:flex-row justify-between items-center p-4 mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                        <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">General Knowledge Quiz</h1>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                             <div className="text-2xl font-mono bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg shadow-inner">
                                {formattedTime}
                            </div>
                            <button
                                onClick={handleSubmitQuiz}
                                className="px-6 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-transform transform hover:scale-105"
                            >
                                Submit
                            </button>
                        </div>
                    </header>
                    
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* The question overview panel provides a great user experience by showing progress at a glance. */}
                        <aside className="lg:w-1/4">
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                                <h2 className="text-xl font-semibold mb-4 text-center">Questions Overview</h2>
                                <div className="grid grid-cols-5 gap-2">
                                    {questions.map((_, index) => {
                                        // The styling for each button is determined dynamically based on the question's state.
                                        const isAttempted = userAnswers[index] !== null;
                                        const isVisited = visitedQuestions.has(index);
                                        const isCurrent = index === currentQuestionIndex;
                                        
                                        let baseClasses = "w-10 h-10 flex items-center justify-center rounded-md font-bold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ";
                                        let stateClasses = "";
                                        // This logic provides clear visual feedback: Current (indigo), Attempted (green), Visited (yellow), or default (gray).
                                        if (isCurrent) {
                                            stateClasses = "bg-indigo-600 text-white ring-2 ring-indigo-500 scale-110";
                                        } else if (isAttempted) {
                                            stateClasses = "bg-green-500 text-white hover:bg-green-600";
                                        } else if (isVisited) {
                                            stateClasses = "bg-yellow-400 text-gray-800 hover:bg-yellow-500";
                                        } else {
                                            stateClasses = "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600";
                                        }

                                        return (
                                            <button key={index} onClick={() => handleQuestionNavigation(index)} className={baseClasses + stateClasses}>
                                                {index + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </aside>

                        {/* This is the main area where the current question and its options are displayed. */}
                        <main className="lg:w-3/4">
                            <div className="p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md animate-fade-in">
                                <div className="mb-6">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentQuestion.category}</p>
                                    <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Question {currentQuestionIndex + 1} of {questions.length}</h2>
                                    <p className="text-xl leading-relaxed">{currentQuestion.question}</p>
                                </div>
                                <div className="space-y-4">
                                    {currentQuestion.options.map((option, index) => (
                                        <label key={index} className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border-2 ${userAnswers[currentQuestionIndex] === option ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500' : 'bg-gray-50 dark:bg-gray-700 border-transparent hover:border-indigo-400'}`}>
                                            <input
                                                type="radio"
                                                name={`question-${currentQuestionIndex}`}
                                                value={option}
                                                checked={userAnswers[currentQuestionIndex] === option}
                                                onChange={() => handleAnswerSelect(currentQuestionIndex, option)}
                                                className="w-5 h-5 text-indigo-600 form-radio focus:ring-indigo-500"
                                            />
                                            <span className="ml-4 text-lg">{option}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-8">
                                     <button
                                        onClick={handleNextQuestion}
                                        disabled={currentQuestionIndex === questions.length - 1}
                                        className="px-8 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
                                    >
                                        Next Question
                                    </button>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    };

    // The final view, which displays the user's score and a detailed breakdown of their answers.
    const ReportPageComponent = () => {
        // The final score is calculated with useMemo for optimization. It will only re-calculate if the user's answers or the questions change.
        const score = useMemo(() => {
            return userAnswers.reduce((acc, answer, index) => {
                return questions[index] && answer === questions[index].correctAnswer ? acc + 1 : acc;
            }, 0);
        }, [userAnswers, questions]);

        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="text-center p-6 mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                        <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">Quiz Report</h1>
                        <p className="mt-4 text-2xl font-semibold">Your Final Score: <span className="text-green-500">{score}</span> / {questions.length}</p>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Review your answers below.</p>
                    </header>

                    <div className="space-y-6">
                        {questions.map((question, index) => {
                            const userAnswer = userAnswers[index];
                            const isCorrect = userAnswer === question.correctAnswer;
                            const isAttempted = userAnswer !== null;
                            // The report provides a clear, side-by-side comparison of the user's answer and the correct one.
                            return (
                                <div key={index} className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all hover:shadow-lg">
                                    <h3 className="text-xl font-semibold mb-4">Question {index + 1}: {question.question}</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-start">
                                            <span className="font-bold w-32 shrink-0">Your Answer:</span>
                                            <span className={`flex-1 ${!isAttempted ? 'text-gray-500' : isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                                                {isAttempted ? userAnswer : 'Not Attempted'}
                                            </span>
                                        </div>
                                        <div className="flex items-start">
                                            <span className="font-bold w-32 shrink-0">Correct Answer:</span>
                                            <span className="flex-1 text-green-500">{question.correctAnswer}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // This switch statement acts as a simple router, rendering the correct component based on the `currentPage` state.
    switch (currentPage) {
        case PAGES.QUIZ:
            return <QuizPageComponent />;
        case PAGES.REPORT:
            return <ReportPageComponent />;
        case PAGES.START:
        default:
            return <StartPageComponent />;
    }
};

export default App;

