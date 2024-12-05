import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useEffect } from "react";

// initial welcome page
const WelcomeForm = () => {
    const { isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // navigate to home if user is already authenticated
    useEffect(() => {
        if(!isLoading && isAuthenticated) navigate('/home');
    }, [isLoading, isAuthenticated]);

    // redirect to signup
    const handleSignUpClick = () => {
      navigate('signup')
    };
  
    return (
        <div className="flex-1 pr-8 ml-28 justify-center items-center">
            <h1 className="text-4xl font-bold mb-4">b-date</h1>
            <p className="text-lg text-gray-600 mb-8">A dating website for UCLA students</p>
            <button
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            onClick={handleSignUpClick}
            >
            Sign Up
            </button>
        </div>
    );
}

export default WelcomeForm;  