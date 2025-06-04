// import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
// import { toast } from "react-toastify";
// import { FaCopy, FaSignOutAlt, FaUser, FaCrown, FaSkull } from "react-icons/fa";
// import CustomDialog from "../../components/CustomDialog";
// import { BeatLoader } from "react-spinners";
// import { v4 as uuidv4 } from "uuid";
// import MinesweeperModeSelector from "../Components/MinesweeperModeSelector";
// import CellCpn from "../../components/CellCpn";
// import { Box } from "../../components/UI/Box";
// interface PlayerState {
//   revealedCells: Set<number>;
//   flags: Set<number>;
// }
// interface Player {
//   id: string;
//   name: string;
//   status: "playing" | "won" | "lost";
//   isReady: boolean;
//   isHost: boolean;
// }

// interface DialogProp {
//   end: boolean;
//   replay: boolean;
// }

// interface PvpPlayProp {
//   socket: any;
//   onInRoom: () => void;
//   onLeaveRoom: () => void;
// }

// const PvpPlay: React.FC<PvpPlayProp> = ({ socket, onInRoom, onLeaveRoom }) => {
//   const [roomId, setRoomId] = useState('');
//   const [playerId, setPlayerId] = useState<string | null>(null);
//   const [playerName, setPlayerName] = useState("");
//   const [maxPlayers, setMaxPlayers] = useState<Number>(2);
//   const [gameStates, setGameStates] = useState<any | null>(null);
//   const [playerStates, setPlayerStates] = useState<Map<string, PlayerState>>(new Map());
//   const [players, setPlayers] = useState<Player[]>([]);
//   const [openDialog, setOpenDialog] = useState<DialogProp>({ end: false, replay: false });
//   const [dialogMessage, setDialogMessage] = useState("");
//   const [configMode, setConfigMode] = useState<any>({});
//   const [gameStarted, setGameStarted] = useState(false);
//   const [endedGame, setEndedGame] = useState(false);

//   // Sử dụng useMemo để tránh tính toán lại các giá trị không thay đổi
//   const currentPlayer = useMemo(() => players.find((p) => p.id === playerId), [players, playerId]);
//   console.log(playerStates);

//   const normalizePlayerStates = useCallback(
//     (states: { [key: string]: { revealedCells: number[]; flags: number[] } }) => {
//       const normalized = new Map<string, PlayerState>();
//       Object.entries(states).forEach(([id, state]) => {
//         normalized.set(id, {
//           revealedCells: new Set(state.revealedCells),
//           flags: new Set(state.flags),
//         });
//       });
//       return normalized;
//     },
//     []
//   );

//   // Tách các sự kiện socket thành các hàm riêng biệt để dễ quản lý
//   const setupSocketEvents = useCallback(() => {
//     const handleJoinedRoom = ({ roomId, playerId }: { roomId: string; playerId: string }) => {
//       setRoomId(roomId);
//       setPlayerId(playerId);
//     };

//     const handleSetGames = ({ gameStates, playerStates, playersStatus }: any) => {
//       const players: Player[] = playersStatus.map((pl: any) => {
//         const [id, player]: any = Object.entries(pl)[0];
//         return {
//           id,
//           name: player.playerName,
//           status: "playing",
//           isReady: player.isReady,
//           isHost: player.isHost
//         };
//       });

//       if (gameStates) {
//         setGameStates(gameStates);
//       }
//       setPlayers(players);
//       setPlayerStates(normalizePlayerStates(playerStates));
//     };

//     const handleUpdateState = ({ playerStates, action }: any) => {

//       setPlayerStates(normalizePlayerStates(playerStates));

//       if (action.result?.isMine || action.result?.isWin) {
//         const isCurrentPlayer = action.playerId === playerId;
//         const message = action.result?.isMine
//           ? isCurrentPlayer
//             ? "Bạn đã chạm vào mìn! Thua cuộc!"
//             : "Đối thủ chạm mìn! Bạn thắng!"
//           : isCurrentPlayer
//             ? "Bạn đã thắng!"
//             : "Đối thủ đã thắng!";

//         setDialogMessage(message);
//         setOpenDialog((pre) => ({ ...pre, end: true }));

//         setPlayers((prev) =>
//           prev.map((p) =>
//             p.id === action.playerId
//               ? { ...p, status: action.result?.isMine ? "lost" : "won" }
//               : { ...p, status: action.result?.isMine ? "won" : "lost" }
//           )
//         );
//       }
//     };

