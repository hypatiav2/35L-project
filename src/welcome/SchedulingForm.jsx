import { useNavigate } from "react-router-dom";

/* Ask them to do the quiz right after signing up. They're given the option to take it now or skip. */
const SchedulingForm = () => {
    const navigate = useNavigate();
  
    const handleSchedule = () => {
      navigate("/schedule");
    }
  
    const handleSkip = () => {
      navigate("/home");
    }
  
    return (
  
      <div className="max-w-md mx-auto bg-white p-6">
  
  
        <h3 className="text-sm font-bold text-blue-600 uppercase mb-2">One last thing!</h3>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Fill out your availability.
        </h2>
        <h1 className="text-lg text-gray-600 mb-8">We find people to match you with based on many factors, including the times that fit your schedule! You can change your availability at any time. </h1>
  
  
        {/* Buttons */}
  
        <div className = "flex-1 flex space-x-4">
          <button
            type="takequiz"
            className="w-1/2 p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            onClick={handleSchedule}
          >
            Take me scheduling
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

export default SchedulingForm;