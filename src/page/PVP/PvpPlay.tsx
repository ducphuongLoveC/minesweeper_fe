import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";
import { FaCopy, FaSignOutAlt, FaUser, FaCrown, FaSkull } from "react-icons/fa";
import CustomDialog from "../../components/CustomDialog";
import { BeatLoader } from "react-spinners";
import { v4 as uuidv4 } from "uuid";
import MinesweeperModeSelector from "../Components/MinesweeperModeSelector";

// Sử dụng Map thay vì object cho hiệu suất tốt hơn
const NUMBER_COLOR_CLASSES = new Map([
  [1, "text-blue-700"],
  [2, "text-green-700"],
  [3, "text-red-700"],
  [4, "text-purple-700"],
  [5, "text-maroon-700"],
  [6, "text-teal-700"],
  [7, "text-black"],
  [8, "text-gray-700"],
]);

const isNumber = (value: any): boolean => typeof value === "number" && !isNaN(value);

const Cell = React.memo(({
  content,
  className,
  onClick,
  onContextMenu
}: {
  content: string;
  className: string;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}) => {
  return (
    <div
      className={className}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {content}
    </div>
  );
}, (prevProps, nextProps) => {
  // Chỉ re-render nếu props thực sự thay đổi
  return prevProps.content === nextProps.content &&
    prevProps.className === nextProps.className &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.onContextMenu === nextProps.onContextMenu;
});
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
  const [maxPlayers, setMaxPlayers] = useState<Number>(2);
  const [gameStates, setGameStates] = useState<any | null>(null);
  const [playerStates, setPlayerStates] = useState<Map<string, PlayerState>>(new Map());
  const [players, setPlayers] = useState<Player[]>([]);
  const [openDialog, setOpenDialog] = useState<DialogProp>({ end: false, replay: false });
  const [dialogMessage, setDialogMessage] = useState("");
  const [configMode, setConfigMode] = useState<any>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [endedGame, setEndedGame] = useState(false);



  // Sử dụng useMemo để tránh tính toán lại các giá trị không thay đổi
  const currentPlayer = useMemo(() => players.find((p) => p.id === playerId), [players, playerId]);
  console.log(playerStates);

  // const normalizePlayerStates = useCallback(
  //   (states: { [key: string]: { revealedCells: number[]; flags: number[] } }) => {
  //     const normalized = new Map<string, PlayerState>();
  //     for (const [id, state] of Object.entries(states)) {
  //       normalized.set(id, {
  //         revealedCells: new Set(state.revealedCells),
  //         flags: new Set(state.flags),
  //       });
  //     }
  //     return normalized;
  //   },
  //   []
  // );



  const normalizePlayerStates = useCallback(
    (states: { [key: string]: { revealedCells: number[]; flags: number[] } }) => {
      const normalized = new Map<string, PlayerState>();
      Object.entries(states).forEach(([id, state]) => {
        normalized.set(id, {
          revealedCells: new Set(state.revealedCells),
          flags: new Set(state.flags),
        });
      });
      return normalized;
    },
    []
  );

  // Tách các sự kiện socket thành các hàm riêng biệt để dễ quản lý
  const setupSocketEvents = useCallback(() => {
    const handleJoinedRoom = ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      setRoomId(roomId);
      setPlayerId(playerId);
    };

    const handleSetGames = ({ gameStates, playerStates, playersStatus }: any) => {
      const players: Player[] = playersStatus.map((pl: any) => {
        const [id, player]: any = Object.entries(pl)[0];
        return {
          id,
          name: player.playerName,
          status: "playing",
          isReady: player.isReady,
          isHost: player.isHost
        };
      });

      if (gameStates) {
        setGameStates(gameStates);
      }
      setPlayers(players);
      setPlayerStates(normalizePlayerStates(playerStates));
    };

    const handleUpdateState = ({ playerStates, action }: any) => {

      setPlayerStates(normalizePlayerStates(playerStates));

      if (action.result?.isMine || action.result?.isWin) {
        const isCurrentPlayer = action.playerId === playerId;
        const message = action.result?.isMine
          ? isCurrentPlayer
            ? "Bạn đã chạm vào mìn! Thua cuộc!"
            : "Đối thủ chạm mìn! Bạn thắng!"
          : isCurrentPlayer
            ? "Bạn đã thắng!"
            : "Đối thủ đã thắng!";

        setDialogMessage(message);
        setOpenDialog((pre) => ({ ...pre, end: true }));

        setPlayers((prev) =>
          prev.map((p) =>
            p.id === action.playerId
              ? { ...p, status: action.result?.isMine ? "lost" : "won" }
              : { ...p, status: action.result?.isMine ? "won" : "lost" }
          )
        );
      }
    };

    const handlers = {
      joinedRoom: handleJoinedRoom,
      setGames: handleSetGames,
      canStartGame: ({ canStart, message }: { canStart: boolean; message: string }) => {
        setGameStarted(canStart);
        toast.success(message, { toastId: "canStartGame" });
      },
      sendReplayGame: ({ message }: { message: string }) => {
        setDialogMessage(message);
        setOpenDialog((pre) => ({ ...pre, replay: true }));
      },
      replayConfirmed: ({ playerStates, playersStatus }: any) => {
        // setGameStates(gameStates);
        setPlayerStates(normalizePlayerStates(playerStates));
        setPlayers(
          playersStatus.map((pl: any) => {
            const [id, player]: any = Object.entries(pl)[0];
            return {
              id,
              name: player.playerName,
              status: "playing",
              isReady: player.isReady,
              isHost: player.isHost
            };
          })
        );
        setGameStarted(true);
        setEndedGame(false);
        setOpenDialog({ end: false, replay: false });
        toast.success("Trò chơi đã được bắt đầu lại!");
      },
      updateState: handleUpdateState,
      gameOver: ({ winner, message }: any) => {
        setDialogMessage(message || (winner === playerId ? "Bạn đã thắng!" : "Bạn đã thua!"));
        setOpenDialog((pre) => ({ ...pre, end: true }));
        setGameStarted(false);
        setEndedGame(true);
      },
      playerLeft: ({ playersStatus, gameStates, playerStates }: any) => {
        toast.info("Đối thủ đã rời phòng!");
        const updatedPlayers: Player[] = playersStatus.map((pl: any) => {
          const [id, player]: any = Object.entries(pl)[0];
          return {
            id,
            name: player.playerName,
            status: "playing",
            isReady: player.isReady,
            isHost: player.isHost
          };
        });
        setPlayers(updatedPlayers);
        setGameStates(gameStates);
        setPlayerStates(normalizePlayerStates(playerStates));
        setGameStarted(false);
        setEndedGame(false);
      },
      error: ({ message }: { message: string }) => toast.error(message),
      roomFull: ({ message }: { message: string }) => toast.error(message),
      playerNotReady: ({ message }: { message: string }) => toast.info(message),
      replayDeclined: ({ message }: { message: string }) => {
        toast.info(message || "Một người chơi đã từ chối chơi lại.");
        setOpenDialog((pre) => ({ ...pre, replay: false }));
      },
      returnToLobby: ({ message }: { message: string }) => {
        toast.info(message);
        setGameStates(null);
        setPlayerStates(new Map());
        setPlayers([]);
        setRoomId("");
        setPlayerId(null);
        setGameStarted(false);
        setEndedGame(false);
        setOpenDialog({ end: false, replay: false });
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
  }, [playerId, normalizePlayerStates]);

  useEffect(() => {
    return setupSocketEvents();
  }, [setupSocketEvents]);

  const joinRoom = useCallback(
    (roomIdToJoin: string) => {
      if (roomIdToJoin.trim()) {
        socket.emit("joinRoom", roomIdToJoin, playerName);
        onInRoom();
      } else {
        toast.error("Kiểm tra lại tên phòng!");
      }
    },
    [playerName, socket, onInRoom]
  );

  const createRoom = useCallback(() => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    socket.emit("joinRoom", newRoomId, playerName, configMode, maxPlayers);
    onInRoom();
  }, [playerName, configMode, maxPlayers, socket, onInRoom]);

  const startGame = useCallback(() => {
    socket.emit("startGame", roomId);
  }, [roomId, socket]);

  const replayGame = useCallback(() => {
    toast.success('Gửi lời mời thành công!');
    socket.emit("replayGame", roomId);
  }, [roomId, socket]);

  const toggleReadyGame = useCallback(() => {
    socket.emit("toggleReadyGame", roomId);
  }, [roomId, socket]);

  const leaveRoom = useCallback(() => {
    socket.emit("leaveRoom", roomId);
    onLeaveRoom();
  }, [roomId, socket, onLeaveRoom]);

  const copyRoomId = useCallback(() => {
    navigator.clipboard.writeText(roomId);
    toast.success("Đã sao chép ID phòng!");
  }, [roomId]);


  const handleOpenCell = useCallback((index: number) => {

    console.log();
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

  const Cell = React.memo(({
    content,
    className,
    onClick,
    onContextMenu
  }: any) => (
    <div
      className={className}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {content}
    </div>
  ));

  const renderBoard = useCallback((isOpponent: boolean, game: any, pId: any) => {
    if (!gameStates) return null;
    console.log(playerStates);

    const { ratioX, ratioY, cells } = game;
    const currentPlayerState = playerStates.get(pId);
    const currentRevealed = currentPlayerState?.revealedCells || new Set();
    const currentFlags = currentPlayerState?.flags || new Set();

    const canInteractGlobal = !isOpponent && gameStarted;

    return (
      <div
        className="grid gap-[1px] bg-gray-300 p-1 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm"
        style={{
          gridTemplateColumns: `repeat(${ratioY}, 24px)`,
          gridTemplateRows: `repeat(${ratioX}, 24px)`,
        }}
      >
        {cells.map((cell: any, index: number) => {
          const isRevealed = currentRevealed.has(index);
          const isFlagged = currentFlags.has(index);
          const canInteract = canInteractGlobal && !isRevealed;
          const interactive = canInteract && gameStarted;
          const canChording = isRevealed && !isOpponent;

          let content = "";
          if (isFlagged) content = "🚩";
          else if (isRevealed) {
            content = cell.isMine ? "💣" : cell.count > 0 ? cell.count.toString() : "";
          } else if (cell.isMarkHint) content = "x";

          const cellClasses = [
            isNumber(cell?.count) ? NUMBER_COLOR_CLASSES.get(cell.count) : "",
            "flex items-center justify-center w-6 h-6 text-sm font-bold",
            isRevealed
              ? "bg-gray-200"
              : "bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500",
            interactive ? "cursor-pointer" : "cursor-default",
          ].join(" ");

          return (
            <Cell
              key={`${pId}-${index}`} // Sử dụng composite key để tránh conflict
              content={content}
              className={cellClasses}
              onClick={interactive ? () => handleOpenCell(index) : canChording ? () => handleChording(index) : undefined}
              onContextMenu={canInteract ? (e) => handleToggleFlag(index, e) : undefined}
            />
          );
        })}
      </div>
    );
  }, [gameStates, playerStates, playerId, gameStarted, handleOpenCell, handleToggleFlag, handleChording]);


  const renderPreGameForm = useCallback(() => {
    if (roomId && gameStates) return null;

    return (
      <div className="mb-4 p-3 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm">
        <MinesweeperModeSelector onModeChange={setConfigMode} />
        <input
          type="text"
          placeholder="Tên của bạn"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-[75%] px-2 py-1 border border-gray-400 bg-white text-sm mb-2 rounded-sm"
        />
        <input
          type="number"
          min={2}
          max={5}
          value={+maxPlayers}
          onChange={(e) => setMaxPlayers(+e.target.value)}
          placeholder="Số người"
          className="w-[25%] px-2 py-1 border border-gray-400 bg-white text-sm flex-grow rounded-sm"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Nhập Room ID"
            className="px-2 py-1 border border-gray-400 bg-white text-sm flex-grow rounded-sm"
          />
          <button
            onClick={() => joinRoom(roomId)}
            className="px-3 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
          >
            Vào phòng
          </button>
          <button
            onClick={createRoom}
            className="px-3 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
          >
            Tạo phòng
          </button>
        </div>
      </div>
    );
  }, [roomId, gameStates, playerName, maxPlayers, joinRoom, createRoom]);

  const renderLobbyControls = useCallback(() => {
    if (gameStarted) return null;

    if (currentPlayer?.isHost) {
      if (endedGame) {
        return (
          <button
            onClick={replayGame}
            className="px-2 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
          >
            Chơi lại
          </button>
        );
      }
      return Object.keys(gameStates).length === maxPlayers ? (
        <button
          onClick={startGame}
          className="px-2 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
        >
          Bắt đầu game
        </button>
      ) : (
        <BeatLoader size={8} color="#6B7280" />
      );
    }

    return (
      <button
        onClick={toggleReadyGame}
        className="px-2 py-1 bg-gray-300 text-gray-800 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-sm rounded-sm"
      >
        {currentPlayer?.isReady ? "Hủy sẵn sàng" : "Sẵn sàng"}
      </button>
    );
  }, [gameStarted, currentPlayer, endedGame, gameStates, replayGame, startGame, toggleReadyGame]);

  const renderPlayerInfo = useCallback((player: Player) => {
    const isCurrentPlayer = playerId === player.id;

    return (
      <div
        key={player.id}
        className={`flex items-center p-2 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm ${isCurrentPlayer ? "bg-gray-200" : ""}`}
      >
        <div className="flex items-center justify-center w-6 h-6 mr-2 bg-gray-400 text-white text-xs rounded-sm">
          <FaUser />
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-sm text-gray-800">
              {player.name} {isCurrentPlayer && "(Bạn)"} {player.isHost && "(Host)"}
            </span>
            {player.status === "won" && <FaCrown className="ml-1 text-yellow-500" size={12} />}
            {player.status === "lost" && <FaSkull className="ml-1 text-gray-500" size={12} />}
            <div
              className={`ml-1 inline-block px-1 py-0.5 text-xs rounded-sm ${player.isReady ? "bg-green-200 text-green-800" : "bg-gray-400 text-gray-200"}`}
            >
              {player.isReady ? "Sẵn sàng" : "Chưa sẵn sàng"}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {player.status === "playing" ? "Đang chơi" :
              player.status === "won" ? "Chiến thắng!" : "Thua cuộc"}
          </div>
        </div>
      </div>
    );
  }, [playerId]);

  const renderGameLobby = useCallback(() => {
    if (!roomId || !gameStates) return null;

    return (
      <div className="mb-4 p-3 bg-gray-200 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 rounded-sm w-full">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm text-gray-800">
            Phòng: <span className="ml-1 bg-gray-300 text-[#337ab7] px-2 py-1 text-xs rounded-sm">{roomId}</span>
          </h3>
          <div className="flex gap-2 items-center">
            {renderLobbyControls()}
            <button
              onClick={copyRoomId}
              className="p-1 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-[#337ab7] rounded-sm"
              title="Sao chép ID phòng"
            >
              <FaCopy size={12} />
            </button>
            <button
              onClick={leaveRoom}
              className="p-1 bg-gray-300 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400 text-[#ff0000] rounded-sm"
              title="Rời khỏi phòng"
            >
              <FaSignOutAlt size={12} />
            </button>
          </div>
        </div>
        <div className="space-y-1">{players.map(renderPlayerInfo)}</div>
      </div>
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
  }, [gameStates, playerStates, players, playerId, renderBoard]);

  return (
    <div className="p-4 bg-gray-200 font-sans">
      <header className="w-full max-w-[520px]">
        {renderPreGameForm()}
        {renderGameLobby()}
      </header>
      <main className="mt-4">
        {renderGameBoards()}
      </main>
      <CustomDialog
        open={openDialog.end}
        title="Kết thúc"
        onClose={() => setOpenDialog((pre) => ({ ...pre, end: false }))}
      >
        <p className="text-sm text-gray-800">{dialogMessage}</p>
      </CustomDialog>
      <CustomDialog
        open={openDialog.replay}
        title="Mời chơi lại"
        onClose={() => setOpenDialog((pre) => ({ ...pre, replay: false }))}
        actions={[
          {
            label: "Chấp nhận",
            onClick: () => {
              socket.emit("confirmReplay", { roomId, playerId });
              setOpenDialog((pre) => ({ ...pre, replay: false }));
            },
          },
          {
            label: "Từ chối",
            onClick: () => {
              socket.emit("declineReplay", { roomId, playerId });
              setOpenDialog((pre) => ({ ...pre, replay: false }));
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