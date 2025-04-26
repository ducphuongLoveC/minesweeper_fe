// import React, { useState } from 'react';
// import Minesweeper from './components/Minesweeper';

// const difficultyLevels = {
//   beginner: { x: 9, y: 9, mines: 10 },
//   intermediate: { x: 16, y: 16, mines: 40 },
//   expert: { x: 30, y: 16, mines: 99 },
//   level4: { x: 50, y: 25, mines: 99 },
// };

// const App: React.FC = () => {
//   const [gameKey, setGameKey] = useState(0);
//   const [difficulty, setDifficulty] = useState<keyof typeof difficultyLevels>('beginner');

//   const handleChooseLevel = (level: keyof typeof difficultyLevels) => {
//     setDifficulty(level);
//     setGameKey(prev => prev + 1);
//   };

//   const { x, y } = difficultyLevels[difficulty];

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
//       <header className="w-full max-w-3xl">
//         <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Minesweeper</h1>
//         <div className="flex flex-wrap justify-center gap-2 mb-4">
//           {Object.keys(difficultyLevels).map((level) => (
//             <button
//               key={level}
//               onClick={() => handleChooseLevel(level as keyof typeof difficultyLevels)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${
//                 difficulty === level
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-white text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {level.charAt(0).toUpperCase() + level.slice(1)}
//             </button>
//           ))}
//           <button
//             id="btn-custom"
//             className="px-4 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
//           >
//             Custom
//           </button>
//         </div>
//       </header>
//       <main className="mt-6">
//         <Minesweeper key={gameKey} ratioX={x} ratioY={y} />
//       </main>
//     </div>
//   );
// };

// export default App;



// import { ToastContainer, toast } from 'react-toastify';
// import React, { useState, useEffect } from 'react';
// import Minesweeper from './components/Minesweeper';
// import { io, Socket } from 'socket.io-client';

// type GameMode = 'solo' | 'pvp';
// type PlayerStatus = 'playing' | 'won' | 'lost';

// interface Player {
//   id: string;
//   name: string;
//   status: PlayerStatus;
//   board: {
//     mines: number[];
//     opened: number[];
//     flagged: number[];
//   };
// }

// interface Room {
//   id: string;
//   players: Player[];
//   difficulty: keyof typeof difficultyLevels;
//   gameStarted: boolean;
// }

// const difficultyLevels = {
//   beginner: { x: 9, y: 9, mines: 10 },
//   intermediate: { x: 16, y: 16, mines: 40 },
//   expert: { x: 30, y: 16, mines: 99 },
// };

// const App = () => {
//   const [gameKey, setGameKey] = useState(0);
//   const [difficulty, setDifficulty] = useState<keyof typeof difficultyLevels>('beginner');
//   const [gameMode, setGameMode] = useState<GameMode>('solo');
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [room, setRoom] = useState<Room | null>(null);
//   const [playerName, setPlayerName] = useState('');

//   // Handle socket events for room updates
//   useEffect(() => {
//     if (socket) {
//       socket.on('roomJoined', (roomData: Room) => {
//         console.log('Room joined:', roomData);
//         setRoom(roomData);
//         setGameMode('pvp');
//         setDifficulty(roomData.difficulty);
//         setGameKey(prev => prev + 1);
//       });

//       socket.on('playerLeft', (playerId: string) => {
//         console.log(`Player left: ${playerId}`);
//         setRoom(null);
//         setSocket(null);
//         setGameMode('solo');
//         toast.info('Opponent has left the game!');
//       });

//       socket.on('gameOver', ({ winnerId }) => {
//         console.log(`Game over, winner: ${winnerId}`);
//         const winner = room?.players.find(p => p.id === winnerId);
//         const message = winner
//           ? `${winner.name} has won the game!`
//           : 'Game Over!';
//         toast.success(message, { autoClose: 5000 });
//         setGameKey(prev => prev + 1);
//       });

