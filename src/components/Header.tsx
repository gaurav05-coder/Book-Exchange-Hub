'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Book Exchange Hub
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden block"
            onClick={toggleMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="hover:text-blue-200">
              Home
            </Link>
            <Link href="/books" className="hover:text-blue-200">
              Browse Books
            </Link>
            {session ? (
              <>
                <Link href="/books/add" className="hover:text-blue-200">
                  Add Book
                </Link>
                <Link href="/profile" className="hover:text-blue-200">
                  My Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-500 text-white border border-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 flex flex-col space-y-3">
            <Link href="/" className="hover:text-blue-200">
              Home
            </Link>
            <Link href="/books" className="hover:text-blue-200">
              Browse Books
            </Link>
            {session ? (
              <>
                <Link href="/books/add" className="hover:text-blue-200">
                  Add Book
                </Link>
                <Link href="/profile" className="hover:text-blue-200">
                  My Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 w-full text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 inline-block"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-500 text-white border border-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;