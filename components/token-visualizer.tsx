"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { encoding_for_model, Tiktoken } from "@dqbd/tiktoken";
import { useVirtualizer } from "@tanstack/react-virtual";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelSelector } from "@/components/model-selector";
import { getTokenColor, getTokenBorderColor, getTokenTextColor } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks";
import { Copy, Trash2, Sparkles, Info, FileCode } from "lucide-react";
import { toast } from "sonner";

interface TokenInfo {
  id: number;
  text: string;
  color: string;
  borderColor: string;
}

const EXAMPLES = [
  "Hello, world! This is a token visualizer.",
  "The quick brown fox jumps over the lazy dog.",
  "function fibonacci(n) { return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2); }",
  "🚀 Rocket ships are amazing! 🌟✨",
  "Tokenization splits text into smaller pieces called tokens.",
  "SELECT * FROM users WHERE email = 'example@example.com';",
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
];

const TOKEN_MIN_WIDTH = 80;
const TOKEN_HEIGHT = 35;

const TokenCell = React.memo(({ 
  token, 
  isSelected, 
  onClick, 
  style 
}: { 
  token: TokenInfo; 
  isSelected: boolean; 
  onClick: (token: TokenInfo) => void; 
  style: React.CSSProperties;
}) => (
  <div
    style={{
      ...style,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4px"
    }}
  >
    <button
      onClick={() => onClick(token)}
      className={`token-chip group w-full h-full ${
        isSelected ? "ring-2 ring-ring" : ""
      }`}
      style={{
        backgroundColor: token.color,
        borderColor: token.borderColor,
        color: getTokenTextColor(),
      }}
      title={`ID: ${token.id}`}
    >
      <span className="token-id">{token.id}</span>
      <span className="token-content">
        {token.text === "\n" ? "\\n" : token.text}
      </span>
    </button>
  </div>
));
TokenCell.displayName = "TokenCell";

