import { useState, useEffect } from "react";
import axios from "axios";

const TicTac = () => {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameState, setGameState] = useState("menu"); // menu, playing, ended
  const [gameStats, setGameStats] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [selectedBoardSize, setSelectedBoardSize] = useState(3);
  const startGame = async () => {
    if (!selectedDifficulty) return;
    setLoading(true);

    try {

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/game/start`, {

        difficulty: selectedDifficulty,

        boardSize: selectedBoardSize

      });

      setGame(response.data);

      setGameState("playing");

    } catch (error) {

      console.error("Error starting game", error);

    } finally {

      setLoading(false);

    }

  };
  const makeMove = async (row, col) => {

    if (!game || game.board[row][col] !== " " || game.winner) return;

    setLoading(true);

    try {

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/game/move`, {

        gameId: game._id,

        row,

        col,

      });

      setGame(response.data);

      if (response.data.winner) {

        setGameState("ended");

        // Get game stats when game ends

        if (response.data._id) {

          getGameStats(response.data._id);

        }

      }

    } catch (error) {

      console.error("Error making move", error);

    } finally {

      setLoading(false);

    }

  };

  const getGameStats = async (gameId) => {

    try {

      const response = await axios.get(`http://localhost:5000/game/stats/${gameId}`);

      setGameStats(response.data);

    } catch (error) {

      console.error("Error getting game stats", error);

    }

  };
  const resetGame = () => {

    setGame(null);

    setGameState("menu");

    setGameStats(null);

    setSelectedDifficulty(null);

  };
  // Determine which symbol to display (X, O, or custom visual)
  const renderCell = (cell) => {

    if (cell === "X") {

      return <div className="text-blue-600 text-4xl">X</div>;

    } else if (cell === "O") {

      return <div className="text-red-600 text-4xl">O</div>;

    }

    return null;

  };
  // Get difficulty color

  const getDifficultyColor = (difficulty) => {

    switch (difficulty) {

      case "easy": return "#4ade80"; // green

      case "medium": return "#fbbf24"; // yellow

      case "hard": return "#ef4444"; // red

      case "expert": return "#8b5cf6"; // purple

      default: return "#4ade80";

    }

  };
  // Get cell size based on board size

  const getCellSize = (boardSize) => {

    switch (boardSize) {

      case 3: return "w-20 h-20";

      case 4: return "w-16 h-16";

      case 6: return "w-12 h-12";

      default: return "w-20 h-20";

    }

  };
  // Get font size based on board size

  const getFontSize = (boardSize) => {

    switch (boardSize) {

      case 3: return "text-4xl";

      case 4: return "text-3xl";

      case 6: return "text-2xl";

      default: return "text-4xl";

    }

  };

  const isDifficultySelected = (difficulty) => {

    return selectedDifficulty === difficulty;

  };

  const isBoardSizeSelected = (size) => {

    return selectedBoardSize === size;

  };

  return (

    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-800 to-blue-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-yellow-300 tracking-wider">Tic-Tac-Toe</h1>

      {gameState === "menu" && (

        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Game Setup</h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Select Board Size:</h3>
            <div className="flex justify-center gap-3">
              {[3, 4, 6].map((size) => (
                <button
                  key={`size-${size}`}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold transition-all ${
                    isBoardSizeSelected(size)
                      ? "bg-blue-600 ring-2 ring-blue-300"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedBoardSize(size)}
                >
                  {size}×{size}
                </button>

              ))}

            </div>

          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Select Difficulty:</h3>
            <div className="grid grid-cols-2 gap-3">
              {["easy", "medium", "hard", "expert"].map((level) => (
                <button
                  key={`diff-${level}`}
                  className={`py-3 px-4 rounded-lg font-bold uppercase tracking-wide transition-all ${
                    isDifficultySelected(level) ? "ring-2 ring-white" : ""
                  }`}
                  style={{
                    backgroundColor: getDifficultyColor(level),
                    opacity: isDifficultySelected(level) ? 1 : 0.8
                  }}
                  onClick={() => setSelectedDifficulty(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`w-full py-3 px-6 rounded-lg font-bold text-lg uppercase tracking-wider transition-all ${
              selectedDifficulty
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            onClick={startGame}
            disabled={!selectedDifficulty || loading}
          >
            {loading ? "Starting Game..." : "Start Game"}

          </button>

        </div>

      )}
      {gameState !== "menu" && game && (

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">

          <div className="mb-4 flex justify-between items-center">

            <span
              className="py-1 px-3 rounded-full text-sm font-bold"

              style={{ backgroundColor: getDifficultyColor(game.difficulty) }}

            >
              {game.difficulty.toUpperCase()}

            </span>
            <span className="bg-blue-600 py-1 px-3 rounded-full text-sm font-bold">

              {game.board.length}×{game.board.length}

            </span>

          </div>
          <div className={`grid grid-cols-${game.board.length} gap-2 mb-4`}

            style={{ gridTemplateColumns: `repeat(${game.board.length}, minmax(0, 1fr))` }}>

            {game.board.map((row, i) =>

              row.map((cell, j) => (

                <button

                  key={`${i}-${j}`}

                  className={`${getCellSize(game.board.length)} flex items-center justify-center border-2 border-gray-600 bg-gray-700 rounded-md transition-all duration-150 hover:bg-gray-600 ${

                    cell !== " " ? "cursor-default" : "cursor-pointer"

                  }`}

                  onClick={() => makeMove(i, j)}

                  disabled={cell !== " " || loading || game.winner}

                >
                  <div className={getFontSize(game.board.length)}>
                    {renderCell(cell)}
                  </div>
                </button>
              ))
            )}
          </div>
      
          {game.winner && (
            <div className="text-center animate-pulse">
              <p className="text-2xl font-bold mb-4">
                {game.winner === "Tie"
                  ? "It's a tie!"
                  : <span className={game.winner === "X" ? "text-blue-400" : "text-red-400"}>
                      {game.winner} wins!
                    </span>
                }
              </p>
              {gameStats && (
                <div className="bg-gray-700 p-4 rounded-lg mb-4 text-left">

                  <h3 className="font-bold mb-2 text-center">Game Stats</h3>

                  <div className="grid grid-cols-2 gap-2 text-sm">

                    <div>Board Size:</div>

                    <div className="text-right">{gameStats.boardSize}×{gameStats.boardSize}</div>

                    <div>Total Moves:</div>

                    <div className="text-right">{gameStats.totalMoves}</div>

                    <div>Your Moves:</div>

                    <div className="text-right">{gameStats.playerMoves}</div>

                    <div>AI Moves:</div>

                    <div className="text-right">{gameStats.computerMoves}</div>

                  </div>

                </div>
              )}
              <div className="flex gap-3 justify-center">
                <button
                  className="mt-2 bg-green-600 hover:bg-green-700 py-2 px-6 rounded-full font-bold transition-colors"
                  onClick={resetGame}
                >
                  New Game
                </button>

              </div>

            </div>

          )}

          {!game.winner && gameState === "playing" && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-lg">

                {loading ? "AI thinking..." : "Your turn"}
              </p>

              <button
                className="bg-yellow-600 hover:bg-yellow-700 py-2 px-4 rounded-md font-bold transition-colors"
                onClick={resetGame}
              >
                Restart
              </button>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TicTac;