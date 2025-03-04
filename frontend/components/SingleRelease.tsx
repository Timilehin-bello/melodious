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
      // router.push("/artist/release");
    } else {
      toast.error("Failed to create track");
      setLoadingRequest(false);
    }
  }

  const handleDropSingle = useCallback(
    async (acceptedFiles: File[]) => {
      // Handle the files here
      if (acceptedFiles.length === 0) throw new Error("No file selected");
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

      if (acceptedFiles.length === 0) throw new Error("No file selected");
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
    <div>
      <h2 className="p-4 text-4wl font-bold">Single Release</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 p-4  rounded shadow-lg w-full text-large"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Song Title</FormLabel>
                <FormControl>
                  <Input placeholder="Joshua Carter" {...field} />
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
                <FormLabel>Genre</FormLabel>
                <FormControl>
                  <Select
                    value={field.value?.toString()}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a music genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genreList &&
                        genreList.map((genre, index) => (
                          <SelectItem key={index} value={genre.id}>
                            {genre.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isrcCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ISRC Code</FormLabel>
                <FormControl>
                  <Input placeholder="193028282" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Is Published?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value.toString()}
                    className="flex  space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="true"
                          className="border-white bg-white"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem
                          value="false"
                          className="border-white bg-white"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FileInputWithDragDrop onDrop={onDropImage} />

          <FormField
            control={form.control}
            name="audioUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio File</FormLabel>
                <div className="mb-4">
                  <Dropzone
                    onDrop={handleDropSingle}
                    multiple={false}
                    accept={{ "audio/*": [".mp3", ".wav", ".ogg", ".m4a"] }}
                    maxSize={5000000}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <div
                        {...getRootProps()}
                        className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer"
                      >
                        <input {...getInputProps()} />
                        <div className="text-center">
                          <UploadCloud size={48} className="mx-auto" />
                          <p>
                            Drag and drop your song here, or click to select a
                            file
                          </p>
                          <p>Audio file must be WAV, FLAC, mp3.</p>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-between col-span-2">
            <div className="flex-1">
              {fileUrl && (
                <div className="mx-0 max-w-[500px] flex-1 ">
                  <div className="mx-0">
                    <Image
                      src={fileUrl}
                      alt="Track image"
                      width={200}
                      height={200}
                      className="rounded-lg "
                    />
                    {/* <audio controls className="w-full">
                                      <source src={fileUrl} />
                                      Your browser does not support the audio element.
                                    </audio> */}
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1">
              {myAudio && (
                <div className="mx-0 max-w-[500px] flex-1 ">
                  <div className="mx-0">
                    <audio controls className="w-full">
                      <source src={myAudio} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end col-span-2">
            <Button
              type="submit"
              className="w-full bg-[#950944] text-white hover:bg-[#950944]/60"
              disabled={loadingRequest}
            >
              {loadingRequest ? "Creating Track ..." : "Create Track"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SingleRelease;
