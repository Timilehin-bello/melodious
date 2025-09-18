"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Removed Switch import as it doesn't exist
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "react-hot-toast";

interface Ad {
  id: number;
  title: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminAdsPage() {
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

      const apiUrl = `http://localhost:8088/v1/ads`;
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
        toast.error(`Failed to fetch ads: ${response.status} ${response.statusText}`);
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
      // const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/v1/ads`;
      const apiUrl = `http://localhost:8088/v1/ads`;
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
          toast.error(`Failed to create ad: ${response.status} ${response.statusText}`);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/ads/${adId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/ads/${adId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  const resetForm = () => {
    setFormData({
      title: "",
      imageUrl: "",
      audioUrl: "",
      duration: 30,
      isActive: true,
    });
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
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ad Management</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </div>

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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ad title"
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <Label htmlFor="audioUrl">Audio URL</Label>
              <Input
                id="audioUrl"
                value={formData.audioUrl}
                onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                placeholder="https://example.com/audio.mp3"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => editingAd ? updateAd(editingAd.id) : createAd()}
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
            <p className="text-center text-gray-500">No ads found. Create your first ad!</p>
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
                          (e.target as HTMLImageElement).src = "/placeholder.svg?height=80&width=80";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        <p className="text-sm text-gray-600">Duration: {ad.duration}s</p>
                        <p className="text-sm text-gray-600">
                          Status: <span className={ad.isActive ? "text-green-600" : "text-red-600"}>
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