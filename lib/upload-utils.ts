import axios from "axios";
import { apiClient } from "./api-client";

export interface UploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  fileKey: string;
  publicUrl: string;
}

const VIDEO_CHUNK_SIZE = 100 * 1024 * 1024; // 100 MB

const ALLOWED_IMAGES = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_FILES = [".pdf", ".docx", ".ppt", ".pptx"];
const ALLOWED_VIDEOS = [".mp4", ".webm"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB

export function getFileExtension(filename: string): string {
  const idx = filename.lastIndexOf(".");
  return idx === -1 ? "" : filename.substring(idx).toLowerCase();
}

export function validateFileConstraints(file: File) {
  const ext = getFileExtension(file.name);
  
  if (ALLOWED_IMAGES.includes(ext)) {
    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`Images must be smaller than 5 MB (selected: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    }
    return "image";
  }
  
  if (ALLOWED_FILES.includes(ext)) {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Documents must be smaller than 100 MB (selected: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`);
    }
    return "file";
  }

  if (ALLOWED_VIDEOS.includes(ext)) {
    if (file.size > MAX_VIDEO_SIZE) {
      throw new Error(`Videos must be smaller than 10 GB (selected: ${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB)`);
    }
    return "video";
  }

  throw new Error(`Unsupported file format "${ext}". Supported: JPG, JPEG, PNG, WEBP, PDF, DOCX, PPT, PPTX, MP4, WEBM`);
}

export async function uploadFile({ file, onProgress }: UploadOptions): Promise<UploadResult> {
  const category = validateFileConstraints(file);

  // 1. Get presigned upload URL or parts
  const presignPayload: any = { originalFileName: file.name };
  if (category === "video") {
    presignPayload.fileSizeBytes = file.size;
  }

  const presignRes = await apiClient.post("/media/presign", presignPayload);
  const presignData = presignRes.data.data;

  // 2. Handle image/file (R2 Presigned PUT) vs Video (AWS S3 Multipart PUT)
  if (category !== "video") {
    const { uploadUrl, fileKey, publicUrl } = presignData;

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress?.(percent);
        }
      },
    });

    return { fileKey, publicUrl };
  } else {
    // Multipart upload for video
    const { uploadId, fileKey, parts } = presignData;
    const partsUploaded: { partNumber: number; eTag: string }[] = [];
    const partProgresses = new Array(parts.length).fill(0);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const start = i * VIDEO_CHUNK_SIZE;
      const end = Math.min(start + VIDEO_CHUNK_SIZE, file.size);
      const blob = file.slice(start, end);

      const res = await axios.put(part.presignedUrl, blob, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.loaded) {
            partProgresses[i] = progressEvent.loaded;
            const totalUploaded = partProgresses.reduce((acc, curr) => acc + curr, 0);
            const overallProgress = Math.min(Math.round((totalUploaded / file.size) * 100), 99);
            onProgress?.(overallProgress);
          }
        },
      });

      // Retrieve ETag
      const etag = res.headers.etag || res.headers.ETag;
      if (!etag) {
        throw new Error(`Failed to retrieve ETag for chunk #${part.partNumber}`);
      }

      partsUploaded.push({
        partNumber: part.partNumber,
        eTag: etag.replace(/"/g, ""), // S3 ETag contains wrapped double quotes
      });
    }

    // 3. Complete Multipart upload on backend
    const completeRes = await apiClient.post("/media/complete", {
      uploadId,
      fileKey,
      parts: partsUploaded,
    });

    // Report 100% completion
    onProgress?.(100);

    return {
      fileKey: completeRes.data.data.fileKey,
      publicUrl: completeRes.data.data.publicUrl,
    };
  }
}
