import React, { useEffect, useState } from "react";
import { getImageBlobUrl } from "./ImageService";

export const HallThumbnail: React.FC<{
  hallId: string;
  version: string;
  width?: number;
}> = ({ hallId, version, width }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const noPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;

  useEffect(() => {
    // When version changes, this will run again and fetch the brand new image
    async function loadImage() {
      setLoading(true);

      // console.log("re-running thumnail due to version change", version);
      // const url = await Tk_hallsService.downloadImage(hallId, "tk_hallimage");
      // const res = (await Tk_hallsService.getMetadata()).data.DataSourceId;

      const url = await getImageBlobUrl(hallId);

      if (url) {
        setImgSrc(url);
      }
      setLoading(false);
    }

    loadImage();

    // Cleanup the blob URL when component unmounts to save memory
    return () => {
      if (imgSrc && imgSrc.startsWith("blob:")) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [hallId, version]);

  if (loading)
    return (
      <div
        style={{
          width: 50,
          height: 50,
          background: "#eee",
        }}
      />
    );

  return (
    <div
      style={{
        width: width ? width : 120,

        objectFit: "fill",
        // border: "2px solid oklch(80.9% 0.105 251.813)",
        border: "3px solid oklch(0.5063 0.0359 241.25)",
        boxShadow: "8px 8px 5px 0px rgba(0,0,0,0.75)",
        borderRadius: "5px",
        borderColor: "#00008f",
      }}
    >
      <img src={imgSrc || noPhotoSvg} className="rounded-sm" />
      {/* <img
        src={imgSrc || "https://placehold.co/50x50?text=No+Photo"}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        alt="Hall"
      /> */}
    </div>
  );
};
