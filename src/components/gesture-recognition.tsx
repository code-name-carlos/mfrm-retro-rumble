"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [isCapturing, setIsCapturing] = useState(false); // Track if capture is in progress
    const [showCountdownOverlay, setShowCountdownOverlay] = useState(false); // Track if countdown overlay is visible


  const getCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({video: true});
      setHasCameraPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this app.',
      });
    }
  }, [toast]);

  // Get camera permission on mount
  useEffect(() => {
    getCameraPermission();
  }, [getCameraPermission]);


  //Toast when error occur
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

  const handleGesture = useCallback(async () => {
    if (!photoUrl) {
      setError("No photo available. Please capture a gesture first.");
      return;
    }

    setIsCapturing(true);

    try {
      const result = await recognizeGesture({ photoUrl });
      if (result.success) {
        onMoveSelect(result.move);
      } else {
        setError(result.errorMessage || "Failed to recognize gesture.");
      }
    } catch (err: any) {
      console.error("Error occurred during gesture recognition:", err);
      setError("Error occurred during gesture recognition.");
    } finally {
      setIsCapturing(false);
            setShowCountdownOverlay(false); // Hide overlay after capture
    }
  }, [onMoveSelect, photoUrl]);

  const startCountdown = useCallback(() => {
      setShowCountdownOverlay(true); // Show overlay before countdown
      setCountdown(3);
  }, []);

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

  const capturePhoto = useCallback(() => {
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
  }, []);

  const handleShoot = useCallback(() => {
    // Reset states before starting a new capture
    setPhotoUrl(null);
    setError(null);
    startCountdown();
  }, [startCountdown]);

  //This useEffect captures after screen recording has a photoURL
  useEffect(() => {
    if (photoUrl) {
      handleGesture();
    }
  }, [photoUrl, handleGesture]);

  return (
    <div className="flex flex-col items-center space-y-4 relative">
      {showCountdownOverlay && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/75 text-white text-9xl font-bold z-50">
          {countdown > 0 ? countdown : "Smile!"}
        </div>
      )}
      <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted style={{ display: showCountdownOverlay ? 'none' : 'block' }}/>

      {!(hasCameraPermission) && (
        <Alert variant="destructive">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access to use this feature.
          </AlertDescription>
        </Alert>
      )}
      {countdown === null ? (
        <Button onClick={handleShoot} disabled={!hasCameraPermission || isCapturing} >
          Shoot!
        </Button>
      ) : null}
      {photoUrl && (
        <img src={photoUrl} alt="Captured Gesture" className="max-w-md rounded-md shadow-lg" />
      )}
    </div>
  );
};

