import React from "react";
import { signIn } from 'next-auth/react';
import { FaFacebook, FaGoogle, FaTwitter } from 'react-icons/fa';

const SocialLoginButtons = () => (
    <div className="flex items-center justify-center space-x-4">
        <button onClick={() => signIn('facebook', { callbackUrl: '/dashboard' })} className="p-2 text-white bg-blue-500 rounded-full">
            <FaFacebook />
        </button>
        <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} className="p-2 text-white bg-red-500 rounded-full">
            <FaGoogle />
        </button>
        <button onClick={() => signIn('twitter', { callbackUrl: '/dashboard' })} className="p-2 text-white bg-blue-400 rounded-full">
            <FaTwitter />
        </button>
    </div>
);

export default SocialLoginButtons;
