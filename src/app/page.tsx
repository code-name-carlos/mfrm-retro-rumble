"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label"; // Import Label
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Import Dialog components
import { GestureRecognition } from "@/components/gesture-recognition";

// Emoji art for Rock, Paper, Scissors, Lizard, Spock
const moveEmojis = {
  Rock: "✊",
  Paper: "✋",
  Scissors: "✌️",
  Lizard: "🦎",
  Spock: "🖖",
};

const moves = Object.keys(moveEmojis) as ("Rock" | "Paper" | "Scissors" | "Lizard" | "Spock")[];
type Move = (typeof moves)[number];

const getAIAssertiveMove = (): Move => {
  return moves[Math.floor(Math.random() * moves.length)];
};

const determineWinner = (playerMove: Move, opponentMove: Move) => {
  if (playerMove === opponentMove) {
    return "It's a tie!";
  }

  const winningCombinations: { [key in Move]: Move[] } = {
    Rock: ["Scissors", "Lizard"],
    Paper: ["Rock", "Spock"],
    Scissors: ["Paper", "Lizard"],
    Lizard: ["Spock", "Paper"],
    Spock: ["Scissors", "Rock"],
  };

  if (winningCombinations[playerMove].includes(opponentMove)) {
    return `You win! ${playerMove} beats ${opponentMove}`;
  } else {
    return `You lose! ${opponentMove} beats ${playerMove}`;
  }
};

