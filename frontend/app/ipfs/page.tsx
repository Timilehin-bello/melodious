"use client";

import DropZone from "@/components/DropZone/DropZone";
import { useMelodiousContext } from "@/contexts/melodious";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [imageUrl, setImageUrl] = useState("");

  const { uploadToIPFS } = useMelodiousContext();

  useEffect(() => {
    // const user = createUser();
    // console.log("User created with transaction hash:", user);
    console.log(imageUrl);
  }, [
    imageUrl,
    // createUser
  ]);
  return (
    <div>
      <div className="w-full">
        <DropZone
          title="Supported htmlFormates: JPEG, PNG"
          heading="Drag & drop file or browse"
          subHeading="or Browse"
          uploadToIPFS={uploadToIPFS}
          setImageUrl={setImageUrl}
        />
        {/* <div className="flex justify-center">
          <Image src={imageUrl} alt="song image" width={200} height={200} />
        </div> */}
      </div>
    </div>
  );
};

export default Page;
