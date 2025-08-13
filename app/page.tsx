"use client";

import { useMiniKit, useAddFrame, useOpenUrl } from "@coinbase/onchainkit/minikit";
import { Name, Identity, Address, Avatar, EthBalance } from "@coinbase/onchainkit/identity";
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Icon } from "./components/DemoComponents";
import Link from 'next/link';

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  // streamlined single-page onboarding

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1 space-y-6 animate-fade-in">
          <section className="bg-[var(--app-card-bg)]/70 backdrop-blur-md rounded-xl border border-[var(--app-card-border)] p-5 space-y-4">
            <h1 className="text-xl font-semibold tracking-tight">Build Quest</h1>
            <p className="text-sm leading-relaxed text-[var(--app-foreground-muted)]">
              Post on‑chain build challenges, collect submissions, and reward the best builders. This mini app prototype focuses on a fast, frame‑friendly UX. Smart contracts & IPFS storage can be layered in later.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <Icon name="check" size="sm" className="text-[var(--app-accent)] mt-0.5" />
                <span>Create quests in seconds</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="check" size="sm" className="text-[var(--app-accent)] mt-0.5" />
                <span>Time‑boxed deadlines</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="check" size="sm" className="text-[var(--app-accent)] mt-0.5" />
                <span>Link based submissions</span>
              </div>
              <div className="flex items-start gap-2">
                <Icon name="check" size="sm" className="text-[var(--app-accent)] mt-0.5" />
                <span>Pick winners post‑deadline</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/quests" className="w-full">
                <Button className="w-full" icon={<Icon name="arrow-right" size="sm" />}>Browse Quests</Button>
              </Link>
              <Link href="/quests/create" className="flex-1 min-w-[8rem]">
                <Button variant="outline" className="w-full">New Quest</Button>
              </Link>
            </div>
          </section>

          <section className="text-center text-[10px] text-[var(--app-foreground-muted)]">
            Prototype UI • Data stored locally • Not yet on‑chain
          </section>
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
    </div>
  );
}
