import { AVATARS } from "@/app/lib/constants";

export async function POST(request: Request) {
  try {
    // 從請求中獲取 avatar_id
    const { avatarId } = await request.json();
    
    if (!avatarId) {
      throw new Error("Avatar ID is required");
    }

    // 根據 avatarId 找到對應的 avatar 配置
    const avatar = AVATARS.find(a => a.avatar_id === avatarId);
    
    if (!avatar || !avatar.api_key_env) {
      throw new Error(`No API key env found for avatar: ${avatarId}`);
    }

    // 從環境變數中讀取對應的 API Key
    const apiKey = process.env[avatar.api_key_env];
    
    if (!apiKey) {
      throw new Error(`Environment variable ${avatar.api_key_env} not found`);
    }

    const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API_URL;

    console.log(`Using API key from ${avatar.api_key_env} for ${avatar.name} (${avatarId})`);

    const res = await fetch(`${baseApiUrl}/v1/streaming.create_token`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
    });

    console.log("Response:", res);

    if (!res.ok) {
      throw new Error(`API request failed: ${res.status}`);
    }

    const data = await res.json();

    return new Response(data.data.token, {
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving access token:", error);

    return new Response("Failed to retrieve access token", {
      status: 500,
    });
  }
}