//     const handlers = {
//       joinedRoom: handleJoinedRoom,
//       setGames: handleSetGames,
//       canStartGame: ({ canStart, message }: { canStart: boolean; message: string }) => {
//         setGameStarted(canStart);
//         toast.success(message, { toastId: "canStartGame" });
//       },
//       sendReplayGame: ({ message }: { message: string }) => {
//         setDialogMessage(message);
//         setOpenDialog((pre) => ({ ...pre, replay: true }));
//       },
//       replayConfirmed: ({ playerStates, playersStatus }: any) => {
//         // setGameStates(gameStates);
//         setPlayerStates(normalizePlayerStates(playerStates));
//         setPlayers(
//           playersStatus.map((pl: any) => {
//             const [id, player]: any = Object.entries(pl)[0];
//             return {
//               id,
//               name: player.playerName,
//               status: "playing",
//               isReady: player.isReady,
//               isHost: player.isHost
//             };
//           })
//         );
//         setGameStarted(true);
//         setEndedGame(false);
//         setOpenDialog({ end: false, replay: false });
//         toast.success("Trò chơi đã được bắt đầu lại!");
//       },
//       updateState: handleUpdateState,
//       gameOver: ({ winner, message }: any) => {
//         setDialogMessage(message || (winner === playerId ? "Bạn đã thắng!" : "Bạn đã thua!"));
//         setOpenDialog((pre) => ({ ...pre, end: true }));
//         setGameStarted(false);
//         setEndedGame(true);
//       },
//       playerLeft: ({ playersStatus, gameStates, playerStates }: any) => {
//         toast.info("Đối thủ đã rời phòng!");
//         const updatedPlayers: Player[] = playersStatus.map((pl: any) => {
//           const [id, player]: any = Object.entries(pl)[0];
//           return {
//             id,
//             name: player.playerName,
//             status: "playing",
//             isReady: player.isReady,
//             isHost: player.isHost
//           };
//         });
//         setPlayers(updatedPlayers);
//         setGameStates(gameStates);
//         setPlayerStates(normalizePlayerStates(playerStates));
//         setGameStarted(false);
//         setEndedGame(false);
//       },
//       error: ({ message }: { message: string }) => toast.error(message),
//       roomFull: ({ message }: { message: string }) => toast.error(message),
//       playerNotReady: ({ message }: { message: string }) => toast.info(message),
//       replayDeclined: ({ message }: { message: string }) => {
//         toast.info(message || "Một người chơi đã từ chối chơi lại.");
//         setOpenDialog((pre) => ({ ...pre, replay: false }));
//       },
//       returnToLobby: ({ message }: { message: string }) => {
//         toast.info(message);
//         setGameStates(null);
//         setPlayerStates(new Map());
//         setPlayers([]);
//         setRoomId("");
//         setPlayerId(null);
//         setGameStarted(false);
//         setEndedGame(false);
//         setOpenDialog({ end: false, replay: false });
//       }
//     };

//     Object.entries(handlers).forEach(([event, handler]) => {
//       socket.on(event, handler);
//     });

//     return () => {
//       Object.entries(handlers).forEach(([event, handler]) => {
//         socket.off(event, handler);
//       });
//     };
//   }, [playerId, normalizePlayerStates]);

//   useEffect(() => {
//     return setupSocketEvents();
//   }, [setupSocketEvents]);

//   const joinRoom = useCallback(
//     (roomIdToJoin: string) => {
//       if (roomIdToJoin.trim()) {
//         socket.emit("joinRoom", roomIdToJoin, playerName);
//         onInRoom();
//       } else {
//         toast.error("Kiểm tra lại tên phòng!");
//       }
//     },
//     [playerName, socket, onInRoom]
//   );

//   const createRoom = useCallback(() => {
//     const newRoomId = uuidv4();
//     setRoomId(newRoomId);
//     socket.emit("joinRoom", newRoomId, playerName, configMode, maxPlayers);
//     onInRoom();
//   }, [playerName, configMode, maxPlayers, socket, onInRoom]);

//   const startGame = useCallback(() => {
//     socket.emit("startGame", roomId);
//   }, [roomId, socket]);

//   const replayGame = useCallback(() => {
//     toast.success('Gửi lời mời thành công!');
//     socket.emit("replayGame", roomId);
//   }, [roomId, socket]);

