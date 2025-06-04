// import React, { useEffect, useState, useCallback } from "react";

// import MinesweeperModeSelector from "./Components/MinesweeperModeSelector";
// import { toast } from "react-toastify";
// import { io } from "socket.io-client";
// import CustomDialog from "../components/CustomDialog";
// import { useAppSelector } from "../hooks/useRedux";
// import CellCpn from "../components/CellCpn";

// function SinglePlay() {
//     const [configMode, setConfigMode] = useState<any>(null);
//     const [playerState, setPlayerState] = useState({
//         revealedCells: new Set<number>(),
//         flags: new Set<number>(),
//     });
//     const [gameState, setGameState] = useState<any>(null);
//     const [dialogMessage, setDialogMessage] = useState('');
//     const [openDialog, setOpenDialog] = useState({ end: false });
//     const [gameStarted, setGameStarted] = useState(false);
//     const [endedGame, setEndedGame] = useState(false);
//     const [socket, setSocket] = useState<any>(null);

//     const { selectedServer } = useAppSelector((state) => state.serverOptions);

//     useEffect(() => {
//         const newSocket = io(`${selectedServer}/single`, {
//             transports: ["websocket"], // Chỉ sử dụng WebSocket
//             upgrade: false,
//             forceNew: true,
//             reconnection: true,
//             reconnectionAttempts: 5,
//             reconnectionDelay: 1000,
//             timeout: 20000,
//         });

//         newSocket.connect();
//         setSocket(newSocket);

//         return () => {
//             newSocket.disconnect();
//         };
//     }, [selectedServer]);

//     const normalizePlayerState = useCallback((state: any) => {
//         return {
//             revealedCells: new Set<number>(state?.revealedCells || []),
//             flags: new Set<number>(state?.flags || []),
//         };
//     }, []);

//     const openCell = useCallback(
//         (index: number) => {
//             if (socket) socket.emit("openCell", { index });
//         },
//         [socket]
//     );

//     const chording = useCallback(
//         (index: number) => {
//             if (socket) socket.emit("chording", { index });
//         },
//         [socket]
//     );

//     const toggleFlag = useCallback(
//         (index: number, e: React.MouseEvent) => {
//             e.preventDefault();
//             if (socket) socket.emit("toggleFlag", { index });
//         },
//         [socket]
//     );

//     const handleError = useCallback(({ message }: { message: string }) => {
//         toast.error(message);
//     }, []);

//     const handleSetGames = useCallback(({ gameState, playerState }: any) => {
//         setGameState(gameState);
//         setPlayerState(normalizePlayerState(playerState));
//         setGameStarted(true);
//         setEndedGame(false);
//     }, [normalizePlayerState]);

//     const handleUpdateState = useCallback(({ playerState }: any) => {
//         // setGameState(gameState);
//         setPlayerState(normalizePlayerState(playerState));
//     }, [normalizePlayerState]);

//     const handleGameOver = useCallback(({ message }: { message: string }) => {
//         setDialogMessage(message);
//         setOpenDialog({ end: true });
//         setGameStarted(false);
//         setEndedGame(true);
//     }, []);

//     useEffect(() => {
//         if (!socket) return;

//         socket.on("error", handleError);
//         socket.on("setGames", handleSetGames);
//         socket.on("updateState", handleUpdateState);
//         socket.on("gameOver", handleGameOver);

//         return () => {
//             socket.off("error", handleError);
//             socket.off("setGames", handleSetGames);
//             socket.off("updateState", handleUpdateState);
//             socket.off("gameOver", handleGameOver);
//         };
//     }, [socket, handleError, handleSetGames, handleUpdateState, handleGameOver]);

//     useEffect(() => {
//         if (configMode && socket) {
//             socket.emit("initializeGame", configMode);
//         }
//     }, [configMode, socket]);

//     const Cell = React.memo(({
//         cell,
//         index,
//         isRevealed,
//         isFlagged,
//         canInteract,
//         canChording,
//         openCell,
//         toggleFlag
//     }: {
//         cell: any,
//         index: number,
//         isRevealed: boolean,
//         isFlagged: boolean,
//         canInteract: boolean,
//         canChording: boolean,
//         openCell: (index: number) => void,
//         toggleFlag: (index: number, e: React.MouseEvent) => void
//     }) => {
//         let content = "";
//         if (isFlagged) content = "🚩";
//         else if (isRevealed)
//             content = cell.isMine ? "💣" : cell.count > 0 ? cell.count : "";
//         return (
//             <CellCpn
//                 canInteract={canInteract}
//                 isRevealed={isRevealed}
//                 key={index}
//                 count={cell.count}
//                 onClick={() => {
//                     if (canInteract) {
//                         openCell(index);
//                     } else if (canChording) {
//                         chording(index);
//                     }
//                 }}
//                 onContextMenu={canInteract ? (e) => toggleFlag(index, e) : undefined}
//             >
//                 {content}
//             </CellCpn>
//         );
//     });

