import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5">
        <div className="relative">
          <Mail className="absolute left-3 top-11 h-5 w-5 text-gray-400" />
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
            className="pl-10"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-11 h-5 w-5 text-gray-400" />
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
            className="pl-10 pr-12"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-11 text-gray-400 hover:text-gray-300 transition-colors"
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
              className="h-4 w-4 rounded border-gray-600 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
            />
            <label htmlFor="rememberMe" className="ml-3 block text-sm text-gray-300">
              Remember me for 30 days
            </label>
          </div>
        </div>
      )}

      {authError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-sm backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            {authError}
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading} fullWidth>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {isSignUp ? 'Creating your account...' : 'Signing you in...'}
          </>
        ) : (
          isSignUp ? 'Create Account' : 'Sign In'
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-transparent px-4 text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleMode}
        className="w-full text-center py-3 px-4 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 hover:border-gray-500 transition-all duration-200 font-medium"
      >
        {isSignUp ? 'Sign in to existing account' : 'Create new account'}
      </button>
    </form>
  );
};

export default LoginForm;