//   const toggleReadyGame = useCallback(() => {
//     socket.emit("toggleReadyGame", roomId);
//   }, [roomId, socket]);

//   const leaveRoom = useCallback(() => {
//     socket.emit("leaveRoom", roomId);
//     onLeaveRoom();
//   }, [roomId, socket, onLeaveRoom]);

//   const copyRoomId = useCallback(() => {
//     navigator.clipboard.writeText(roomId);
//     toast.success("Đã sao chép ID phòng!");
//   }, [roomId]);


//   const handleOpenCell = useCallback((index: number) => {

//     console.log();
//     if (gameStates && gameStarted) {

//       socket.emit("openCell", { roomId, index });
//     }
//   }, [gameStates, gameStarted, roomId, socket]);

//   const handleToggleFlag = useCallback((index: number, e: React.MouseEvent) => {
//     e.preventDefault();
//     if (gameStates && gameStarted) {
//       socket.emit("toggleFlag", { roomId, index });
//     }
//   }, [gameStates, gameStarted, roomId, socket]);

//   const handleChording = useCallback((index: number) => {
//     if (gameStates && gameStarted) {
//       socket.emit("chording", { roomId, index });
//     }
//   }, [gameStates, gameStarted, roomId, socket]);


//   const renderBoard = useCallback((isOpponent: boolean, game: any, pId: any) => {
//     if (!gameStates) return null;
//     console.log(playerStates);

//     const { ratioX, ratioY, cells } = game;
//     const currentPlayerState = playerStates.get(pId);
//     const currentRevealed = currentPlayerState?.revealedCells || new Set();
//     const currentFlags = currentPlayerState?.flags || new Set();

//     const canInteractGlobal = !isOpponent && gameStarted;

//     return (
//       <div
//         className="grid gap-[1px] bg-gray-300 p-1 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm"
//         style={{
//           gridTemplateColumns: `repeat(${ratioY}, 24px)`,
//           gridTemplateRows: `repeat(${ratioX}, 24px)`,
//         }}
//       >
//         {cells.map((cell: any, index: number) => {
//           const isRevealed = currentRevealed.has(index);
//           const isFlagged = currentFlags.has(index);
//           const canInteract = canInteractGlobal && !isRevealed;
//           const interactive = canInteract && gameStarted;
//           const canChording = isRevealed && !isOpponent;

//           let content = "";
//           if (isFlagged) content = "🚩";
//           else if (isRevealed) {
//             content = cell.isMine ? "💣" : cell.count > 0 ? cell.count.toString() : "";
//           } else if (cell.isMarkHint) content = "x";

//           return (
//             <CellCpn
//               canInteract={canInteract}
//               count={cell.count}
//               isRevealed={isRevealed}
//               key={`${pId}-${index}`}
//               onClick={interactive ? () => handleOpenCell(index) : canChording ? () => handleChording(index) : undefined}
//               onContextMenu={canInteract ? (e) => handleToggleFlag(index, e) : undefined}
//             >
//               {content}
//             </CellCpn>
//           );
//         })}
//       </div>
//     );
//   }, [gameStates, playerStates, playerId, gameStarted, handleOpenCell, handleToggleFlag, handleChording]);


//   const renderPreGameForm = useCallback(() => {
//     if (roomId && gameStates) return null;

//     return (
//       <Box>
//         <MinesweeperModeSelector onModeChange={setConfigMode} />
//         <Box
//           as='input'
//           type="text"
//           placeholder="Tên của bạn"
//           value={playerName}
//           onChange={(e) => setPlayerName(e.target.value)}
//           className="w-[75%]"
//         />
//         <Box
//           as='input'
//           type="number"
//           min={2}
//           max={5}
//           value={+maxPlayers}
//           onChange={(e) => setMaxPlayers(+e.target.value)}
//           placeholder="Số người"
//           className="w-[25%]"
//         />
//         <div className="flex gap-2">
//           <Box
//             as='input'
//             type="text"
//             value={roomId}
//             onChange={(e) => setRoomId(e.target.value)}
//             placeholder="Nhập Room ID"
//           />
//           <Box
//             as="button"
//             onClick={() => joinRoom(roomId)}
//           >
//             Vào phòng
//           </Box>
//           <Box
//             as="button"
//             onClick={createRoom}
//           >
//             Tạo phòng
//           </Box>
//         </div>
//       </Box>
//     );
//   }, [roomId, gameStates, playerName, maxPlayers, joinRoom, createRoom]);

