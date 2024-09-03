// src/CallButton.js
import React from 'react';

const CallButton = () => {
  const makeCall = async () => {
    console.log('Attempting to make a call...'); // Log before making the API call

    try {
      const response = await fetch('http://localhost:5000/call'); // Your backend endpoint
      const data = await response.json();
      
      console.log('Call initiated successfully with SID:', data); // Log the successful call SID
    } catch (error) {
      console.error('Error making call:', error); // Log if there is an error
    }
  };

  return (
    <div>
      <button onClick={makeCall}>Call Now</button>
    </div>
  );
};

export default CallButton;
