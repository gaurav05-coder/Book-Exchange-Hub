'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface BookProps {
  params: {
    id: string;
  };
}

export default function EditBook({ params }: BookProps) {
  const { id } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    condition: '',
    exchangeType: '',
    contactInfo: '',
  });
  
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  const subjects = [
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
  
  const conditions = [
    'New',
    'Used - Like New',
    'Used - Good',
    'Used - Fair'
  ];
  
  const exchangeTypes = ['Sell', 'Lend'];

  // Fetch book data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsFetching(true);
        const res = await fetch(`/api/books/${id}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch book');
        }
        
        const book = await res.json();
        
        // Check if the book belongs to the logged in user
        if (session && book.user._id !== session.user.id) {
          router.push('/books');
          return;
        }
        
        setFormData({
          title: book.title,
          subject: book.subject,
          condition: book.condition,
          exchangeType: book.exchangeType,
          contactInfo: book.contactInfo,
        });
        
        setImage(book.image);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should not exceed 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError('You must be logged in to update a book');
      return;
    }
    
    // Validation
    if (!formData.title || !formData.subject || !formData.condition || !formData.exchangeType || !formData.contactInfo || !image) {
      setError('Please fill in all fields and upload an image');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      const bookData = {
        ...formData,
        image,
      };
      
      const res = await fetch(`/api/books/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update book');
      }
      
      router.push('/books');
      router.refresh();
    } catch (error: any) {
      setError(error.message);
    } finally {
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Edit Book</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 mb-2">
            Book Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="subject" className="block text-gray-700 mb-2">
            Subject/Category *
          </label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="condition" className="block text-gray-700 mb-2">
            Condition *
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Condition</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Exchange Type *
          </label>
          <div className="flex gap-4">
            {exchangeTypes.map((type) => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="exchangeType"
                  value={type}
                  checked={formData.exchangeType === type}
                  onChange={handleChange}
                  className="mr-2"
                  required
                />
                {type}
              </label>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="image" className="block text-gray-700 mb-2">
            Book Image *
          </label>
          {image && (
            <div className="mb-2">
              <img
                src={image}
                alt="Book preview"
                className="w-40 h-40 object-cover rounded-md"
              />
            </div>
          )}
          
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">Max size: 5MB. Leave empty to keep current image.</p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="contactInfo" className="block text-gray-700 mb-2">
            Contact Information *
          </label>
          <input
            type="text"
            id="contactInfo"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            placeholder="Phone number or email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isLoading ? 'Updating...' : 'Update Book'}
          </button>
        </div>
      </form>
    </div>
  );
} 