//   const renderLobbyControls = useCallback(() => {
//     if (gameStarted) return null;

//     if (currentPlayer?.isHost) {
//       if (endedGame) {
//         return (
//           <Box
//             onClick={replayGame}
//             className="px-2 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
//           >
//             Chơi lại
//           </Box>
//         );
//       }
//       return Object.keys(gameStates).length === maxPlayers ? (
//         <Box
//           as='button'
//           onClick={startGame}
//         >
//           Bắt đầu game
//         </Box>
//       ) : (
//         <BeatLoader size={8} color="#6B7280" />
//       );
//     }

//     return (
//       <Box
//         as='button'
//         onClick={toggleReadyGame}
//       >
//         {currentPlayer?.isReady ? "Hủy sẵn sàng" : "Sẵn sàng"}
//       </Box>
//     );
//   }, [gameStarted, currentPlayer, endedGame, gameStates, replayGame, startGame, toggleReadyGame]);

//   const renderPlayerInfo = useCallback((player: Player) => {
//     const isCurrentPlayer = playerId === player.id;

//     return (
//       <Box
//         key={player.id}
//         className={`flex items-center ${isCurrentPlayer ? "bg-gray-200" : ""}`}
//       >
//         <div className="flex items-center justify-center w-6 h-6 mr-2 bg-gray-400 text-white text-xs rounded-sm">
//           <FaUser />
//         </div>
//         <div className="flex-1">
//           <div className="flex items-center">
//             <span className="font-medium text-sm text-gray-800">
//               {player.name} {isCurrentPlayer && "(Bạn)"} {player.isHost && "(Host)"}
//             </span>
//             {player.status === "won" && <FaCrown className="ml-1 text-yellow-500" size={12} />}
//             {player.status === "lost" && <FaSkull className="ml-1 text-gray-500" size={12} />}
//             <div
//               className={`ml-1 inline-block px-1 py-0.5 text-xs rounded-sm ${player.isReady ? "bg-green-200 text-green-800" : "bg-gray-400 text-gray-200"}`}
//             >
//               {player.isReady ? "Sẵn sàng" : "Chưa sẵn sàng"}
//             </div>
//           </div>
//           <div className="text-xs text-gray-500">
//             {player.status === "playing" ? "Đang chơi" :
//               player.status === "won" ? "Chiến thắng!" : "Thua cuộc"}
//           </div>
//         </div>
//       </Box>
//     );
//   }, [playerId]);

//   const renderGameLobby = useCallback(() => {
//     if (!roomId || !gameStates) return null;

//     return (
//       <Box>
//         <div className="flex justify-between items-center mb-2">
//           <h3 className="font-bold text-sm text-gray-800">
//             Phòng: <span className="ml-1 bg-gray-300 text-[#337ab7] px-2 py-1 text-xs rounded-sm">{roomId}</span>
//           </h3>
//           <div className="flex gap-2 items-center">
//             {renderLobbyControls()}
//             <Box
//               as='button'
//               onClick={copyRoomId}
//               className="text-[#337ab7]"
//               title="Sao chép ID phòng"
//             >
//               <FaCopy size={12} />
//             </Box>
//             <Box
//               as='button'
//               onClick={leaveRoom}
//               className="text-[#ff0000]"
//               title="Rời khỏi phòng"
//             >
//               <FaSignOutAlt size={12} />
//             </Box>
//           </div>
//         </div>
//         <div className="space-y-1">{players.map(renderPlayerInfo)}</div>
//       </Box>
//     );
//   }, [roomId, gameStates, renderLobbyControls, copyRoomId, leaveRoom, players, renderPlayerInfo]);

//   const renderGameBoards = useCallback(() => {
//     if (!gameStates || Object.keys(gameStates).length === 0) return null;

//     return (
//       <div className="flex gap-4">
//         {Object.entries(gameStates).map(([pId, game]) => (
//           <div key={pId} className="flex flex-col">
//             <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
//               {players.find((p) => p.id === pId)?.name}
//               <span className="ml-1 text-xs px-2 py-1 bg-gray-400 text-white rounded-sm">
//                 {pId === playerId ? "Bạn" : "Đối thủ"}
//               </span>
//             </h3>
//             {renderBoard(pId !== playerId, game, pId)}
//           </div>
//         ))}
//       </div>
//     );
//   }, [gameStates, playerStates, players, playerId, renderBoard]);

