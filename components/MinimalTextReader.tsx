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
import { useSpeakOnly } from "./logic/useSpeakOnly";
import { StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { Button } from "./Button";

import { AVATARS } from "@/app/lib/constants";

const createConfig = (avatarId: string): StartAvatarRequest => {
  const selectedAvatar = AVATARS.find(
    (avatar) => avatar.avatar_id === avatarId,
  );

  return {
    quality: AvatarQuality.Low,
    avatarName: avatarId,
    knowledgeId: undefined,
    voice: {
      rate: 1.0,
      emotion: VoiceEmotion.EXCITED,
      model: ElevenLabsModel.eleven_flash_v2_5,
      voiceId: selectedAvatar?.voice_id, // 使用指定的語音 ID
    },
    language: "en",
    voiceChatTransport: VoiceChatTransport.WEBSOCKET,
    sttSettings: {
      provider: STTProvider.DEEPGRAM,
    },
  };
};

export default function MinimalTextReader() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { speakText } = useSpeakOnly();

  const [selectedAvatarId, setSelectedAvatarId] = useState(
    AVATARS[0].avatar_id,
  );
  const [textInput, setTextInput] = useState("");
  const [lastText, setLastText] = useState(""); // 記錄最後念的文字
  const [isLoading, setIsLoading] = useState(false);

  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken(avatarId: string) {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const token = await response.text();

      console.log(`Token fetched for ${avatarId}`);

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startAvatarSession = useMemoizedFn(async () => {
    if (sessionState !== StreamingAvatarSessionState.INACTIVE) return;

    setIsLoading(true);
    try {
      const token = await fetchAccessToken(selectedAvatarId);
      const avatar = initAvatar(token);
      const config = createConfig(selectedAvatarId);

      avatar.on(StreamingEvents.STREAM_READY, () => {
        console.log("Avatar ready");
      });

      await startAvatar(config);
    } catch (error) {
      console.error("Error starting avatar:", error);
    }
    setIsLoading(false);
  });

  // 念文字（純朗讀，不對話）
  const handleSpeakText = () => {
    if (!textInput.trim()) return;
    speakText(textInput); // 使用 useSpeakOnly 的 speakText
    setLastText(textInput); // 記錄最後念的文字
    setTextInput(""); // 清空輸入框
  };

  // 重複念上一句
  const repeatLastText = () => {
    if (!lastText) return;
    speakText(lastText); // 重複念上一句
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
                  <p className="text-zinc-400">點擊啟動開始使用</p>
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
            className="w-full !py-4 !text-lg"
            disabled={isLoading}
            onClick={startAvatarSession}
          >
            {isLoading ? "啟動中..." : `啟動 ${selectedAvatar?.name}`}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* 文字輸入 */}
            <div className="flex gap-3">
              <input
                className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="輸入要念的文字..."
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSpeakText();
                  }
                }}
              />
              <Button
                className="!px-6 !py-3 !bg-blue-600 hover:!bg-blue-700"
                disabled={!textInput.trim()}
                onClick={handleSpeakText}
              >
                念讀
              </Button>
            </div>

            {/* 功能按鈕 */}
            <div className="flex gap-3 justify-center">
              <Button
                className="!bg-green-600 hover:!bg-green-700"
                disabled={!lastText}
                onClick={repeatLastText}
              >
                🔄 Repeat
                {lastText && (
                  <span className="ml-2 text-xs opacity-75">
                    (
                    {lastText.length > 20
                      ? lastText.substring(0, 20) + "..."
                      : lastText}
                    )
                  </span>
                )}
              </Button>
              <Button
                className="!bg-red-600 hover:!bg-red-700"
                onClick={() => stopAvatar()}
              >
                停止
              </Button>
            </div>

            {/* 最後念的文字顯示 */}
            {lastText && (
              <div className="text-center p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                <p className="text-zinc-400 text-sm mb-1">最後念讀的文字：</p>
                <p className="text-white">{lastText}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
