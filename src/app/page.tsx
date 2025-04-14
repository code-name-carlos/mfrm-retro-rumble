"use client";
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GestureRecognition } from "@/components/gesture-recognition";
import { Label } from "@/components/ui/label"; // Import Label
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  //Toast Errors
  const { toast } = useToast();

  const handleMoveSelect = useCallback(
      (move: Move) => {
        if (playerMove !== null) {
          toast({
            variant: "destructive",
            title: "Illegal move",
            description: "You've already chosen your gameplay action! Please play again!",
          });
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
          toast({
            variant: "destructive",
            title: "Illegal move",
            description: "You've already chosen your gameplay action! Please play again!",
          });
          return;
        }

        setPlayerMove(move);
        const aiMove = getAIAssertiveMove();
        setOpponentMove(aiMove);
        setResult(determineWinner(move, aiMove));
      },
      [playerMove, toast]
  );

  const resetGame = () => {
    setPlayerMove(null);
    setOpponentMove(null);
    setResult(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background relative overflow-hidden">
      {/* Top Left Circle */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-accent -translate-x-1/4 -translate-y-1/4 md:w-64 md:h-64 md:-translate-x-1/8 md:-translate-y-1/8"></div>

      {/* Bottom Right Circle */}
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary translate-x-1/4 translate-y-1/4 md:w-64 md:h-64 md:translate-x-1/8 md:translate-y-1/8"></div>

      <h1 className="text-3xl font-bold mb-4 text-foreground z-10">Shoot!</h1>
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

      {/* Gesture Recognition Component */}
      <GestureRecognition onMoveSelect={handleGestureSelect} />

      {/* Manual Move Selection Buttons */}
      <div className="flex justify-center space-x-4 z-10">
        {moves.map((move) => (
            <Button
                key={move}
                onClick={() => handleMoveSelect(move)}
                disabled={playerMove !== null}
                aria-label={`Select ${move} move`}
            >
              <Label htmlFor={move}>{moveEmojis[move]}</Label>
            </Button>
        ))}
      </div>

      {playerMove && (
          <Button onClick={resetGame} className="mt-4 z-10">
            Play Again
          </Button>
      )}
    </div>
  );
}
