"use client";

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation";

const dashboard = () => {

    const { data:session, status } = useSession();

    let auth = {
        isAuth: false,
        name: '',
        email: '',
        image: '',
    }

    if (session?.user) {
        auth = {
            isAuth: true,
            name: session.user.name ?? '',
            email: session.user.email ?? '',
            image: session.user.image ?? '',
        }
    }

    // if (status === 'authenticated') {
    //     redirect('/dashboard');
    // }

    return (
        <div>{auth.isAuth? `Welcome ${auth.name}, You are ${status}` : 'Please sign in to access the dashboard.'}</div>
    )
}

export default dashboard