export default function Home() {
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [showMoveButtons, setShowMoveButtons] = useState(true);
  const [gameMode, setGameMode] = useState<"gesture" | "manual">("manual"); // Default to manual
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimeRunning, setIsTimeRunning] = useState(false);

  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);


  //Toast Errors
  const { toast } = useToast();

  const handleMoveSelect = useCallback(
    (move: Move) => {
      if (playerMove !== null) {
        handleIllegalMove();
        return;
      }

      setPlayerMove(move);
      const aiMove = getAIAssertiveMove();
      setOpponentMove(aiMove);
      setResult(determineWinner(move, aiMove));

      // Reduce health
      setPlayerHealth(prev => Math.max(0, prev - 33)); // Reduce health on each move
      setOpponentHealth(prev => Math.max(0, prev - 33));

    },
    [playerMove, toast]
  );

  const handleGestureSelect = useCallback(
    (move: Move) => {
      if (playerMove !== null) {
        handleIllegalMove();
        return;
      }

      setPlayerMove(move);
      const aiMove = getAIAssertiveMove();
      setOpponentMove(aiMove);
      setResult(determineWinner(move, aiMove));
    },
    [playerMove, toast]
  );

  const handleIllegalMove = useCallback(
    () => {
      toast({
        variant: "destructive",
        title: "Illegal move",
        description: "You've already chosen your gameplay action! Please play again!",
      });
    },
    [toast]
  );

  const handleShowInstructions = () => {
    setInstructions(
      `Rock crushes Scissors and Lizard, 
            Paper covers Rock and disproves Spock, 
            Scissors cuts Paper and decapitates Lizard, 
            Lizard poisons Spock and eats Paper, 
            Spock smashes Scissors and vaporizes Rock.`
    );
    setShowOptions(false);
  };

  const handleToggleOptions = () => {
    setShowOptions(!showOptions);
    setInstructions("");
  };

  const handleResetGame = () => {
    resetGame();
    setInstructions("");
    setShowOptions(false);
  };

  const resetGame = () => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
    setShowMoveButtons(true);
    setGameMode("manual"); // Reset to manual mode
    setPlayerHealth(100);
    setOpponentHealth(100);
    setTimeLeft(15);
    setIsTimeRunning(false);
    setShowVideo(false);
  };

  const handlePlayAgain = () => {
    resetGame();
    setShowMoveButtons(true);
  };

  useEffect(() => {
    if (isTimeRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      // Handle what happens when time runs out
      console.log("Time's up!");
      setIsTimeRunning(false);
    }
  }, [isTimeRunning, timeLeft]);

  const handleShoot = async () => {
    setShowVideo(true); // Show the video
  };

  // Function to handle camera permission
  const getCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
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

  const startCountdown = useCallback(() => {
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
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: "Camera not initialized. Please ensure camera access is enabled.",
      });
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      toast({
        variant: 'destructive',
        title: 'Canvas Error',
        description: "Could not create canvas context.",
      });
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const newPhotoUrl = canvas.toDataURL('image/png');
    setPhotoUrl(newPhotoUrl);
  }, [toast]);

  useEffect(() => {
    if (photoUrl) {
      // Simulate selecting a random move for demonstration.
      const aiMove = getAIAssertiveMove();
      setOpponentMove(aiMove);

      // Here, you would typically use the photoUrl to recognize the player's move.
      // For this example, we'll assume the player made a random move.
      const playerAutoMove = getAIAssertiveMove(); // Get a random move
      setPlayerMove(playerAutoMove); // Set the player's move

      setResult(determineWinner(playerAutoMove, aiMove));
      setPlayerHealth(prev => Math.max(0, prev - 33)); // Reduce health on each move
      setOpponentHealth(prev => Math.max(0, prev - 33));

      setShowVideo(false); // Hide the video
    }
  }, [photoUrl]);

  const renderCountdownOverlay = () => {
    if (countdown === null || !showVideo) return null;

    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/75 text-white text-9xl font-bold z-50">
        {countdown > 0 ? countdown : "Smile!"}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-background relative overflow-hidden">
      {/* Top Left Circle */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-accent -translate-x-1/4 -translate-y-1/4 md:w-64 md:h-64 md:-translate-x-1/8 md:-translate-y-1/8"></div>

      {/* Bottom Right Circle */}
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary translate-x-1/4 translate-y-1/4 md:w-64 md:h-64 md:translate-x-1/8 md:translate-y-1/8"></div>

      <h1 className="text-3xl font-bold mb-4 text-foreground z-10 pixelated">Retro Rumble</h1>
      <h2 className="text-xl mb-4 text-muted-foreground z-10 pixelated" aria-level={1}>Rock Paper Scissors Lizard Spock</h2>

      {/* Player and Opponent Info */}
      <div className="flex justify-around w-full max-w-4xl mb-4 z-10">
        <div className="w-1/2 mx-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg text-foreground pixelated">Player</span>
            <span className="text-sm text-muted-foreground pixelated">{playerHealth}%</span>
          </div>
          <Progress value={playerHealth} />
        </div>

        <div className="w-1/2 mx-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg text-foreground pixelated">Opponent</span>
            <span className="text-sm text-muted-foreground pixelated">{opponentHealth}%</span>
          </div>
          <Progress value={opponentHealth} />
        </div>
      </div>

      {/* Timer */}
      <div className="text-2xl mb-4 text-accent z-10 pixelated">
        Time: {timeLeft}
      </div>

      {/* Move Display */}
      <div className="flex justify-around w-full max-w-4xl mb-8 z-10">
        <Card className="w-1/2 mx-2 bg-card border-2 border-border">
          <CardContent className="flex flex-col items-center">
            <h2 className="text-xl mb-2 text-foreground pixelated">Player</h2>
            <div className="text-8xl" role="img" aria-label={`Player Move: ${playerMove || "Not selected"}`}>
              {playerMove ? moveEmojis[playerMove] : "❓"}
            </div>
            <p className="text-sm text-muted-foreground pixelated" aria-live="polite">
              Move: {playerMove || "Not selected"}
            </p>
          </CardContent>
        </Card>

        <Card className="w-1/2 mx-2 bg-card border-2 border-border">
          <CardContent className="flex flex-col items-center">
            <h2 className="text-xl mb-2 text-foreground pixelated">Opponent</h2>
            <div className="text-8xl" role="img" aria-label={`Opponent Move: ${opponentMove || "Not selected"}`}>
              {opponentMove ? moveEmojis[opponentMove] : "❓"}
            </div>
            <p className="text-sm text-muted-foreground pixelated" aria-live="polite">
              Move: {opponentMove || "Not selected"}
            </p>
          </CardContent>
        </Card>
      </div>

      {result && (
        <p className="text-lg mb-4 text-accent z-10 pixelated" aria-live="assertive">
          {result}
        </p>
      )}

      {instructions && <Alert className="w-full max-w-md z-10">
        <AlertTitle>Instructions</AlertTitle>
        <AlertDescription>{instructions}</AlertDescription>
      </Alert>}

      {/* Gameplay Logic - Move Selection */}
      {showMoveButtons && (
        <div className="flex justify-center space-x-4 z-10">
          {moves.map((move) => (
            <Button key={move} onClick={() => handleMoveSelect(move)} aria-label={`Select ${move} move`} className="pixelated">
              <Label htmlFor={move}>{moveEmojis[move]}</Label>
            </Button>
          ))}
        </div>
      )}

      {/* Options Box */}
      <div className="flex justify-center space-x-4 mt-4 z-10 w-full max-w-md">
        <Button onClick={handleShoot} disabled={!hasCameraPermission} className="w-1/2 pixelated">
          Shoot!
        </Button>
        <Button onClick={handleShowInstructions} className="w-1/2 pixelated">Instructions</Button>
        <Button onClick={handleResetGame} className="w-1/2 pixelated">Reset Game</Button>
      </div>
      {/* Render the countdown overlay when showVideo is true */}
      {renderCountdownOverlay()}

      {showVideo && (
        <Dialog open={showVideo} onOpenChange={setShowVideo}>
          <DialogContent className="sm:max-w-[425px] flex flex-col items-center">
            <DialogTitle>Capture Your Move!</DialogTitle>
            <DialogDescription>Prepare for your epic retro battle!</DialogDescription>
            <div className="flex flex-col items-center space-y-4 relative">
              <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted />
              {!(hasCameraPermission) && (
                <Alert variant="destructive">
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access to use this feature.
                  </AlertDescription>
                </Alert>
              )}
              {countdown === null ? (
                <Button onClick={startCountdown} disabled={!hasCameraPermission}>
                  Capture!
                </Button>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
