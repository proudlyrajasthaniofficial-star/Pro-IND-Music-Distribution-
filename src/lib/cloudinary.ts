/**
 * Cloudinary Secure Upload Utility
 */

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  duration?: number;
}

export async function uploadToCloudinary(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  // 0. File Validation
  const MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB limit
  const ALLOWED_TYPES = [
    'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 
    'image/jpeg', 'image/png', 'image/webp'
  ];

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed is 150MB.`);
  }

  if (!ALLOWED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.wav')) {
    throw new Error(`Unsupported file type: ${file.type || 'unknown'}. Please upload WAV, MP3, or high-res images.`);
  }

  // 1. Get signature from backend
  console.log("📝 Requesting upload signature...");
  const signResponse = await fetch("/api/cloudinary-sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ params: {} })
  });

  const signData = await signResponse.json().catch(() => null);

  if (!signResponse.ok || !signData) {
    const isJson = signResponse.headers.get("content-type")?.includes("application/json");
    let errorMsg = `Signature request failed with status ${signResponse.status}`;
    
    if (isJson && signData?.error) {
      errorMsg = signData.error;
    } else if (signResponse.status === 404) {
      errorMsg = "API Signature endpoint not found (404). Please ensure the server is running correctly.";
    }
    
    console.error(`❌ Signature Error (${signResponse.status}):`, errorMsg);
    throw new Error(errorMsg);
  }

  const { signature, timestamp, apiKey, cloudName, uploadPreset } = signData;
  console.log("✅ Signature received for cloud:", cloudName);

  // 2. Prepare upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", "ind-distribution");
  if (uploadPreset) {
    formData.append("upload_preset", uploadPreset);
  }

  // 3. Perform upload
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response: CloudinaryResponse = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        const error = JSON.parse(xhr.responseText);
        reject(new Error(error.error?.message || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(formData);
  });
}