//       socket.on('error', (message: string) => {
//         console.log(`Error: ${message}`);
//         toast.error(message);
//       });

//       socket.on('full', (message: string) => {
//         toast.success(message);
//       });

//       return () => {
//         socket.off('roomJoined');
//         socket.off('playerLeft');
//         socket.off('gameOver');
//         socket.off('error');
//       };
//     }
//   }, [socket, room]);

//   const handleChooseLevel = (level: keyof typeof difficultyLevels) => {
//     setDifficulty(level);
//     setGameKey(prev => prev + 1);
//   };

//   const initializeSocket = () => {
//     const newSocket = io('http://localhost:3000');
//     setSocket(newSocket);
//     return newSocket;
//   };

//   const handleCreateRoom = () => {
//     const newSocket = initializeSocket();
//     newSocket.emit('createRoom', {
//       difficulty,
//       playerName: playerName || `Player_${Math.floor(Math.random() * 1000)}`,
//     });

//     newSocket.on('roomCreated', (roomData: Room) => {
//       console.log('Room created:', roomData);
//       setRoom(roomData);
//       setGameMode('pvp');
//     });
//   };

//   const handleJoinRoom = (roomId: string) => {
//     const newSocket = initializeSocket();
//     newSocket.emit('joinRoom', {
//       roomId,
//       playerName: playerName || `Player_${Math.floor(Math.random() * 1000)}`,
//     });
//   };

//   const resetGame = () => {
//     setRoom(null);
//     setSocket(null);
//     setGameMode('solo');
//     setGameKey(prev => prev + 1);
//   };

//   const { x, y } = difficultyLevels[difficulty];

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
//       <header className="w-full max-w-3xl">
//         <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Minesweeper</h1>

//         <div className="flex justify-center gap-4 mb-6">
//           <button
//             onClick={() => setGameMode('solo')}
//             className={`px-4 py-2 rounded-lg font-medium transition-colors ${gameMode === 'solo' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
//           >
//             Chơi đơn
//           </button>
//           <button
//             onClick={() => setGameMode('pvp')}
//             className={`px-4 py-2 rounded-lg font-medium transition-colors ${gameMode === 'pvp' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
//           >
//             Chơi với bạn
//           </button>
//         </div>

//         {gameMode === 'pvp' && !room && (
//           <div className="mb-6 p-4 bg-white rounded-lg shadow">
//             <input
//               type="text"
//               placeholder="Your name"
//               value={playerName}
//               onChange={(e) => setPlayerName(e.target.value)}
//               className="px-3 py-2 border rounded mb-2 w-full"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={handleCreateRoom}
//                 className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//               >
//                 Tạo phòng
//               </button>
//               <button
//                 onClick={() => {
//                   const roomId = prompt('Enter room ID:');
//                   if (roomId) handleJoinRoom(roomId);
//                 }}
//                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//               >
//                 Vào phòng
//               </button>
//             </div>
//           </div>
//         )}

//         {room && (
//           <div className="mb-4 p-3 bg-blue-50 rounded-lg">
//             <h3 className="font-semibold">Room: {room.id}</h3>
//             <div className="flex gap-4 mt-2">
//               {room.players.map(player => (
//                 <div key={player.id} className="flex items-center">
//                   <span className={`font-medium ${player.status === 'won' ? 'text-green-600' : player.status === 'lost' ? 'text-red-600' : 'text-gray-700'}`}>
//                     {player.name}
//                   </span>
//                   {player.status !== 'playing' && (
//                     <span className="ml-1 text-xs">
//                       ({player.status === 'won' ? 'Winner!' : 'Lost'})
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </header>

