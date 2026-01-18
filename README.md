# Token Visualizer

A web-based tool to visualize how OpenAI tokenizers process text using tiktoken.

## Features

- **Real-time tokenization**: See how your text gets split into tokens instantly
- **Multiple OpenAI models**: Support for GPT-4o, GPT-4, GPT-3.5 Turbo, and legacy models
- **Interactive token explorer**: Click any token to see detailed information including:
  - Token ID
  - Character count
  - Unicode code points
  - Raw byte representation
- **Visual token display**: Color-coded tokens for easy identification
- **Copy functionality**: Quickly copy token text or IDs

## Supported Models

- GPT-4o / GPT-4o Mini (o200k_base)
- GPT-4 / GPT-4 Turbo (cl100k_base)
- GPT-3.5 Turbo (cl100k_base)
- GPT-3.5 Turbo 16K (cl100k_base)
- Legacy models (Davinci, Code Davinci, GPT-2)

## Tech Stack

- **Next.js 16** - React framework
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - UI components
- **[@dqbd/tiktoken](https://github.com/dqbd/tiktoken)** - OpenAI tokenizer library
- **TypeScript** - Type safety

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## About Tokenization

**Tokens** are the basic units of text that language models process. Different models use different tokenization strategies.

**Byte Pair Encoding (BPE)** is the algorithm used by tiktoken (OpenAI models). It breaks text into subword units, balancing between character-level and word-level tokenization.

**Why it matters:** API costs are calculated per token, and models have context limits measured in tokens. Understanding tokenization helps optimize prompts and manage costs.

## License

MIT