//   return (
//     <div className="p-4 bg-gray-200 font-sans">
//       <header className="w-full max-w-[520px]">
//         {renderPreGameForm()}
//         {renderGameLobby()}
//       </header>
//       <main className="mt-4">
//         {renderGameBoards()}
//       </main>
//       <CustomDialog
//         open={openDialog.end}
//         title="Kết thúc"
//         onClose={() => setOpenDialog((pre) => ({ ...pre, end: false }))}
//       >
//         <p className="text-sm text-gray-800">{dialogMessage}</p>
//       </CustomDialog>
//       <CustomDialog
//         open={openDialog.replay}
//         title="Mời chơi lại"
//         onClose={() => setOpenDialog((pre) => ({ ...pre, replay: false }))}
//         actions={[
//           {
//             label: "Chấp nhận",
//             onClick: () => {
//               socket.emit("confirmReplay", { roomId, playerId });
//               setOpenDialog((pre) => ({ ...pre, replay: false }));
//             },
//           },
//           {
//             label: "Từ chối",
//             onClick: () => {
//               socket.emit("declineReplay", { roomId, playerId });
//               setOpenDialog((pre) => ({ ...pre, replay: false }));
//             },
//           },
//         ]}
//       >
//         <p className="text-sm text-gray-800">{dialogMessage}</p>
//       </CustomDialog>
//     </div>
//   );
// };

// export default React.memo(PvpPlay);



