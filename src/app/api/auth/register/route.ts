import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { name, email, password } = await req.json();
    
    // Check if email is from mnnit.ac.in domain
    if (!email.endsWith('@mnnit.ac.in')) {
      return NextResponse.json(
        { error: 'Only @mnnit.ac.in email addresses are allowed' },
        { status: 400 }
      );
    }
    
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    const user = await User.create({
      name,
      email,
      password,
    });
    
    return NextResponse.json(
      {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: errors }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 