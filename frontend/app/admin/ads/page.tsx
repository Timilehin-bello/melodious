"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  Edit,
  Plus,
  Upload,
  Music,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import { useMelodiousContext } from "@/contexts/melodious";
import Image from "next/image";

interface Ad {
  id: number;
  title: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
}

// Banner Image Dropzone Component
const BannerImageDropzone: React.FC<{
  onFileUpload: (file: File) => void;
  uploading: boolean;
  preview: string;
  onRemove: () => void;
}> = ({ onFileUpload, uploading, preview, onRemove }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <div className="space-y-2">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${uploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <ImageIcon className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                {uploading
                  ? "Uploading..."
                  : isDragActive
                  ? "Drop image here"
                  : "Upload banner image"}
              </p>
              <p className="text-xs text-gray-500">
                Drag & drop or click to browse (max 10MB)
              </p>
              <p className="text-xs text-gray-500">
                Recommended: 16:9 aspect ratio, JPG/PNG
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <Image
            src={preview}
            alt="Banner preview"
            width={300}
            height={169}
            className="rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// Audio File Dropzone Component
const AudioFileDropzone: React.FC<{
  onFileUpload: (file: File) => void;
  uploading: boolean;
  fileName: string;
  onRemove: () => void;
}> = ({ onFileUpload, uploading, fileName, onRemove }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  return (
    <div className="space-y-2">
      {!fileName ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${uploading ? "pointer-events-none opacity-50" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <Music className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-sm font-medium">
                {uploading
                  ? "Uploading..."
                  : isDragActive
                  ? "Drop audio here"
                  : "Upload audio file"}
              </p>
              <p className="text-xs text-gray-500">
                Drag & drop or click to browse (max 50MB)
              </p>
              <p className="text-xs text-gray-500">
                Recommended: MP3 format, 30-60 seconds
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <Music className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-gray-500">Audio file uploaded</p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default function AdminAdsPage() {
  const { uploadToIPFS } = useMelodiousContext();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    audioUrl: "",
    duration: 30,
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Get auth token
  const getAuthToken = () => {
    const data = localStorage.getItem("xx-mu");
    return data ? JSON.parse(data)?.tokens?.token?.access?.token : null;
  };

  // Fetch ads
  const fetchAds = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated - please log in first");
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/ads`;
      console.log("Fetching ads from:", apiUrl);
      console.log("Using token:", token ? "Token present" : "No token");

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log("API response:", result);
        setAds(result.data?.ads || []);
      } else {
        const errorText = await response.text();
        console.error("API error response:", errorText);
        toast.error(
          `Failed to fetch ads: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error(`Error fetching ads: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Create ad
  const createAd = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated - please log in first");
        return;
      }

      console.log("Creating ad with data:", formData);
      const apiUrl = `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/ads`;
      console.log("POST to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log("Create response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Create response:", result);
        toast.success("Ad created successfully");
        setShowCreateForm(false);
        resetForm();
        fetchAds();
      } else {
        const errorText = await response.text();
        console.error("Create error response:", errorText);
        try {
          const error = JSON.parse(errorText);
          toast.error(error.message || "Failed to create ad");
        } catch {
          toast.error(
            `Failed to create ad: ${response.status} ${response.statusText}`
          );
        }
      }
    } catch (error) {
      console.error("Error creating ad:", error);
      toast.error(`Error creating ad: ${error}`);
    }
  };

  // Update ad
  const updateAd = async (adId: number) => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/ads/${adId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Ad updated successfully");
        setEditingAd(null);
        resetForm();
        fetchAds();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to update ad");
      }
    } catch (error) {
      console.error("Error updating ad:", error);
      toast.error("Error updating ad");
    }
  };

  // Delete ad
  const deleteAd = async (adId: number) => {
    if (!confirm("Are you sure you want to delete this ad?")) return;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_ENDPOINT}/ads/${adId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Ad deleted successfully");
        fetchAds();
      } else {
        toast.error("Failed to delete ad");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("Error deleting ad");
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const url = await uploadToIPFS(file);
      setFormData({ ...formData, imageUrl: url });
      setImagePreview(url);
      setImageFile(file);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle audio upload
  const handleAudioUpload = async (file: File) => {
    setUploadingAudio(true);
    try {
      const url = await uploadToIPFS(file);
      setFormData({ ...formData, audioUrl: url });
      setAudioFileName(file.name);
      setAudioFile(file);

      // Extract audio duration
      const audio = document.createElement("audio");
      audio.src = URL.createObjectURL(file);
      audio.addEventListener("loadedmetadata", () => {
        setFormData((prev) => ({
          ...prev,
          duration: Math.floor(audio.duration),
        }));
        URL.revokeObjectURL(audio.src);
      });

      toast.success("Audio uploaded successfully!");
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to upload audio");
    } finally {
      setUploadingAudio(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      audioUrl: "",
      duration: 30,
      isActive: true,
    });
    setImagePreview("");
    setAudioFileName("");
    setImageFile(null);
    setAudioFile(null);
  };

  const startEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      imageUrl: ad.imageUrl,
      audioUrl: ad.audioUrl,
      duration: ad.duration,
      isActive: ad.isActive,
    });
    setImagePreview(ad.imageUrl);
    const filename = ad.audioUrl.split("/").pop() || "";
    setAudioFileName(filename);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <div className="container md:w-[850px] mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Ad Management</h1>
        <Button
          className="bg-white text-black hover:bg-gray-200"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </div>

      {/* Instructions Card */}
      {!showCreateForm && !editingAd && ads.length === 0 && (
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Getting Started with Ads</h3>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>
                • Ads will play automatically based on the frequency set in your
                environment configuration
              </li>
              <li>
                • Use the drag & drop upload areas to upload files directly to
                IPFS
              </li>
              <li>• Recommended audio format: MP3 (30-60 seconds, max 50MB)</li>
              <li>
                • Recommended image format: JPG/PNG (16:9 aspect ratio, max
                10MB)
              </li>
              <li>
                • Audio duration will be automatically detected from uploaded
                files
              </li>
              <li>• Non-premium users will see ads at regular intervals</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingAd) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingAd ? "Edit Ad" : "Create New Ad"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Ad title"
              />
            </div>
            <div>
              <Label>Banner Image</Label>
              <div className="space-y-4">
                {/* Upload Dropzone */}
                <BannerImageDropzone
                  onFileUpload={handleImageUpload}
                  uploading={uploadingImage}
                  preview={imagePreview}
                  onRemove={() => {
                    setImagePreview("");
                    setFormData({ ...formData, imageUrl: "" });
                    setImageFile(null);
                  }}
                />

                {/* Alternative: Manual URL Input */}
                <div className="text-center text-sm text-gray-500">or</div>
                <Input
                  placeholder="Enter image URL manually"
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                />
              </div>
            </div>
            <div>
              <Label>Audio File</Label>
              <div className="space-y-4">
                {/* Upload Dropzone */}
                <AudioFileDropzone
                  onFileUpload={handleAudioUpload}
                  uploading={uploadingAudio}
                  fileName={audioFileName}
                  onRemove={() => {
                    setAudioFileName("");
                    setFormData({ ...formData, audioUrl: "" });
                    setAudioFile(null);
                  }}
                />

                {/* Alternative: Manual URL Input */}
                <div className="text-center text-sm text-gray-500">or</div>
                <Input
                  placeholder="Enter audio URL manually"
                  value={formData.audioUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, audioUrl: e.target.value });
                    const filename = e.target.value.split("/").pop() || "";
                    setAudioFileName(filename);
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value),
                  })
                }
                min={1}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() =>
                  editingAd ? updateAd(editingAd.id) : createAd()
                }
              >
                {editingAd ? "Update" : "Create"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingAd(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ads List */}
      {loading ? (
        <p>Loading ads...</p>
      ) : (
        <div className="grid gap-4">
          {ads.length === 0 ? (
            <p className="text-center text-gray-500">
              No ads found. Create your first ad!
            </p>
          ) : (
            ads.map((ad) => (
              <Card key={ad.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.svg?height=80&width=80";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <p className="text-sm text-gray-600">
                          Duration: {ad.duration}s
                        </p>
                        <p className="text-sm text-gray-600">
                          Status:{" "}
                          <span
                            className={
                              ad.isActive ? "text-green-600" : "text-red-600"
                            }
                          >
                            {ad.isActive ? "Active" : "Inactive"}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(ad.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(ad)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAd(ad.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
