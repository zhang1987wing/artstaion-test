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
    console.log('Photos API: Starting request...');
    console.log('Photos API: Connecting to MongoDB...');
    await connectDB();
    console.log('Photos API: Connected to MongoDB successfully');
    
    // Get total count first
    const totalCount = await Photo.countDocuments();
    console.log('Photos API: Total photos in database:', totalCount);
    
    // Get all photos, sorted by creation date (newest first)
    const photos = await Photo.find().sort({ createdAt: -1 });
    console.log('Photos API: Retrieved photos count:', photos.length);
    
    // Log each photo's basic info
    photos.forEach((photo: IPhoto, index: number) => {
      console.log(`Photos API: Photo ${index + 1}:`, {
        id: photo._id,
        thumbnail: photo.thumbnailUrl.substring(0, 50) + '...'
      });
    });
    
    // Format the response
    const formattedPhotos = photos.map((photo: IPhoto) => ({
      id: photo._id,
      thumbnail: photo.thumbnailUrl,
      fullsize: photo.originalUrl,
      width: photo.width,
      height: photo.height
    }));

    console.log('Photos API: Final formatted photos count:', formattedPhotos.length);
    return NextResponse.json({ photos: formattedPhotos });
  } catch (error) {
    console.error('Photos API: Error getting photos:', error);
    return NextResponse.json(
      { error: "Failed to get photos" },
      { status: 500 }
    );
  }
} 