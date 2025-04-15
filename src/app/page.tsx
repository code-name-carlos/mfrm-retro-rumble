"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Confetti from 'react-dom-confetti';
import { Switch } from "@/components/ui/switch";
import Pillow from "@/components/ui/pillow";
import Mattress from "@/components/ui/mattress";
import Nighttime from "@/components/ui/Nighttime";
import Sheets from "@/components/ui/sheets";
import Lightning from "@/components/ui/Lightning";

// Emoji art for Rock, Paper, Scissors, Lizard, Spock
const rpslsMoveEmojis = {
  Rock: "✊",
  Paper: "✋",
  Scissors: "✌️",
  Lizard: "🦎",
  Spock: "🖖",
};

// Icon art for Mattress Firm
const mattressFirmMoveIcons = {
  Pillow: Pillow,
  Mattress: Mattress,
  Dream: Nighttime,
  Blanket: Sheets,
  "Night Light": Lightning,
};

const rpslsMoves = Object.keys(rpslsMoveEmojis) as ("Rock" | "Paper" | "Scissors" | "Lizard" | "Spock")[];
const mattressFirmMoves = Object.keys(mattressFirmMoveIcons) as ("Pillow" | "Mattress" | "Dream" | "Blanket" | "Night Light")[];

type Move = (typeof rpslsMoves)[number] | (typeof mattressFirmMoves)[number];

const getAIAssertiveMove = (isMattressFirm: boolean): Move => {
  const movesArray = isMattressFirm ? mattressFirmMoves : rpslsMoves;
  return movesArray[Math.floor(Math.random() * movesArray.length)];
};

const determineWinner = (playerMove: Move, opponentMove: Move, isMattressFirm: boolean) => {
    if (playerMove === opponentMove) {
        return "It's a tie!";
    }

    let winningCombinations: { [key: string]: string[] } = {};

    if (isMattressFirm) {
        winningCombinations = {
            Pillow: ["Night Light", "Dream"],
            Mattress: ["Blanket", "Pillow"],
            Blanket: ["Night Light", "Dream"],
            "Night Light": ["Dream", "Mattress"],
            Dream: ["Pillow", "Night Light"],
        };
    } else {
        winningCombinations = {
            Rock: ["Scissors", "Lizard"],
            Paper: ["Rock", "Spock"],
            Scissors: ["Paper", "Lizard"],
            Lizard: ["Spock", "Paper"],
            Spock: ["Scissors", "Rock"],
        };
    }

    if (winningCombinations[playerMove].includes(opponentMove)) {
        return "win";
    } else {
        return "lose";
    }
};

const confettiConfig = {
  angle: 90,
  spread: 45,
  startVelocity: 45,
  elementCount: 300,
  dragFriction: 0.1,
  duration: 3000,
  stagger: 5,
  width: "10px",
  height: "10px",
  perspective: "500px",
  colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"]
};

