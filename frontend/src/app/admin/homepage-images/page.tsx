"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface HomepageImage {
  _id?: string;
  position: "left" | "right";
  imageUrl: string;
  altText: string;
}

export default function HomepageImagesPage() {
  const [images, setImages] = useState<HomepageImage[]>([]);
  const [leftImage, setLeftImage] = useState({
    imageUrl: "",
    altText: "Woman in sustainable fashion",
  });
  const [rightImage, setRightImage] = useState({
    imageUrl: "",
    altText: "Man in sustainable clothing",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ left: false, right: false });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchHomepageImages();
  }, []);

  const fetchHomepageImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/homepage/images`
      );

      if (response.ok) {
        const data = await response.json();
        setImages(data);

        // Set current images
        const leftImg = data.find(
          (img: HomepageImage) => img.position === "left"
        );
        const rightImg = data.find(
          (img: HomepageImage) => img.position === "right"
        );

        if (leftImg) {
          setLeftImage({
            imageUrl: leftImg.imageUrl,
            altText: leftImg.altText,
          });
        }
        if (rightImg) {
          setRightImage({
            imageUrl: rightImg.imageUrl,
            altText: rightImg.altText,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching homepage images:", error);
      setError("Failed to fetch homepage images");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, position: "left" | "right") => {
    try {
      setUploading((prev) => ({ ...prev, [position]: true }));

      const formData = new FormData();
      formData.append("images", file);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.images[0].imageUrl;

        if (position === "left") {
          setLeftImage((prev) => ({ ...prev, imageUrl }));
        } else {
          setRightImage((prev) => ({ ...prev, imageUrl }));
        }
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
     
    } finally {
      setUploading((prev) => ({ ...prev, [position]: false }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login?redirect=/admin/homepage-images");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/homepage/images`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leftImage,
            rightImage,
          }),
        }
      );

      if (response.ok) {
        alert("Homepage images updated successfully!");
        fetchHomepageImages();
      } else {
        throw new Error("Failed to update homepage images");
      }
    } catch (error) {
      console.error("Error updating homepage images:", error);
      alert("Failed to update homepage images");
    } finally {
      setSaving(false);
    }
  };

  const getFullImageUrl = (imagePath: string) => {
    if (!imagePath) return "/placeholder.svg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath.replace(/^http:\/\//, "https://");
    }
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return `${process.env.NEXT_PUBLIC_API_URL}/${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading homepage images...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Homepage Images</h1>
          <p className="text-gray-600 mt-2">
            Manage the two main images displayed on the homepage
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#8B7355] hover:bg-[#7A6449]"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-6">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Image */}
        <Card>
          <CardHeader>
            <CardTitle>Left Image</CardTitle>
            <CardDescription>
              The first image in the product images section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="left-image">Upload Image</Label>
              <Input
                id="left-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "left");
                }}
                disabled={uploading.left}
              />
              {uploading.left && (
                <p className="text-sm text-gray-600">Uploading...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="left-alt">Alt Text</Label>
              <Input
                id="left-alt"
                value={leftImage.altText}
                onChange={(e) =>
                  setLeftImage((prev) => ({ ...prev, altText: e.target.value }))
                }
                placeholder="Image description for accessibility"
              />
            </div>

            {leftImage.imageUrl && (
              <div className="space-y-2">
                <Label>Current Image</Label>
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={
                      getFullImageUrl(leftImage.imageUrl) || "/placeholder.svg"
                    }
                    alt={leftImage.altText}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Image */}
        <Card>
          <CardHeader>
            <CardTitle>Right Image</CardTitle>
            <CardDescription>
              The second image in the product images section
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="right-image">Upload Image</Label>
              <Input
                id="right-image"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, "right");
                }}
                disabled={uploading.right}
              />
              {uploading.right && (
                <p className="text-sm text-gray-600">Uploading...</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="right-alt">Alt Text</Label>
              <Input
                id="right-alt"
                value={rightImage.altText}
                onChange={(e) =>
                  setRightImage((prev) => ({
                    ...prev,
                    altText: e.target.value,
                  }))
                }
                placeholder="Image description for accessibility"
              />
            </div>

            {rightImage.imageUrl && (
              <div className="space-y-2">
                <Label>Current Image</Label>
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={
                      getFullImageUrl(rightImage.imageUrl) || "/placeholder.svg"
                    }
                    alt={rightImage.altText}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            How the images will appear on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              {leftImage.imageUrl ? (
                <img
                  src={
                    getFullImageUrl(leftImage.imageUrl) || "/placeholder.svg"
                  }
                  alt={leftImage.altText}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Left Image
                </div>
              )}
            </div>
            <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
              {rightImage.imageUrl ? (
                <img
                  src={
                    getFullImageUrl(rightImage.imageUrl) || "/placeholder.svg"
                  }
                  alt={rightImage.altText}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Right Image
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
