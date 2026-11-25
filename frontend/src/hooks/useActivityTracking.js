import { useEffect, useRef, useState } from 'react';
import API from '../services/api';

const useActivityTracking = () => {
  const [userStatus, setUserStatus] = useState('ACTIVE');
  const intervalRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  // Check if user is idle (no mouse/keyboard activity)
  const checkIdleStatus = () => {
    const now = Date.now();
    const idleTime = (now - lastActivityRef.current) / 1000; // seconds
    
    const API_URL = process.env.REACT_APP_API_URL;
    const IDLE_THRESHOLD = parseInt(process.env.REACT_APP_IDLE_THRESHOLD || '60');
    const AWAY_THRESHOLD = parseInt(process.env.REACT_APP_AWAY_THRESHOLD || '900');
    
    let status = 'ACTIVE';
    if (idleTime >= AWAY_THRESHOLD) {
      status = 'AWAY';
    } else if (idleTime >= IDLE_THRESHOLD) {
      status = 'IDLE';
    }
    
    if (status !== userStatus) {
      setUserStatus(status);
      updateServerStatus(status);
    }
  };

  // Send status to backend
  const updateServerStatus = async (status) => {
    try {
      await API.post('/activity/update', { status });
    } catch (error) {
      console.error('Failed to update activity status:', error);
    }
  };

  // Reset activity timer on user interaction
  const resetActivityTimer = () => {
    lastActivityRef.current = Date.now();
    if (userStatus !== 'ACTIVE') {
      setUserStatus('ACTIVE');
      updateServerStatus('ACTIVE');
    }
  };

  // Set up event listeners
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'mousemove', 'scroll', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, resetActivityTimer);
    });
    
    // Check status every 30 seconds
    intervalRef.current = setInterval(checkIdleStatus, 30000);
    
    // Initial status update
    updateServerStatus('ACTIVE');
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetActivityTimer);
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Send offline status when component unmounts
      updateServerStatus('OFFLINE');
    };
  }, []);

  return { userStatus };
};

export default useActivityTracking;