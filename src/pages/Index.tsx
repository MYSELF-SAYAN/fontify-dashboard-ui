
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/api';

const Index = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in and redirect accordingly
  React.useEffect(() => {
    const checkAuth = () => {
      if (authService.isLoggedIn()) {
        if (authService.isAdmin()) {
          navigate('/admin');
        } else {
          navigate('/upload');
        }
      } else {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-fontify-primary">Fontify</h1>
        <p className="text-xl text-gray-600 mb-8">Redirecting to dashboard...</p>
        <div className="w-12 h-12 border-4 border-fontify-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default Index;
