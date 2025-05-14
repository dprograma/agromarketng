"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Spinner from '@/components/Spinner';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSendingResetLink, setIsSendingResetLink] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingResetLink(true);
        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'forgot-password',
                    email
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Password reset link sent to your email');
                setEmail(''); // Clear form after success
            } else {
                toast.error(data.error || 'Failed to send reset link');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsSendingResetLink(false);
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
                <h2 className="text-3xl font-bold text-center text-green-700">Password Recovery</h2>
                <p className="text-center text-gray-500">Please enter your email to receive a password reset link.</p>

                <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSendingResetLink}
                        className="w-full px-4 py-3 mt-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSendingResetLink ? <Spinner /> : 'Send Reset Link'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link
                        href="/signin"
                        className="text-green-600 font-medium hover:text-green-800 hover:underline text-sm"
                    >
                        Back to Sign In
                    </Link>
                </div>
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
                        Forgot Your Password?
                    </h2>
                    <p className="text-xl text-gray-200 mb-8 max-w-lg">
                        Don't worry! It happens to the best of us. Enter your email and we'll send you a link to reset your password.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-yellow-500 text-white font-semibold shadow-lg hover:bg-yellow-400 transition-colors duration-300"
                    >
                        Create New Account
                    </Link>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;