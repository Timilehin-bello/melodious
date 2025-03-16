"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FileInputWithDragDrop from "@/components/FileInputwithDragandDrop";
import Dropzone from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMelodiousContext } from "@/contexts/melodious";
import {
  extractDuration,
  extractDurationInSeconds,
} from "@/lib/extractDuration";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import fetchMethod from "@/lib/readState";
import BlockLoader from "./BlockLoader";
import Image from "next/image";

const SingleRelease = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [genreList, setGenreList] = useState<any[]>([]);
  const { uploadToIPFS, createSingleTrack } = useMelodiousContext();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const [myAudio, setMyAudio] = useState<string | null>(null);

  const router = useRouter();

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),

    genreId: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          return parseInt(val);
        }

        return val;
      },
      z.number({
        message: "Genre must be selected.",
      })
    ),

    isrcCode: z.string().min(2, {
      message: "ISRC Code must be at least 2 characters.",
    }),
    audioUrl: z.string({
      message: "You must select a song file",
    }),
    imageUrl: z.string({
      message: "You must select a file",
    }),
    isPublished: z.string().nonempty("Please select an option."),
    duration: z
      .string({
        message: "You must enter a duration",
      })
      .optional(),
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      isrcCode: "",
      genreId: 0,
      audioUrl: "",
      imageUrl: "",
      isPublished: "",
      duration: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!myAudio || !fileUrl) {
      toast.error("Please select a file");
      return;
    }

    setLoadingRequest(true);
    const genre = Number(values.genreId);

    const result = await createSingleTrack(values);

    if (result) {
      setLoadingRequest(false);
      router.push("/artist/release");
    } else {
      toast.error("Failed to create track");
      setLoadingRequest(false);
    }
  }

  const handleDropSingle = useCallback(
    async (acceptedFiles: File[]) => {
      // Handle the files here
      console.log("acceptedFiles", acceptedFiles);
      if (acceptedFiles.length === 0) {
        toast.error(
          "File size too large. Please select a file that is 6MB or less"
        );
        return;
      }

      setLoading(true);
      const ipfsHash = await uploadToIPFS(acceptedFiles[0]);
      if (ipfsHash) {
        setMyAudio(ipfsHash);
        const durationOfSong = await extractDuration(acceptedFiles[0]);
        form.setValue("audioUrl", ipfsHash);
        form.setValue("duration", durationOfSong);
        setLoading(false);
      }
    },
    [uploadToIPFS, setMyAudio]
  );

  const onDropImage = useCallback(
    async (acceptedFiles: File[]) => {
      // Handle the files here

      console.log("acceptedFiles", acceptedFiles);
      if (acceptedFiles.length === 0) {
        toast.error(
          "File size too large. Please select a file that is 6MB or less"
        );
        return;
      }

      setLoading(true);
      const ipfsHash = await uploadToIPFS(acceptedFiles[0]);
      if (ipfsHash) {
        setFileUrl(ipfsHash);
        form.setValue("imageUrl", ipfsHash);
        setLoading(false);
      }
    },
    [uploadToIPFS, setFileUrl]
  );

  const fetchTracks = async () => {
    try {
      // setLoading(true);
      const genreList: any[] = await fetchMethod("get_genres");
      // console.log("genreList", genreList);
      if (Array.isArray(genreList)) {
        setTimeout(() => {
          setGenreList(genreList);
          // setLoading(false);
        }, 3000);
      } else {
        console.log("Fetched data is not an array");
        // setLoading(false);
      }
    } catch (error) {
      console.log(error);
      // setLoading(false);
    }
  };
  useEffect(() => {
    fetchTracks();
  }, []);

  if (loading) {
    return <BlockLoader message="Uploading File" />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white">Single Release</h2>
        <p className="text-gray-400 mt-2">
          Upload your track and fill in the details below
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Main Content Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Upload Section */}
            <div className="space-y-6">
              <div className=" p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold mb-4">Media Files</h3>

                {/* Cover Art Upload */}
                <div className="mb-6">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Cover Art</FormLabel>
                        <div className="mt-2">
                          {fileUrl ? (
                            <div className="relative group">
                              <Image
                                src={fileUrl}
                                alt="Track cover"
                                width={200}
                                height={200}
                                className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Dropzone
                                  onDrop={onDropImage}
                                  multiple={false}
                                  accept={{
                                    "image/*": [".png", ".jpg", ".jpeg"],
                                  }}
                                >
                                  {({ getRootProps, getInputProps }) => (
                                    <button
                                      type="button"
                                      {...getRootProps()}
                                      className="text-white text-sm bg-gray-800 px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                                    >
                                      <input {...getInputProps()} />
                                      Change Image
                                    </button>
                                  )}
                                </Dropzone>
                              </div>
                            </div>
                          ) : (
                            <FileInputWithDragDrop onDrop={onDropImage} />
                          )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Audio Upload */}
                <FormField
                  control={form.control}
                  name="audioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Audio Track</FormLabel>
                      <div className="mt-2">
                        <Dropzone
                          onDrop={handleDropSingle}
                          multiple={false}
                          accept={{
                            "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
                          }}
                          maxSize={6000000}
                        >
                          {({ getRootProps, getInputProps }) => (
                            <div
                              {...getRootProps()}
                              className="border-2 border-dashed border-gray-200 hover:border-[#950944] p-6 rounded-lg text-center cursor-pointer transition-colors"
                            >
                              <input {...getInputProps()} />
                              <div className="text-center">
                                <UploadCloud
                                  size={48}
                                  className="mx-auto text-gray-400"
                                />
                                <p className="mt-2 text-sm text-gray-600">
                                  Drag and drop your song here, or click to
                                  select
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Supported formats: WAV, FLAC, MP3 (Max 5MB)
                                </p>
                              </div>
                            </div>
                          )}
                        </Dropzone>
                        {myAudio && (
                          <div className="mt-4">
                            <audio controls className="w-full">
                              <source src={myAudio} />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Right Column - Track Details */}
            <div className=" p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-xl font-semibold mb-4">Track Details</h3>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Song Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter song title"
                        {...field}
                        className="focus:ring-[#950944] focus:border-[#950944]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genreId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Genre</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="focus:ring-[#950944] focus:border-[#950944]">
                          <SelectValue placeholder="Select a music genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genreList.map((genre) => (
                          <SelectItem
                            className="cursor-pointer"
                            key={genre.id}
                            value={genre.id.toString()}
                          >
                            {genre.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isrcCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">ISRC Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter ISRC code"
                        {...field}
                        className="focus:ring-[#950944] focus:border-[#950944]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">
                      Publishing Status
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-6"
                      >
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem
                              value="true"
                              className="border-2 border-gray-300 text-white data-[state=checked]:border-[#950944] data-[state=checked]:bg-[#950944]"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Publish Now
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <RadioGroupItem
                              value="false"
                              className="border-2 border-gray-300 text-white data-[state=checked]:border-[#950944] data-[state=checked]:bg-[#950944]"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            Save as Draft
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <Button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-[#950944] text-white hover:bg-[#950944]/90 transition-colors rounded-lg font-medium"
              disabled={loadingRequest}
            >
              {loadingRequest ? (
                <div className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Creating Track...
                </div>
              ) : (
                "Create Track"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SingleRelease;
