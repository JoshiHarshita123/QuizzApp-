Simple Quiz Application
This project was built as a task assignment for the Software Engineer Intern position at CausalFunnel. It is a single-page quiz application that uses a predefined set of questions, allows users to take a timed quiz, and provides a detailed report at the end.

The application is built using React.js and styled with Tailwind CSS. The entire application is contained within a single file (quiz-app.jsx) for simplicity and ease of deployment.

Live Demo
[A live version of this application can be hosted on platforms like Netlify, Vercel, or GitHub Pages.]

Features Implemented
Start Page: Collects the user's email address before starting the quiz. Includes basic email validation.

Quiz Interface:

Displays 15 multiple-choice questions from a static, predefined list.

A 30-minute countdown timer is prominently displayed. The quiz auto-submits when the timer ends.

Question Navigation:

An "Overview Panel" on the side shows all 15 question numbers.

The panel uses color-coding to indicate the status of each question:

Gray: Not visited.

Yellow: Visited but not attempted.

Green: Attempted.

Indigo (Bold): The current question being viewed.

Users can click on any question number to navigate directly to it.

Report Page:

Appears after the quiz is submitted or the timer runs out.

Displays the user's final score.

Provides a detailed breakdown of each question, showing the user's selected answer and the correct answer side-by-side for easy comparison.

Local Data Source: Uses a fixed set of 15 questions stored locally within the application. It also processes the data by decoding HTML entities and shuffling the answer choices for each question.

Bonus Features Implemented
Responsive Design: The application layout adapts smoothly to different screen sizes, from mobile phones to desktop monitors, ensuring a great user experience on any device.

Smooth Transitions: Subtle animations are used for question transitions and interactive elements to provide a more polished and modern feel.

My Approach
My goal was to build a robust, user-friendly, and maintainable application that meets all the specified requirements.

Technology Stack: I chose React for its component-based architecture and efficient state management with hooks (useState, useEffect, useMemo). This makes the UI logic clean and organized. Tailwind CSS was used for styling, as it allows for rapid development of a responsive and modern-looking interface directly within the JSX.

Component Structure (Conceptual): Although the code is in a single file, I structured it logically as if it were multiple components:

App: The root component that manages the overall state, including the current page, questions, user answers, and the timer.

StartPageComponent: The initial screen for email entry.

QuizPageComponent: The main view containing the timer, question overview panel, and the current question display.

ReportPageComponent: The final summary screen.
This separation of concerns, even within one file, makes the code easier to read and understand.

State Management: I relied on React's useState hook for managing all dynamic data. This includes the current page, quiz questions, user answers, current question index, and the timer's remaining time. For derived data, like the formatted time string and the final score, I used useMemo to optimize performance by avoiding unnecessary recalculations.

Data Processing:

The questions are stored in a static JSON object at the top of the component.

This data is processed inside a useEffect hook when the application first loads.

A crucial step was processing the data. The questions and answers contained HTML-encoded entities (e.g., &quot;), so I wrote a helper function decodeHTMLEntities to convert them into readable characters.

To ensure fairness, the correct and incorrect answers are combined and then shuffled using a Fisher-Yates shuffle algorithm before being displayed to the user.

Setup and Installation
Since the project is a standard React application and is delivered as a single component, you can integrate it into any React project created with create-react-app or a similar toolchain.

Clone the repository:

git clone [https://github.com/JoshiHarshita123/QuizzApp-.git](https://github.com/JoshiHarshita123/QuizzApp-.git)

Navigate to the project directory:

cd QuizzApp-

Integrate the component:

Create a src directory if one doesn't exist.

Place the quiz-app.jsx file inside the src directory.

Update your main application entry point (e.g., src/index.js) to render the App component from quiz-app.jsx.

Install dependencies:

npm install

Run the application:

npm start

Challenges Faced
Data Formatting: The primary challenge was handling the HTML entities within the provided static data (e.g., &quot;). To solve this, I created a simple utility function that uses the browser's DOM parser to decode these entities into their correct characters, ensuring they display properly to the user.

Timer Management: Implementing a reliable timer in React requires careful use of setInterval within a useEffect hook. It was important to manage the interval's lifecycle correctly by clearing it on component unmount or when the quiz ends to prevent memory leaks and unexpected behavior.

Single-File Constraint: Developing the entire application within a single file while keeping the code clean and readable was a good exercise in code organization. I used clear naming conventions, comments, and logical grouping of functions and "virtual" components to maintain clarity.

Assumptions Made
I assumed that a modern browser environment with support for React is available.

For the sake of the exercise, the user's email is collected but not stored or used beyond the start screen.
