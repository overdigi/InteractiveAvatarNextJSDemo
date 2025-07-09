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

// 使用原來可用的配置
const createConfig = (avatarId: string): StartAvatarRequest => {
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

export default function TextToSpeechOnly() {
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
      const token = await response.text();

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
      const config = createConfig(selectedAvatarId);

      // 只監聽必要的事件
      avatar.on(StreamingEvents.STREAM_READY, () => {
        console.log("Avatar ready");
      });

      await startAvatar(config);
    } catch (error) {
      console.error("Error starting avatar:", error);
    }
    setIsLoading(false);
  });

  // 讓虛擬人念文字
  const speakText = () => {
    if (!textInput.trim()) return;
    sendMessage(textInput);
    setTextInput(""); // 念完後清空輸入框
  };

  // 切換虛擬人
  const switchAvatar = async (avatarId: string) => {
    if (avatarId === selectedAvatarId) return;

    setSelectedAvatarId(avatarId);
    if (sessionState === StreamingAvatarSessionState.CONNECTED) {
      stopAvatar();
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
        <h1 className="text-3xl font-bold text-white mb-2">虛擬人文字朗讀</h1>
        <p className="text-zinc-400">輸入文字，讓虛擬人為您朗讀</p>
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
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
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
                <div className="text-center">
                  <LoadingIcon />
                  <p className="text-zinc-400 mt-4">啟動中...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-zinc-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">
                      {selectedAvatar?.gender === "male" ? "👨‍💼" : "👩‍💼"}
                    </span>
                  </div>
                  <p className="text-zinc-400">點擊「啟動」開始使用</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 文字輸入和控制 */}
      <div className="space-y-4">
        {!isConnected ? (
          <Button
            className="w-full !py-4 !text-lg !font-semibold"
            disabled={isLoading}
            onClick={startAvatarSession}
          >
            {isLoading ? "啟動中..." : `啟動 ${selectedAvatar?.name}`}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* 文字輸入區 */}
            <div className="space-y-2">
              <label className="block text-white font-medium">
                輸入要朗讀的文字：
              </label>
              <textarea
                className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="在這裡輸入任何您想讓虛擬人朗讀的文字..."
                rows={4}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault();
                    speakText();
                  }
                }}
              />
              <p className="text-zinc-500 text-sm">
                提示：按 Ctrl + Enter 快速朗讀
              </p>
            </div>

            {/* 操作按鈕 */}
            <div className="flex gap-3">
              <Button
                className="flex-1 !py-3 !text-lg !bg-blue-600 hover:!bg-blue-700"
                disabled={!textInput.trim()}
                onClick={speakText}
              >
                🔊 開始朗讀
              </Button>
              <Button
                className="!py-3 !bg-zinc-700 hover:!bg-zinc-600"
                disabled={!textInput}
                onClick={() => setTextInput("")}
              >
                清空
              </Button>
              <Button
                className="!py-3 !bg-red-600 hover:!bg-red-700"
                onClick={() => stopAvatar()}
              >
                停止
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
