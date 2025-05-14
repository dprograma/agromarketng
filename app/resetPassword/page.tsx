"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import Link from 'next/link';
import Image from 'next/image';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';


const ResetPassword = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetingPassword, setIsResetingPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Check if token exists
    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            router.push('/forgotPassword');
        }
    }, [token, router]);

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetingPassword(true);

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            setIsResetingPassword(false);
            return;
        }

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'reset-password', token, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Password reset successfully');
                // Redirect to login after successful reset
                setTimeout(() => {
                    router.push('/signin');
                }, 1500);
            } else {
                toast.error(data.error || 'Failed to reset password');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsResetingPassword(false);
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
                <h2 className="text-3xl font-bold text-center text-green-700">Reset Password</h2>
                <p className="text-center text-gray-500">Enter your new password below.</p>

                <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition-all"
                            />
                            <button
                                type="button"
                                onClick={toggleNewPasswordVisibility}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
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
                    </div>

                    <button
                        type="submit"
                        disabled={isResetingPassword}
                        className="w-full px-4 py-3 mt-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isResetingPassword ? <Spinner/> : 'Reset Password'}
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
                        Almost There!
                    </h2>
                    <p className="text-xl text-gray-200 mb-8 max-w-lg">
                        Create a strong password to secure your account. Once complete, you'll be able to access all our features.
                    </p>
                    <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                        <h3 className="text-white font-semibold mb-2">Password Tips:</h3>
                        <ul className="text-gray-200 text-left space-y-1">
                            <li>• Use at least 8 characters</li>
                            <li>• Include uppercase and lowercase letters</li>
                            <li>• Add numbers and special characters</li>
                            <li>• Avoid using personal information</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPassword;
