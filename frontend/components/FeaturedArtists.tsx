"use client";
import React from "react";
import Image from "next/image";
import useFetch from "@/hooks/useFetch";

const FeaturedArtists = () => {
  const {
    data: featuredArtists,
    loading,
    error,
  } = useFetch("/api/artists/featured");

  if (loading) {
    return (
      <section className="bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
            Featured Artists
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-12">
            Featured Artists
          </h2>
          <div className="bg-red-900 bg-opacity-50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-red-200 mb-4">Unable to load featured artists at the moment.</p>
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
    <section className="bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900 text-white py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">
          Featured Artists
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {featuredArtists &&
            (featuredArtists as any).map((artist: any) => (
              <div 
                key={artist.id} 
                className="text-center group cursor-pointer hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="relative overflow-hidden rounded-full mx-auto mb-4 w-32 h-32 md:w-40 md:h-40">
                  <Image
                    src={artist.avatar}
                    alt={artist.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                  {artist.name}
                </h3>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtists;