'use client';

import { useState, useEffect, useCallback } from 'react';
import Spinner from '@/components/Spinner';
import Image from 'next/image';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import Link from 'next/link';
import SocialLoginIcons from '@/components/SocialLoginIcons';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Mail } from 'lucide-react';

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (confirmPassword.trim() !== password.trim()) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleResendVerification = useCallback(async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendMessage({ type: 'success', text: data.message || 'Verification email sent!' });
        setResendCountdown(60);
      } else {
        setResendMessage({ type: 'error', text: data.error || 'Failed to resend. Please try again.' });
      }
    } catch (error) {
      setResendMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsResending(false);
    }
  }, [registeredEmail, resendCountdown, isResending]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);

    if (!validateForm()) {
      setIsSigningUp(false);
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setRegisteredEmail(email);
        setSignupSuccess(true);
        setResendCountdown(60);
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        if (data.error === 'Email already exists' || data.error === 'User already exists') {
          toast.error('Email already exists. Please login or use a different email.');
        } else {
          toast.error(data.error || 'Failed to create account. Please try again.');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setIsSigningUp(false);
    }
  };

  // Success state — verification email sent
  if (signupSuccess) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl mx-auto my-10 lg:my-20"
        >
          <div className="flex justify-center">
            <Link href="/">
              <Image src={heroImg} alt="logo" className="h-10 w-auto" />
            </Link>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-green-700">Account Created!</h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Mail className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-800">Verification email sent</span>
              </div>
              <p className="text-sm text-green-700">
                We&apos;ve sent a verification link to <strong>{registeredEmail}</strong>. Please check your inbox and spam folder.
              </p>
            </div>

            <p className="text-sm text-gray-500">
              Didn&apos;t receive the email? You can resend it below.
            </p>

            {/* Resend button with countdown */}
            <button
              onClick={handleResendVerification}
              disabled={resendCountdown > 0 || isResending}
              className="w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isResending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : resendCountdown > 0 ? (
                `Resend in ${resendCountdown}s`
              ) : (
                'Resend Verification Email'
              )}
            </button>

            {resendMessage && (
              <p className={`text-sm ${resendMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {resendMessage.text}
              </p>
            )}

            <div className="pt-4 border-t border-gray-200">
              <Link
                href="/signin"
                className="text-green-600 font-medium hover:text-green-800 hover:underline text-sm"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Right Side Background */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-700">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
              <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-yellow-400"></div>
              <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-green-400"></div>
              <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-green-300"></div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex flex-col items-center justify-center h-full text-center p-12"
          >
            <h2 className="text-4xl font-bold text-white mb-6">Almost There!</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-lg">
              Just verify your email to get started. Check your inbox for the verification link.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 space-y-6 bg-white shadow-xl rounded-xl mx-auto my-10 lg:my-20 lg:w-1/2"
      >
        <div className="flex justify-center">
          <Link href="/">
            <Image src={heroImg} alt="logo" className="h-10 w-auto" />
          </Link>
        </div>
        <h2 className="text-3xl font-bold text-center text-green-700">Create an Account</h2>
        <p className="text-center text-gray-500">Start your journey with us today!</p>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition-all"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition-all"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition-all"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition-all"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isSigningUp}
            className="w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {isSigningUp ? <Spinner /> : 'Sign Up'}
          </button>
        </form>

        <div className="relative flex items-center justify-center mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative px-4 bg-white">
            <span className="text-sm text-gray-500">Or continue with</span>
          </div>
        </div>

        <SocialLoginIcons />

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-green-600 font-medium hover:text-green-800 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>

      {/* Right Side Background */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-700">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-yellow-400"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-green-400"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-green-300"></div>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex flex-col items-center justify-center h-full text-center p-12"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Join the Agro Revolution</h2>
          <p className="text-xl text-gray-200 mb-8 max-w-lg">
            Sign up to access fresh produce, connect with farmers, and be part of a sustainable marketplace. Start your journey today!
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-yellow-500 text-white font-semibold shadow-lg hover:bg-yellow-400 transition-colors duration-300"
          >
            Already have an account?
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
