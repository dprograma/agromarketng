'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaFacebook, FaGoogle, FaTwitter } from 'react-icons/fa';
import authImgBg from '../../public/assets/img/auth-background.jpg';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push('/signin');
    } else {
      console.log('Signup failed');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left Side Form */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg mx-auto my-20 lg:w-1/2">
      <div className="flex justify-center inset-0"><Link href="/"><Image src={heroImg} alt="logo" className="h-8 w-auto" /></Link></div>
        <h2 className="text-3xl font-bold text-center text-green-700">Create an Account</h2>
        <p className="text-center text-gray-500">Start your journey with us today!</p>
        
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-400"
          >
            Sign Up
          </button>
        </form>

        {/* Social Media Signup */}
        <div className="flex items-center justify-center space-x-3 mt-4">
          <span className="text-gray-500">Or sign up with</span>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <button className="p-2 text-white bg-blue-500 rounded-full">
            <FaFacebook />
          </button>
          <button className="p-2 text-white bg-red-500 rounded-full">
            <FaGoogle />
          </button>
          <button className="p-2 text-white bg-blue-400 rounded-full">
            <FaTwitter />
          </button>
        </div>

        {/* Redirect to Sign In */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/signin" className="text-green-600 hover:underline">
            Sign In
          </a>
        </p>
      </div>

      {/* Right Side Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src={authImgBg}
          alt="Signup Background"
          layout="fill"
          className="object-cover w-full h-full"
        />
         <div className="absolute inset-0 bg-green-900/50"></div>
      </div>
    </div>
  );
}
