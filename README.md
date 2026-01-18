# Token Visualizer

A high-performance, web-based tool to visualize how OpenAI tokenizers process text using `tiktoken`. Built for scale, it can handle massive inputs (10M+ characters) without freezing the UI.

## 🚀 Key Features

- **Extreme Performance**:
  - **Web Worker Offloading**: Tokenization logic runs in a background thread, ensuring the main UI thread never blocks, even with millions of characters.
  - **Virtualized Rendering**: Uses `@tanstack/react-virtual` to efficiently render only the visible tokens in a fluid grid, handling datasets of any size with ease.
  - **Optimized Editor**: Integrated **Monaco Editor** configured for performance (word wrap enabled, minimal overhead) to handle large text blocks smoothly.
  - **Memoization**: Critical components like token cells and the model selector are memoized to prevent unnecessary re-renders during typing.

- **Advanced Visualization**:
  - **Fluid Grid Layout**: Tokens are displayed in a responsive grid that automatically adjusts column counts and widths based on screen size.
  - **Interactive Explorer**: Click any token to view deep details:
    - Token ID
    - Character Count
    - Unicode Code Points (displayed in a grid)
    - Raw Bytes
  - **Color-Coded**: Tokens are visually distinct with a high-contrast color palette for easy differentiation.
  - **Horizontal Scroll**: Individual token pills support internal horizontal scrolling, preserving layout integrity for exceptionally long tokens.

- **Supported Models**:
  - GPT-4o / GPT-4o Mini (`o200k_base`)
  - GPT-4 / GPT-4 Turbo (`cl100k_base`)
  - GPT-3.5 Turbo (`cl100k_base`)
  - Legacy models (Davinci, GPT-2, etc.)

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with a custom dark theme (`oklch`)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/) via `@monaco-editor/react`
- **Virtualization**: [@tanstack/react-virtual](https://tanstack.com/virtual)
- **Tokenizer**: [@dqbd/tiktoken](https://github.com/dqbd/tiktoken) (WASM-based)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)

## ⚡️ Performance Optimizations

1.  **Web Worker Tokenizer**: The CPU-intensive task of encoding text into tokens is moved to a `Worker`. This prevents the "page unresponsive" dialog when pasting large books or codebases.
2.  **Virtualized Grid**: Instead of rendering 100,000 DOM nodes, the app renders only what fits on your screen.
3.  **Memoized Components**: `TokenCell` and `ModelSelector` are wrapped in `React.memo` to ensure that typing in the editor doesn't trigger expensive re-renders of the entire visualizer.
4.  **Debounced Input**: Text processing is debounced (1000ms) to avoid overwhelming the worker during rapid typing.

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📝 License

MIT