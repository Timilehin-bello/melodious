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
import React, { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import FileInputWithDragDrop from "@/components/FileInputwithDragandDrop";
import Dropzone from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMelodiousContext } from "@/contexts/melodious";
import { extractDuration } from "@/lib/extractDuration";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const SingleRelease = () => {
  const { uploadToIPFS, createSingleTrack } = useMelodiousContext();

  const router = useRouter();

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    // genreId: z.string({
    //   message: "Genre Id must be selected.",
    // }),

    genreId: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          return parseInt(val);
        }

        return val;
      },
      z.number({
        message: "Genre Id must be selected.",
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
    isPublished: z.string({
      message: "You must select an option",
    }),
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
    const genre = Number(values.genreId);

    const result = await createSingleTrack(values);

    if (result) {
      toast({
        title: "Successfully created track song",
        description: "Create new track seamlessly",
      });

      router.push("/artist/release");
    }
  }

  const handleDropSingle = useCallback(
    async (acceptedFiles: File[]) => {
      // Handle the files here
      if (acceptedFiles.length === 0) throw new Error("No file selected");

      const ipfsHash = await uploadToIPFS(acceptedFiles[0]);
      const durationOfSong = await extractDuration(acceptedFiles[0]);

      form.setValue("audioUrl", ipfsHash);
      form.setValue("duration", durationOfSong);
    },
    [uploadToIPFS]
  );

  const onDropImage = useCallback(
    async (acceptedFiles: File[]) => {
      // Handle the files here

      if (acceptedFiles.length === 0) throw new Error("No file selected");

      const ipfsHash = await uploadToIPFS(acceptedFiles[0]);
      form.setValue("imageUrl", ipfsHash);
    },
    [uploadToIPFS]
  );

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 p-4 border rounded shadow-lg w-full text-large"
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
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a music genre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Hip Hop</SelectItem>
                      <SelectItem value="2">Blues </SelectItem>
                      <SelectItem value="3">Country</SelectItem>
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

          {/* <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ISRC Code</FormLabel>
                <FormControl>
                  <Input placeholder="mikej" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          /> */}

          <div></div>
          <Button
            type="submit"
            className="w-full bg-[#950944] text-white hover:bg-[#950944]/60"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SingleRelease;