//       <main className="mt-6 flex flex-col items-center gap-8">
//         {gameMode === 'pvp' && room?.players.length === 2 ? (
//           <div className="flex gap-8">
//             {room.players.map(player => (
//               <div key={player.id} className="flex flex-col items-center">
//                 <h3 className="text-lg font-semibold mb-2">{player.name} {socket?.id === player.id ? '(You)' : '(Opponent)'}</h3>
//                 <Minesweeper
//                   key={`${gameKey}-${player.id}`}
//                   ratioX={x}
//                   ratioY={y}
//                   gameMode={gameMode}
//                   socket={socket}
//                   room={room.id}
//                   playerId={player.id}
//                   isOwnBoard={socket?.id === player.id}
//                   playerName={player.name}
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <Minesweeper
//             key={gameKey}
//             ratioX={x}
//             ratioY={y}
//             gameMode={gameMode}
//             socket={socket}
//             room={room?.id}
//             playerId={socket?.id}
//             isOwnBoard={true}
//             playerName={playerName}
//           />
//         )}
//       </main>
//       <ToastContainer position="top-center" autoClose={3000} />
//     </div>
//   );
// };

// export default App;




// import { ToastContainer, toast } from 'react-toastify';
// import React, { useState, useEffect } from 'react';
// import Minesweeper from './components/Minesweeper';
// import { io, Socket } from 'socket.io-client';

// type GameMode = 'solo' | 'pvp';
// type PlayerStatus = 'playing' | 'won' | 'lost';

// interface Player {
//   id: string;
//   name: string;
//   status: PlayerStatus;
//   board: {
//     mines: number[];
//     opened: number[];
//     flagged: number[];
//   };
// }

// interface Room {
//   id: string;
//   players: Player[];
//   difficulty: keyof typeof difficultyLevels;
//   gameStarted: boolean;
//   customSettings?: {
//     width: number;
//     height: number;
//     mines: number;
//   };
// }

// const difficultyLevels = {
//   beginner: { x: 9, y: 9, mines: 10 },
//   intermediate: { x: 16, y: 16, mines: 40 },
//   expert: { x: 30, y: 16, mines: 99 },
//   custom: { x: 16, y: 16, mines: 40 }, // Default values for custom
// };

// const App = () => {
//   const [gameKey, setGameKey] = useState(0);
//   const [difficulty, setDifficulty] = useState<keyof typeof difficultyLevels>('beginner');
//   const [gameMode, setGameMode] = useState<GameMode>('solo');
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [room, setRoom] = useState<Room | null>(null);
//   const [playerName, setPlayerName] = useState('');
//   const [showCustomSettings, setShowCustomSettings] = useState(false);
//   const [customSettings, setCustomSettings] = useState({
//     width: 16,
//     height: 16,
//     mines: 40,
//   });

//   // Handle socket events for room updates
//   useEffect(() => {
//     if (socket) {
//       socket.on('roomJoined', (roomData: Room) => {
//         console.log('Room joined:', roomData);
//         setRoom(roomData);
//         setGameMode('pvp');
//         setDifficulty(roomData.difficulty);
//         setGameKey(prev => prev + 1);
//       });

//       socket.on('playerLeft', (playerId: string) => {
//         console.log(`Player left: ${playerId}`);
//         setRoom(null);
//         setSocket(null);
//         setGameMode('solo');
//         toast.info('Opponent has left the game!');
//       });

//       socket.on('gameOver', ({ winnerId }) => {
//         console.log(`Game over, winner: ${winnerId}`);
//         const winner = room?.players.find(p => p.id === winnerId);
//         const message = winner
//           ? `${winner.name} has won the game!`
//           : 'Game Over!';
//         toast.success(message, { autoClose: 5000 });
//         setGameKey(prev => prev + 1);
//       });

//       socket.on('error', (message: string) => {
//         console.log(`Error: ${message}`);
//         toast.error(message);
//       });

//       socket.on('full', (message: string) => {
//         toast.success(message);
//       });

//       return () => {
//         socket.off('roomJoined');
//         socket.off('playerLeft');
//         socket.off('gameOver');
//         socket.off('error');
//       };
//     }
//   }, [socket, room]);

