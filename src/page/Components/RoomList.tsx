import React from "react";
import { UserGroupIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import { Box } from "../../components/UI/Box"
interface Room {
    id: string;
    name: string;
    currentPlayers: number;
    maxPlayers: number;
}

interface RoomListProps {
    rooms: Room[];
    onJoinRoom: (roomId: string) => void;
}

const RoomList: React.FC<RoomListProps> = ({ rooms, onJoinRoom }) => {
    const truncateRoomId = (id: string, maxLength: number = 8) => {
        return id.length > maxLength ? `${id.slice(0, maxLength)}...` : id;
    };

    return (
        <div className="w-full max-w-[350px] font-sans p-4">
            <Box className="h-[90vh] overflow-hidden">
                <h1 className="text-lg font-bold text-gray-800 mb-3">Danh sách phòng</h1>
                <div className="flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {rooms.map((room) => (
                        <Box as="section" key={room.id} className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-700">
                                    {room.name} (ID: {truncateRoomId(room.id)})
                                </span>
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                    <UserGroupIcon className="w-4 h-4 text-blue-600" />
                                    {room.currentPlayers}/{room.maxPlayers} người chơi
                                </span>
                            </div>
                            <Box
                                as="button"
                                onClick={() => onJoinRoom(room.id)}
                                aria-label={`Join room ${room.name}`}
                                className="flex items-center gap-1"
                            >
                                <ArrowRightCircleIcon className="w-5 h-5 text-green-600" />
                                Tham gia
                            </Box>
                        </Box>
                    ))}
                </div>
            </Box>
        </div>
    );
};

export default RoomList;
