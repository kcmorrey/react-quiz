import { useQuiz } from '../contexts/QuizContext';

function NextButton() {
	const { dispatch, answer, questionIndex, numQuestions } = useQuiz();

	if (answer === null) return null;

	if (questionIndex < numQuestions - 1) {
		return (
			<div>
				<button className="btn btn-ui" onClick={() => dispatch({ type: 'nextQuestion' })}>
					Next
				</button>
			</div>
		);
	}

	if (questionIndex === numQuestions - 1) {
		return (
			<div>
				<button className="btn btn-ui" onClick={() => dispatch({ type: 'finish' })}>
					Finish
				</button>
			</div>
		);
	}
}

export default NextButton;
