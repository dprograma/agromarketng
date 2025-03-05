"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Spinner from '@/components/Spinner';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import authImgBg from '../../public/assets/img/auth-background.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSendingResetLink, setIsSendingResetLink] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingResetLink(true);
        const res = await fetch('/api/auth', {
            method: 'FORGOT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();
        setMessage(data.message || data.error);
        setIsSendingResetLink(false);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Left Side Form */}
            <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg mx-auto my-20 lg:w-1/2">
                <div className="flex justify-center inset-0"><Link href="/"><Image src={heroImg} alt="logo" className="h-8 w-auto" /></Link></div>
                <h2 className="text-3xl font-bold text-center text-green-700">Password Recovery</h2>
                <p className="text-center text-gray-500">Please fill the form below to reset your password.</p>

                <form onSubmit={handleSubmit} className="space-y-5">

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

                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-400"
                    >
                        {isSendingResetLink ? <Spinner/> : 'Send Reset Link'}
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

export default ForgotPassword;
