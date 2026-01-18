import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* SEO */}
        <meta name="description" content="Visualize how OpenAI models tokenize text. Explore GPT-4, GPT-3.5, and more token encodings in real-time with this interactive tool." />
        <meta name="keywords" content="token visualizer, OpenAI, GPT-4, GPT-3.5, tiktoken, tokenizer, BPE, byte pair encoding, AI, LLM" />
        <meta name="author" content="Token Visualizer" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Token Visualizer - Explore OpenAI Tokenization" />
        <meta property="og:description" content="Visualize how OpenAI models tokenize text. Explore GPT-4, GPT-3.5, and more token encodings in real-time." />
        <meta property="og:url" content="https://tokenvisualizer.com" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:site_name" content="Token Visualizer" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Token Visualizer - Explore OpenAI Tokenization" />
        <meta name="twitter:description" content="Visualize how OpenAI models tokenize text. Explore GPT-4, GPT-3.5, and more token encodings in real-time." />
        <meta name="twitter:image" content="/og-image.png" />

        {/* Theme Color */}
        <meta name="theme-color" content="#5865F2" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