//   const handleChooseLevel = (level: keyof typeof difficultyLevels) => {
//     setDifficulty(level);
//     if (level === 'custom') {
//       setShowCustomSettings(true);
//     } else {
//       setShowCustomSettings(false);
//       setGameKey(prev => prev + 1);
//     }
//   };

//   const handleCustomSettingsChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
//     const value = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
//     setCustomSettings(prev => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const applyCustomSettings = () => {
//     difficultyLevels.custom = {
//       x: customSettings.width,
//       y: customSettings.height,
//       mines: Math.min(customSettings.mines, customSettings.width * customSettings.height - 1),
//     };
//     setShowCustomSettings(false);
//     setGameKey(prev => prev + 1);
//   };

//   const initializeSocket = () => {
//     const newSocket = io('http://localhost:3000');
//     setSocket(newSocket);
//     return newSocket;
//   };

//   const handleCreateRoom = () => {
//     const newSocket = initializeSocket();
//     const settings = difficulty === 'custom' 
//       ? { 
//           customSettings: {
//             width: customSettings.width,
//             height: customSettings.height,
//             mines: customSettings.mines,
//           }
//         }
//       : {};

//     newSocket.emit('createRoom', {
//       difficulty,
//       playerName: playerName || `Player_${Math.floor(Math.random() * 1000)}`,
//       ...settings,
//     });

//     newSocket.on('roomCreated', (roomData: Room) => {
//       console.log('Room created:', roomData);
//       setRoom(roomData);
//       setGameMode('pvp');
//     });
//   };

//   const handleJoinRoom = (roomId: string) => {
//     const newSocket = initializeSocket();
//     newSocket.emit('joinRoom', {
//       roomId,
//       playerName: playerName || `Player_${Math.floor(Math.random() * 1000)}`,
//     });
//   };

//   const resetGame = () => {
//     setRoom(null);
//     setSocket(null);
//     setGameMode('solo');
//     setGameKey(prev => prev + 1);
//   };

//   const { x, y } = difficulty === 'custom' 
//     ? { x: customSettings.width, y: customSettings.height } 
//     : difficultyLevels[difficulty];

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
//       <header className="w-full max-w-3xl">
//         <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Minesweeper</h1>

//         <div className="flex justify-center gap-4 mb-6">
//           <button
//             onClick={() => setGameMode('solo')}
//             className={`px-4 py-2 rounded-lg font-medium transition-colors ${gameMode === 'solo' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
//           >
//             Chơi đơn
//           </button>
//           <button
//             onClick={() => setGameMode('pvp')}
//             className={`px-4 py-2 rounded-lg font-medium transition-colors ${gameMode === 'pvp' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
//           >
//             Chơi với bạn
//           </button>
//         </div>

//         <div className="flex justify-center gap-2 mb-6">
//           {Object.keys(difficultyLevels).map(level => (
//             <button
//               key={level}
//               onClick={() => handleChooseLevel(level as keyof typeof difficultyLevels)}
//               className={`px-4 py-2 rounded-lg font-medium transition-colors ${difficulty === level ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
//             >
//               {level.charAt(0).toUpperCase() + level.slice(1)}
//             </button>
//           ))}
//         </div>

//         {showCustomSettings && (
//           <div className="mb-6 p-4 bg-white rounded-lg shadow">
//             <div className="grid grid-cols-3 gap-4 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Width (5-50)</label>
//                 <input
//                   type="number"
//                   min="5"
//                   max="50"
//                   value={customSettings.width}
//                   onChange={(e) => handleCustomSettingsChange(e, 'width')}
//                   className="px-3 py-2 border rounded w-full"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Height (5-50)</label>
//                 <input
//                   type="number"
//                   min="5"
//                   max="50"
//                   value={customSettings.height}
//                   onChange={(e) => handleCustomSettingsChange(e, 'height')}
//                   className="px-3 py-2 border rounded w-full"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Mines (1-{Math.min(customSettings.width * customSettings.height - 1, 999)})</label>
//                 <input
//                   type="number"
//                   min="1"
//                   max={customSettings.width * customSettings.height - 1}
//                   value={customSettings.mines}
//                   onChange={(e) => handleCustomSettingsChange(e, 'mines')}
//                   className="px-3 py-2 border rounded w-full"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={applyCustomSettings}
//               className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
//             >
//               Apply Settings
//             </button>
//           </div>
//         )}

