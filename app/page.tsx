'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import LandingPageContent from '@/components/LandingPageContent';
import PageShell from '@/components/PageShell';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    // Check for preview parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const preview = urlParams.get('preview') === 'true';
    setIsPreview(preview);

    if (loading) return;

    // If user is authenticated and NOT previewing, redirect to dashboard
    if (user && !preview) {
      router.replace('/dashboard');
    } else {
      setShowLanding(true);
    }
  }, [loading, user, router]);

  // Show loading state while checking auth
  if (loading || (!showLanding && user && !isPreview)) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-screen py-24">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0B5E8E] rounded-lg flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="4" width="16" height="16" rx="2" fill="white"/>
              </svg>
            </div>
            <div className="text-[#4F7D96] font-semibold">Loading...</div>
          </div>
        </div>
      </PageShell>
    );
  }

  // Show landing page
  return <LandingPageContent isPreview={isPreview} />;
}