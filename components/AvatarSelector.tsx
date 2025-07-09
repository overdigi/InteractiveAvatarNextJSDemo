import React from "react";

import { AVATARS } from "@/app/lib/constants";

interface AvatarSelectorProps {
  selectedAvatarId: string;
  onAvatarSelect: (avatarId: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatarId,
  onAvatarSelect,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">選擇您的虛擬助理</h2>
        <p className="text-zinc-400">請選擇一位助理來開始您的對話體驗</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AVATARS.map((avatar) => (
          <div
            key={avatar.avatar_id}
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedAvatarId === avatar.avatar_id
                ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900"
                : "hover:ring-2 hover:ring-zinc-600 hover:ring-offset-2 hover:ring-offset-zinc-900"
            }`}
            onClick={() => onAvatarSelect(avatar.avatar_id)}
          >
            <div className="bg-zinc-800 rounded-xl p-6 transition-all duration-300 group-hover:bg-zinc-750">
              {/* Avatar 預覽區域 */}
              <div className="aspect-video bg-zinc-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <div className="w-24 h-24 bg-zinc-600 rounded-full flex items-center justify-center">
                  <span className="text-3xl">
                    {avatar.gender === "male" ? "👨‍💼" : "👩‍💼"}
                  </span>
                </div>
              </div>

              {/* 助理資訊 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {avatar.name}
                </h3>
                <p className="text-sm text-zinc-400">{avatar.description}</p>

                {/* 特性標籤 */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                    {avatar.gender === "male" ? "專業" : "親切"}
                  </span>
                  <span className="px-2 py-1 bg-zinc-700 text-zinc-300 text-xs rounded-full">
                    {avatar.gender === "male" ? "可靠" : "溫暖"}
                  </span>
                </div>
              </div>

              {/* 選中狀態指示器 */}
              {selectedAvatarId === avatar.avatar_id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
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
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
