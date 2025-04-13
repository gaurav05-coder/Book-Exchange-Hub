'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ChatModal from '@/components/ChatModal';

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
    email: string;
  };
  createdAt: string;
}

export default function Books() {
  const { data: session } = useSession();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const subjects = [
    'All Subjects',
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'Economics',
    'Business',
    'Others'
  ];

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/books');
        
        if (!res.ok) {
          throw new Error('Failed to fetch books');
        }
        
        const data = await res.json();
        setBooks(data);
        setFilteredBooks(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  useEffect(() => {
    let result = books;
    
    // Filter by subject
    if (selectedSubject && selectedSubject !== 'All Subjects') {
      result = result.filter(book => book.subject === selectedSubject);
    }
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredBooks(result);
  }, [searchTerm, selectedSubject, books]);

  const handleBookClick = (book: Book) => {
    if (session) {
      setSelectedBook(book);
      setShowChatModal(true);
    } else {
      // Redirect to login if not logged in
      window.location.href = '/auth/signin?callbackUrl=/books';
    }
  };

  const closeChatModal = () => {
    setShowChatModal(false);
    setSelectedBook(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="loader rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-700">Browse Books</h1>
        {session && (
          <Link 
            href="/books/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Book
          </Link>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label htmlFor="search" className="block text-gray-700 mb-2">
              Search by Title
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search books..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="md:w-1/3">
            <label htmlFor="subject" className="block text-gray-700 mb-2">
              Filter by Subject
            </label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 mb-4">No books found</h2>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div 
              key={book._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer transform transition-transform hover:scale-[1.02] hover:shadow-lg"
              onClick={() => handleBookClick(book)}
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={book.image} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{book.title}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    book.exchangeType === 'Sell' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                    {book.exchangeType}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Subject:</span> {book.subject}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Condition:</span> {book.condition}
                  </p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Contact:</span> {book.contactInfo}
                  </p>
                </div>
                
                <div className="text-sm text-gray-500">
                  Posted by {book.user.name}
                </div>
                
                {session && session.user.id === book.user._id && (
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/books/edit/${book._id}`}
                      className="text-blue-600 hover:underline text-sm"
                      onClick={(e) => e.stopPropagation()} // Prevent card click
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/books/delete/${book._id}`}
                      className="text-red-600 hover:underline text-sm"
                      onClick={(e) => e.stopPropagation()} // Prevent card click
                    >
                      Delete
                    </Link>
                  </div>
                )}
                
                {session && session.user.id !== book.user._id && (
                  <div className="mt-4">
                    <button 
                      className="text-blue-600 text-sm flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookClick(book);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chat with Owner
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedBook && (
        <ChatModal 
          book={selectedBook} 
          onClose={closeChatModal} 
          currentUserId={session?.user.id || ''} 
        />
      )}
    </div>
  );
} 