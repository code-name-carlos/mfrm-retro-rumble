"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { recognizeGesture } from "@/ai/flows/gesture-recognition";
import { useToast } from "@/hooks/use-toast";

interface GestureRecognitionProps {
  onMoveSelect: (move: string) => void;
}

export const GestureRecognition: React.FC<GestureRecognitionProps> = ({
  onMoveSelect,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Gesture Recognition Failed",
        description: error,
        variant: "destructive",
      });
      setError(null);
    }
  }, [error, toast]);

  const handleGesture = async () => {
    if (!photoUrl) {
      setError("No photo available. Please enable camera access.");
      return;
    }

    try {
      const result = await recognizeGesture({ photoUrl });
      if (result.success) {
        onMoveSelect(result.move);
      } else {
        setError(result.errorMessage || "Failed to recognize gesture.");
      }
    } catch (e) {
      setError("Error occurred during gesture recognition.");
    }
  };

  // Placeholder function for capturing a photo.  Replace with actual camera logic
  const capturePhoto = () => {
    setPhotoUrl("https://picsum.photos/200/300");
  };

  return (
    <div>
      <Button onClick={capturePhoto}>Capture Gesture</Button>
      {photoUrl && <img src={photoUrl} alt="Gesture" />}
      <Button onClick={handleGesture}>Recognize Gesture</Button>
    </div>
  );
};
