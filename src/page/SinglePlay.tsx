import React, { useEffect, useState, useCallback } from "react";

import MinesweeperModeSelector from "./Components/MinesweeperModeSelector";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import CustomDialog from "../components/CustomDialog";
import { useAppSelector } from "../hooks/useRedux";

export const numberColorClasses = new Map([
    [1, "text-blue-700"],
    [2, "text-green-700"],
    [3, "text-red-700"],
    [4, "text-purple-700"],
    [5, "text-maroon-700"],
    [6, "text-teal-700"],
    [7, "text-black"],
    [8, "text-gray-700"],
]);

const getNumberClass = (count: any, isRevealed: boolean): string => {
    if (!isRevealed || !count || typeof count !== "number") return "";
    return numberColorClasses.get(count) || "";
};

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

    const { selectedServer } = useAppSelector((state) => state.serverOptions);

    useEffect(() => {
        const newSocket = io(`${selectedServer}/single`, {
            transports: ["websocket"], // Chỉ sử dụng WebSocket
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

    const normalizePlayerState = useCallback((state: any) => {
        return {
            revealedCells: new Set<number>(state?.revealedCells || []),
            flags: new Set<number>(state?.flags || []),
        };
    }, []);

    const openCell = useCallback(
        (index: number) => {
            if (socket) socket.emit("openCell", { index });
        },
        [socket]
    );

    const chording = useCallback(
        (index: number) => {
            if (socket) socket.emit("chording", { index });
        },
        [socket]
    );

    const toggleFlag = useCallback(
        (index: number, e: React.MouseEvent) => {
            e.preventDefault();
            if (socket) socket.emit("toggleFlag", { index });
        },
        [socket]
    );

    const handleError = useCallback(({ message }: { message: string }) => {
        toast.error(message);
    }, []);

    const handleSetGames = useCallback(({ gameState, playerState }: any) => {
        setGameState(gameState);
        setPlayerState(normalizePlayerState(playerState));
        setGameStarted(true);
        setEndedGame(false);
    }, [normalizePlayerState]);

    const handleUpdateState = useCallback(({ playerState }: any) => {
        // setGameState(gameState);
        setPlayerState(normalizePlayerState(playerState));
    }, [normalizePlayerState]);

    const handleGameOver = useCallback(({ message }: { message: string }) => {
        setDialogMessage(message);
        setOpenDialog({ end: true });
        setGameStarted(false);
        setEndedGame(true);
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on("error", handleError);
        socket.on("setGames", handleSetGames);
        socket.on("updateState", handleUpdateState);
        socket.on("gameOver", handleGameOver);

        return () => {
            socket.off("error", handleError);
            socket.off("setGames", handleSetGames);
            socket.off("updateState", handleUpdateState);
            socket.off("gameOver", handleGameOver);
        };
    }, [socket, handleError, handleSetGames, handleUpdateState, handleGameOver]);

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

        const cellClasses = [
            getNumberClass(cell.count, isRevealed),
            "flex items-center justify-center w-6 h-6 text-sm font-bold",
            isRevealed
                ? "bg-gray-200"
                : "bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500",
            canInteract ? "cursor-pointer" : "cursor-default",
        ].join(" ");

        return (
            <div
                key={index}
                className={cellClasses}
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
            </div>
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
                    const canChording = currentRevealed.has(index) && !endedGame;

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
        <div className="p-4 bg-gray-200 font-sans w-[500px]">
            <MinesweeperModeSelector onModeChange={setConfigMode} />
            <div className="flex items-center justify-between">
                <div className="w-full text-center border-2 font-medium text-sm rounded-sm min-w-[100px] bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
                    1/{gameState?.totalMines}
                </div>
                <div className="w-full text-center border-2 font-medium text-sm rounded-sm min-w-[100px] bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
                    1/{gameState?.totalMines}
                </div>

                <div className="w-full text-center border-2 font-medium text-sm rounded-sm min-w-[100px] bg-gray-300 border-t-2 border-l-2 border-b-2 border-r-2 border-t-white border-l-white border-b-gray-500 border-r-gray-500">
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