import { useMelodiousContext } from "@/contexts/melodious";
import { useState } from "react";
import Dropzone from "react-dropzone";
import ReuseableModal from "./Modal/ReuseableModal";

interface SongMetadata {
  file: File;
  title: string;
  description: string;
  genre: string;
  image?: File;
  duration?: string;
}

type UploadType = {
  uploadType: string | null;
  setUploadType?: (type: "single" | "album") => void;
  handleUpload?: () => void;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  loading?: boolean;
  setLoading?: (loading: boolean) => void;
  albumName?: string;
  setAlbumName?: (name: string) => void;
  songs?: SongMetadata[];
};

const MusicUpload = ({
  uploadType,
  setUploadType,
  handleUpload,
  modalOpen,
  setModalOpen,
}: UploadType) => {
  const [albumName, setAlbumName] = useState("");
  const [songs, setSongs] = useState<SongMetadata[]>([]);
  const [singleSong, setSingleSong] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const { uploadToIPFS } = useMelodiousContext();

  const extractDuration = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        const duration = Math.floor(audio.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        resolve(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      });
      audio.addEventListener("error", () =>
        reject("Error extracting duration")
      );
    });
  };

  //   const handleUpload = async () => {
  //     setLoading(true);
  //     setStatus("");
  //     try {
  //       if (uploadType === "album") {
  //         if (!albumName) {
  //           alert("Please provide an album name.");
  //           return;
  //         }
  //         if (!songs.length) {
  //           alert("Please upload at least one song.");
  //           return;
  //         }
  //         const ipfsResults = await Promise.all(
  //           songs.map(
  //             async ({ file, title, description, genre, image, duration }) => {
  //               const ipfsHash = await uploadToIPFS(file);
  //               const imageHash = image ? await uploadToIPFS(image) : null;
  //               return {
  //                 title,
  //                 description,
  //                 genre,
  //                 ipfsHash,
  //                 imageHash,
  //                 duration,
  //               };
  //             }
  //           )
  //         );
  //         setStatus(
  //           `Album '${albumName}' uploaded with songs: ${JSON.stringify(
  //             ipfsResults,
  //             null,
  //             2
  //           )}`
  //         );
  //       } else if (uploadType === "single") {
  //         if (!singleSong) {
  //           alert("Please upload a song.");
  //           return;
  //         }
  //         const ipfsHash = await uploadToIPFS(singleSong);
  //         setStatus(`Single song uploaded with hash: ${ipfsHash}`);
  //       }
  //     } catch (error) {
  //       setStatus("Error during upload.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  const handleDropSingle = (acceptedFiles: File[]) => {
    setSingleSong(acceptedFiles[0]);
  };

  const handleDropAlbum = async (acceptedFiles: File[]) => {
    const newSongs = await Promise.all(
      acceptedFiles.map(async (file) => {
        const duration = await extractDuration(file);
        return {
          file,
          title: "",
          description: "",
          genre: "",
          image: undefined,
          duration,
        };
      })
    );
    setSongs([...songs, ...newSongs]);
  };

  const updateSongMetadata = (
    index: number,
    field: keyof Omit<SongMetadata, "file">,
    value: string | File
  ) => {
    const updatedSongs = [...songs];
    updatedSongs[index] = { ...updatedSongs[index], [field]: value };
    setSongs(updatedSongs);
  };

  const removeSong = (index: number) => {
    setSongs(songs.filter((_, i) => i !== index));
  };

  return (
    <div className="">
      <div className="max-w-4xl mx-auto  rounded-lg p-8">
        <ReuseableModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(modalOpen)}
          title={`Upload ${uploadType === "single" ? "Single Song" : "Album"}`}
        >
          {uploadType === "album" && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Album Name
              </label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-900"
                placeholder="Enter album name"
              />
            </div>
          )}

          {uploadType === "single" && (
            <div className="mb-4">
              <Dropzone
                onDrop={handleDropSingle}
                multiple={false}
                accept={{ "audio/*": [] }}
              >
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <p>
                      Drag and drop your song here, or click to select a file
                    </p>
                  </div>
                )}
              </Dropzone>
              {singleSong && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {singleSong.name}
                </p>
              )}
            </div>
          )}

          {uploadType === "album" && (
            <div className="mb-4">
              <Dropzone onDrop={handleDropAlbum} accept={{ "audio/*": [] }}>
                {({ getRootProps, getInputProps }) => (
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center cursor-pointer"
                  >
                    <input {...getInputProps()} />
                    <p>
                      Drag and drop your songs here, or click to select files
                    </p>
                  </div>
                )}
              </Dropzone>
              {songs.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {songs.map((song, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded-md p-4 flex flex-col justify-between"
                    >
                      <div>
                        <p className="text-sm text-gray-600 mb-2 font-semibold">
                          {song.file.name}
                        </p>
                        <label className="block text-sm font-medium mb-1">
                          Song Title
                        </label>
                        <input
                          type="text"
                          value={song.title}
                          onChange={(e) =>
                            updateSongMetadata(index, "title", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md mb-2"
                          placeholder="Enter song title"
                        />
                        <label className="block text-sm font-medium mb-1">
                          Description
                        </label>
                        <textarea
                          value={song.description}
                          onChange={(e) =>
                            updateSongMetadata(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md mb-2"
                          placeholder="Enter song description"
                        ></textarea>
                        <label className="block text-sm font-medium mb-1">
                          Genre
                        </label>
                        <input
                          type="text"
                          value={song.genre}
                          onChange={(e) =>
                            updateSongMetadata(index, "genre", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md mb-2"
                          placeholder="Enter song genre"
                        />
                        <label className="block text-sm font-medium mb-1">
                          Duration
                        </label>
                        <p className="text-sm text-gray-600 mb-2">
                          {song.duration || "Calculating..."}
                        </p>
                        <label className="block text-sm font-medium mb-1">
                          Song Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            updateSongMetadata(
                              index,
                              "image",
                              e.target.files?.[0] || ""
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-md mb-2"
                        />
                      </div>
                      <button
                        onClick={() => removeSong(index)}
                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Remove Song
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-6 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
          {status && (
            <p className="mt-4 text-center text-sm text-gray-700 whitespace-pre-wrap">
              {status}
            </p>
          )}
        </ReuseableModal>
      </div>
    </div>
  );
};

export default MusicUpload;
