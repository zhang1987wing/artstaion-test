import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/mongodb';
import Photo from '@/models/Photo';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  console.log('Upload API called');
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files.length) {
      console.log('No files received');
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    console.log('Files received:', files.length);

    // Connect to MongoDB
    await connectDB();

    const uploadedPhotos = await Promise.all(
      files.map(async (file) => {
        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64String}`;

        // Upload original image to Cloudinary
        const originalResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'artstation/originals',
          resource_type: 'auto'
        });

        // Upload and generate thumbnail
        const thumbnailResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'artstation/thumbnails',
          transformation: [
            { width: 250, height: 250, crop: 'fill' }
          ],
          resource_type: 'auto'
        });

        // Save photo information to MongoDB
        const photo = await Photo.create({
          originalUrl: originalResult.secure_url,
          thumbnailUrl: thumbnailResult.secure_url,
          width: originalResult.width,
          height: originalResult.height
        });

        return {
          id: photo._id,
          fullsize: originalResult.secure_url,
          thumbnail: thumbnailResult.secure_url,
          width: originalResult.width,
          height: originalResult.height
        };
      })
    );
    
    return NextResponse.json({ 
      success: true,
      photos: uploadedPhotos
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
} 