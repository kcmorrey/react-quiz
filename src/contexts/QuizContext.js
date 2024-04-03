import { useEffect, useReducer } from 'react';
import { useContext } from 'react';
import { createContext } from 'react';

const QuizContext = createContext();

const SECS_PER_QUESTION = 30;

const initialState = {
	questions: [],
	status: 'loading',
	questionIndex: 0,
	answer: null,
	points: 0,
	highScore: 0,
	secondsRemaining: null,
};

function reducer(state, action) {
	switch (action.type) {
		case 'dataReceived':
			return { ...state, questions: action.payload, status: 'ready' };
		case 'dataFailed':
			return { ...state, status: 'error' };
		case 'start':
			return { ...state, status: 'active', secondsRemaining: state.questions.length * SECS_PER_QUESTION };
		case 'newAnswer':
			const question = state.questions.at(state.questionIndex);
			const points = action.payload === question.correctOption ? state.points + question.points : state.points;

			return { ...state, answer: action.payload, points };
		case 'nextQuestion':
			return { ...state, questionIndex: state.questionIndex + 1, answer: null };
		case 'tick':
			return { ...state, secondsRemaining: state.secondsRemaining - 1, status: state.secondsRemaining === 0 ? 'finished' : state.status };
		case 'finish':
			return { ...state, status: 'finished', highScore: state.points > state.highScore ? state.points : state.highScore };
		case 'restart':
			return { ...initialState, status: 'ready', questions: state.questions, highScore: state.highScore };
		default:
			throw new Error('Action unknown');
	}
}

function QuizProvider({ children }) {
	const [{ questions, status, questionIndex, answer, points, highScore, secondsRemaining }, dispatch] = useReducer(reducer, initialState);

	const numQuestions = questions.length;
	const maxPoints = questions.reduce((acc, val) => acc + val.points, 0);

	useEffect(
		function () {
			fetch('http://localhost:8000/questions')
				.then((res) => res.json())
				.then((data) => dispatch({ type: 'dataReceived', payload: data }))
				.catch((err) => dispatch({ type: 'dataFailed' }));
		},
		[dispatch],
	);

	return (
		<QuizContext.Provider
			value={{ questions, status, questionIndex, answer, points, highScore, secondsRemaining, maxPoints, numQuestions, dispatch }}
		>
			{children}
		</QuizContext.Provider>
	);
}

function useQuiz() {
	const context = useContext(QuizContext);
	if (context === undefined) throw new Error('QuizContext was used outside of QuizProvider');
	return context;
}

export { QuizProvider, useQuiz };
