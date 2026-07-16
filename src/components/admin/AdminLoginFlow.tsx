'use client';

import React, { useState } from 'react';
import PatternLock from 'react-pattern-lock';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import StarfieldCanvas from '@/app/components/StarfieldCanvas'; // Reusing existing starfield
import { useRouter } from 'next/navigation';
import { verifyAuthToken } from '@/lib/api';

interface AdminLoginFlowProps {
    onClose: () => void;
}

const N_PATTERN = [6, 3, 0, 4, 8, 5, 2];

export default function AdminLoginFlow({ onClose }: AdminLoginFlowProps) {
    const [path, setPath] = useState<number[]>([]);
    const [error, setError] = useState(false);
    const [stage, setStage] = useState<'pattern' | 'google' | 'edit'>('pattern');
    const [authError, setAuthError] = useState('');
    const router = useRouter();

    const handleFinish = () => {
        if (!path || path.length === 0) return;
        if (path.join(',') === N_PATTERN.join(',')) {
            // Success
            setTimeout(() => {
                setStage('google');
            }, 500);
        } else {
            // Fail
            setError(true);
            setTimeout(() => {
                setPath([]);
                setError(false);
            }, 1000);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            if (result.user.email === 'srdeshpande1122@gmail.com') {
                const token = await result.user.getIdToken();
                const isVerified = await verifyAuthToken(token);
                if (isVerified) {
                    onClose();
                    router.push('/admin');
                } else {
                    setAuthError('Server-side verification failed. Access Denied.');
                    await auth.signOut();
                }
            } else {
                setAuthError('Unauthorized user.');
                await auth.signOut(); // Sign out unauthorized users
            }
        } catch (error: any) {
            console.error("Sign-in error", error);
            setAuthError(error.message || 'Failed to sign in.');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-void-black text-star-white">
            <StarfieldCanvas opacity={0.6} />
            <button 
                onClick={onClose} 
                className="absolute top-8 right-8 text-star-white opacity-50 hover:opacity-100 font-display uppercase tracking-widest text-xs z-10"
            >
                Close
            </button>

            <div className="relative z-10 max-w-md w-full p-8 glass-card flex flex-col items-center">
                {stage === 'pattern' && (
                    <>
                        <h2 className="font-display font-bold text-2xl mb-8 tracking-wide">Enter Pattern</h2>
                        <div className="mb-4">
                            <PatternLock
                                width={300}
                                pointSize={15}
                                size={3}
                                path={path}
                                onChange={(p: number[]) => setPath(p)}
                                onFinish={handleFinish}
                                error={error}
                                // Styling to match the theme
                                style={{ margin: '0 auto' }}
                                connectorThickness={3}
                                // We can't easily replace the points with "brighter stars" directly without heavily
                                // customizing the PatternLock rendering, but providing custom colors helps. 
                                // We're using standard react-pattern-lock styling via CSS beneath if needed, 
                                // but setting generic props here. 'var(--ice-blue)' or 'var(--galaxy-gold)' could be used if 
                                // supported by react-pattern-lock, but it usually defaults to generic colors unless overridden.
                            />
                        </div>
                        <p className="text-xs opacity-50 font-sans tracking-tight">Draw the shape of N</p>
                    </>
                )}

                {stage === 'google' && (
                    <div className="flex flex-col items-center w-full">
                        <h2 className="font-display font-bold text-2xl mb-4 tracking-wide text-center">Admin Access</h2>
                        <p className="text-sm opacity-60 mb-8 text-center font-sans">
                            Sign in with an authorized Google account to continue.
                        </p>
                        
                        <button
                            onClick={handleGoogleSignIn}
                            className="glass-btn px-6 py-3 font-display text-sm tracking-widest w-full flex items-center justify-center gap-3 transition-colors hover:bg-[rgba(255,255,255,0.1)]"
                        >
                            Sign in with Google
                        </button>
                        
                        {authError && (
                            <div className="mt-4 text-red-400 text-sm font-sans px-4 py-2 bg-[rgba(255,0,0,0.1)] border border-[rgba(255,0,0,0.2)] rounded-md">
                                {authError}
                            </div>
                        )}
                    </div>
                )}

                {stage === 'edit' && (
                    <div className="flex flex-col items-center w-full">
                        <h2 className="font-display font-bold text-2xl mb-6 tracking-wide text-center text-ice-blue">Edit Mode</h2>
                        <div className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] p-6 rounded-lg text-center font-sans">
                            <p className="mb-4 opacity-70">Welcome to the secret edit interface.</p>
                            <p className="text-xs opacity-50 block p-4 border border-dashed border-[rgba(255,255,255,0.2)] rounded">
                                Dummy Edit Controls Placeholder
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
