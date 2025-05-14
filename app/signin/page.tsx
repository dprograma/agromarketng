'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "@/components/SessionWrapper";
import { Session } from '@/types';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import SocialLoginIcons from '@/components/SocialLoginIcons';
import Spinner from '@/components/Spinner';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { showAlertToast, showToast } from '@/lib/toast-utils';


export default function SigninPage() {
  const { session, setSession } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const searchParams = useSearchParams();
  const alertCode = searchParams.get('alert');

  // Show toast notification if alert code is present in URL
  useEffect(() => {
    if (alertCode) {
      showAlertToast(alertCode);
    }
  }, [alertCode]);

  useEffect(() => {
    // If already authenticated, redirect to appropriate dashboard
    if (session) {
      switch (session.role) {
        case "admin":
          router.replace('/admin/dashboard');
          break;
        case "agent":
          router.replace('/agent/dashboard');
          break;
        default:
          router.replace('/dashboard');
      }
    }
  }, [session, router]);

  // Only show signin form if not authenticated
  if (session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);

    try {
      const res = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Create session object
        const session = {
          token: data.token,
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          isAgent: data.user.isAgent,
          agentId: data.user.agentId
        };

        // Set session in context
        setSession(session);

        // Show success toast
        toast.success(`Welcome back, ${data.user.name}!`);

        // Redirect based on role
        switch (data.user.role) {
          case "admin":
            router.push('/admin/dashboard');
            break;
          case "agent":
            router.push('/agent/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        // Show error toast
        toast.error(data.error || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
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
        <h2 className="text-3xl font-bold text-center text-green-700">Welcome Back!</h2>
        <p className="text-center text-gray-500">Sign in to your personalized dashboard</p>

        <form onSubmit={handleSignin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Link href="/forgotPassword" className="text-xs text-green-600 hover:text-green-800 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
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
          </div>

          <button
            type="submit"
            disabled={isSigningIn}
            className="w-full px-4 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSigningIn ? <Spinner /> : 'Sign In'}
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

        {/* Redirect to Sign Up */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-green-600 font-medium hover:text-green-800 hover:underline">
            Sign Up
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
            href="/signup"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-yellow-500 text-white font-semibold shadow-lg hover:bg-yellow-400 transition-colors duration-300"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
