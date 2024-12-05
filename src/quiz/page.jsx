import React from 'react';
import Navbar from '../home/navbar';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { dbGetRequest, dbPutRequest } from '../api/db';
import { Toast } from '../toast';

export default function QuizPage() {
    const { isAuthenticated, getSupabaseClient } = useAuth();
    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [searchParams] = useSearchParams();
    const redirectType = searchParams.get('redirect'); // if directed from welcome, go to scheduling next. Else go home
    const [resetKey, setResetKey] = useState(0); // increment to force rerender when reset
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const contents=[
        ["How much do you talk?", "Mute", "Fluent in Yapanese"],
        ["How much do you like your alone time?", "Always with people", "Always alone"],
        ["How much do you like/listen to music?", "What is a song", "Can't live without music"],
        ["How much do you like/play sports?", "I don't go outside", "D1 athlete"],
        ["Do you enjoy partying/drinking?", "Never", "Wilding every night"],
        ["How chill are you?", "Not so easygoing", "Easygoing"],
        ["STEM or art?", "Art", "STEM"],
        ["How would you describe your life currently?", "Absolute clownery", "Have life together"],
        ["How fast is your response time?", "Several days", "Immediately"],
        ["What do you enjoy doing?", "Watching a movie in bed", "Adventuring in the Alps"]
    ]
    const [scores, setScores] = useState(Array(contents.length).fill(null))
    const [user, setUser] = useState({
        similarity_vector: Array(contents.length).fill(null)
    })

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                await dbGetRequest('/vector', (data) => {
                    setUser(data);
                    setScores(data.similarity_vector || Array(contents.length).fill(null));
                }, handleFetchError, isAuthenticated, getSupabaseClient);
            } catch (error) {
                console.error("Failed to fetch user information on page load:", error);
            }
        };
        fetchUserData();
    }, [isAuthenticated, getSupabaseClient]);
    
    

    const handleFetchError = (error) => {
        console.error("Failed to fetch user information on page load:", error);
    };

    const handleScoreChange = (index, value) => {
        const updatedScores = [...scores];
        updatedScores[index] = value;
        setScores(updatedScores);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitted(true);

        function handleResponse(data)
        {
            console.log(data)
        }
        function handleError(error) {
        console.error("booo", error)
        }

        await dbPutRequest('/vector', { similarity_vector: scores }, handleResponse, handleError, isAuthenticated, getSupabaseClient);
        triggerToast("Quiz submitted!")
    };
    
    const handleReset = () => {
        setIsSubmitted(false);
        setScores(Array(contents.length).fill(null));
        setResetKey((prev) => prev + 1);
    }

    const handleRedirect = async (e) => {
        e.preventDefault();
        if(redirectType === 'onboarding') {
            navigate('/welcome/scheduling');
        } else {
            navigate('/home');
        }
    }

    const triggerToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen py-8 px-4">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 max-w-2xl mx-auto p-4">Compatibility Quiz</h1>
            <h1 className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">Our quiz has ten questions designed to assess your values and strengths. We use the results to match you with people whose results suggest a high compatibility score with you. </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                    <Question
                        key={`question${value}-${resetKey}`} 
                        name={value} contents={contents[value]}
                        initialSelected={redirectType === 'onboarding' ? undefined : scores[value]} 
                        onChange={handleScoreChange}
                    />
                ))}
                <div className="flex justify-center py-8">
                    {isSubmitted ? 
                    (<div className="flex space-x-4">
                        <button
                            className="text-blue-600 font-semibold border border-blue-600 px-4 py-2 hover:text-white hover:bg-blue-600 rounded transition"
                            onClick={handleRedirect}
                        >
                            {redirectType === 'onboarding' ? "Continue" : "Go Home"}
                        </button>
                        <button
                            className="text-gray-600 font-bold border border-white px-4 py-2 hover:text-red-700 hover:border-gray-500 rounded transition"
                            onClick={handleReset}
                        >
                            Retake
                        </button>
                    </div>) : (
                        <button
                            type="submit"
                            className="text-blue-600 font-semibold border border-blue-600 px-4 py-2 hover:text-white hover:bg-blue-600 rounded transition"
                        >
                            Submit
                        </button>
                    )}
                </div>
            </form>
            </div>
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
        </div>
    );
};

function Question({ name, contents, initialSelected, onChange }) {
    const [selectedValue, setSelectedValue] = useState(initialSelected);

    useEffect(() => {
        setSelectedValue(initialSelected);
    }, [initialSelected]);

    // update selected before updating parent
    const handleOptionChange = (name, value) => {
        setSelectedValue(value); 
        if (onChange) onChange(name, value);
    };
    return (
        <div className="max-w-4xl mx-auto p-8 border-t-2">
        <h2 className="text-blue-600 text-lg font-semibold text-center mb-10">{contents[0]}</h2>
        <div className="flex items-center">
            <span className="basis-1/6 text-gray-500 font-medium text-center">{contents[1]}</span>
            <ul className="basis-2/3 flex space-x-4 items-center justify-center">
            {[1, 2, 3, 4, 5].map((value) => (
                <Option
                key={value}
                name={name}
                value={value}
                isSelected={selectedValue === value}
                onChange={handleOptionChange}
                />
            ))}
            </ul>
            <span className="basis-1/6 text-gray-500 font-medium text-center">{contents[2]}</span>
        </div>
        </div>
    );
}

function Option({ name, value, isSelected, onChange }) {
  return (
    <li className="relative">
      <label className="flex items-center justify-center w-16 h-12 rounded-full cursor-pointer">
        <input
            className="sr-only peer"
            type="radio"
            name={name}
            value={value}
            checked={isSelected}
            onChange={() => onChange(name, value)}
            required
        />
        <span
          className="block w-12 h-12 border-2 border-gray-300 rounded-full 
          peer-hover:border-blue-600 peer-checked:border-blue-600 
          peer-checked:bg-blue-100"
        ></span>
      </label>
    </li>
  );
}
