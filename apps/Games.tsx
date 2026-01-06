
import React, { useState, useEffect, useRef } from 'react';
import { AppProps } from '../types';
import { Icon } from '../components/SystemUI';

// --- Mini Game: Tic Tac Toe ---
export const TicTacToeGame: React.FC<AppProps> = ({ showNotification }) => {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [xIsNext, setXIsNext] = useState(true);
    
    const winner = calculateWinner(board);
    const isDraw = !winner && board.every(Boolean);

    useEffect(() => {
        if(winner) showNotification(`Player ${winner} won!`);
        if(isDraw) showNotification("Game Over: Draw!");
    }, [winner, isDraw, showNotification]);

    function handleClick(i: number) {
        if (winner || board[i]) return;
        const next = board.slice();
        next[i] = xIsNext ? 'X' : 'O';
        setBoard(next);
        setXIsNext(!xIsNext);
    }

    function reset() {
        setBoard(Array(9).fill(null));
        setXIsNext(true);
    }

    return (
        <div className="h-full bg-surface flex flex-col items-center justify-center p-4">
            <div className="mb-4 text-xl font-bold text-primary">
                {winner ? `Winner: ${winner}` : isDraw ? "Draw!" : `Next Player: ${xIsNext ? 'X' : 'O'}`}
            </div>
            <div className="grid grid-cols-3 gap-2 bg-surfaceVariant p-2 rounded-xl">
                {board.map((val, i) => (
                    <button 
                        key={i} 
                        onClick={() => handleClick(i)}
                        className={`w-20 h-20 text-4xl font-bold rounded-lg transition-all active:scale-90 duration-150 flex items-center justify-center shadow-sm
                            ${val === 'X' ? 'text-blue-500 bg-white' : val === 'O' ? 'text-red-500 bg-white' : 'bg-white/50 hover:bg-white'}
                        `}
                    >
                        {val}
                    </button>
                ))}
            </div>
            <button onClick={reset} className="mt-6 px-6 py-2 bg-secondary text-white rounded-full active:scale-95 transition-transform hover:shadow-lg">Restart Game</button>
        </div>
    );
};

function calculateWinner(squares: any[]) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// --- Mini Game: Snake ---
export const SnakeGame: React.FC<AppProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    
    // Placeholder simplified
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.fillStyle = '#222';
        ctx.fillRect(0,0, canvas.width, canvas.height);
        ctx.fillStyle = '#4ade80';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Snake Game Placeholder", 150, 150);
    }, []);

    return (
        <div className="h-full bg-surface flex flex-col items-center justify-center">
            <div className="text-xl font-bold mb-2">Score: {score}</div>
            <canvas ref={canvasRef} width={300} height={300} className="bg-black rounded shadow-lg" />
            <button className="mt-4 px-4 py-2 bg-primary text-onPrimary rounded-full active:scale-95 transition-transform">Start Game</button>
        </div>
    );
};

// --- Mini Game: Minesweeper ---
export const MinesweeperGame: React.FC<AppProps> = ({ showNotification }) => {
    const ROWS = 10;
    const COLS = 10;
    const MINES = 15;

    const [grid, setGrid] = useState<any[][]>([]);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    useEffect(() => { reset(); }, []);

    const reset = () => {
        let newGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill({ isMine: false, isOpen: false, count: 0 }));
        let minesPlaced = 0;
        while(minesPlaced < MINES) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            if(!newGrid[r][c].isMine) {
                newGrid[r][c] = { ...newGrid[r][c], isMine: true };
                minesPlaced++;
            }
        }
        
        // Calculate counts
        for(let r=0; r<ROWS; r++) {
            for(let c=0; c<COLS; c++) {
                if(!newGrid[r][c].isMine) {
                    let count = 0;
                    for(let i=-1; i<=1; i++) {
                        for(let j=-1; j<=1; j++) {
                            if(r+i>=0 && r+i<ROWS && c+j>=0 && c+j<COLS && newGrid[r+i][c+j].isMine) count++;
                        }
                    }
                    newGrid[r][c] = { ...newGrid[r][c], count };
                }
            }
        }
        setGrid(newGrid);
        setGameOver(false);
        setWon(false);
    };

    const handleClick = (r: number, c: number) => {
        if(gameOver || won || grid[r][c].isOpen) return;
        
        const newGrid = [...grid.map(row => [...row])];
        
        if(newGrid[r][c].isMine) {
            newGrid[r][c].isOpen = true;
            setGrid(newGrid);
            setGameOver(true);
            showNotification("Boom! Game Over.");
            return;
        }

        const reveal = (rr: number, cc: number) => {
            if(rr<0 || rr>=ROWS || cc<0 || cc>=COLS || newGrid[rr][cc].isOpen) return;
            newGrid[rr][cc].isOpen = true;
            if(newGrid[rr][cc].count === 0) {
                 for(let i=-1; i<=1; i++) for(let j=-1; j<=1; j++) reveal(rr+i, cc+j);
            }
        };
        reveal(r,c);
        setGrid(newGrid);
        
        // Check win
        let openCount = 0;
        newGrid.forEach(row => row.forEach(cell => { if(cell.isOpen) openCount++; }));
        if(openCount === (ROWS*COLS - MINES)) {
            setWon(true);
            showNotification("You cleared the minefield!");
        }
    };

    return (
        <div className="h-full bg-surface flex flex-col items-center justify-center p-2 select-none">
            <div className="mb-2 font-bold text-primary">{gameOver ? "Game Over" : won ? "Victory!" : "Minesweeper"}</div>
            <div className="bg-surfaceVariant p-2 rounded shadow-inner" style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 2rem)`, gap: '2px' }}>
                {grid.map((row, r) => row.map((cell, c) => (
                    <div 
                        key={`${r}-${c}`}
                        onClick={() => handleClick(r,c)}
                        className={`w-8 h-8 flex items-center justify-center font-bold text-sm cursor-pointer border border-black/10 transition-all active:scale-90 duration-100
                            ${cell.isOpen 
                                ? (cell.isMine ? 'bg-red-500 text-white' : 'bg-white/50') 
                                : 'bg-primary/20 hover:bg-primary/30 hover:scale-105 shadow-sm'}
                        `}
                    >
                        {cell.isOpen && !cell.isMine && cell.count > 0 && cell.count}
                        {cell.isOpen && cell.isMine && '💣'}
                    </div>
                )))}
            </div>
            <button onClick={reset} className="mt-4 px-4 py-1 bg-secondary text-white rounded-full text-sm active:scale-95 transition-transform">Reset</button>
        </div>
    );
};
