"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { recognizeGesture } from "@/ai/flows/gesture-recognition";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface GestureRecognitionProps {
  onMoveSelect: (move: string) => void;
}

export const GestureRecognition: React.FC<GestureRecognitionProps> = ({
  onMoveSelect,
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
  }, []);


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
      setError("No photo available. Please capture a gesture first.");
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

  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      capturePhoto();
      setCountdown(null);
    }
  }, [countdown]);

  const capturePhoto = () => {
    if (!videoRef.current) {
      setError("Camera not initialized. Please ensure camera access is enabled.");
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setError("Could not create canvas context.");
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const newPhotoUrl = canvas.toDataURL('image/png');
    setPhotoUrl(newPhotoUrl);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />

      { !(hasCameraPermission) && (
          <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access to use this feature.
                    </AlertDescription>
            </Alert>
      )
      }
       {countdown !== null ? (
        <div className="text-5xl font-bold text-accent">{countdown}</div>
      ) : (
           <Button onClick={startCountdown} disabled={!hasCameraPermission}>
             Capture Gesture
           </Button>
      )}
      <div className="flex space-x-4">

        <Button onClick={handleGesture} disabled={!photoUrl || !hasCameraPermission}>Recognize Gesture</Button>
      </div>
      {photoUrl && (
        <img src={photoUrl} alt="Captured Gesture" className="max-w-md rounded-md shadow-lg" />
      )}
    </div>
  );
};
