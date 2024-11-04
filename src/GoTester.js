import React, { useEffect, useState } from 'react';

// Testing our root API Call!
export default function GoTester() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080')
      .then(response => response.text())
      .then(data => setMessage(data))
      .catch(error => console.error('Error fetching message:', error));
  }, []);

  return (
    <div className="App">
        <h1>Hello! Our public root call: </h1>
        <h1>{message}</h1>
    </div>
  );
}