import { useState, useEffect } from "react";
import { getImageBlobUrl } from "./ImageService";

interface Props {
  recordId: string;
  alt: string;
}

export default function ImageCell1({ recordId, alt }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    console.log("image cell :", recordId);
    getImageBlobUrl(recordId)
      .then((url) => {
        if (!cancelled) {
          console.log("inside getImage :", recordId);
          console.log("inside getImage utl:", url);
          setSrc(url);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recordId]);

  if (loading) return <div className="no-image">Loading...</div>;
  if (!src) return <div className="no-image">No Image</div>;
  return <img src={src} alt={alt} />;
}
