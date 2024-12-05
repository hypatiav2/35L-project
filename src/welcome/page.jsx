import { Outlet, useNavigate } from 'react-router-dom';
import bruinpic from "./bruins.jpg"
import { useAuth } from '../AuthContext';
import Navbar from '../home/navbar';

const WelcomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  

 

  // redirect to login page
  const handleLoginClick = () => {
    navigate('/login');
  };
  
  // go back to welcome form when clicking home button
  const handleHomeIcon = () => {
    navigate('/welcome');
  };

  return (
    <div className="flex flex-col h-screen font-sans">

      {/* Navigation bar */}
      {isAuthenticated ? 
        <Navbar />
      :
        <nav className="bg-white text-blue-600 px-6 py-4 shadow-lg flex justify-between items-center">
          <div className="text-xl font-extrabold text-blue-800 cursor-pointer" onClick={handleHomeIcon}>b-date</div>
          <div
            className="text-gray-600 font-semibold px-4 py-2 hover:text-white hover:bg-blue-600 rounded transition cursor-pointer"
            onClick={handleLoginClick}
          >
            Log In
          </div>
        </nav>
      }

      {/* Page content */}
      <div className="flex flex-grow px-8 py-8 justify-between items-center">
        <Outlet />
        <div className="w-1/2 flex justify-center items-center bg-gray-200 h-128">
            <img src={bruinpic} alt="Bruin bear" className="w-full h-full object-cover"/>
        </div>
      </div>
    </div>
  );
};



export default WelcomePage;