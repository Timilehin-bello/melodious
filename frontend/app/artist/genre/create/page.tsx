"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useCallback, useState } from "react";
// import { toast } from "@/hooks/use-toast";
import { useMelodiousContext } from "@/contexts/melodious";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FileInputWithDragDrop from "@/components/FileInputwithDragandDrop";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import BlockLoader from "@/components/BlockLoader";
import toast from "react-hot-toast";
import Image from "next/image";

const CreateGenre = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const { uploadToIPFS, createGenre } = useMelodiousContext();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const router = useRouter();

  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    description: z.string().min(2, {
      message: "Description must be at least 2 characters.",
    }),
    imageUrl: z.string({
      message: "Please select a file",
    }),
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!fileUrl) {
      toast.error("Please select a file");
      return;
    }

    setLoadingRequest(true);
    const result = await createGenre(values);

    if (result) {
      // toast({
      //   title: "Successfully created track song",
      //   description: "Create new track seamlessly",
      // });
      // toast.success("Successfully created track song");
      setTimeout(() => {
        setLoadingRequest(false);
        router.push("/artist/genre");
      }, 3000);
    } else {
      toast.error("Failed to create genre");
      setLoadingRequest(false);
    }
  }

  const onDropImage = useCallback(
    async (acceptedFiles: File[]) => {
      // Handle the files here

      if (acceptedFiles.length === 0) throw new Error("No file selected");
      setLoading(true);
      const ipfsHash = await uploadToIPFS(acceptedFiles[0]);
      if (ipfsHash) {
        form.setValue("imageUrl", ipfsHash);
        setFileUrl(ipfsHash);
        setLoading(false);
      }
    },
    [uploadToIPFS, setFileUrl]
  );

  if (loading) {
    return <BlockLoader message="Uploading Genre Cover Image ..." />;
  }
  return (
    <div className="p-4 text-white">
      <h1>Create Genre</h1>
      <p className="mb-12 text-gray-300">
        You can create different kinds of genre
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="  rounded shadow-lg w-full text-large"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Joshua Carter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us more about the genre"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1">
              <FileInputWithDragDrop onDrop={onDropImage} />
            </div>

            {fileUrl && (
              <div className="mx-0 max-w-[500px] flex-1 ">
                <div className="mx-0">
                  <Image
                    src={fileUrl}
                    alt="Genre image"
                    width={150}
                    height={100}
                    className="rounded-lg pt-12 pb-6"
                  />
                  {/* <audio controls className="w-full">
                      <source src={fileUrl} />
                      Your browser does not support the audio element.
                    </audio> */}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#950944] text-white hover:bg-[#950944]/60"
            disabled={loadingRequest}
          >
            {loadingRequest ? "Submitting ..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CreateGenre;
