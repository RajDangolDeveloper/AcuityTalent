"use client";

import { useState } from "react";
import apiClient from "@/src/app/api/api-client";

export default function SpacesUpload({
  onUploaded,
}: {
  onUploaded?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await apiClient.post("/spaces/upload-url", {
        fileName: file.name,
        contentType: file.type,
      });

      const { signedUrl, publicUrl } = res.data;

      const upload = await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!upload.ok) throw new Error("Upload failed");

      const finalUrl =
        publicUrl ||
        `${process.env.NEXT_PUBLIC_SPACES_BASE}/${encodeURIComponent(file.name)}`;
      setImageUrl(finalUrl);
      if (onUploaded) onUploaded(finalUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading && <div>Uploading…</div>}
      {imageUrl && (
        <div>
          <img src={imageUrl} alt="uploaded" className="max-w-xs mt-2" />
        </div>
      )}
    </div>
  );
}
