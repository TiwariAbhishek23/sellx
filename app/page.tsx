"use client";
import React, { FormEvent, useState } from 'react';

const HomePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [response, setResponse] = useState<{ images: string[], dataText: string } | null>(null);
  const [healthCheckMessage, setHealthCheckMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      console.log(res)
      if (!res.ok) {
        console.log(res)
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
      console.log(data)
    } catch (error) {
      console.log('Error scraping the URL:', error);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const res = await fetch('/api/healthcheck', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setHealthCheckMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen p-24">
  <div className="w-full max-w-5xl flex items-center justify-between font-mono text-sm lg:flex">

    {/* Fixed footer */}
    <div className="fixed bottom-0 left-0 flex w-full bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:bg-none">
      <a
        href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-8 pointer-events-none lg:pointer-events-auto lg:p-0"
      >
        By Abhishek Tiwari
      </a>
    </div>

  </div>

  {/* Main content section */}
  <div className="flex flex-col items-center justify-center relative mt-16 lg:mt-0 lg:flex-row lg:justify-around lg:text-left">
    {/* Form section */}
    <div className="flex flex-col items-center space-y-4 lg:items-start">
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-2">
          <input
            type="text"
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border rounded p-2 mt-2 text-black"
            placeholder='Enter The Url here'
          />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-4">
          Scrape
        </button>
      </form>
      <button onClick={handleHealthCheck} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
        Check Server Health
      </button>
    </div>

    {/* Visual decoration */}
    <div className="relative h-48 lg:h-auto lg:w-auto">
      {/* Visual elements */}
      <div className="absolute top-0 left-0 w-full h-full before:absolute before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40"></div>
    </div>
  </div>

  {/* Display area for scraped data */}
  <div className="mt-16 mb-32 text-center lg:mb-0 lg:grid lg:grid-cols-4 lg:text-left">
    {healthCheckMessage && <p className="col-span-4">{healthCheckMessage}</p>}
    {response && (
      <div className="col-span-4">
        <h2 className="text-xl font-bold mb-4">Scraped Data</h2>
        {/* Display scraped data here */}
      </div>
    )}
  </div>

</main>
  );

};

export default HomePage;
