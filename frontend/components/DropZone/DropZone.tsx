"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

interface DropZoneProps {
  title: string;
  heading: string;
  subHeading: string;
  setImageUrl: (url: string) => void;
  uploadToIPFS: (file: File) => Promise<string>;
}

const DropZone: React.FC<DropZoneProps> = ({
  title,
  heading,
  subHeading,
  setImageUrl,
  uploadToIPFS,
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFile: File[]) => {
      if (acceptedFile.length === 0) throw new Error("No file selected");

      console.log("Accepted file:", acceptedFile);

      const url = await uploadToIPFS(acceptedFile[0]);
      setFileUrl(url);
      setImageUrl(url);
    },
    [uploadToIPFS, setImageUrl]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg"],
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
    },
    maxSize: 5000000,
  });
  return (
    <div className="flex items-center justify-center">
      <div
        className="border-2 cursor-pointer border-dashed rounded-md h-52 mx-auto w-[400px] border-[#FFC0CB] flex items-center justify-center p-4"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col text-center items-center justify-center">
          <div className="p-4">
            <Image
              src={"/images/upload.svg"}
              alt="upload"
              width={60}
              height={60}
              objectFit="contain"
              className="w-auto h-auto"
            />
          </div>
          <span className="text-base text-[#454545] font-bold">
            {heading} <span className="text-[#FFC0CB]">{subHeading}</span>
          </span>

          <p className="text-[#676767] text-xs">{title}</p>
        </div>
      </div>

      {fileUrl && (
        <aside className="mx-0 max-w-[400px]">
          <div className="mx-0">
            <Image src={fileUrl} alt="nft image" width={200} height={200} />
            {/* <audio controls className="w-full">
              <source src={fileUrl} />
              Your browser does not support the audio element.
            </audio> */}
          </div>
        </aside>
      )}
    </div>
  );
};

export default DropZone;
