import React, { useState, useEffect } from 'react';

const CookieNotice = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/dismissed cookies
    const cookieConsent = localStorage.getItem('msrcasc_cookie_consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('msrcasc_cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-6xl mx-auto bg-dark-900/90 backdrop-blur-md border border-dark-800 shadow-2xl rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-gray-300 text-sm md:text-base flex-1">
          <p>
            We use cookies to enhance your browsing experience, serve personalized features, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies as described in our <a href="/privacy" className="text-primary-400 hover:text-primary-300 underline">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsVisible(false)}
            className="flex-1 md:flex-none px-4 py-2 bg-dark-800 hover:bg-dark-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieNotice;
