const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type UploadedFile = {
  url: string;
};

type UploadImagesResponse = {
  files: UploadedFile[];
  message?: string;
};

export const uploadFileToS3 = async (
  imageFiles: File[],
): Promise<string[]> => {
  const token = localStorage.getItem("auth_token");

  const urls: string[] = [];

  for (const file of imageFiles) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Upload failed");
    }

    urls.push(data.url);
  }

  return urls;
};

export const uploadSingleImageToS3 = async (file: File): Promise<string> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "banners");

  const res = await fetch(`${BASE_URL}/v1/upload/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.url;
};

export const uploadVideoToS3 = async (file: File): Promise<string> => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "banners");

  const res = await fetch(`${BASE_URL}/v1/upload/file`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Video upload failed");
  return data.url;
};

export const deleteMediaFromS3 = async (url: string): Promise<void> => {
  const token = localStorage.getItem("token");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/upload/delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete media");
};