export function TokenVisualizer() {
  const [text, setText] = useState("Hello, world!");
  const debouncedText = useDebounce(text, 1000);
  const [model, setModel] = useState("gpt-4o");
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokenCount, setTokenCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [encodingName, setEncodingName] = useState<string>("o200k_base");
  const [gridColumns, setGridColumns] = useState(1);
  const [columnWidth, setColumnWidth] = useState(TOKEN_MIN_WIDTH);

  const tiktokenRef = useRef<Tiktoken | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const handleBeforeMount = (monaco: any) => {
    monaco.editor.defineTheme("app-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#13141c", // Matches app background
      },
    });
  };

  const rowCount = Math.ceil(tokens.length / gridColumns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => TOKEN_HEIGHT,
    overscan: 5,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: gridColumns,
    getScrollElement: () => parentRef.current,
    estimateSize: () => columnWidth,
  });

  useLayoutEffect(() => {
    if (parentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          if (width > 0) {
            const newColumns = Math.max(1, Math.floor(width / TOKEN_MIN_WIDTH) - 4);
            setGridColumns(newColumns);
            setColumnWidth(width / newColumns);
          }
        }
      });
      resizeObserver.observe(parentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [tokens.length > 0]);  
    useEffect(() => {
      try {
        if (tiktokenRef.current) {
          tiktokenRef.current.free();
        }
        const enc = encoding_for_model(model as any);
        tiktokenRef.current = enc;
        setEncodingName(enc.name || model);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load tokenizer for this model.");
      }
    }, [model]);
  
    useEffect(() => {
      if (!tiktokenRef.current) return;
  
      const enc = tiktokenRef.current;
      if (debouncedText) {
        const tokenIds = enc.encode(debouncedText);
        const newTokens: TokenInfo[] = [];
        for (let i = 0; i < tokenIds.length; i++) {
          const id = tokenIds[i];
          const decodedBytes = enc.decode_single_token_bytes(id);
          const decodedText = new TextDecoder("utf-8").decode(decodedBytes);
          newTokens.push({
            id,
            text: decodedText,
            color: getTokenColor(i),
            borderColor: getTokenBorderColor(i),
          });
        }
        setTokens(newTokens);
        setTokenCount(tokenIds.length);
        setCharCount(debouncedText.length);
      } else {
        setTokens([]);
        setTokenCount(0);
        setCharCount(0);
      }
    }, [debouncedText, model]);
  
    // Auto-select first token when tokens change
    useEffect(() => {
      if (tokens.length > 0) {
        setSelectedToken(tokens[0]);
      } else {
        setSelectedToken(null);
      }
    }, [tokens]);
  
    const handleClear = () => {
      setText("");
    };
  
    const handleExample = (example: string) => {
      setText(example);
    };
  
    const handleCopyTokens = () => {
      const tokenText = tokens.map((t) => t.text).join("");
      navigator.clipboard.writeText(tokenText);
      toast.success("Copied token text to clipboard");
    };
  
    const handleCopyTokenIds = () => {
      const tokenIds = tokens.map((t) => t.id).join(", ");
      navigator.clipboard.writeText(tokenIds);
      toast.success("Copied token IDs to clipboard");
    };
  
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="2" fill="white"/>
              </svg>
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Token Visualizer
              </h1>
              <p className="text-sm text-muted-foreground">
                See how OpenAI tokenizers process your text
              </p>
            </div>
            <Badge variant="outline" className="text-xs ml-auto">
              {encodingName}
            </Badge>
          </div>
  
          {/* Main content area - side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column - Input */}
            <Card className="lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Input Text
                </CardTitle>
                <CardDescription>
                  Type or paste text to see how it gets tokenized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <ModelSelector value={model} onChange={setModel} />
                </div>
  
              <div className="space-y-2">
                <Label htmlFor="text-input">Text</Label>
                <div className="border rounded-xl overflow-hidden min-h-[120px] bg-[#13141c] p-4">
                  <Editor
                    height="300px"
                    defaultLanguage="markdown"
                    theme="app-dark"
                    value={text}
                    onChange={(value) => setText(value || "")}
                    beforeMount={handleBeforeMount}
                    options={{
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      fontSize: 14,
                      wordWrap: "on",
                      lineNumbers: "off",
                      folding: false,
                      glyphMargin: false,
                      renderLineHighlight: "none",
                      selectionHighlight: false,
                      multiCursorModifier: "ctrlCmd",
                      occurrencesHighlight: "off",
                      hideCursorInOverviewRuler: true,
                      overviewRulerLanes: 0,
                      fixedOverflowWidgets: true,
                      fastScrollSensitivity: 2,
                      padding: { top: 8, bottom: 8 },
                      lineDecorationsWidth: 0,
                      lineNumbersMinChars: 0,
                    }}
                  />
                </div>
              </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleClear} variant="outline" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                  {EXAMPLES.map((example, index) => (
                    <Button
                      key={index}
                      onClick={() => handleExample(example)}
                      variant="ghost"
                      size="sm"
                    >
                      Example {index + 1}
                    </Button>
                  ))}
                </div>
  
                {/* Stats */}
                <div className="flex flex-wrap gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {tokenCount} tokens
                    </Badge>
                    <span className="text-sm text-muted-foreground">Token count</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {charCount} chars
                    </Badge>
                    <span className="text-sm text-muted-foreground">Character count</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {tokenCount > 0 ? (charCount / tokenCount).toFixed(1) : "0"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Avg chars/token</span>
                  </div>
                </div>
              </CardContent>
            </Card>
  
            {/* Right Column - Tokens */}
            <div className="space-y-6">
              {tokens.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileCode className="w-5 h-5" />
                          Tokens
                        </CardTitle>
                        <CardDescription>
                          Click on any token to see details
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCopyTokens} variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Text
                        </Button>
                        <Button onClick={handleCopyTokenIds} variant="outline" size="sm">
                          <Copy className="w-4 h-4 mr-2" />
                          Copy IDs
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={parentRef}
                      className="p-2 rounded-lg bg-muted/30 max-h-[200px] overflow-y-auto"
                    >
                      <div
                        style={{
                          height: `${rowVirtualizer.getTotalSize()}px`,
                          width: `${columnVirtualizer.getTotalSize()}px`,
                          position: "relative",
                        }}
                      >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                          <React.Fragment key={virtualRow.key}>
                            {columnVirtualizer.getVirtualItems().map((virtualColumn) => {
                              const index = virtualRow.index * gridColumns + virtualColumn.index;
                              const token = tokens[index];
  
                              if (!token) return null;
  
                              return (
                                <TokenCell
                                  key={`${virtualRow.key}-${virtualColumn.key}`}
                                  token={token}
                                  isSelected={selectedToken?.id === token.id}
                                  onClick={setSelectedToken}
                                  style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: `${virtualColumn.size}px`,
                                    height: `${virtualRow.size}px`,
                                    transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                                  }}
                                />
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            {/* Selected Token Details */}
            {selectedToken && (
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Token Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="visual">
                    <TabsList>
                      <TabsTrigger value="visual">Visual</TabsTrigger>
                      <TabsTrigger value="raw">Raw Data</TabsTrigger>
                    </TabsList>
                    <TabsContent value="visual" className="space-y-4">
                      <div className="p-6 rounded-lg text-center" style={{ backgroundColor: selectedToken.color }}>
                        <span className="text-4xl font-mono" style={{ color: getTokenTextColor() }}>
                          {selectedToken.text === "\n" ? "\\n" : selectedToken.text}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Token ID</Label>
                          <p className="text-2xl font-mono">{selectedToken.id}</p>
                        </div>
                        <div>
                          <Label>Character Count</Label>
                          <p className="text-2xl font-mono">{selectedToken.text.length}</p>
                        </div>
                        <div className="col-span-2">
                          <Label>Unicode Code Points</Label>
                          <p className="text-sm font-mono text-muted-foreground">
                            {Array.from(selectedToken.text)
                              .map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`)
                              .join(" ")}
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="raw" className="space-y-4">
                      <div className="space-y-2 font-mono text-sm">
                        <div className="p-3 rounded bg-muted">
                          <span className="text-muted-foreground">Text: </span>
                          {JSON.stringify(selectedToken.text)}
                        </div>
                        <div className="p-3 rounded bg-muted">
                          <span className="text-muted-foreground">ID: </span>
                          {selectedToken.id}
                        </div>
                        <div className="p-3 rounded bg-muted">
                          <span className="text-muted-foreground">Bytes: </span>
                          {new TextEncoder().encode(selectedToken.text).join(" ")}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Tokenization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Tokens</strong> are the basic units of text that language models process.
              Different models use different tokenization strategies.
            </p>
            <p>
              <strong>Byte Pair Encoding (BPE)</strong> is the algorithm used by tiktoken (OpenAI models).
              It breaks text into subword units, balancing between character-level and word-level tokenization.
            </p>
            <p>
              <strong>Why it matters:</strong> API costs are calculated per token, and models
              have context limits measured in tokens. Understanding tokenization helps
              optimize prompts and manage costs.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
