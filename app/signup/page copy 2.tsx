'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
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
    <div className="flex min-h-screen bg-green-50">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white shadow-lg">
        <h2 className="text-3xl font-bold text-green-800 mb-6">Sign Up</h2>
        <form onSubmit={handleSignup} className="w-full max-w-md space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            className="w-full p-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            Sign Up
          </button>
        </form>
      </div>

      {/* Right Side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/agromarket-signup.jpg"
          alt="Agricultural Market"
          layout="fill"
          objectFit="cover"
          className="rounded-r-lg"
        />
      </div>
    </div>
  );
}
