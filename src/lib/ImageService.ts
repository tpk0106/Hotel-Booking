import { getClient } from "@microsoft/power-apps/data";
import { dataSourcesInfo } from "../../.power/schemas/appschemas/dataSourcesInfo";
// import { x-ms-dataverse-entityset } from "../../.power/schemas/dataverse/halls.Schema.json";

const client = getClient(dataSourcesInfo);

const imageCache = new Map<string, string>();
const noImageSet = new Set<string>();

function toDataUrl(data: Uint8Array): string {
  // Sniff MIME type from magic bytes
  let mime = "image/png";
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
    mime = "image/jpg";
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff)
    mime = "image/jpeg";
  else if (data[0] === 0x89 && data[1] === 0x50) mime = "image/png";
  else if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46)
    mime = "image/gif";

  // Convert bytes to base64 data URL (avoids blob: URL CSP issues in PA player)
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

export async function getImageBlobUrl(
  recordId: string,
): Promise<string | null> {
  // if (imageCache.has(recordId)) return imageCache.get(recordId)!;
  if (noImageSet.has(recordId)) return null;

  // const hallTableName =
  //   (await Tk_hallsService.getMetadata()).data.LogicalName || "";
  // console.log("Meta Data HallName === : ", hallTableName);

  const result = await client.downloadImageFromRecord(
    "tk_halls",
    recordId,
    "tk_hallimage",
  );

  if (!result.success || !result.data || result.data.length === 0) {
    noImageSet.add(recordId);
    console.log("NO IMAGE : ", recordId);
    return null;
  }

  const url = toDataUrl(result.data);
  imageCache.set(recordId, url);
  return url;
}

export function invalidateImageCache(recordId: string) {
  imageCache.delete(recordId);
  noImageSet.delete(recordId);
}
