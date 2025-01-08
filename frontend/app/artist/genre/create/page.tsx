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
import React, { useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useMelodiousContext } from "@/contexts/melodious";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FileInputWithDragDrop from "@/components/FileInputwithDragandDrop";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

const CreateGenre = () => {
  const { uploadToIPFS, createGenre } = useMelodiousContext();
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
    const result = await createGenre(values);

    if (result) {
      toast({
        title: "Successfully created track song",
        description: "Create new track seamlessly",
      });
    }
    router.push("/artist/genre");
  }

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

          <FileInputWithDragDrop onDrop={onDropImage} />

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

export default CreateGenre;
