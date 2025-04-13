import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { connectToDatabase } from '@/lib/db';
import Book from '@/models/Book';
import { authOptions } from '../../auth/[...nextauth]/options';

// Configure dynamic options for API route
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Configure to handle large uploads for image updates
export const maxDuration = 60;
export const fetchCache = 'force-no-store';

// GET single book
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const book = await Book.findById(params.id).populate('user', 'name email');
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch book' }, { status: 500 });
  }
}

// UPDATE book
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const book = await Book.findById(params.id);
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    // Check if the book belongs to the logged in user
    if (book.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to update this book' }, { status: 401 });
    }
    
    const data = await req.json();
    
    const updatedBook = await Book.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedBook);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

// DELETE book
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    
    await connectToDatabase();
    
    const book = await Book.findById(params.id);
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    // Check if the book belongs to the logged in user
    if (book.user.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this book' }, { status: 401 });
    }
    
    await Book.findByIdAndDelete(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
} 