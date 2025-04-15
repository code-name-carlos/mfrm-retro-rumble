"use client";
import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GestureRecognition } from "@/components/gesture-recognition";
import { Label } from "@/components/ui/label"; // Import Label
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const [showMoveButtons, setShowMoveButtons] = useState(false);
  const [gameMode, setGameMode] = useState<"gesture" | "manual">("gesture");

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
    setShowMoveButtons(false);
    setGameMode("gesture"); // Reset to gesture mode
  };

  const handlePlayAgain = () => {
    resetGame();
    setShowMoveButtons(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background relative overflow-hidden">
      {/* Top Left Circle */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-accent -translate-x-1/4 -translate-y-1/4 md:w-64 md:h-64 md:-translate-x-1/8 md:-translate-y-1/8"></div>

      {/* Bottom Right Circle */}
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary translate-x-1/4 translate-y-1/4 md:w-64 md:h-64 md:translate-x-1/8 md:translate-y-1/8"></div>

      <h1 className="text-3xl font-bold mb-4 text-foreground z-10">SHOOT!</h1>
      <h2 className="text-xl mb-4 text-muted-foreground z-10" aria-level={1}>Rock Paper Scissors Lizard Spock</h2>

      <div className="flex justify-around w-full max-w-4xl mb-8 z-10">
        <Card className="w-1/2 mx-2">
          <CardContent className="flex flex-col items-center">
            <h2 className="text-xl mb-2 text-foreground">Player</h2>
            <div className="text-8xl" role="img" aria-label={`Player Move: ${playerMove || "Not selected"}`}>
              {playerMove ? moveEmojis[playerMove] : "❓"}
            </div>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Move: {playerMove || "Not selected"}
            </p>
          </CardContent>
        </Card>

        <Card className="w-1/2 mx-2">
          <CardContent className="flex flex-col items-center">
            <h2 className="text-xl mb-2 text-foreground">Opponent</h2>
            <div className="text-8xl" role="img" aria-label={`Opponent Move: ${opponentMove || "Not selected"}`}>
              {opponentMove ? moveEmojis[opponentMove] : "❓"}
            </div>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Move: {opponentMove || "Not selected"}
            </p>
          </CardContent>
        </Card>
      </div>

      {result && (
        <p className="text-lg mb-4 text-accent z-10" aria-live="assertive">
          {result}
        </p>
      )}

      {instructions && <Alert className="w-full max-w-md z-10">
        <AlertTitle>Instructions</AlertTitle>
        <AlertDescription>{instructions}</AlertDescription>
      </Alert>}

      {/* Options Box */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex justify-center space-x-4 z-10">
          <Button onClick={handleToggleOptions}>Options</Button>
        </div>
        {showOptions && (
          <div className="mt-2 bg-card p-4 rounded-md shadow-md z-20">
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => { setShowMoveButtons(true); setGameMode("manual"); setShowOptions(false); }}>FIGHT</Button>
              <Button onClick={handleShowInstructions} className="col-span-2">Instructions</Button>
              <Button onClick={handleResetGame} className="col-span-2">Reset Game</Button>
            </div>
          </div>
        )}
      </div>

      {/* Gameplay Logic - Move Selection */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
        {playerMove ? (
          // Play Again Button
          <Button onClick={handlePlayAgain} className="mt-4">
            Play Again
          </Button>
        ) : (
          <>
            {showMoveButtons && (
              <div className="flex justify-center space-x-4 z-10">
                {moves.map((move) => (
                  <Button key={move} onClick={() => handleMoveSelect(move)} aria-label={`Select ${move} move`}>
                    <Label htmlFor={move}>{moveEmojis[move]}</Label>
                  </Button>
                ))}
              </div>
            )}
            {gameMode === "gesture" && <GestureRecognition onMoveSelect={handleGestureSelect} />}
          </>
        )}
      </div>
    </div>
  );
}

