import React, { useState } from "react";
import {
  Cog6ToothIcon,
  SparklesIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/solid";
import { Box } from "../../components/UI/Box";

interface GameMode {
  name: string;
  rows: number;
  cols: number;
  mines?: number;
  isMark?: boolean;
}

const gameModes: GameMode[] = [
  { name: "Dễ", rows: 9, cols: 9 },
  { name: "Trung", rows: 16, cols: 16 },
  { name: "Khó", rows: 16, cols: 30 },
];

interface MinesweeperModeSelectorProps {
  onModeChange: (mode: GameMode) => void;
}

const MinesweeperModeSelector: React.FC<MinesweeperModeSelectorProps> = ({ onModeChange }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(gameModes[0]);
  const [showCustom, setShowCustom] = useState(false);
  const [customMode, setCustomMode] = useState<GameMode>({
    name: "Custom",
    rows: 10,
    cols: 10,
    mines: 20,
    isMark: false,
  });

  const handleModeSelect = (mode: GameMode) => {
    setSelectedMode(mode);
    onModeChange(mode);
    setShowCustom(false);
  };

  const handleCustomSubmit = () => {
    const validatedMode = { ...customMode };
    handleModeSelect(validatedMode);
  };

  return (
    <div className="font-sans">
      <h1 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <SparklesIcon className="w-6 h-6 text-yellow-500" />
        Chọn chế độ
      </h1>
      <div className="flex my-1 gap-1">
        {gameModes.map((mode) => (
          <button
            key={mode.name}
            onClick={() => handleModeSelect(mode)}
            className={`flex items-center justify-center gap-2 ${selectedMode.name === mode.name && !showCustom
              ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
              : "bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400"
              } border-2 font-medium text-sm rounded-sm px-1 py-1`}
          >
            {selectedMode.name === mode.name && !showCustom && (
              <CheckCircleIcon className="w-4 h-4 text-green-600" />
            )}
            {mode.name}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`flex items-center justify-center gap-2 ${showCustom || selectedMode.name === "Custom"
            ? "bg-gray-200 border-t-white border-l-white border-b-gray-500 border-r-gray-500"
            : "bg-gray-300 border-t-white border-l-white border-b-gray-500 border-r-gray-500 hover:bg-gray-400"
            } border-2 font-medium text-sm rounded-sm px-1 py-1`}
        >
          <Cog6ToothIcon className="w-4 h-4 text-blue-600" />
          Chỉnh
          {showCustom ? (
            <ArrowUpIcon className="w-4 h-4 text-gray-600" />
          ) : (
            <ArrowDownIcon className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
      {showCustom && (
        <Box>
          <div className="grid grid-cols-3 mb-3">
            <div>
              <label className="block text-xs text-gray-800 mb-1">Hàng</label>
              <Box as="input"
                type="number"
                min="1"
                max="20"
                value={customMode.rows}
                onChange={(e) =>
                  setCustomMode({ ...customMode, rows: parseInt(e.target.value) || 5 })
                }
                placeholder="1-20"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-800 mb-1">Cột</label>
              <Box as="input"
                type="number"
                min="1"
                max="30"
                value={customMode.cols}
                onChange={(e) =>
                  setCustomMode({ ...customMode, cols: parseInt(e.target.value) || 5 })
                }
                placeholder="1-30"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-800 mb-1">Bom</label>
              <Box as="input"
                type="number"
                min="1"
                value={customMode.mines}
                onChange={(e) =>
                  setCustomMode({ ...customMode, mines: parseInt(e.target.value) || 1 })
                }
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-800 mb-1">Đánh dấu</label>
            <input
              type="checkbox"
              checked={customMode.isMark}
              onChange={(e) =>
                setCustomMode({ ...customMode, isMark: e.target.checked })
              }
            />
          </div>
          <Box as="button" onClick={handleCustomSubmit} className="flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-600" />
            Lưu
          </Box>
        </Box>
      )}
    </div>
  );
};

export default MinesweeperModeSelector;
