'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface BookProps {
  params: {
    id: string;
  };
}

interface Book {
  _id: string;
  title: string;
  subject: string;
  condition: string;
  exchangeType: string;
  image: string;
  contactInfo: string;
  user: {
    _id: string;
    name: string;
  };
}

export default function DeleteBook({ params }: BookProps) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [book, setBook] = useState<Book | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch book data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsFetching(true);
        const res = await fetch(`/api/books/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch book');
        }
        
        const bookData = await res.json();
        
        // Check if the book belongs to the logged in user
        if (session && bookData.user._id !== session.user.id) {
          router.push('/books');
          return;
        }
        
        setBook(bookData);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsFetching(false);
      }
    };
    
    if (session) {
      fetchBook();
    }
  }, [id, session, router]);

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleDelete = async () => {
    if (!session) {
      setError('You must be logged in to delete a book');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const res = await fetch(`/api/books/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete book');
      }
      
      router.push('/books');
      router.refresh();
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="loader rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-red-600 mb-4">Book not found</h2>
        <Link href="/books" className="text-blue-600 hover:underline">
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Delete Book</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <img 
              src={book.image}
              alt={book.title}
              className="w-full rounded-md object-cover"
            />
          </div>
          
          <div className="md:w-2/3">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{book.title}</h2>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Subject:</span> {book.subject}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Condition:</span> {book.condition}
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Exchange Type:</span> {book.exchangeType}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Contact:</span> {book.contactInfo}
              </p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
              <h3 className="text-lg font-medium text-red-700 mb-2">Confirm Deletion</h3>
              <p className="text-gray-700">
                Are you sure you want to delete this book? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors disabled:bg-red-400"
              >
                {isLoading ? 'Deleting...' : 'Delete Book'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 