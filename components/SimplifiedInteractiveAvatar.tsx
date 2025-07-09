import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import {
  StreamingAvatarSessionState,
  useStreamingAvatarContext,
  ChatMode,
} from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { AvatarSelector } from "./AvatarSelector";
import { ChatModeSelector } from "./ChatModeSelector";

import { AVATARS } from "@/app/lib/constants";

// 使用預設配置，會根據選擇的助理動態更新
const createAvatarConfig = (
  avatarId: string,
  _chatMode: ChatMode,
): StartAvatarRequest => {
  const selectedAvatar = AVATARS.find(
    (avatar) => avatar.avatar_id === avatarId,
  );

  return {
    quality: AvatarQuality.Medium,
    avatarName: avatarId,
    knowledgeId: undefined,
    voice: {
      rate: 1.2,
      emotion: VoiceEmotion.FRIENDLY,
      model: ElevenLabsModel.eleven_flash_v2_5,
      voiceId: selectedAvatar?.voice_id,
    },
    language: "zh",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
    sttSettings: {
      provider: STTProvider.DEEPGRAM,
    },
  };
};

function SimplifiedInteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const {
    avatarSelection,
    setSelectedAvatarId,
    setSelectedChatMode,
    resetAvatarSelection,
  } = useStreamingAvatarContext();

  const [config, setConfig] = useState<StartAvatarRequest | null>(null);
  const mediaStream = useRef<HTMLVideoElement>(null);

  // 根據選擇的助理和聊天模式更新配置
  useEffect(() => {
    if (
      avatarSelection.isAvatarSelected &&
      avatarSelection.isChatModeSelected
    ) {
      const newConfig = createAvatarConfig(
        avatarSelection.selectedAvatarId,
        avatarSelection.selectedChatMode!,
      );

      setConfig(newConfig);
    }
  }, [
    avatarSelection.isAvatarSelected,
    avatarSelection.isChatModeSelected,
    avatarSelection.selectedAvatarId,
    avatarSelection.selectedChatMode,
  ]);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token);

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSession = useMemoizedFn(async () => {
    if (!config) return;

    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      // 設置事件監聽器
      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);

      // 如果是語音聊天模式，自動啟動語音聊天
      if (avatarSelection.selectedChatMode === "voice") {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  const handleBackToSelection = useMemoizedFn(() => {
    stopAvatar();
    resetAvatarSelection();
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  // 如果會話已連接，顯示聊天界面
  if (sessionState !== StreamingAvatarSessionState.INACTIVE) {
    const selectedAvatar = AVATARS.find(
      (avatar) => avatar.avatar_id === avatarSelection.selectedAvatarId,
    );

    return (
      <div className="w-full flex flex-col gap-4">
        {/* 助理信息條 */}
        <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
              <span className="text-lg">
                {selectedAvatar?.gender === "male" ? "👨‍💼" : "👩‍💼"}
              </span>
            </div>
            <div>
              <h3 className="text-white font-medium">{selectedAvatar?.name}</h3>
              <p className="text-zinc-400 text-sm">
                {avatarSelection.selectedChatMode === "voice"
                  ? "語音聊天"
                  : "文字聊天"}
              </p>
            </div>
          </div>
          <button
            className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded transition-colors"
            onClick={handleBackToSelection}
          >
            重新選擇
          </button>
        </div>

        {/* 視頻和控制區域 */}
        <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
          <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
            <AvatarVideo ref={mediaStream} />
          </div>
          <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full">
            {sessionState === StreamingAvatarSessionState.CONNECTED ? (
              <AvatarControls />
            ) : (
              <LoadingIcon />
            )}
          </div>
        </div>

        {/* 訊息歷史 */}
        {sessionState === StreamingAvatarSessionState.CONNECTED && (
          <MessageHistory />
        )}
      </div>
    );
  }

  // 如果尚未選擇助理，顯示助理選擇界面
  if (!avatarSelection.isAvatarSelected) {
    return (
      <div className="w-full flex flex-col gap-6">
        <AvatarSelector
          selectedAvatarId={avatarSelection.selectedAvatarId}
          onAvatarSelect={setSelectedAvatarId}
        />
      </div>
    );
  }

  // 如果已選擇助理但尚未選擇聊天模式，顯示聊天模式選擇界面
  if (!avatarSelection.isChatModeSelected) {
    const selectedAvatar = AVATARS.find(
      (avatar) => avatar.avatar_id === avatarSelection.selectedAvatarId,
    );

    return (
      <div className="w-full flex flex-col gap-6">
        {/* 已選擇的助理預覽 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 p-4 bg-zinc-800 rounded-lg">
            <div className="w-12 h-12 bg-zinc-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">
                {selectedAvatar?.gender === "male" ? "👨‍💼" : "👩‍💼"}
              </span>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">{selectedAvatar?.name}</h3>
              <p className="text-zinc-400 text-sm">
                {selectedAvatar?.description}
              </p>
            </div>
          </div>
        </div>

        {/* 聊天模式選擇 */}
        <ChatModeSelector
          selectedMode={avatarSelection.selectedChatMode}
          onModeSelect={setSelectedChatMode}
          onStartChat={startSession}
        />

        {/* 返回助理選擇 */}
        <div className="text-center">
          <button
            className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors"
            onClick={() => setSelectedAvatarId("")}
          >
            ← 重新選擇助理
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default SimplifiedInteractiveAvatar;