//         {gameMode === 'pvp' && !room && (
//           <div className="mb-6 p-4 bg-white rounded-lg shadow">
//             <input
//               type="text"
//               placeholder="Your name"
//               value={playerName}
//               onChange={(e) => setPlayerName(e.target.value)}
//               className="px-3 py-2 border rounded mb-2 w-full"
//             />
//             <div className="flex gap-2">
//               <button
//                 onClick={handleCreateRoom}
//                 className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//               >
//                 Tạo phòng
//               </button>
//               <button
//                 onClick={() => {
//                   const roomId = prompt('Enter room ID:');
//                   if (roomId) handleJoinRoom(roomId);
//                 }}
//                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//               >
//                 Vào phòng
//               </button>
//             </div>
//           </div>
//         )}

//         {room && (
//           <div className="mb-4 p-3 bg-blue-50 rounded-lg">
//             <h3 className="font-semibold">Room: {room.id}</h3>
//             <div className="flex gap-4 mt-2">
//               {room.players.map(player => (
//                 <div key={player.id} className="flex items-center">
//                   <span className={`font-medium ${player.status === 'won' ? 'text-green-600' : player.status === 'lost' ? 'text-red-600' : 'text-gray-700'}`}>
//                     {player.name}
//                   </span>
//                   {player.status !== 'playing' && (
//                     <span className="ml-1 text-xs">
//                       ({player.status === 'won' ? 'Winner!' : 'Lost'})
//                     </span>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </header>

//       <main className="mt-6 flex flex-col items-center gap-8">
//         {gameMode === 'pvp' && room?.players.length === 2 ? (
//           <div className="flex gap-8">
//             {room.players.map(player => (
//               <div key={player.id} className="flex flex-col items-center">
//                 <h3 className="text-lg font-semibold mb-2">{player.name} {socket?.id === player.id ? '(You)' : '(Opponent)'}</h3>
//                 <Minesweeper
//                   key={`${gameKey}-${player.id}`}
//                   ratioX={x}
//                   ratioY={y}
//                   gameMode={gameMode}
//                   socket={socket}
//                   room={room.id}
//                   playerId={player.id}
//                   isOwnBoard={socket?.id === player.id}
//                   playerName={player.name}
//                 />
//               </div>
//             ))}
//           </div>
//         ) : (
//           <Minesweeper
//             key={gameKey}
//             ratioX={x}
//             ratioY={y}
//             gameMode={gameMode}
//             socket={socket}
//             room={room?.id}
//             playerId={socket?.id}
//             isOwnBoard={true}
//             playerName={playerName}
//           />
//         )}
//       </main>
//       <ToastContainer position="top-center" autoClose={3000} />
//     </div>
//   );
// };

// export default App;





import { ToastContainer, toast } from 'react-toastify';
import React, { useState, useEffect } from 'react';
import Minesweeper from './components/Minesweeper';
import { io, Socket } from 'socket.io-client';
import { FaCopy, FaSignOutAlt, FaUser, FaCrown, FaSkull } from 'react-icons/fa';

type GameMode = 'solo' | 'pvp';
type PlayerStatus = 'playing' | 'won' | 'lost';

interface Player {
  id: string;
  name: string;
  status: PlayerStatus;
  board: {
    mines: number[];
    opened: number[];
    flagged: number[];
  };
}

interface Room {
  id: string;
  players: Player[];
  difficulty: keyof typeof difficultyLevels;
  gameStarted: boolean;
  customSettings?: {
    width: number;
    height: number;
    mines: number;
  };
}

