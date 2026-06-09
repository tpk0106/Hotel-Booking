import { toast } from "react-toastify";

// const imageDataUrl = (data: unknown): string => {
//   const url: string = "data:image/jpeg;base64," + data;
//   return url;
// };

// let toastId: any;
// utils.ts
const imageDataUrl = (data: any): string => {
  if (!data) return "";

  // If it already has a header (starts with "data:"), return as is
  if (typeof data === "string" && data.startsWith("data:image")) {
    return data;
  }

  // Otherwise, prepend the header.
  // TIP: "image/png" is generally the most 'forgiving' header for base64 strings
  return `data:image/png;base64,${data}`;
};
export const fileDataUrl = (file: any, recordId?: string) => {
  if (!file) return "";

  // 1. If it's a local File object or a temporary preview URL
  if (file instanceof File) return URL.createObjectURL(file);
  if (typeof file === "string" && file.startsWith("blob:")) return file;

  // 2. If we have a recordId, we construct the proxy URL
  // This path MUST match what the proxy in vite.config.ts is listening for
  if (recordId) {
    return `/api/data/v9.2/tk_halls(${recordId})/tk_hallimage/$value`;
  }

  return "";
};

export const fileDataUrl1 = (file: any) => {
  if (!file) return "";
  if (typeof file === "string") return file; // Existing URL/Base64
  if (file instanceof File) return URL.createObjectURL(file); // New upload preview
  return "";
};

const showToastMessage = (message: string, type?: string) => {
  switch (type) {
    case "W":
      toast.warn(message, {
        position: "top-right",
        closeOnClick: true,
      });
      break;
    case "E":
      toast.error(message, {
        position: "top-right",
        closeOnClick: true,
      });
      break;
    default:
      toast.success(message, {
        position: "top-right",
        closeOnClick: true,
      });
  }
};

export function addDays(date: Date, days: number): Date {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export { imageDataUrl, showToastMessage };
