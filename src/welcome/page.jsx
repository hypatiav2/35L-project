import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [showSignUpForm, setShowSignUpForm] = useState(false);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    setShowSignUpForm(true);
  };

  return (
    <div className="flex flex-col h-screen font-sans">
      {/* Navigation Bar */}
      <nav className="flex justify-between px-8 py-4 border-b border-gray-300">
        <div className="text-xl font-bold">Logo</div>
        <div
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={handleLoginClick}
        >
          Log In
        </div>
      </nav>

      <div className="flex flex-grow px-8 py-8 items-center">
        {showSignUpForm ? (
          <SignUpForm />
        ) : (
          <div className="flex-1 pr-8">
            <h1 className="text-4xl font-bold mb-4">Bdate</h1>
            <p className="text-lg text-gray-600 mb-8">Great website for dating</p>
            <button
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
              onClick={handleSignUpClick}
            >
              Sign Up
            </button>
          </div>
        )}
        <div className="flex-1 flex justify-center items-center bg-gray-200 h-72 w-full">
          <div className="text-gray-500">Image Placeholder</div>
        </div>
      </div>
    </div>
  );
};

const SignUpForm = () => {
  return (
    <div className="text-lg text-center">
      Hello, you are filling out the sign-up form.
    </div>
  );
};

export default WelcomePage;