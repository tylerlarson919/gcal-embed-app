'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CalendarEmbedder() {
  const searchParams = useSearchParams();
  const [inputUrl, setInputUrl] = useState<string>('');
  const [embeddedUrl, setEmbeddedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAndSetUrl = (urlToValidate: string | null) => {
    setError(null);
    setEmbeddedUrl(null);

    if (!urlToValidate) {
        // This case is for when the user clicks the button with an empty input
        // We don't want to show an error if the page just loaded without a param
        if (inputUrl === '') return; 
        setError('URL cannot be empty.');
        return;
    }

    try {
      const url = new URL(urlToValidate);
      const isValidGoogleCalendarUrl =
        url.protocol === 'https:' &&
        url.hostname === 'calendar.google.com' &&
        url.pathname.includes('/embed') &&
        url.searchParams.has('src');

      if (!isValidGoogleCalendarUrl) {
        throw new Error('URL must be a valid Google Calendar embed link with a "src" parameter.');
      }
      setEmbeddedUrl(urlToValidate);

    } catch (e: any) {
      setError(e.message || 'Invalid URL format. Please check and try again.');
      setEmbeddedUrl(null);
    }
  };

  // On initial component mount, check for the 'url' parameter
  useEffect(() => {
    const urlFromParam = searchParams.get('url');
    if (urlFromParam) {
      setInputUrl(urlFromParam);
      validateAndSetUrl(urlFromParam);
    }
  }, [searchParams]);

  // Handle manual submission from the input field
  const handleManualSubmit = () => {
    validateAndSetUrl(inputUrl);
  };


  // If a URL is successfully embedded, show only the full-screen iframe
  if (embeddedUrl) {
    return (
      <div className="fixed inset-0 w-full h-full bg-black">
        <iframe
          src={embeddedUrl}
          className="filter invert(1) hue-rotate(180deg)"
          style={{ borderWidth: 0, backgroundColor: '#ffffff' }}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          title="Google Calendar Embed"
        ></iframe>
      </div>
    );
  }

  // Otherwise, show the input form
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center text-white mb-4">
          Google Calendar Embedder
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Paste your full Google Calendar embed URL to display it, or provide it as a URL parameter.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            placeholder="https://calendar.google.com/calendar/embed?src=..."
            className="flex-grow bg-gray-800 text-white border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleManualSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors"
          >
            Embed
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md mt-4 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </main>
  );
}


// Wrap the main component in Suspense as required by useSearchParams
export default function HomePage() {
    return (
        <Suspense fallback={<div className="bg-gray-900 w-full h-screen"></div>}>
            <CalendarEmbedder />
        </Suspense>
    );
}