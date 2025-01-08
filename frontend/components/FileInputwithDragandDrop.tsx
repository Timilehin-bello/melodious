// components/FileInputWithDragDrop.tsx

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UploadCloudIcon } from "lucide-react";

type Props = {
  onDrop: (acceptedFiles: File[]) => void;
};

const FileInputWithDragDrop: React.FC<Props> = ({ onDrop }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
    },
    maxSize: 5000000,
  });

  const formSchema = z.object({
    imageUrl: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
  });

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: "",
    },
  });

  return (
    <FormField
      control={form.control}
      name="imageUrl"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cover Image</FormLabel>

          <div
            {...getRootProps()}
            className={`p-6 border-2 border-dashed rounded ${
              isDragActive ? "border-blue-500" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <div className="text-center">
                <UploadCloudIcon size={48} className="mx-auto" />
                <p>Drag 'n' drop some files here, or Browse</p>
                <p className="text-sm text-gray-500">
                  Supported File Format: png, jpg, etc
                </p>
              </div>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};

export default FileInputWithDragDrop;
