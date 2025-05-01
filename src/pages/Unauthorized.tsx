
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full text-center py-12 px-6 bg-white rounded-lg shadow-lg">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center bg-red-100 p-4 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-12 w-12 text-red-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Unauthorized Access</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page. Please contact your administrator
          if you believe this is an error.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full bg-fontify-primary hover:bg-fontify-accent"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
