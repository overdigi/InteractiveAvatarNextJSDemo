import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React, { useMemo } from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { useTextChat } from "../logic/useTextChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";
import { useStreamingAvatarContext, MessageSender } from "../logic";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";

export const AvatarControls: React.FC = () => {
  const {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();
  const { repeatMessage } = useTextChat();
  const { messages } = useStreamingAvatarContext();

  // 獲取最後一條 Avatar 消息
  const lastAvatarMessage = useMemo(() => {
    const avatarMessages = messages.filter(
      (msg: any) => msg.sender === MessageSender.AVATAR,
    );

    return avatarMessages[avatarMessages.length - 1];
  }, [messages]);

  const handleRepeat = () => {
    if (lastAvatarMessage) {
      repeatMessage(lastAvatarMessage.content);
    }
  };

  return (
    <div className="flex flex-col gap-3 relative w-full items-center">
      <ToggleGroup
        className={`bg-zinc-700 rounded-lg p-1 ${isVoiceChatLoading ? "opacity-50" : ""}`}
        disabled={isVoiceChatLoading}
        type="single"
        value={isVoiceChatActive || isVoiceChatLoading ? "voice" : "text"}
        onValueChange={(value) => {
          if (value === "voice" && !isVoiceChatActive && !isVoiceChatLoading) {
            startVoiceChat();
          } else if (
            value === "text" &&
            isVoiceChatActive &&
            !isVoiceChatLoading
          ) {
            stopVoiceChat();
          }
        }}
      >
        <ToggleGroupItem
          className="data-[state=on]:bg-zinc-800 rounded-lg p-2 text-sm w-[90px] text-center"
          value="voice"
        >
          Voice Chat
        </ToggleGroupItem>
        <ToggleGroupItem
          className="data-[state=on]:bg-zinc-800 rounded-lg p-2 text-sm w-[90px] text-center"
          value="text"
        >
          Text Chat
        </ToggleGroupItem>
      </ToggleGroup>
      {isVoiceChatActive || isVoiceChatLoading ? <AudioInput /> : <TextInput />}

      {/* 控制按鈕組 */}
      <div className="flex gap-2 mt-2">
        <Button
          className="!bg-blue-600 !text-white hover:!bg-blue-700 transition-colors"
          disabled={!lastAvatarMessage}
          onClick={handleRepeat}
        >
          🔄 Repeat
        </Button>
        <Button
          className="!bg-red-600 !text-white hover:!bg-red-700 transition-colors"
          onClick={interrupt}
        >
          ⏹️ 中斷
        </Button>
      </div>
    </div>
  );
};
