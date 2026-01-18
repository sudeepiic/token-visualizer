"use client";

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModelSelector } from "@/components/model-selector";
import { getTokenColor, getTokenBorderColor, getTokenTextColor, formatNumber } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks";
import { Copy, Trash2, Sparkles, Info, FileCode, Loader2, Github } from "lucide-react";
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
      className={`token-chip group w-full h-full overflow-hidden ${
        isSelected ? "ring-2 ring-ring" : ""
      }`}
      style={{
        backgroundColor: token.color,
        borderColor: token.borderColor,
        color: getTokenTextColor(),
      }}
      title={`ID: ${token.id}`}
    >
      <span className="token-id shrink-0">{token.id}</span>
      <span className="token-content min-w-0 overflow-x-auto whitespace-nowrap scrollbar-hide">
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
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [workerReady, setWorkerReady] = useState(false);

  const workerRef = useRef<Worker | null>(null);
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
            if (width < 640) {
              setGridColumns(2);
              setColumnWidth(width / 2);
            } else {
              const newColumns = Math.max(1, Math.floor(width / TOKEN_MIN_WIDTH) - 4);
              setGridColumns(newColumns);
              setColumnWidth(width / newColumns);
            }
          }
        }
      });
      resizeObserver.observe(parentRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [tokens.length > 0]);

  useEffect(() => {
    try {
      workerRef.current = new Worker(new URL('../workers/tokenizer.worker.ts', import.meta.url));
      
          workerRef.current.onmessage = (event) => {
            const { status, tokens, tokenCount, charCount, encodingName, error } = event.data;
            if (status === 'ready') {
              setWorkerReady(true);
            } else if (status === 'complete') {
              setTokens(tokens);
              setTokenCount(tokenCount);
              setCharCount(charCount);
              setEncodingName(encodingName || model);
              setIsTokenizing(false);
            } else if (status === 'error') {
              console.error("Worker error message:", error);
              toast.error("Tokenization failed");
              setIsTokenizing(false);
            }
          };
      
          workerRef.current.onerror = (error) => {        console.error("Worker startup error:", error);
        toast.error("Worker failed to start");
        setIsTokenizing(false);
      };
    } catch (e) {
      console.error("Failed to create worker:", e);
      setIsTokenizing(false);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (!workerReady) return;

    if (debouncedText) {
      setIsTokenizing(true);
      workerRef.current?.postMessage({ text: debouncedText, model });
    } else {
      setTokens([]);
      setTokenCount(0);
      setCharCount(0);
      setIsTokenizing(false);
    }
  }, [debouncedText, model, workerReady]);
  
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
            <div className="flex items-center gap-2 ml-auto">
              <Badge variant="outline" className="text-xs">
                {encodingName}
              </Badge>
              <a 
                href="https://github.com/sapeol/token-visualizer" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground active:scale-95 h-9 w-9 text-muted-foreground hover:text-foreground"
                title="View on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
  
        {/* Main content area - side by side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column - Input */}
          <Card className="lg:sticky lg:top-6 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Input Text
                </CardTitle>
                <CardDescription>
                  Type or paste text to see how it gets tokenized
                </CardDescription>
              </div>
              <Button onClick={handleClear} variant="outline" size="sm" className="h-8">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
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

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Tokens</span>
                    <Badge variant="secondary" className="text-base px-3 py-1 justify-center">
                      {formatNumber(tokenCount)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Characters</span>
                    <Badge variant="secondary" className="text-base px-3 py-1 justify-center">
                      {formatNumber(charCount)}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Avg Chars/Token</span>
                    <Badge variant="secondary" className="text-base px-3 py-1 justify-center">
                      {tokenCount > 0 ? (charCount / tokenCount).toFixed(1) : "0"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
  
            {/* Right Column - Tokens */}
            <div className="flex flex-col gap-6 h-full">
              {(tokens.length > 0 || isTokenizing) && (
                <Card className="flex-1 flex flex-col min-h-[300px]">
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
                        <Button onClick={handleCopyTokens} variant="outline" size="sm" disabled={isTokenizing}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Text
                        </Button>
                        <Button onClick={handleCopyTokenIds} variant="outline" size="sm" disabled={isTokenizing}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy IDs
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="overflow-hidden flex flex-col">
                    {isTokenizing ? (
                      <div className="flex items-center justify-center flex-1 h-full min-h-[200px]">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div
                        ref={parentRef}
                        className="p-2 rounded-lg bg-muted/30 max-h-[200px] overflow-auto"
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
                    )}
                  </CardContent>
                </Card>
              )}
            {/* Selected Token Details */}
            {selectedToken && (
              <Tabs defaultValue="visual">
                <Card className="border border-white">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      Token Details
                    </CardTitle>
                    <TabsList>
                      <TabsTrigger value="visual">Visual</TabsTrigger>
                      <TabsTrigger value="raw">Raw Data</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="visual" className="space-y-4">
                      <div className="p-6 rounded-lg text-center" style={{ backgroundColor: selectedToken.color }}>
                        <span className="text-4xl font-mono" style={{ color: getTokenTextColor() }}>
                          {selectedToken.text === "\n" ? "\\n" : selectedToken.text}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Token ID</Label>
                          <p className="text-2xl font-mono">{selectedToken.id}</p>
                        </div>
                        <div>
                          <Label>Character Count</Label>
                          <p className="text-2xl font-mono">{selectedToken.text.length}</p>
                        </div>
                        <div>
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
                  </CardContent>
                </Card>
              </Tabs>
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
