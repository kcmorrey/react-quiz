import { useReducer } from 'react';
import { useEffect } from 'react';
import Main from './Main';
import Loader from './Loader';
import Error from './Error';
import Header from './Header';
import StartScreen from './StartScreen';
import Question from './Question';
import NextButton from './NextButton';
import Footer from './Footer';
import Progress from './Progress';
import FinishScreen from './FinishScreen';
import Timer from './Timer';

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

export default function App() {
	const [{ questions, status, questionIndex, answer, points, highScore, secondsRemaining }, dispatch] = useReducer(reducer, initialState);

	const numQuestions = questions.length;
	const maxPoints = questions.reduce((acc, val) => acc + val.points, 0);

	useEffect(function () {
		fetch('http://localhost:8000/questions')
			.then((res) => res.json())
			.then((data) => dispatch({ type: 'dataReceived', payload: data }))
			.catch((err) => dispatch({ type: 'dataFailed' }));
	}, []);
	return (
		<div className="app">
			<Header />

			<Main>
				{status === 'loading' && <Loader />}
				{status === 'error' && <Error />}
				{status === 'ready' && <StartScreen numQuestions={numQuestions} dispatch={dispatch} />}
				{status === 'active' && (
					<>
						<Progress index={questionIndex} numQuestions={numQuestions} points={points} maxPoints={maxPoints} answer={answer} />
						<Question question={questions[questionIndex]} dispatch={dispatch} answer={answer} />
						<Footer>
							<NextButton dispatch={dispatch} answer={answer} index={questionIndex} numQuestions={numQuestions} />
							<Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
						</Footer>
					</>
				)}
				{status === 'finished' && <FinishScreen points={points} maxPoints={maxPoints} highScore={highScore} dispatch={dispatch} />}
			</Main>
		</div>
	);
}
