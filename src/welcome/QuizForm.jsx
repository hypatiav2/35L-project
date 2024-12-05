import { useNavigate } from "react-router-dom";

/* Ask them to do the quiz right after signing up. They're given the option to take it now or skip. */
const QuizForm = () => {
    const navigate = useNavigate();
  
    const handleQuiz = (e) => {
        navigate("/quiz?redirect=onboarding");
    }
  
    const handleSkip = (e) => {
        navigate('/welcome/scheduling');
    }
  
    return (
  
      <div className="max-w-md mx-auto bg-white p-6">
  
  
        <h3 className="text-sm font-bold text-blue-600 uppercase mb-2">Almost done!</h3>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Take our personality quiz.
        </h2>
        <h1 className="text-lg text-gray-600 mb-8">Our quiz has ten questions designed to assess your values and strengths. We use the results to match you with people whose results suggest a high compatibility score with you. </h1>
  
  
        {/* Buttons */}
  
        <div className = "flex-1 flex space-x-4">
          <button
            type="takequiz"
            className="w-1/2 p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            onClick={handleQuiz}
          >
            Take the quiz
          </button>
  
          <button
            type="skip"
            className="w-1/2 p-3 bg-blue-400 text-white font-semibold rounded-lg hover:bg-blue-500"
            onClick={handleSkip}
          >
            Skip for now
          </button>
        </div>
  
      </div>
    );
  };

export default QuizForm;