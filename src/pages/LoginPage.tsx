import React from 'react';
import LoginForm from '../components/LoginForm';
import { Shield } from 'lucide-react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f8be00] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-600 p-3 rounded-full">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Welcome back</h1>
            <p className="text-center text-gray-600 mb-8">
              Enter your credentials to access your account
            </p>
            <LoginForm />
          </div>
        </div>
        <p className="text-center text-gray-600 text-sm mt-6">
          © {new Date().getFullYear()} SecureApp. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;