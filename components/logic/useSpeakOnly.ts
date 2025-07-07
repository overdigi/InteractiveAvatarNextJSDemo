import { TaskMode, TaskType } from "@heygen/streaming-avatar";
import { useCallback } from "react";

import { useStreamingAvatarContext } from "./context";

export const useSpeakOnly = () => {
  const { avatarRef } = useStreamingAvatarContext();

  // 只念文字，不產生對話回應
  const speakText = useCallback(
    (text: string) => {
      if (!avatarRef.current) return;

      // 使用 REPEAT 類型，只念文字不產生回應
      avatarRef.current.speak({
        text: text,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.ASYNC,
      });
    },
    [avatarRef],
  );

  const speakTextSync = useCallback(
    async (text: string) => {
      if (!avatarRef.current) return;

      return await avatarRef.current?.speak({
        text: text,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.SYNC,
      });
    },
    [avatarRef],
  );

  return {
    speakText,
    speakTextSync,
  };
};
