import React from "react";

import { Button } from "./Button";

export type ChatMode = "voice" | "text";

interface ChatModeSelectorProps {
  selectedMode: ChatMode | null;
  onModeSelect: (mode: ChatMode) => void;
  onStartChat: () => void;
  disabled?: boolean;
}

export const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  selectedMode,
  onModeSelect,
  onStartChat,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">選擇聊天模式</h3>
        <p className="text-zinc-400 text-sm">選擇您偏好的互動方式</p>
      </div>

      <div className="space-y-4">
        {/* 語音聊天模式 */}
        <div
          className={`relative cursor-pointer transition-all duration-300 ${
            selectedMode === "voice"
              ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900"
              : "hover:ring-2 hover:ring-zinc-600 hover:ring-offset-2 hover:ring-offset-zinc-900"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => !disabled && onModeSelect("voice")}
        >
          <div className="bg-zinc-800 rounded-lg p-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">🎙️ 語音聊天</h4>
              <p className="text-zinc-400 text-sm">
                使用語音與助理進行自然對話
              </p>
            </div>
            {selectedMode === "voice" && (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 文字聊天模式 */}
        <div
          className={`relative cursor-pointer transition-all duration-300 ${
            selectedMode === "text"
              ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900"
              : "hover:ring-2 hover:ring-zinc-600 hover:ring-offset-2 hover:ring-offset-zinc-900"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => !disabled && onModeSelect("text")}
        >
          <div className="bg-zinc-800 rounded-lg p-4 flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-medium">💬 文字聊天</h4>
              <p className="text-zinc-400 text-sm">通過文字輸入與助理互動</p>
            </div>
            {selectedMode === "text" && (
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 開始聊天按鈕 */}
      {selectedMode && (
        <div className="mt-6">
          <Button className="w-full" disabled={disabled} onClick={onStartChat}>
            開始{selectedMode === "voice" ? "語音" : "文字"}聊天
          </Button>
        </div>
      )}
    </div>
  );
};
