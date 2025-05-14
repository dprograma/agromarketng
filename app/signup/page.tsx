'use client';

import { useState, useEffect } from 'react';
import Spinner from '@/components/Spinner';
import Image from 'next/image';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import Link from 'next/link';
import SocialLoginIcons from '@/components/SocialLoginIcons';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

  const validateForm = () => {
    const newErrors: any = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (confirmPassword.trim() !== password.trim()) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Toggle password visibility functions
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
        toast.success('Account created successfully! Please verify your email to sign in.');

        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Redirect to signin page after a short delay
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      } else {
        // Show specific error message if available
        if (data.error === 'Email already exists') {
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
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
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
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
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

        {/* Social Media Signup */}
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
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-green-700">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-yellow-400"></div>
            <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-green-400"></div>
            <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-green-300"></div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex flex-col items-center justify-center h-full text-center p-12"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Join the Agro Revolution
          </h2>
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
