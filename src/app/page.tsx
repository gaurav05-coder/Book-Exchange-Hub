'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center">
      <div className="text-center my-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6 text-blue-700">
          Welcome to Book Exchange Hub
        </h1>
        <p className="text-xl mb-8 text-gray-700">
          The ultimate platform for MNNIT students to exchange textbooks and study materials
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/books" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
          >
            Browse Books
          </Link>
          {!session && (
            <Link 
              href="/auth/signup"
              className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-50 transition"
            >
              Join Now
            </Link>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Share Your Books</h2>
          <p className="text-gray-600">
            Have textbooks you no longer need? List them on our platform to sell or lend to other students.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Find Study Materials</h2>
          <p className="text-gray-600">
            Search for the textbooks and study materials you need for your courses at affordable prices.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-3 text-blue-600">Connect with Peers</h2>
          <p className="text-gray-600">
            Connect directly with fellow MNNIT students to exchange academic resources and save money.
          </p>
        </div>
      </div>

      <div className="mt-16 text-center max-w-2xl">
        <h2 className="text-2xl font-semibold mb-4 text-blue-700">How It Works</h2>
        <div className="flex flex-col md:flex-row justify-between gap-6 mt-6">
          <div className="flex-1 flex flex-col items-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-3">1</div>
            <h3 className="font-medium mb-1">Sign Up</h3>
            <p className="text-gray-600 text-sm">Create an account with your college email</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-3">2</div>
            <h3 className="font-medium mb-1">List or Browse</h3>
            <p className="text-gray-600 text-sm">Add your books or search for what you need</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mb-3">3</div>
            <h3 className="font-medium mb-1">Connect</h3>
            <p className="text-gray-600 text-sm">Exchange books with fellow students</p>
          </div>
        </div>
      </div>
    </div>
  );
}
