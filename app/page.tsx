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

    const files = fileInputRef.current.files;
    console.log('Selected files:', Array.from(files).map(file => ({ name: file.name, size: file.size })));
    
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

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
      alert('Failed to upload files');
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

    // 添加删除按钮
    lightbox.on('uiRegister', function() {
      if (!lightbox.pswp?.ui) return;
      
      lightbox.pswp.ui.registerElement({
        name: 'delete-button',
        order: 8,
        isButton: true,
        html: '<svg aria-hidden="true" class="pswp__icn" viewBox="0 0 24 24" width="24" height="24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>',
        onClick: async () => {
          if (!lightbox.pswp) return;
          
          const currentIndex = lightbox.pswp.currIndex;
          const photo = photos[currentIndex];
          
          if (confirm('确定要删除这张图片吗？')) {
            try {
              const response = await fetch(`/api/photos/${photo.id}`, {
                method: 'DELETE'
              });
              
              if (response.ok) {
                // 关闭 lightbox
                lightbox.pswp.close();
                // 重新获取照片列表
                await fetchPhotos();
              } else {
                alert('删除失败');
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              alert('删除失败');
            }
          }
        }
      });
    });

    lightbox.init();

    return () => {
      lightbox.destroy();
    };
  }, [photos]); // 当照片列表更新时重新初始化 lightbox

  return (
    <div className="min-h-screen bg-[#1C1C1C]">
      {/* Header */}
      <header className="bg-[#232323] shadow-lg mb-8">        
        {/* Navigation Bar */}
        <nav className="border-t border-[#333333]">
          <div className="max-w-[2400px] mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-white">My ArtStation</h1>
              {user ? (
                <div className="text-white"></div>
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

      <main className="max-w-[2400px] mx-auto px-6">
        {/* Upload Section */}
        {user && (
          <div className="mb-12 bg-[#232323] p-6 rounded-lg">
            <Input 
              type="file" 
              ref={fileInputRef}
              className="bg-[#2C2C2C] border-[#333333] text-white mb-4" 
              accept="image/*"
              multiple
            />
            <Button 
              onClick={handleUpload}
              disabled={uploading}
              className="bg-[#13AFF0] hover:bg-[#0C8BC0] text-white"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        )}

        {/* Gallery Section */}
        <div className="w-full bg-[#232323] p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-6">Gallery</h2>
          <div 
            id="gallery" 
            className="w-full"
          >
            {photos.length > 0 ? (
              <div className="grid grid-cols-7 gap-[10px] p-[5px]">
                {photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.fullsize}
                    data-pswp-width={photo.width}
                    data-pswp-height={photo.height}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[20px] overflow-hidden w-[250px] h-[250px]"
                  >
                    <img
                      src={photo.thumbnail}
                      alt={`Photo ${photo.id}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-white">
                <p className="text-xl font-semibold mb-2">No Images Yet</p>
                <p className="text-gray-400">Upload some images to get started</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 