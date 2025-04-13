import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a book title'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Please select a subject/category'],
    enum: [
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
    ],
  },
  condition: {
    type: String,
    required: [true, 'Please select the condition'],
    enum: ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'],
  },
  exchangeType: {
    type: String,
    required: [true, 'Please select exchange type'],
    enum: ['Sell', 'Lend']
  },
  image: {
    type: String, // Storing image as base64 string
    required: [true, 'Please upload an image'],
  },
  contactInfo: {
    type: String,
    required: [true, 'Please provide contact information'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Book || mongoose.model('Book', BookSchema); 