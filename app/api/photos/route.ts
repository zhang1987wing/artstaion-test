import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Photo from '@/models/Photo';
import { Document } from 'mongoose';

interface IPhoto extends Document {
  _id: string;
  thumbnailUrl: string;
  originalUrl: string;
  width: number;
  height: number;
}

export async function GET() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Get all photos, sorted by creation date (newest first)
    const photos = await Photo.find().sort({ createdAt: -1 });
    
    // Format the response
    const formattedPhotos = photos.map((photo: IPhoto) => ({
      id: photo._id,
      thumbnail: photo.thumbnailUrl,
      fullsize: photo.originalUrl,
      width: photo.width,
      height: photo.height
    }));

    return NextResponse.json({ photos: formattedPhotos });
  } catch (error) {
    console.error('Error getting photos:', error);
    return NextResponse.json(
      { error: "Failed to get photos" },
      { status: 500 }
    );
  }
} 