# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 專案概述

這是一個基於 Next.js 的 HeyGen Interactive Avatar 展示應用程式，使用 TypeScript 和 Tailwind CSS。主要功能包括與 AI 虛擬助理進行語音和文字聊天。

## 常用開發指令

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構生產版本
npm run build

# 啟動生產伺服器
npm start

# 程式碼檢查
npm run lint
```

## 環境設定

需要在 `.env` 檔案中設置以下環境變數：
- `HEYGEN_API_KEY` - HeyGen API 金鑰
- `HEYGEN_API_KEY_WILL` - WILL Avatar 專用金鑰
- `HEYGEN_API_KEY_CRCH` - CRCH Avatar 專用金鑰
- `NEXT_PUBLIC_BASE_API_URL` - HeyGen API 基礎 URL (選填)
- `OPENAI_API_KEY` - OpenAI API 金鑰 (選填，用於 OpenAI 功能)

## 核心架構

### 狀態管理
- 使用 React Context (`components/logic/context.tsx`) 管理全域狀態
- 自定義 hooks 分離不同功能邏輯：
  - `useStreamingAvatarSession.ts` - Avatar 會話管理
  - `useVoiceChat.ts` - 語音聊天功能
  - `useTextChat.ts` - 文字聊天功能
  - `useMessageHistory.ts` - 訊息記錄管理
  - `useConnectionQuality.ts` - 連線品質監控
  - `useConversationState.ts` - 對話狀態管理
  - `useInterrupt.ts` - 中斷功能
  - `useSpeakOnly.ts` - 純語音功能

### 主要元件
- `InteractiveAvatar.tsx` - 主要 Avatar 介面元件
- `SimplifiedInteractiveAvatar.tsx` - 簡化版 Avatar 介面
- `MinimalTextReader.tsx` - 最小化文字閱讀器元件
- `AvatarSession/` - Avatar 會話相關元件
  - `AvatarVideo.tsx` - 影片播放元件
  - `AvatarControls.tsx` - 控制按鈕
  - `AudioInput.tsx` - 音訊輸入
  - `TextInput.tsx` - 文字輸入
  - `MessageHistory.tsx` - 訊息記錄
- `AvatarConfig/` - Avatar 配置元件
- `AvatarSelector.tsx` - Avatar 選擇器
- `ChatModeSelector.tsx` - 聊天模式選擇器
- `TextToSpeechOnly.tsx` - 純文字轉語音元件
- `SimpleTextToSpeech.tsx` - 簡單文字轉語音元件

### API 路由
- `/api/get-access-token/route.ts` - 獲取 HeyGen 存取令牌

### 會話狀態
使用 enum 管理會話狀態：
- `INACTIVE` - 未啟動
- `CONNECTING` - 連線中
- `CONNECTED` - 已連線

## 技術棧

- **框架**: Next.js 15 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **UI 元件**: Radix UI
- **狀態管理**: React Context + Custom Hooks
- **SDK**: @heygen/streaming-avatar
- **代碼檢查**: ESLint + Prettier

## 開發規範

### 代碼風格
- 使用 ESLint 和 Prettier 進行代碼格式化
- Import 順序：type -> builtin -> external -> internal -> parent -> sibling -> index
- React 元件使用 JSX 排序規則
- 未使用的 imports 會被自動移除

### 檔案結構
- `app/` - Next.js App Router 檔案
  - `api/` - API 路由
  - `lib/` - 共用工具和常數
- `components/` - 可重用元件
  - `AvatarConfig/` - Avatar 配置相關元件
  - `AvatarSession/` - Avatar 會話相關元件
  - `logic/` - 狀態管理和業務邏輯 hooks
- `docs/` - 文件資料
- `public/` - 靜態資源
- `styles/` - 全域樣式

## HeyGen SDK 整合

### 主要功能
- 語音聊天 (WebSocket 傳輸)
- 文字聊天
- 即時語音識別 (STT)
- 多語言支援
- 連線品質監控
- 中斷和重複功能

### 預設配置
- 品質：低品質 (AvatarQuality.Low)
- 語言：英文
- 語音情感：EXCITED
- 語音速度：1.5x
- STT 提供商：DEEPGRAM
- 傳輸方式：WebSocket

### 可用 Avatar
在 `app/lib/constants.ts` 中定義了可用的 Avatar 列表：
- **WILL** - 專業男性助理
- **CRCH** - 親切女性助理

每個 Avatar 都有對應的 API 金鑰環境變數和語音設定。