//     const renderBoard = useCallback(() => {
//         if (!gameState || !playerState) return null;

//         const { ratioX, ratioY, cells } = gameState;
//         const currentRevealed = playerState.revealedCells;
//         const currentFlags = playerState.flags;

//         return (
//             <div
//                 className="inline-grid gap-[1px] bg-gray-300 p-1 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
//                 style={{
//                     gridTemplateColumns: `repeat(${ratioY}, 24px)`,
//                     gridTemplateRows: `repeat(${ratioX}, 24px)`,
//                 }}
//             >
//                 {cells.map((cell: any, index: number) => {
//                     const isRevealed = currentRevealed.has(index);
//                     const isFlagged = currentFlags.has(index);
//                     const canInteract = !isRevealed && !endedGame;
//                     const canChording = currentRevealed.has(index) && !endedGame;

//                     return (
//                         <Cell
//                             key={index}
//                             cell={cell}
//                             index={index}
//                             isRevealed={isRevealed}
//                             isFlagged={isFlagged}
//                             canInteract={canInteract}
//                             canChording={canChording}
//                             openCell={openCell}
//                             toggleFlag={toggleFlag}
//                         />
//                     );
//                 })}
//             </div>
//         );
//     }, [gameState, playerState, endedGame, openCell, toggleFlag]);

//     return (
//         <div className="p-4 bg-gray-200 font-sans w-[500px]">
//             <MinesweeperModeSelector onModeChange={setConfigMode} />
//             <div className="flex items-center justify-between">
//                 <div className="w-full text-center border-2 font-medium text-sm rounded-sm min-w-[100px] bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
//                     1/{gameState?.totalMines}
//                 </div>
//                 <div className="w-full text-center border-2 font-medium text-sm rounded-sm min-w-[100px] bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
//                     1/{gameState?.totalMines}
//                 </div>

//                 <div className="w-full text-center border-2 font-medium text-sm rounded-sm min-w-[100px] bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
//                     100
//                 </div>
//             </div>
//             {gameState && <div className="mt-4">{renderBoard()}</div>}
//             <CustomDialog
//                 open={openDialog.end}
//                 title="Kết thúc trò chơi"
//                 onClose={() => setOpenDialog((pre) => ({ ...pre, end: false }))}
//             >
//                 <p className="text-sm text-gray-800 font-sans">{dialogMessage}</p>
//             </CustomDialog>
//         </div>
//     );
// }

// export default SinglePlay;


import { FaceSmileIcon, FaceFrownIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState, useCallback } from "react";
import MinesweeperModeSelector from "./Components/MinesweeperModeSelector";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import CustomDialog from "../components/CustomDialog";
import { useAppSelector } from "../hooks/useRedux";
import CellCpn from "../components/CellCpn";


const statusGame = {
    'playing': <FaceSmileIcon className="w-6 h-full text-green-500 p-0 m-0" />,
    'lost': <FaceFrownIcon className="w-6 h-full text-red-500 p-0 m-0" />
}


