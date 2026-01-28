import AuthCon from "@/context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { Card, type CardImgProps } from "react-bootstrap";

interface AuthenticatedImageProps extends CardImgProps {
  path?: string;
}

const AuthenticatedImage = ({ path, ...props }: AuthenticatedImageProps) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const { auth } = useContext(AuthCon);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/files/${path}`,
          {
            headers: {
              Authorization: `Bearer ${auth}`,
            },
          },
        );

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
      } catch (error) {
        console.error("Failed to load image", error);
        setImgSrc(`https://picsum.photos/id/237/200/150`);
      }
    };

    if (path) {
      fetchImage();
    } else {
      setImgSrc(`https://picsum.photos/id/237/200/150`);
    }
  }, [path]);

  return <Card.Img {...props} src={imgSrc} />;
};

export default AuthenticatedImage;
