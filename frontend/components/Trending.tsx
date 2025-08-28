"use client";
import React from "react";
import Image from "next/image";
import useFetch from "@/hooks/useFetch";

const Trending = () => {
  const { data: trendingSongs, loading, error } = useFetch("/api/trending");

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
            Trending Songs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800 bg-opacity-50 rounded-lg p-4 md:p-6 text-center animate-pulse">
                <div className="w-full h-48 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12">
            Trending Songs
          </h2>
          <div className="bg-red-900 bg-opacity-50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-red-200 mb-4">Unable to load trending songs at the moment.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
          Trending Songs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
          {trendingSongs &&
            (trendingSongs as any).map((song: any) => (
              <div
                key={song.id}
                className="bg-gray-800 bg-opacity-50 rounded-lg p-4 md:p-6 text-center hover:bg-opacity-70 transition-all duration-300 cursor-pointer"
              >
                <Image
                  src={song.cover}
                  alt={song.title}
                  width={200}
                  height={200}
                  className="mx-auto rounded-lg mb-4 w-full h-auto"
                />
                <h3 className="text-lg md:text-xl font-bold mb-1">{song.title}</h3>
                <p className="text-gray-400 text-sm md:text-base">{song.artist}</p>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default Trending;