function SinglePlay() {
    const [configMode, setConfigMode] = useState<any>(null);
    const [playerState, setPlayerState] = useState({
        revealedCells: new Set<number>(),
        flags: new Set<number>(),
    });
    const [gameState, setGameState] = useState<any>(null);
    const [dialogMessage, setDialogMessage] = useState('');
    const [openDialog, setOpenDialog] = useState({ end: false });
    const [gameStarted, setGameStarted] = useState(false);
    const [endedGame, setEndedGame] = useState(false);
    const [socket, setSocket] = useState<any>(null);

    const [statusPlayer, setStatusPlayer] = useState<string>('');

    const { selectedServer } = useAppSelector((state) => state.serverOptions);

    useEffect(() => {
        const newSocket = io(`${selectedServer}/single`, {
            transports: ["websocket"],
            upgrade: false,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 20000,
        });

        newSocket.connect();
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [selectedServer]);

    const applyChanges = useCallback((changes) => {
        setPlayerState(prev => {
            const newRevealed = new Set(prev.revealedCells);
            const newFlags = new Set(prev.flags);

            // Apply revealed cell changes
            changes.revealedCells?.forEach(cell => newRevealed.add(cell));

            // Apply flag changes (toggle)
            changes.flags?.forEach(flag => {
                if (newFlags.has(flag)) {
                    newFlags.delete(flag);
                } else {
                    newFlags.add(flag);
                }
            });

            return {
                revealedCells: newRevealed,
                flags: newFlags
            };
        });
    }, []);

    const openCell = useCallback((index: number) => {
        if (socket) socket.emit("openCell", { index });
    }, [socket]);

    const chording = useCallback((index: number) => {
        if (socket) socket.emit("chording", { index });
    }, [socket]);

    const toggleFlag = useCallback((index: number, e: React.MouseEvent) => {
        e.preventDefault();
        if (socket) socket.emit("toggleFlag", { index });
    }, [socket]);

    const handleError = useCallback(({ message }: { message: string }) => {
        toast.error(message);
    }, []);

    const handleGameInitialized = useCallback(({ gameState, revealedCells, flags, status }: any) => {
        setGameState(gameState);
        setStatusPlayer(status)
        setPlayerState({
            revealedCells: new Set(revealedCells),
            flags: new Set(flags)
        });
        setGameStarted(true);
        setEndedGame(false);
    }, []);

    const handleStateUpdate = useCallback(({ changes, ...actionData }: any) => {
        applyChanges(changes);
        // You can use actionData for any additional logic if needed
    }, [applyChanges]);

    const handleGameOver = useCallback(({ message, revealedCells, flags, status }: any) => {
        console.log(message);

        console.log(status);
        setStatusPlayer(status);

        setPlayerState({
            revealedCells: new Set(revealedCells),
            flags: new Set(flags)
        });
        // setDialogMessage(message);
        // setOpenDialog({ end: true });
        toast.success(message);
        setGameStarted(false);
        setEndedGame(true);
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("error", handleError);
        socket.on("gameInitialized", handleGameInitialized);
        socket.on("stateUpdate", handleStateUpdate);
        socket.on("gameOver", handleGameOver);

        return () => {
            socket.off("error", handleError);
            socket.off("gameInitialized", handleGameInitialized);
            socket.off("stateUpdate", handleStateUpdate);
            socket.off("gameOver", handleGameOver);
        };
    }, [socket, handleError, handleGameInitialized, handleStateUpdate, handleGameOver]);

    useEffect(() => {
        if (configMode && socket) {
            socket.emit("initializeGame", configMode);
        }
    }, [configMode, socket]);

    const Cell = React.memo(({
        cell,
        index,
        isRevealed,
        isFlagged,
        canInteract,
        canChording,
        openCell,
        toggleFlag
    }: {
        cell: any,
        index: number,
        isRevealed: boolean,
        isFlagged: boolean,
        canInteract: boolean,
        canChording: boolean,
        openCell: (index: number) => void,
        toggleFlag: (index: number, e: React.MouseEvent) => void
    }) => {
        let content = "";
        if (isFlagged) content = "🚩";
        else if (isRevealed)
            content = cell.isMine ? "💣" : cell.count > 0 ? cell.count : "";

        return (
            <CellCpn
                canInteract={canInteract}
                isRevealed={isRevealed}
                key={index}
                count={cell.count}
                onClick={() => {
                    if (canInteract) {
                        openCell(index);
                    } else if (canChording) {
                        chording(index);
                    }
                }}
                onContextMenu={canInteract ? (e) => toggleFlag(index, e) : undefined}
            >
                {content}
            </CellCpn>
        );
    });

    const renderBoard = useCallback(() => {
        if (!gameState || !playerState) return null;

        const { ratioX, ratioY, cells } = gameState;
        const currentRevealed = playerState.revealedCells;
        const currentFlags = playerState.flags;

        return (
            <div
                className="inline-grid gap-[1px] bg-gray-300 p-1 border-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
                style={{
                    gridTemplateColumns: `repeat(${ratioY}, 24px)`,
                    gridTemplateRows: `repeat(${ratioX}, 24px)`,
                }}
            >
                {cells.map((cell: any, index: number) => {
                    const isRevealed = currentRevealed.has(index);
                    const isFlagged = currentFlags.has(index);
                    const canInteract = !isRevealed && !endedGame;
                    const canChording = isRevealed && !endedGame;

                    return (
                        <Cell
                            key={index}
                            cell={cell}
                            index={index}
                            isRevealed={isRevealed}
                            isFlagged={isFlagged}
                            canInteract={canInteract}
                            canChording={canChording}
                            openCell={openCell}
                            toggleFlag={toggleFlag}
                        />
                    );
                })}
            </div>
        );
    }, [gameState, playerState, endedGame, openCell, toggleFlag]);

    return (
        <div className="p-4 bg-gray-200 font-sans">
            <MinesweeperModeSelector onModeChange={setConfigMode} />
            <div className="flex items-center">
                <div className="text-center border-2 font-medium text-sm rounded-sm min-w-[100px] bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
                    1/{gameState?.totalMines}
                </div>
                <div onClick={() => {
                    socket.emit("initializeGame", configMode);
                }} className="cursor-pointer w-6 mx-2 flex items-center justify-center border-2 font-medium text-sm rounded-sm  bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
                    {statusGame[statusPlayer]}
                </div>

                <div className="text-center border-2 font-medium text-sm rounded-sm min-w-[100px] bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
                    100
                </div>
            </div>
            {gameState && <div className="mt-4">{renderBoard()}</div>}
            <CustomDialog
                open={openDialog.end}
                title="Kết thúc trò chơi"
                onClose={() => setOpenDialog((pre) => ({ ...pre, end: false }))}
            >
                <p className="text-sm text-gray-800 font-sans">{dialogMessage}</p>
            </CustomDialog>
        </div>
    );
}

export default SinglePlay;