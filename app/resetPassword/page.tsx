"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Spinner from '@/components/Spinner';
import Link from 'next/link';
import Image from 'next/image';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import authImgBg from '../../public/assets/img/auth-background.jpg';


const ResetPassword = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isResetingPassword, setIsResetingPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsResetingPassword(true);
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        const res = await fetch('/api/auth', {
            method: 'RESET',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
        });

        const data = await res.json();
        setMessage(data.message || data.error);
        setIsResetingPassword(false);
    };

    return ( 
        <div className="flex min-h-screen bg-gray-100">
            {/* Left Side Form */}
            <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg mx-auto my-20 lg:w-1/2">
                <div className="flex justify-center inset-0"><Link href="/"><Image src={heroImg} alt="logo" className="h-8 w-auto" /></Link></div>
                <h2 className="text-3xl font-bold text-center text-green-700">Reset Password</h2>
                <p className="text-center text-gray-500">Enter your new password to reset your password.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Enter new password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="•••••••••••••"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="•••••••••••••"
                            required
                            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-400"
                    >
                        {isResetingPassword ? <Spinner/> : 'Reset Password'}
                    </button>
                </form>

                {message && <p className="text-center text-red-500">{message}</p>}
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
};

export default ResetPassword;
