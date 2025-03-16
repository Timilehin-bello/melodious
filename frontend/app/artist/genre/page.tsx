"use client";
import BlockLoader from "@/components/BlockLoader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import fetchMethod from "@/lib/readState";
import Link from "next/link";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Pencil, ExternalLink, Music } from "lucide-react";
import Image from "next/image";
import { CreateGenreModal } from "@/components/Modal/CreateGenreModal";
import toast from "react-hot-toast";

type Genre = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

const Genres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  console.log("Genres", genres);

  const fetchGenre = useCallback(async () => {
    if (!mounted.current) return;

    try {
      setLoading(true);
      const genreList: Genre[] = await fetchMethod("get_genres");

      if (!Array.isArray(genreList)) {
        toast.error("Invalid data received from server");
        return;
      }

      // Only update state if component is still mounted
      if (mounted.current) {
        setGenres(genreList);
      }
    } catch (error) {
      if (mounted.current) {
        toast.error("Failed to fetch genres");
        console.error("Error fetching genres:", error);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Add this at the top of your component
  const mounted = useRef(false);

  // Use this useEffect for mounting/unmounting
  useEffect(() => {
    mounted.current = true;
    fetchGenre();

    return () => {
      mounted.current = false;
    };
  }, [fetchGenre]);

  if (loading) {
    return <BlockLoader message="Loading Genres" />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Genres</h1>
          <p className="text-gray-400">Manage your music genres</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-[#950944] text-white rounded-lg hover:bg-[#950944]/90 transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Genre
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl shadow-xl border border-white/10 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-white/5">
              <TableHead className="text-gray-300 font-semibold">
                Genre
              </TableHead>
              <TableHead className="text-gray-300 font-semibold">
                Description
              </TableHead>
              <TableHead className="text-gray-300 font-semibold">
                Cover Art
              </TableHead>
              <TableHead className="text-gray-300 font-semibold w-[100px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {genres.length > 0 ? (
              genres.map((genre) => (
                <TableRow
                  key={genre.id}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#950944]/20 flex items-center justify-center">
                        <Music className="w-4 h-4 text-[#950944]" />
                      </div>
                      <span>{genre.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {genre.description || "No description"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center space-x-2">
                      {genre.imageUrl && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                          <Image
                            src={genre.imageUrl}
                            alt={genre.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <Link
                        href={genre.imageUrl}
                        target="_blank"
                        className="text-[#950944] hover:text-[#950944]/80 inline-flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/artist/genre/${genre.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors duration-200"
                    >
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Music className="w-8 h-8 mb-2 text-gray-500" />
                    <p>No genres found</p>
                    <Link
                      href="/artist/genre/create"
                      className="text-[#950944] hover:text-[#950944]/80 mt-2"
                    >
                      Create your first genre
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateGenreModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchGenre();
        }}
      />
    </div>
  );
};

export default Genres;