export default function Home() {
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [gameMode, setGameMode] = useState<"gesture" | "manual">("manual");
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimeRunning, setIsTimeRunning] = useState(true);
  const [isGameActive, setIsGameActive] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isMattressFirm, setIsMattressFirm] = useState(false);

  const { toast } = useToast();

  const themeColors = isMattressFirm ? {
    background: '#1a254f',
    foreground: '#f8f8f8',
    accent: '#FFF',
  } : {
    background: '#8E2DE2',
    foreground: '#FEE440',
    accent: '#FF69B4',
  };

  useEffect(() => {
    document.body.style.backgroundColor = themeColors.background;
  }, [themeColors.background]);

  const moves = isMattressFirm ? mattressFirmMoves : rpslsMoves;
  const moveEmojis = isMattressFirm ? mattressFirmMoveIcons : rpslsMoveEmojis;

  const handleMoveSelect = useCallback(
    (move: Move) => {
      if (!isGameActive) return;

      setPlayerMove(move);
      const aiMove = getAIAssertiveMove(isMattressFirm);
      setOpponentMove(aiMove);
      const gameResult = determineWinner(move, aiMove, isMattressFirm);
      setResult(gameResult === 'win' ? `You win! ${move} beats ${aiMove}` : `You lose! ${aiMove} beats ${move}`);

      if (gameResult === 'win') {
        setOpponentHealth(prev => Math.max(0, prev - 33));
      } else if (gameResult === 'lose') {
        setPlayerHealth(prev => Math.max(0, prev - 33));
      }
      setIsGameActive(false);
    },
    [isGameActive, isMattressFirm]
  );

  const updateHealth = (gameResult: string) => {
    if (gameResult === 'win') {
      setOpponentHealth(prev => Math.max(0, prev - 33));
    } else if (gameResult === 'lose') {
      setPlayerHealth(prev => Math.max(0, prev - 33));
    }
  };

  const handleShowInstructions = () => {
    setInstructions(
        isMattressFirm ?
      `Pillow smothers Night Light (silence),
       Pillow supports Dream (comfort),
        Mattress absorbs Blanket (foundation),
        Mattress defeats Pillow (bigger),
        Blanket covers Night Light (muffles),
        Blanket enhances Dream (warmth),
        Night Light disrupts Dream (wakeup),
        Night Light signals Mattress (time to rise),
        Dream transcends Pillow (mental vs physical),
        Dream ignores Night Light (deep sleep).`
            :
      `Rock crushes Scissors and Lizard,
            Paper covers Rock and disproves Spock,
            Scissors cuts Paper and decapitates Lizard,
            Lizard poisons Spock and eats Paper,
            Spock smashes Scissors and vaporizes Rock.`
    );
  };

  const handleResetGame = () => {
    resetGame();
    setInstructions("");
  };

  const resetGame = useCallback(() => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
    setGameMode("manual");
    setPlayerHealth(100);
    setOpponentHealth(100);
    setTimeLeft(60);
    setIsTimeRunning(true);
    setShowVideo(false);
    setIsGameActive(true);
    setGameEnded(false);
    setWinner(null);
    setConfetti(false);
    setPhotoUrl(null);
    setCountdown(null);
  }, []);

  const handlePlayAgain = () => {
    resetGame();
  };

  useEffect(() => {
    if (playerHealth <= 0 || opponentHealth <= 0) {
      setIsTimeRunning(false);
      setIsGameActive(false);
      setGameEnded(true);
      setWinner(playerHealth > opponentHealth ? 'Player' : 'Opponent');
      setConfetti(true);
    }
  }, [playerHealth, opponentHealth]);

  useEffect(() => {
    if (isTimeRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsTimeRunning(false);
      setIsGameActive(false);
      setGameEnded(true);
      setWinner(playerHealth > opponentHealth ? 'Player' : 'Opponent');
      setConfetti(true);
    }
  }, [isTimeRunning, timeLeft, playerHealth, opponentHealth]);

  const handleShoot = async () => {
    setShowVideo(true);
  };

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
    setShowVideo(false);
  }, [toast]);

  useEffect(() => {
    if (photoUrl) {
      const aiMove = getAIAssertiveMove(isMattressFirm);
      setOpponentMove(aiMove);

      const playerAutoMove = getAIAssertiveMove(isMattressFirm);
      setPlayerMove(playerAutoMove);

      const gameResult = determineWinner(playerAutoMove, aiMove, isMattressFirm);
      setResult(gameResult === 'win' ? `You win! ${playerAutoMove} beats ${aiMove}` : `You lose! ${aiMove} beats ${playerAutoMove}`);
      updateHealth(gameResult);
      setIsGameActive(false);
      setPhotoUrl(null);
    }
  }, [photoUrl, isMattressFirm]);

  const renderCountdownOverlay = () => {
    if (countdown === null || !showVideo) return null;

    return (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/75 text-white text-9xl font-bold z-50">
        {countdown > 0 ? countdown : "Smile!"}
      </div>
    );
  };

  const getConfig = (value:number) => {
    return {
      ...confettiConfig,
      origin: { x: 0.1, y: value }
    }
  }

  useEffect(() => {
    if (isGameActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsTimeRunning(false);
      setIsGameActive(false);
      setGameEnded(true);
      setWinner(playerHealth > opponentHealth ? 'Player' : 'Opponent');
      setConfetti(true);
    }
  }, [isTimeRunning, timeLeft, playerHealth, opponentHealth, isGameActive]);

  const getMoveDisplay = (move: Move | null) => {
    if (!move) return "❓";

    if (isMattressFirm && mattressFirmMoveIcons[move as keyof typeof mattressFirmMoveIcons]) {
      const Icon = mattressFirmMoveIcons[move as keyof typeof mattressFirmMoveIcons];
      return <Icon width="60" height="60" fill={themeColors.foreground} />;
    } else if (!isMattressFirm && rpslsMoveEmojis[move as keyof typeof rpslsMoveEmojis]) {
      return rpslsMoveEmojis[move as keyof typeof rpslsMoveEmojis];
    }

    return "❓";
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-accent -translate-x-1/4 -translate-y-1/4 md:w-64 md:h-64 md:-translate-x-1/8 md:-translate-y-1/8"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary translate-x-1/4 translate-y-1/4 md:w-64 md:h-64 md:translate-x-1/8 md:translate-y-1/8"></div>

      <h1 className="text-3xl font-bold mb-4 text-foreground z-10 pixelated">
        {isMattressFirm ? "Mattress Firm Dream Duel" : "Retro Rumble"}
      </h1>
      <h2 className="text-xl mb-4 text-muted-foreground z-10 pixelated" aria-level={1}>
        {isMattressFirm ? "Sleep Showdown" : "Rock Paper Scissors Lizard Spock"}
      </h2>
            <Confetti active={confetti} config={ getConfig(.25) }/>
            <Confetti active={confetti} config={ getConfig(.75) }/>

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

      <div className="text-2xl mb-4 text-accent z-10 pixelated">
        Time: {timeLeft}
      </div>

      <div className="flex justify-around w-full max-w-4xl mb-8 z-10">
        <Card className="w-1/2 mx-2 bg-card border-2 border-border">
          <CardContent className="flex flex-col items-center">
            <h2 className="text-xl mb-2 text-foreground pixelated">Player</h2>
            <div className="text-8xl" role="img" aria-label={`Player Move: ${playerMove || "Not selected"}`}>
              {getMoveDisplay(playerMove)}
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
              {getMoveDisplay(opponentMove)}
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

      <div className="flex justify-center space-x-4 z-10">
          {moves.map((move) => (
            <Button key={move} onClick={() => handleMoveSelect(move)} aria-label={`Select ${move} move`} className="pixelated">
              <Label htmlFor={move}>{
                isMattressFirm && typeof moveEmojis[move as keyof typeof mattressFirmMoveIcons] !== 'string' ?
                    (<>
                        {/*Render the component directly if it's a React component*/}
                        {(moveEmojis[move as keyof typeof mattressFirmMoveIcons] as React.ComponentType)({
                            width: "30", // Set width as needed
                            height: "30", // Set height as needed
                            fill: themeColors.foreground, // Use theme color
                        })}
                    </>)
                    :
                    moveEmojis[move as keyof typeof rpslsMoveEmojis] //Render the emoji if it's a string (for RPSLS)
            }</Label>
            </Button>
          ))}
        </div>

      <div className="flex justify-center space-x-4 mt-4 z-10 w-full max-w-md">
        <Button onClick={handleShoot} disabled={!hasCameraPermission || !isGameActive} className="w-1/2 pixelated" style={{ width: '100%' }}>
          Shoot!
        </Button>
        <Button onClick={handleShowInstructions} className="w-1/2 pixelated" style={{ width: '100%' }}>Instructions</Button>
        <Button onClick={handleResetGame} className="w-1/2 pixelated" style={{ width: '100%' }}>Reset Game</Button>
      </div>
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
        {gameEnded && winner && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black/75 text-white text-5xl font-bold z-50">
            {winner} Wins!
          </div>
        )}
             <Switch checked={isMattressFirm} onCheckedChange={setIsMattressFirm} className="mt-4 z-10" />
             <Label htmlFor="mattress-firm-toggle" className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 z-10">
        Mattress Firm Mode
      </Label>
    </div>
  );
}
