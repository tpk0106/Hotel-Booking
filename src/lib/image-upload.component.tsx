import { Box } from "@mui/material";
import { TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { imageDataUrl } from "./utils";

// https://codesandbox.io/p/sandbox/material-ui-image-upload-component-9s8u0?file=%2Fsrc%2FImageUpload.js

type hallData = { setParentState: (val: any) => void; currentImg?: string };

const ImageUpload = ({ setParentState, currentImg }: hallData) => {
  const [selectedImage, setSelectedImage] = useState<any>();

  const [selectedImageName, setSelectedImageName] = useState<string>("");

  useEffect(() => {
    if (currentImg) {
      setSelectedImage(imageDataUrl(currentImg));
    }
  }, [currentImg]);

  const handleFileUpload = (event: any) => {
    const file = event.currentTarget?.files[0];

    if (!file) return;

    setSelectedImageName(file.name);
    const reader = new FileReader();

    // Inside handleFileUpload
    reader.onloadend = () => {
      const base64withHeader = reader.result as string;
      setSelectedImage(base64withHeader); // Keep header for the local <img /> preview

      // SPLIT at the comma: "data:image/png;base64,iVBOR..." -> ["data...", "iVBOR..."]
      const base64Data = base64withHeader.split(",")[1];

      setParentState(base64Data); // Send ONLY the raw string to the parent/API
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      <Box
        sx={{
          margin: 0,
          padding: 0,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(128, 128,128, 0.08)",
        }}
      >
        <img
          src={selectedImage} // This will now always have a proper data:image/... header
          alt={selectedImageName}
          style={{
            maxWidth: "100px",
            objectFit: "cover", // 'cover' or 'contain' is usually better than 'fill'
            maxHeight: "100px",
            borderRadius: ".125rem",
            display: selectedImage ? "block" : "none", // Hide if empty
          }}
        />

        <TextField
          type={"file"}
          sx={{
            ".MuiOutlinedInput-root": {
              flexDirection: "row",
              backgroundColor: "#fff",
              width: "250px",
              height: "60px",
              border: "2px",
              borderColor: "#000000",
            },
          }}
          slotProps={{
            input: {
              inputProps: {
                accept: "image/png, image/gif, image/jpeg, image/jpg",
              },
            },
          }}
          onChange={(e) => {
            handleFileUpload(e);
          }}
          placeholder={selectedImageName}
        />
      </Box>
    </>
  );
};

export default ImageUpload;
