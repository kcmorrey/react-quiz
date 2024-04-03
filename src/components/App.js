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
import { useQuiz } from '../contexts/QuizContext';

export default function App() {
	const { status, dispatch } = useQuiz();

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
		<div className="app">
			<Header />
			<Main>
				{status === 'loading' && <Loader />}
				{status === 'error' && <Error />}
				{status === 'ready' && <StartScreen />}
				{status === 'active' && (
					<>
						<Progress />
						<Question />
						<Footer>
							<NextButton />
							<Timer />
						</Footer>
					</>
				)}
				{status === 'finished' && <FinishScreen />}
			</Main>
		</div>
	);
}
