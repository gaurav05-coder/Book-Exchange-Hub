import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/db';
import Book from '@/models/Book';
import { authOptions } from '../auth/[...nextauth]/options';

// Configure dynamic options for API route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Configure to handle large uploads for images
export const maxDuration = 60;
export const fetchCache = 'force-no-store';

// GET all books
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const title = searchParams.get('title');
    
    let query = {};
    
    if (subject) {
      query = { ...query, subject };
    }
    
    if (title) {
      query = { ...query, title: { $regex: title, $options: 'i' } };
    }
    
    const books = await Book.find(query).sort({ createdAt: -1 }).populate('user', 'name email');
    
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}

// POST new book
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const data = await req.json();
    
    const bookData = {
      ...data,
      user: session.user.id
    };
    
    const book = await Book.create(bookData);
    
    return NextResponse.json(book, { status: 201 });
  } catch (error: any) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
} 