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
import { useTextChat } from "./logic/useTextChat";
import { StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { Button } from "./Button";

import { AVATARS } from "@/app/lib/constants";

// 創建簡化的配置 - 使用原來可用的格式
const createSimpleConfig = (avatarId: string): StartAvatarRequest => {
  return {
    quality: AvatarQuality.Low,
    avatarName: avatarId,
    knowledgeId: undefined,
    voice: {
      rate: 1.5,
      emotion: VoiceEmotion.EXCITED,
      model: ElevenLabsModel.eleven_flash_v2_5,
    },
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
    sttSettings: {
      provider: STTProvider.DEEPGRAM,
    },
  };
};

export default function SimpleTextToSpeech() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { sendMessage } = useTextChat();

  const [selectedAvatarId, setSelectedAvatarId] = useState(
    AVATARS[0].avatar_id,
  );
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);

  // 獲取 Access Token
  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const token = await response.text();

      console.log("Token fetched successfully");

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  // 啟動虛擬人
  const startAvatarSession = useMemoizedFn(async () => {
    if (sessionState !== StreamingAvatarSessionState.INACTIVE) return;

    setIsLoading(true);
    try {
      const token = await fetchAccessToken();
      const avatar = initAvatar(token);
      const config = createSimpleConfig(selectedAvatarId);

      // 簡化的事件監聽
      avatar.on(StreamingEvents.STREAM_READY, () => {
        console.log("Avatar ready");
      });

      await startAvatar(config);
    } catch (error) {
      console.error("Error starting avatar:", error);
    }
    setIsLoading(false);
  });

  // 讓虛擬人說話
  const speakText = () => {
    if (!textInput.trim()) return;
    sendMessage(textInput);
    setTextInput("");
  };

  // 切換虛擬人
  const switchAvatar = async (avatarId: string) => {
    if (avatarId === selectedAvatarId) return;

    setSelectedAvatarId(avatarId);
    if (sessionState === StreamingAvatarSessionState.CONNECTED) {
      stopAvatar();
      // 稍微延遲後重新啟動新的虛擬人
      setTimeout(() => {
        startAvatarSession();
      }, 1000);
    }
  };

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
  }, [stream]);

  const selectedAvatar = AVATARS.find(
    (avatar) => avatar.avatar_id === selectedAvatarId,
  );
  const isConnected = sessionState === StreamingAvatarSessionState.CONNECTED;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">虛擬人文字念讀</h1>
        <p className="text-zinc-400">選擇虛擬人，輸入文字，點擊念讀</p>
      </div>

      {/* 虛擬人選擇 */}
      <div className="grid grid-cols-2 gap-4">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.avatar_id}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedAvatarId === avatar.avatar_id
                ? "border-blue-500 bg-blue-500/10"
                : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
            }`}
            onClick={() => switchAvatar(avatar.avatar_id)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-zinc-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">
                  {avatar.gender === "male" ? "👨‍💼" : "👩‍💼"}
                </span>
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">{avatar.name}</h3>
                <p className="text-zinc-400 text-sm">{avatar.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 虛擬人視窗 */}
      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <div className="aspect-video relative">
          {isConnected ? (
            <AvatarVideo ref={mediaStream} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800">
              {isLoading ? (
                <LoadingIcon />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">
                      {selectedAvatar?.gender === "male" ? "👨‍💼" : "👩‍💼"}
                    </span>
                  </div>
                  <p className="text-zinc-400">
                    點擊下方「啟動{selectedAvatar?.name}」開始
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 控制區域 */}
      <div className="space-y-4">
        {!isConnected ? (
          <Button
            className="w-full !py-3 !text-lg"
            disabled={isLoading}
            onClick={startAvatarSession}
          >
            {isLoading ? "啟動中..." : `啟動 ${selectedAvatar?.name}`}
          </Button>
        ) : (
          <>
            {/* 文字輸入區 */}
            <div className="flex gap-3">
              <textarea
                className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 resize-none"
                placeholder="輸入要念讀的文字..."
                rows={3}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    speakText();
                  }
                }}
              />
              <Button
                className="!px-6 !py-3 h-fit"
                disabled={!textInput.trim()}
                onClick={speakText}
              >
                念讀
              </Button>
            </div>

            {/* 快捷操作 */}
            <div className="flex gap-2 justify-center">
              <Button
                className="!bg-red-600 hover:!bg-red-700"
                onClick={() => stopAvatar()}
              >
                停止
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
