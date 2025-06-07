import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from './ui/Input';
import Button from './ui/Button';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, signUp, isLoading, error: authError } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (isSignUp) {
        await signUp(formData.email, formData.password);
      } else {
        await login(formData.email, formData.password, formData.rememberMe);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
  };

  // Check if the error is related to email confirmation
  const isEmailConfirmationError = authError && (
    authError.includes('Email not confirmed') || 
    authError.includes('check your email') ||
    authError.includes('confirmation link')
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
          required
        />

        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {!isSignUp && (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 transition-colors"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Forgot password?
            </a>
          </div>
        </div>
      )}

      {authError && (
        <div className={`p-4 rounded-lg border ${
          isEmailConfirmationError 
            ? 'bg-amber-50 border-amber-200 text-amber-800' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {isEmailConfirmationError ? (
                <Mail className="h-5 w-5 text-amber-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-1">
                {isEmailConfirmationError ? 'Email Confirmation Required' : 'Authentication Error'}
              </h3>
              <p className="text-sm">
                {authError}
              </p>
              {isEmailConfirmationError && (
                <div className="mt-3 text-sm">
                  <p className="font-medium mb-2">What to do next:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Check your email inbox for a confirmation message</li>
                    <li>Look in your spam/junk folder if you don't see it</li>
                    <li>Click the confirmation link in the email</li>
                    <li>Return here and try signing in again</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isSignUp ? 'Creating account...' : 'Signing in...'}
          </>
        ) : (
          isSignUp ? 'Create Account' : 'Sign in'
        )}
      </Button>

      <div className="text-center text-sm text-gray-600">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={toggleMode}
          className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;