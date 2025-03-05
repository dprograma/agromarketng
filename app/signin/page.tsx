'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "@/components/SessionWrapper";
import { Session } from '@/types';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import heroImg from '../../public/assets/img/agromarket-logo.png';
import authImgBg from '../../public/assets/img/auth-background.jpg';
import SocialLoginIcons from '@/components/SocialLoginIcons';
import Alert from '@/components/Alerts';
import { AlertsMsg } from '@/components/AlertsMsg';
import Spinner from '@/components/Spinner'; 


export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alerts, setAlerts] = useState<boolean>(false);
  const [alertMessages, setAlertMessages] = useState<string | undefined>();
  const [alertTypes, setAlertTypes] = useState<string | undefined>();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const searchParams = useSearchParams();
  const alert = searchParams.get('alert');
  const router = useRouter();
  const session = useSession() as Session | null;

  const alertsResponse = AlertsMsg({ alert: alert || '' });
  const { alertMessage = '', alertType = '' } = alertsResponse || {};

  const { setSession } = useSession();


  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      const token = data.token;
      setSession({ token });
      router.push('/dashboard');
    } else {
      const alert = 'invalid_login'
      const alertsResponse = AlertsMsg({ alert: alert || '' });
      setAlerts(true)
      setAlertTypes(alertsResponse?.alertType);
      setAlertMessages(alertsResponse?.alertMessage);
    }
    setIsSigningIn(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {alert && <Alert message={alertMessage} type={alertType} />}
      {alerts && <Alert message={alertMessages || ''} type={alertTypes || ''} />}
      {/* Left Side Form */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg mx-auto my-20 lg:w-1/2">
        <div className="flex justify-center inset-0"><Link href="/"><Image src={heroImg} alt="logo" className="h-8 w-auto" /></Link></div>
        <h2 className="text-3xl font-bold text-center text-green-700">Welcome Back!</h2>
        <p className="text-center text-gray-500">Sign in to your personalized dashboard</p>

        <form onSubmit={handleSignin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-400 text-gray-700"
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
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-green-400 text-gray-700"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-green-700 rounded-md hover:bg-green-800 focus:outline-none focus:ring focus:ring-green-400"
          >
            {isSigningIn ? <Spinner /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          <a href="/forgotPassword" className="text-green-600 hover:underline">
            Forgot password?{" "}
          </a>
        </p>

        {/* Social Media Signup */}
        <div className="flex items-center justify-center space-x-3 mt-4">
          <span className="text-gray-500">Or sign up with</span>
        </div>
        <SocialLoginIcons />

        {/* Redirect to Sign In */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="text-green-600 hover:underline">
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
