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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // 获取图片信息
    const photo = await Photo.findById(params.id);
    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    // 从 Cloudinary 删除图片
    const originalPublicId = photo.originalUrl.split('/').slice(-1)[0].split('.')[0];
    const thumbnailPublicId = photo.thumbnailUrl.split('/').slice(-1)[0].split('.')[0];
    
    await Promise.all([
      cloudinary.uploader.destroy(`artstation/originals/${originalPublicId}`),
      cloudinary.uploader.destroy(`artstation/thumbnails/${thumbnailPublicId}`)
    ]);

    // 从数据库删除记录
    await Photo.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
} 