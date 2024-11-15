import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
    
    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate('/login');
    };

    const [showSignUpForm, setShowSignUpForm] = useState(false);

    const handleSignUpClick = () => {
        setShowSignUpForm(true);
    };




    return (

    <div style={styles.container}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>Logo</div>
        <div style={styles.loginButton} onClick={handleLoginClick}>
          Log In
        </div>
      </nav>

      <div style={styles.mainContent}>
        {showSignUpForm ? (
          <SignUpForm />
        ) : (
          <div style={styles.textSection}>
            <h1 style={styles.heading}>Bdate</h1>
            <p style={styles.paragraph}>
              Great website for dating
            </p>
            <button style={styles.signUpButton} onClick={handleSignUpClick}>Sign Up</button>
          </div>
        )}
        <div style={styles.imagePlaceholder}></div>
      </div>
      </div>
  );
};

const SignUpForm = () => {
    return (
      <div> 
            Hello you are filling out the sign up form
      </div>
    );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid #e0e0e0',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  loginButton: {
    fontSize: '1rem',
    color: '#007bff',
    cursor: 'pointer',
  },
  mainContent: {
    display: 'flex',
    flexGrow: 1,
    padding: '2rem',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    paddingRight: '2rem',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  paragraph: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '2rem',
  },
  signUpButton: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '4px',
  },
  imagePlaceholder: {
    width: '50%',
    height: '300px',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

export default WelcomePage;