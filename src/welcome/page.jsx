import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    setShowSignUpForm(true);
  };

  const handleContinueClick = () => {
    setShowQuizForm(true);
  }

  return (
    <div className="flex flex-col h-screen font-sans">

      {/* Navigation bar */}

      <nav className="flex justify-between px-8 py-4 border-b border-gray-300">
        <div className="text-xl font-extrabold text-blue-800">b-date</div>
        <div
          className="text-blue-600 cursor-pointer hover:underline"
          onClick={handleLoginClick}
        >
          Log In
        </div>
      </nav>

      {/* Page content */}

      <div className="flex flex-grow px-8 py-8 items-center">

        {showQuizForm ? (
          <QuizForm />
          ) : (
            
            showSignUpForm ? (
              <SignUpForm showQuizForm={showQuizForm} setShowQuizForm={setShowQuizForm} />
  
            ) : (
              <div className="flex-1 pr-8 ml-28 justify-center items-center">
                <h1 className="text-4xl font-bold mb-4">b-date</h1>
                <p className="text-lg text-gray-600 mb-8">Dining hall-themed website for UCLA students</p>
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
                  onClick={handleSignUpClick}
                >
                  Sign Up
                </button>
              </div>
            )
          )
        }

        <div className="w-1/2 flex justify-center items-center bg-gray-200 h-96">
          <div className="text-gray-500">Image Placeholder</div>
        </div>
      </div>
    </div>
  );
};

const SignUpForm = ({ showQuizForm, setShowQuizForm }) => {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
        ...prev,
        [name]: value,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setShowQuizForm(true);
    // TODO send form to server and go to login page
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6">
      <h3 className="text-sm font-bold text-blue-600 uppercase mb-2">Sign Up</h3>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Tell us some more about yourself!
      </h2>
      <form onSubmit={handleFormSubmit} className="space-y-4">

        {/* Username */}
        <input
            type="username"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            required
        />

        {/* First Name and Last Name */}
        <div className="flex gap-4">
          <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              required
          />
          <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              required
          />
        </div>

        {/* Email */}
        <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            required
        />

        {/* Password */}
        <div className="relative">
            <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                required
            />
        </div>

        {/* Submit Button */}
        <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
        >
            Continue
        </button>
      </form>
    </div>
  );
};







{ /* Ask them to do the quiz right after signing up. They're given the option to take it now or skip. */ }
const QuizForm = () => {

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
        >
          Take the quiz
        </button>

        <button
          type="skip"
          className="w-1/2 p-3 bg-blue-400 text-white font-semibold rounded-lg hover:bg-blue-500"
        >
          Skip for now
        </button>
      </div>

    </div>
  );
};

export default WelcomePage;