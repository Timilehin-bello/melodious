"use client";
import BlockLoader from "@/components/BlockLoader";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import fetchMethod from "@/lib/readState";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Genre = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
};

const Genres = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchGenre = async () => {
    try {
      setLoading(true);
      const genreList: Genre[] = await fetchMethod("get_genres");
      if (Array.isArray(genreList)) {
        setTimeout(() => {
          setGenres(genreList);
          setLoading(false);
        }, 3000);
      } else {
        console.log("Fetched data is not an array");
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchGenre();
    // console.log("genre", genres);
  }, []);

  if (loading) {
    return <BlockLoader message="Loading Genres" />;
  }

  return (
    <div className="text-white mt-8 p-4">
      <div className="flex justify-between mb-14">
        <h2>Genre</h2>
        <Link
          href="/artist/genre/create"
          className="bg-[#D1E1E11C] text-white p-2 rounded-md"
        >
          Create
        </Link>
      </div>
      <Table>
        {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Image Url</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {genres.length !== 0 ? (
            genres.map((genre) => (
              <TableRow key={genre.id}>
                <TableCell className="font-medium">{genre.name}</TableCell>
                <TableCell>{genre.description}</TableCell>
                <TableCell>
                  {
                    <Link href={genre.imageUrl} target="_blank">
                      {genre.imageUrl}
                    </Link>
                  }
                </TableCell>
                <TableCell>
                  <Link
                    href={`/artist/genre/${genre.id}`}
                    className="bg-gray-400 p-2 rounded-md"
                  >
                    Edit
                  </Link>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3}>No records found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Genres;
