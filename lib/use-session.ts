'use client';

import { useEffect, useState } from 'react';

// Generate a simple session ID for anonymous users
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Check if we have a session ID in localStorage
    let storedSessionId = localStorage.getItem('mauj_session_id');
    
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem('mauj_session_id', storedSessionId);
    }
    
    setSessionId(storedSessionId);
  }, []);

  return { sessionId, userId: null }; // userId will be populated when auth is added
}

