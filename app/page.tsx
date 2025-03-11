'use client'

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

interface Photo {
  id: number;
  thumbnail: string;
  fullsize: string;
  width: number;
  height: number;
}

export default function Home() {
  const [user, setUser] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取照片列表
  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos');
      const data = await response.json();
      if (data.photos) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  // 初始加载时获取照片
  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.length) {
      console.log('No file selected');
      alert('Please select a file first');
      return;
    }

    const file = fileInputRef.current.files[0];
    console.log('Selected file:', file.name, 'Size:', file.size);
    
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      console.log('Starting upload...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Upload response:', data);
      
      if (data.success) {
        console.log('Upload successful');
        // 清空文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // 重新获取照片列表而不是刷新整个页面
        await fetchPhotos();
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    let lightbox = new PhotoSwipeLightbox({
      gallery: '#gallery',
      children: 'a',
      pswpModule: () => import('photoswipe'),
      showHideAnimationType: 'none',
      zoomAnimationDuration: false,
      showAnimationDuration: 0,
      hideAnimationDuration: 0
    });
    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  }, [photos]); // 当照片列表更新时重新初始化 lightbox

  return (
    <div className="min-h-screen bg-[#1C1C1C]">
      {/* Header */}
      <header className="bg-[#232323] shadow-lg">
        {/* Top Bar */}
        <div className="max-w-[2400px] mx-auto px-6 py-4">
          <h1 className="text-xl font-bold text-white">My ArtStation</h1>
        </div>
        
        {/* Navigation Bar */}
        <nav className="border-t border-[#333333]">
          <div className="max-w-[2400px] mx-auto px-6 flex justify-between items-center">
            <div className="inline-block py-3 space-x-8">
              <a href="#" className="text-white hover:text-[#13AFF0]">Home</a>
              <a href="#" className="text-white hover:text-[#13AFF0]">Gallery</a>
              <a href="#" className="text-white hover:text-[#13AFF0]">About</a>
              <a href="#" className="text-white hover:text-[#13AFF0]">Contact</a>
            </div>
            <div>
              {user ? (
                <div className="text-white">Welcome, {user}!</div>
              ) : (
                <Button 
                  onClick={() => setUser("Guest")}
                  className="bg-[#13AFF0] hover:bg-[#0C8BC0] text-white"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="max-w-[2400px] mx-auto px-6 py-8">
        {/* Upload Section */}
        {user && (
          <div className="mb-12">
            <Input 
              type="file" 
              ref={fileInputRef}
              className="bg-[#232323] border-[#333333] text-white" 
              accept="image/*"
            />
            <Button 
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 bg-[#13AFF0] hover:bg-[#0C8BC0] text-white"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        )}

        {/* Gallery Section */}
        <div className="w-full">
          <div 
            id="gallery" 
            className="grid" 
            style={{
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '5px'
            }}
          >
            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square">
                <a
                  href={photo.fullsize}
                  data-pswp-width={photo.width}
                  data-pswp-height={photo.height}
                  target="_blank"
                  rel="noreferrer"
                >
                  <img
                    src={photo.thumbnail}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-full object-cover"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 