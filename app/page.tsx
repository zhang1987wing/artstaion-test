'use client'

import * as React from "react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState<string | null>(null);

  const artworks = [
    { id: 1, title: "Fantasy Landscape", artist: "Artist One", likes: 234 },
    { id: 2, title: "Character Design", artist: "Artist Two", likes: 156 },
    { id: 3, title: "Sci-fi Environment", artist: "Artist Three", likes: 342 },
    { id: 4, title: "Concept Art", artist: "Artist Four", likes: 189 },
    { id: 5, title: "Digital Painting", artist: "Artist Five", likes: 275 },
  ];

  return (
    <div className="min-h-screen bg-[#1C1C1C]">
      {/* Header */}
      <header className="flex justify-between items-center bg-[#232323] px-6 py-4 shadow-lg">
        <h1 className="text-xl font-bold text-white">My ArtStation</h1>
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
      </header>

      <main className="max-w-[2000px] mx-auto px-6 py-8">
        {/* Upload Section */}
        {user && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Your Work</h2>
            <Input type="file" className="bg-[#232323] border-[#333333] text-white" />
            <Button className="mt-4 bg-[#13AFF0] hover:bg-[#0C8BC0] text-white">Upload</Button>
          </div>
        )}

        {/* Gallery Section */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <motion.div
                key={artwork.id}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative"
              >
                <Card className="bg-transparent border-none overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={`https://placehold.co/600x400?text=Art+${artwork.id}`}
                        alt={artwork.title}
                        className="w-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg">
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="text-white font-bold text-lg mb-1">{artwork.title}</h3>
                          <p className="text-gray-300 text-sm mb-2">by {artwork.artist}</p>
                          <div className="flex items-center justify-between">
                            <Button 
                              className="bg-[#13AFF0] hover:bg-[#0C8BC0] text-white text-sm px-3 py-1"
                            >
                              Like • {artwork.likes}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 