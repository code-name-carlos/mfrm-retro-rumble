"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GestureRecognition } from "@/components/gesture-recognition";

// Placeholder images
const playerImage = "https://picsum.photos/200/300";
const opponentImage = "https://picsum.photos/200/300";

const moves = ["Rock", "Paper", "Scissors", "Lizard", "Spock"] as const;
type Move = (typeof moves)[number];

export default function Home() {
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [opponentMove, setOpponentMove] = useState<Move | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleMoveSelect = (move: Move) => {
    setPlayerMove(move);
    const aiMove = moves[Math.floor(Math.random() * moves.length)];
    setOpponentMove(aiMove);
    determineWinner(move, aiMove);
  };

  const determineWinner = (playerMove: Move, opponentMove: Move) => {
    if (playerMove === opponentMove) {
      setResult("It's a tie!");
      return;
    }

    const winningCombinations: { [key in Move]: Move[] } = {
      Rock: ["Scissors", "Lizard"],
      Paper: ["Rock", "Spock"],
      Scissors: ["Paper", "Lizard"],
      Lizard: ["Spock", "Paper"],
      Spock: ["Scissors", "Rock"],
    };

    if (winningCombinations[playerMove].includes(opponentMove)) {
      setResult(`You win! ${playerMove} beats ${opponentMove}`);
    } else {
      setResult(`You lose! ${opponentMove} beats ${playerMove}`);
    }
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error("Image failed to load");
    (event.target as HTMLImageElement).src = "https://picsum.photos/id/237/200/300";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background relative overflow-hidden">

      {/* Top Left Circle */}
      <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-accent -translate-x-1/4 -translate-y-1/4 md:w-64 md:h-64 md:-translate-x-1/8 md:-translate-y-1/8"></div>

      {/* Bottom Right Circle */}
      <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary translate-x-1/4 translate-y-1/4 md:w-64 md:h-64 md:translate-x-1/8 md:translate-y-1/8"></div>

      <h1 className="text-3xl font-bold mb-4 text-foreground z-10">Retro Rumble</h1>

      <div className="flex justify-around w-full max-w-4xl mb-8 z-10">
        <Card className="w-1/2 mx-2">
          <CardContent className="flex flex-col items-center">
            <h2 className="text-xl mb-2 text-foreground">Player</h2>
            <img
              src={playerImage}
              alt="The Player"
              className="rounded-md shadow-md mb-2"
              onError={handleImageError}
            />
            <p className="text-sm text-muted-foreground">
              Move: {playerMove || "Not selected"}
            </p>
          </CardContent>
        </Card>

        <Card className="w-1/2 mx-2">
          <CardContent className="flex flex-col items-center">
            <h2 className="text-xl mb-2 text-foreground">Opponent</h2>
            <img
              src={opponentImage}
              alt="The Opponent"
              className="rounded-md shadow-md mb-2"
              onError={handleImageError}
            />
            <p className="text-sm text-muted-foreground">
              Move: {opponentMove || "Not selected"}
            </p>
          </CardContent>
        </Card>
      </div>

      {result && <p className="text-lg mb-4 text-accent z-10">{result}</p>}

      <div className="flex flex-wrap justify-center gap-4 mb-8 z-10">
        {moves.map((move) => (
          <Button key={move} onClick={() => handleMoveSelect(move)}>
            {move}
          </Button>
        ))}
      </div>

      <GestureRecognition onMoveSelect={handleMoveSelect} />
    </div>
  );
}
