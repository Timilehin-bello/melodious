"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMelodiousContext } from "@/contexts/melodious";
import toast from "react-hot-toast";
import Image from "next/image";
import BlockLoader from "../BlockLoader";

interface CreateGenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." }),
  imageUrl: z.string({ message: "Please select a file" }),
});

export const CreateGenreModal: React.FC<CreateGenreModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const { uploadToIPFS, createGenre } = useMelodiousContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const onDropImage = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast.error("Please select a valid image file");
        return;
      }

      setLoading(true);
      try {
        const ipfsHash = await uploadToIPFS(acceptedFiles[0]);
        if (ipfsHash) {
          form.setValue("imageUrl", ipfsHash);
          setFileUrl(ipfsHash);
        }
      } catch (error) {
        toast.error("Failed to upload image");
      } finally {
        setLoading(false);
      }
    },
    [uploadToIPFS, form]
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!fileUrl) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    try {
      const result = await createGenre(values);
      if (result) {
        toast.success("Genre created successfully");
        form.reset();
        setFileUrl(null);
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error("Failed to create genre");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <BlockLoader message="Processing..." />;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#181425] p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center mb-6"
                >
                  <h3 className="text-2xl font-semibold text-white">
                    Create New Genre
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </Dialog.Title>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">
                            Genre Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Jazz, Rock, Classical"
                              {...field}
                              className="bg-white/5 border-white/10 text-white"
                            />
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
                          <FormLabel className="text-white">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe this genre..."
                              className="bg-white/5 border-white/10 text-white resize-none h-24"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormLabel className="text-white">Genre Cover</FormLabel>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div
                            onClick={() =>
                              document.getElementById("file-upload")?.click()
                            }
                            className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center cursor-pointer hover:border-[#950944] transition-colors"
                          >
                            <input
                              id="file-upload"
                              type="file"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) {
                                  onDropImage([e.target.files[0]]);
                                }
                              }}
                              accept="image/*"
                            />
                            <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-400">
                              Click to upload image
                            </p>
                          </div>
                        </div>
                        {fileUrl && (
                          <div className="w-24 h-24 relative rounded-lg overflow-hidden">
                            <Image
                              src={fileUrl}
                              alt="Genre cover"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white/10 text-white hover:bg-white/20"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-[#950944] text-white hover:bg-[#950944]/90"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Genre"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
