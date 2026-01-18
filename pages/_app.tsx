import "@/styles/globals.css";
import "sonner/dist/styles.css";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Token Visualizer - Explore OpenAI Tokenization</title>
      </Head>
      <Component {...pageProps} />
      <Toaster richColors position="top-right" theme="dark" />
    </>
  );
}