const difficultyLevels = {
  beginner: { x: 9, y: 9, mines: 10 },
  intermediate: { x: 16, y: 16, mines: 40 },
  expert: { x: 30, y: 16, mines: 99 },
  custom: { x: 16, y: 16, mines: 40 },
};

const App = () => {
  const [gameKey, setGameKey] = useState(0);
  const [difficulty, setDifficulty] = useState<keyof typeof difficultyLevels>('beginner');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    width: 16,
    height: 16,
    mines: 40,
  });

  useEffect(() => {
    if (socket) {
      socket.on('roomJoined', (roomData: Room) => {
        setRoom(roomData);
        setGameMode('pvp');
        setDifficulty(roomData.difficulty);
        setGameKey(prev => prev + 1);
      });

      socket.on('playerLeft', (playerId: string) => {
        setRoom(null);
        setSocket(null);
        setGameMode('solo');
        toast.info('Đối thủ đã rời khỏi phòng!');
      });

      socket.on('gameOver', ({ winnerId }) => {
        const winner = room?.players.find(p => p.id === winnerId);
        const message = winner
          ? `${winner.name} đã chiến thắng!`
          : 'Game Over!';
        toast.success(message, { autoClose: 5000 });
        setGameKey(prev => prev + 1);
      });

      socket.on('error', (message: string) => {
        toast.error(message);
      });

      return () => {
        socket.off('roomJoined');
        socket.off('playerLeft');
        socket.off('gameOver');
        socket.off('error');
      };
    }
  }, [socket, room]);

  const handleChooseLevel = (level: keyof typeof difficultyLevels) => {
    setDifficulty(level);
    if (level === 'custom') {
      setShowCustomSettings(true);
    } else {
      setShowCustomSettings(false);
      setGameKey(prev => prev + 1);
    }
  };

  const handleCustomSettingsChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
    setCustomSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyCustomSettings = () => {
    difficultyLevels.custom = {
      x: customSettings.width,
      y: customSettings.height,
      mines: Math.min(customSettings.mines, customSettings.width * customSettings.height - 1),
    };
    setShowCustomSettings(false);
    setGameKey(prev => prev + 1);
  };

  const initializeSocket = () => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);
    return newSocket;
  };

  const handleCreateRoom = () => {
    const newSocket = initializeSocket();
    const settings = difficulty === 'custom' 
      ? { 
          customSettings: {
            width: customSettings.width,
            height: customSettings.height,
            mines: customSettings.mines,
          }
        }
      : {};

    newSocket.emit('createRoom', {
      difficulty,
      playerName: playerName || `Người chơi ${Math.floor(Math.random() * 1000)}`,
      ...settings,
    });

    newSocket.on('roomCreated', (roomData: Room) => {
      setRoom(roomData);
      setGameMode('pvp');
    });
  };

  const handleJoinRoom = (roomId: string) => {
    const newSocket = initializeSocket();
    newSocket.emit('joinRoom', {
      roomId,
      playerName: playerName || `Người chơi ${Math.floor(Math.random() * 1000)}`,
    });
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leaveRoom');
      socket.disconnect();
    }
    setRoom(null);
    setSocket(null);
    setGameMode('solo');
    toast.info('Bạn đã rời khỏi phòng');
  };

  const copyRoomId = () => {
    if (room) {
      navigator.clipboard.writeText(room.id);
      toast.success('Đã sao chép ID phòng!');
    }
  };

  const { x, y } = difficulty === 'custom' 
    ? { x: customSettings.width, y: customSettings.height } 
    : difficultyLevels[difficulty];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <header className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Minesweeper by Duc Phuong</h1>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setGameMode('solo')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${gameMode === 'solo' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
          >
            Chơi đơn
          </button>
          <button
            onClick={() => setGameMode('pvp')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${gameMode === 'pvp' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
          >
            Chơi với bạn
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {Object.keys(difficultyLevels).map(level => (
            <button
              key={level}
              onClick={() => handleChooseLevel(level as keyof typeof difficultyLevels)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${difficulty === level ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
            >
              {level === 'beginner' ? 'Dễ' : 
               level === 'intermediate' ? 'Trung bình' : 
               level === 'expert' ? 'Khó' : 'Tùy chỉnh'}
            </button>
          ))}
        </div>

        {showCustomSettings && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chiều rộng (5-50)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={customSettings.width}
                  onChange={(e) => handleCustomSettingsChange(e, 'width')}
                  className="px-3 py-2 border rounded w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao (5-50)</label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={customSettings.height}
                  onChange={(e) => handleCustomSettingsChange(e, 'height')}
                  className="px-3 py-2 border rounded w-full"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số mìn (1-{Math.min(customSettings.width * customSettings.height - 1, 999)})</label>
                <input
                  type="number"
                  min="1"
                  max={customSettings.width * customSettings.height - 1}
                  value={customSettings.mines}
                  onChange={(e) => handleCustomSettingsChange(e, 'mines')}
                  className="px-3 py-2 border rounded w-full"
                />
              </div> */}
            </div>
            <button
              onClick={applyCustomSettings}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
            >
              Áp dụng cài đặt
            </button>
          </div>
        )}

        {gameMode === 'pvp' && !room && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow">
            <input
              type="text"
              placeholder="Tên của bạn"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="px-3 py-2 border rounded mb-2 w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex-1"
              >
                Tạo phòng
              </button>
              <button
                onClick={() => {
                  const roomId = prompt('Nhập ID phòng:');
                  if (roomId) handleJoinRoom(roomId);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-1"
              >
                Vào phòng
              </button>
            </div>
          </div>
        )}

        {room && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-md border border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-lg text-blue-700 flex items-center">
                Phòng: 
                <span className="ml-2 bg-blue-100 px-3 py-1 rounded-md font-mono">
                  {room.id}
                </span>
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={copyRoomId}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                  title="Sao chép ID phòng"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={leaveRoom}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                  title="Rời khỏi phòng"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              {room.players.map(player => (
                <div 
                  key={player.id} 
                  className={`flex items-center p-3 rounded-lg ${socket?.id === player.id ? 'bg-blue-50' : 'bg-gray-50'}`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${socket?.id === player.id ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                    <FaUser />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium">
                        {player.name} {socket?.id === player.id && '(Bạn)'}
                      </span>
                      {player.status === 'won' && (
                        <FaCrown className="ml-2 text-yellow-500" />
                      )}
                      {player.status === 'lost' && (
                        <FaSkull className="ml-2 text-gray-500" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {player.status === 'playing' ? 'Đang chơi' : 
                       player.status === 'won' ? 'Chiến thắng!' : 'Thua cuộc'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mt-6 flex flex-col items-center gap-8">
        {gameMode === 'pvp' && room?.players.length === 2 ? (
          <div className="flex gap-8">
            {room.players.map(player => (
              <div key={player.id} className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  {player.name} 
                  {socket?.id === player.id ? (
                    <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded">Bạn</span>
                  ) : (
                    <span className="ml-2 text-sm bg-gray-500 text-white px-2 py-1 rounded">Đối thủ</span>
                  )}
                </h3>
                <Minesweeper
                  key={`${gameKey}-${player.id}`}
                  ratioX={x}
                  ratioY={y}
                  gameMode={gameMode}
                  socket={socket}
                  room={room.id}
                  playerId={player.id}
                  isOwnBoard={socket?.id === player.id}
                  playerName={player.name}
                />
              </div>
            ))}
          </div>
        ) : (
          <Minesweeper
            key={gameKey}
            ratioX={x}
            ratioY={y}
            gameMode={gameMode}
            socket={socket}
            room={room?.id}
            playerId={socket?.id}
            isOwnBoard={true}
            playerName={playerName}
          />
        )}
      </main>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default App;