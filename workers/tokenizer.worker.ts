import { encoding_for_model } from "@dqbd/tiktoken";

// High-contrast curated color palette for tokens (duplicated from lib/utils to allow worker isolation)
const TOKEN_COLORS = [
  { bg: '#3b82f6', border: '#1d4ed8' },   // blue-500
  { bg: '#8b5cf6', border: '#6d28d9' },   // violet-500
  { bg: '#ec4899', border: '#be185d' },   // pink-500
  { bg: '#f43f5e', border: '#be123c' },   // rose-500
  { bg: '#f97316', border: '#c2410c' },   // orange-500
  { bg: '#eab308', border: '#a16207' },   // yellow-500
  { bg: '#22c55e', border: '#15803d' },   // green-500
  { bg: '#14b8a6', border: '#0f766e' },   // teal-500
  { bg: '#06b6d4', border: '#0e7490' },   // cyan-500
  { bg: '#6366f1', border: '#4338ca' },   // indigo-500
  { bg: '#a855f7', border: '#7e22ce' },   // purple-500
  { bg: '#ef4444', border: '#b91c1c' },   // red-500
];

function getTokenColor(index: number): string {
  return TOKEN_COLORS[index % TOKEN_COLORS.length].bg;
}

function getTokenBorderColor(index: number): string {
  return TOKEN_COLORS[index % TOKEN_COLORS.length].border;
}

// Signal that the worker is ready
self.postMessage({ status: 'ready' });

self.onmessage = (e: MessageEvent) => {
  const { text, model } = e.data;

  try {
    const enc = encoding_for_model(model);
    const encodingName = enc.name;
    const tokenIds = enc.encode(text);
    
    const tokens = [];
    const decoder = new TextDecoder("utf-8");

    // Optimization: Pre-allocate array if possible, or just push.
    // For 10M chars, this loop is the heavy part.
    for (let i = 0; i < tokenIds.length; i++) {
      const id = tokenIds[i];
      const decodedBytes = enc.decode_single_token_bytes(id);
      const decodedText = decoder.decode(decodedBytes);
      
      tokens.push({
        id,
        text: decodedText,
        color: getTokenColor(i),
        borderColor: getTokenBorderColor(i),
      });
    }

    enc.free();

    self.postMessage({
      status: 'complete',
      tokens,
      tokenCount: tokenIds.length,
      charCount: text.length,
      encodingName
    });

  } catch (error: any) {
    self.postMessage({
      status: 'error',
      error: error.message
    });
  }
};