import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { FaCopy, FaSignOutAlt, FaUser, FaCrown, FaSkull } from "react-icons/fa";
import CustomDialog from "../../components/CustomDialog";
import { BeatLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import MinesweeperModeSelector from "../Components/MinesweeperModeSelector";
import CellCpn from "../../components/CellCpn";
import { Box } from "../../components/UI/Box";

interface PlayerState {
  revealedCells: Set<number>;
  flags: Set<number>;
}

interface Player {
  id: string;
  name: string;
  status: "playing" | "won" | "lost";
  isReady: boolean;
  isHost: boolean;
}

interface DialogProp {
  end: boolean;
  replay: boolean;
}

interface PvpPlayProp {
  socket: any;
  onInRoom: () => void;
  onLeaveRoom: () => void;
}

const PvpPlay: React.FC<PvpPlayProp> = ({ socket, onInRoom, onLeaveRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(2);
  const [gameStates, setGameStates] = useState<any | null>(null);

  const [playerStates, setPlayerStates] = useState<Map<string, PlayerState>>(new Map());
  const [players, setPlayers] = useState<Player[]>([]);
  const [openDialog, setOpenDialog] = useState<DialogProp>({ end: false, replay: false });
  const [dialogMessage, setDialogMessage] = useState("");
  const [configMode, setConfigMode] = useState<any>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [endedGame, setEndedGame] = useState(false);

  const currentPlayer = useMemo(() => players.find((p) => p.id === playerId), [players, playerId]);

  console.log('playerStates', playerStates);


  // Initialize player states from server data
  const initializePlayerStates = useCallback((states: Record<string, any>) => {
    const newStates = new Map<string, PlayerState>();
    Object.entries(states).forEach(([id, state]) => {
      newStates.set(id, {
        revealedCells: new Set(state.revealedCells || []),
        flags: new Set(state.flags || [])
      });
    });
    return newStates;
  }, []);

  const handleDeltaUpdate = useCallback((data: any) => {

    if (data.action) {
      const { playerId, action } = data;

      setPlayerStates(prev => {
        const newStates = new Map(prev);
        const playerState = newStates.get(playerId) || {
          revealedCells: new Set(),
          flags: new Set()
        };

        if (action.changes?.revealedCells) {
          action.changes.revealedCells.forEach((idx: number) => {
            playerState.revealedCells.add(idx);
          });
        }

        newStates.set(playerId, playerState);
        return newStates;
      });

      if (action.result?.isMine || action.result?.isWin) {
        const isCurrentPlayer = playerId === currentPlayer?.id;
        const message = action.result?.isMine
          ? isCurrentPlayer
            ? "Bạn đã chạm vào mìn! Thua cuộc!"
            : "Đối thủ chạm mìn! Bạn thắng!"
          : isCurrentPlayer
            ? "Bạn đã thắng!"
            : "Đối thủ đã thắng!";

        setDialogMessage(message);
        setOpenDialog(prev => ({ ...prev, end: true }));
        setEndedGame(true);
        setGameStarted(false);

        setPlayers(prev => prev.map(p => {
          if (p.id === playerId) {
            return { ...p, status: action.result.isMine ? "lost" : "won" };
          }
          return { ...p, status: action.result.isMine ? "won" : "lost" };
        }));
      }
    }
  }, [currentPlayer]);

  // Setup socket event listeners
  useEffect(() => {
    const handleSetGames = ({ gameStates, playersStatus }: any) => {
      setGameStates(gameStates);

      const newPlayers = playersStatus.map((pl: any) => {
        const [id, player]: any = Object.entries(pl)[0];
        return {
          id,
          name: player.playerName,
          status: player.status || "playing",
          isReady: player.isReady,
          isHost: player.isHost
        };
      });
      setPlayers(newPlayers);
    };

    const handlePlayerStatusUpdate = ({ playerId, isReady }: any) => {
      setPlayers(prev => prev.map(p =>
        p.id === playerId ? { ...p, isReady } : p
      ));
    };

    const handleFlagToggled = ({ playerId, index, hasFlag }: any) => {
      setPlayerStates(prev => {
        const newStates = new Map(prev);
        const playerState = newStates.get(playerId) || {
          revealedCells: new Set(),
          flags: new Set()
        };

        if (hasFlag) {
          playerState.flags.add(index);
        } else {
          playerState.flags.delete(index);
        }

        newStates.set(playerId, playerState);
        return newStates;
      });
    };

    const handlers = {
      joinedRoom: ({ roomId, playerId }: any) => {
        setRoomId(roomId);
        setPlayerId(playerId);
        onInRoom();
      },
      setGames: handleSetGames,
      updateState: handleDeltaUpdate,
      playerStatusUpdate: handlePlayerStatusUpdate,
      flagToggled: handleFlagToggled,
      gameStarted: () => {
        setGameStarted(true);
        setEndedGame(false);
        toast.success("Game đã bắt đầu!");
      },
      replayRequested: ({ message }: any) => {
        setDialogMessage(message);
        setOpenDialog(prev => ({ ...prev, replay: true }));
      },
      replayConfirmed: () => {
        setGameStarted(true);
        setEndedGame(false);
        setOpenDialog({ end: false, replay: false });
        toast.success("Game đã được bắt đầu lại!");
      },
      playerLeft: ({ playersStatus, gameState, playerState }: any) => {
        toast.info("Đối thủ đã rời phòng!");
        setPlayers(playersStatus.map((pl: any) => {
          const [id, player]: any = Object.entries(pl)[0];
          return {
            id,
            name: player.playerName,
            status: "playing",
            isReady: player.isReady,
            isHost: player.isHost
          };
        }));

        if (gameState) {
          setGameStates({ [playersStatus[0][0]]: gameState });
        }

        if (playerState) {
          setPlayerStates(initializePlayerStates({ [playersStatus[0][0]]: playerState }));
        }

        setGameStarted(false);
        setEndedGame(false);
      },
      returnToLobby: () => {
        resetGameState();
        onLeaveRoom();
      },
      error: ({ message }: any) => toast.error(message),
      roomFull: ({ message }: any) => toast.error(message),
      playerNotReady: ({ message }: any) => toast.info(message),
      replayDeclined: ({ message }: any) => {
        toast.info(message);
        setOpenDialog(prev => ({ ...prev, replay: false }));
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [handleDeltaUpdate, initializePlayerStates, onInRoom, onLeaveRoom]);

  const resetGameState = () => {
    setGameStates(null);
    setPlayerStates(new Map());
    setPlayers([]);
    setRoomId("");
    setPlayerId(null);
    setGameStarted(false);
    setEndedGame(false);
    setOpenDialog({ end: false, replay: false });
  };

  const joinRoom = useCallback((roomIdToJoin: string) => {
    if (roomIdToJoin.trim()) {
      socket.emit("joinRoom", roomIdToJoin, playerName, configMode, maxPlayers);
    } else {
      toast.error("Vui lòng nhập ID phòng!");
    }
  }, [playerName, configMode, maxPlayers, socket]);

  const createRoom = useCallback(() => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    socket.emit("joinRoom", newRoomId, playerName, configMode, maxPlayers);
  }, [playerName, configMode, maxPlayers, socket]);

  const startGame = useCallback(() => {
    socket.emit("startGame", roomId);
  }, [roomId, socket]);

  const toggleReadyGame = useCallback(() => {
    socket.emit("toggleReadyGame", roomId);
  }, [roomId, socket]);

  const replayGame = useCallback(() => {
    socket.emit("replayGame", roomId);
  }, [roomId, socket]);

  const leaveRoom = useCallback(() => {
    socket.emit("leaveRoom", roomId);
  }, [roomId, socket]);

  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId);
    toast.success("Đã sao chép ID phòng!");
  }, [roomId]);

  const handleOpenCell = useCallback((index: number) => {
    if (gameStates && gameStarted) {
      socket.emit("openCell", { roomId, index });
    }
  }, [gameStates, gameStarted, roomId, socket]);

  const handleToggleFlag = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameStates && gameStarted) {
      socket.emit("toggleFlag", { roomId, index });
    }
  }, [gameStates, gameStarted, roomId, socket]);

  const handleChording = useCallback((index: number) => {
    if (gameStates && gameStarted) {
      socket.emit("chording", { roomId, index });
    }
  }, [gameStates, gameStarted, roomId, socket]);

  const renderBoard = useCallback((isOpponent: boolean, game: any, pId: string) => {
    if (!game) return null;

    const { ratioX, ratioY, cells } = game;
    const currentPlayerState = playerStates.get(pId);
    const currentRevealed = currentPlayerState?.revealedCells || new Set();
    const currentFlags = currentPlayerState?.flags || new Set();

    console.log(cells);

    return (
      <Box
        variant="boxChild"
        className="grid gap-[1px] bg-gray-300"
        style={{
          gridTemplateColumns: `repeat(${ratioY}, 24px)`,
          gridTemplateRows: `repeat(${ratioX}, 24px)`,
        }}
      >
        {cells.map((cell: any, index: number) => {
          // console.log('cel', cell);

          const isRevealed = currentRevealed.has(index);
          const isFlagged = currentFlags.has(index);
          const canInteract = !isOpponent && gameStarted && !isRevealed;
          const interactive = canInteract && gameStarted;
          const canChording = isRevealed && !isOpponent;

          let content = "";
          if (isFlagged) content = "🚩";
          else if (isRevealed) {
            content = cell.count > 0 ? cell.count.toString() : "";
          } else if (endedGame && cell.isMine) {
            content = '💣'
          } else if (cell.isMarkHint) content = "x";

          return (
            <CellCpn
              key={`${pId}-${index}`}
              isRevealed={isRevealed}
              count={cell.count}
              canInteract={canInteract}
              onClick={interactive ? () => handleOpenCell(index) : canChording ? () => handleChording(index) : undefined}
              onContextMenu={canInteract ? (e) => handleToggleFlag(index, e) : undefined}
            >
              {content}
            </CellCpn>
          );
        })}
      </Box>
    );
  }, [gameStarted, handleOpenCell, handleToggleFlag, playerStates]);

  const renderPreGameForm = useCallback(() => {
    if (roomId && gameStates) return null;

    return (
      <Box>
        <MinesweeperModeSelector onModeChange={setConfigMode} />
        <Box
          as='input'
          type="text"
          placeholder="Tên của bạn"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-[75%]"
        />
        <Box
          as='input'
          type="number"
          min={2}
          max={5}
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          placeholder="Số người"
          className="w-[25%]"
        />
        <div className="flex gap-2">
          <Box
            as='input'
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Nhập Room ID"
          />
          <Box
            as="button"
            onClick={() => joinRoom(roomId)}
          >
            Vào phòng
          </Box>
          <Box
            as="button"
            onClick={createRoom}
          >
            Tạo phòng
          </Box>
        </div>
      </Box>
    );
  }, [roomId, gameStates, playerName, maxPlayers, joinRoom, createRoom]);

  const renderLobbyControls = useCallback(() => {
    if (gameStarted) return null;

    if (currentPlayer?.isHost) {
      if (endedGame) {
        return (
          <Box
            as='button'
            onClick={replayGame}
          >
            Chơi lại
          </Box>
        );
      }
      return Object.keys(gameStates).length === maxPlayers ? (
        <Box
          as='button'
          onClick={startGame}
        >
          Bắt đầu game
        </Box>
      ) : (
        <BeatLoader size={8} color="#6B7280" />
      );
    }

    return (
      <Box
        as='button'
        onClick={toggleReadyGame}
      >
        {currentPlayer?.isReady ? "Hủy sẵn sàng" : "Sẵn sàng"}
      </Box>
    );
  }, [gameStarted, currentPlayer, endedGame, gameStates, replayGame, startGame, toggleReadyGame]);

  const renderPlayerInfo = useCallback((player: Player) => {
    const isCurrentPlayer = playerId === player.id;

    return (
      <Box
        key={player.id}
        className={`flex items-center ${isCurrentPlayer ? "bg-gray-200" : ""}`}
      >
        <div className="flex items-center justify-center w-6 h-6 mr-2 bg-gray-400 text-white text-xs rounded-sm">
          <FaUser />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm text-gray-800">
              {player.name} {isCurrentPlayer && "(Bạn)"} {player.isHost && "(Host)"}
            </span>
            <div
              className={`ml-1 inline-block px-1 py-0.5 text-xs rounded-sm ${player.isReady ? "bg-green-200 text-green-800" : "bg-gray-400 text-gray-200"}`}
            >
              {player.isReady ? "Sẵn sàng" : "Chưa sẵn sàng"}
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            {player.status === "playing" ? "Đang chơi" : player.status === "won" ? "Chiến thắng!" : "Thua cuộc"}
            {player.status === "won" && <FaCrown className="ml-1 text-yellow-500" size={12} />}
            {player.status === "lost" && <FaSkull className="ml-1 text-gray-500" size={12} />}
          </div>
        </div>
      </Box>
    );
  }, [playerId]);

  const renderGameLobby = useCallback(() => {
    if (!roomId || !gameStates) return null;

    return (
      <Box>
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm text-gray-800">
            Phòng: <span className="ml-1 bg-gray-300 text-[#337ab7] px-2 py-1 text-xs rounded-sm">{roomId}</span>
          </h3>
          <div className="flex gap-2 items-center">
            {renderLobbyControls()}
            <Box
              as='button'
              onClick={copyRoomId}
              className="text-[#337ab7]"
              title="Sao chép ID phòng"
            >
              <FaCopy size={12} />
            </Box>
            <Box
              as='button'
              onClick={leaveRoom}
              className="text-[#ff0000]"
              title="Rời khỏi phòng"
            >
              <FaSignOutAlt size={12} />
            </Box>
          </div>
        </div>
        <div className="space-y-1">{players.map(renderPlayerInfo)}</div>
      </Box>
    );
  }, [roomId, gameStates, renderLobbyControls, copyRoomId, leaveRoom, players, renderPlayerInfo]);

  const renderGameBoards = useCallback(() => {
    if (!gameStates || Object.keys(gameStates).length === 0) return null;

    return (
      <div className="flex gap-4">
        {Object.entries(gameStates).map(([pId, game]) => (
          <div key={pId} className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
              {players.find((p) => p.id === pId)?.name}
              <span className="ml-1 text-xs px-2 py-1 bg-gray-400 text-white rounded-sm">
                {pId === playerId ? "Bạn" : "Đối thủ"}
              </span>
            </h3>
            {renderBoard(pId !== playerId, game, pId)}
          </div>
        ))}
      </div>
    );
  }, [gameStates, players, playerId, renderBoard]);

  return (
    <div className="p-4 bg-gray-200 font-sans">
      <header className="w-full">
        {renderPreGameForm()}
        {renderGameLobby()}
      </header>
      <main className="mt-4">
        {renderGameBoards()}
      </main>
      <CustomDialog
        open={openDialog.end}
        title="Kết thúc"
        onClose={() => setOpenDialog(prev => ({ ...prev, end: false }))}
      >
        <p className="text-sm text-gray-800">{dialogMessage}</p>
      </CustomDialog>
      <CustomDialog
        open={openDialog.replay}
        title="Mời chơi lại"
        onClose={() => setOpenDialog(prev => ({ ...prev, replay: false }))}
        actions={[
          {
            label: "Chấp nhận",
            onClick: () => {
              socket.emit("confirmReplay", { roomId });
              setOpenDialog(prev => ({ ...prev, replay: false }));
            },
          },
          {
            label: "Từ chối",
            onClick: () => {
              socket.emit("declineReplay", { roomId });
              setOpenDialog(prev => ({ ...prev, replay: false }));
            },
          },
        ]}
      >
        <p className="text-sm text-gray-800">{dialogMessage}</p>
      </CustomDialog>
    </div>
  );
};

export default React.memo(PvpPlay);