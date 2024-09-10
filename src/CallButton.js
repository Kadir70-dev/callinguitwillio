import React, { useState } from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const socket = io('http://localhost:5000'); // Ensure this matches your backend URL

const CallButton = () => {
  const [callStatus, setCallStatus] = useState('idle'); // States: idle, ringing, in-call, call-ended
  const [phoneNumber, setPhoneNumber] = useState('');

  const makeCall = async () => {
    console.log('Attempting to make a call...');
    console.log ('Phone number:', phoneNumber);
    setCallStatus('ringing');

    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('ice-candidate', event.candidate);
        }
      };

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socket.emit('offer', {
        sdp: peerConnection.localDescription,
        phoneNumber: phoneNumber
      });

      socket.on('answer', async answer => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        setCallStatus('in-call');
      });

      socket.on('ice-candidate', candidate => {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      setTimeout(() => {
        setCallStatus('call-ended');
        peerConnection.close();
      }, 5000); // Automatically end call after 5 seconds

    } catch (error) {
      console.error('Error making call:', error);
      setCallStatus('idle');
    }
  };

  const resetCall = () => {
    setCallStatus('idle');
    console.log('Call ended or reset');
  };

  return (
    <div className="text-center">
      <div className="mb-4">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Enter phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>
      <div>
        {callStatus === 'idle' && (
          <button className="btn btn-success btn-lg" onClick={makeCall}>
            Call Now
          </button>
        )}
        {callStatus === 'ringing' && (
          <button className="btn btn-warning btn-lg" disabled>
            Ringing...
          </button>
        )}
        {callStatus === 'in-call' && (
          <button className="btn btn-danger btn-lg" onClick={resetCall}>
            End Call
          </button>
        )}
        {callStatus === 'call-ended' && (
          <button className="btn btn-primary btn-lg" onClick={resetCall}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
};

export default CallButton;
