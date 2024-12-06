import { useState } from "react";
import { useAuth } from "../AuthContext";
import { dbPostRequest } from '../api/db';
import { useNavigate } from "react-router-dom";
import { Toast } from "../toast";


const SignUpForm = () => {
    const {signUp, getSupabaseClient } = useAuth();
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      bio: ''
    })
  
    // update input
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
          ...prev,
          [name]: value,
      }));
    };
  
    // profile pic upload
    const handleFileChange = async (e) => {
      const file = e.target.files[0];
      let profile_pictureBase64 = '';
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        profile_pictureBase64 = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result.split(',')[1]);
      })};
      console.log(profile_pictureBase64);
      setFormData((prev) => ({
        ...prev,
        profilePicture: profile_pictureBase64, // Store the selected file
      }));
    }; 

    // trigger toast message
    const triggerToast = (message) => {
      setToastMessage(message);
      setShowToast(true);

      // Automatically hide the toast after 3 seconds
      setTimeout(() => {
          setShowToast(false);
      }, 3000);
    };
  
    // submit new user
    const handleFormSubmit = async (e) => {
      e.preventDefault();
  
      // Sign up the user
      const { success, userID, message } = await signUp(formData.email, formData.password);
  
       // Display error if sign-up fails
      if (!success) {
        triggerToast(message);
        return;
      }
      console.log(message);
     
      // insert new user into database
      const jsonPayload = {
        "id": userID, // retrieve JWT from signup
        "name": formData.firstName + " " + formData.lastName,
        "email": formData.email,
        "bio": formData.bio,
        "profile_picture": formData.profilePicture
      }
  
      // redirect to quiz welcome form after successful signup
      function handleResponse(data)
      {
        navigate('/welcome/quiz');
        console.log(data);
      }
      function handleError(error) {
        console.error('Error during sign-up:', error);
        alert('Failed to create user.');
      }
          
      await dbPostRequest('/users', jsonPayload, handleResponse, handleError, true, getSupabaseClient);
    };
  
    return (
      <div className="max-w-md mx-auto bg-white p-6">
        <h3 className="text-sm font-bold text-blue-600 uppercase mb-2">Sign Up</h3>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Tell us some more about yourself!
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
  
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
  
          {/* Bio */}
          <input
              type="bio"
              name="bio"
              placeholder="A short bio about you"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              required
          />
  
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium text-black-600 mb-2">
              Upload Profile Picture
            </label>
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            />
            {formData.profilePicture && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {formData.profilePicture.name}
              </p>
            )}
          </div>
  
          {/* Submit Button */}
          <button
              type="submit"
              className="w-full p-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
          >
              Continue
          </button>
        </form>
        {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      </div>
    );
  };

  
export default SignUpForm;