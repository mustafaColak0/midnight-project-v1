import { useEffect, useRef, useState } from "react";

import {
  ShieldCheck,
  Wallet,
  Radio,
  Lock,
  Vote,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Activity,
  LogOut,
} from "lucide-react";

import type { WalletConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";

import { createMidnightProviders } from "./midnight/providers";
import { provePrivateThreshold, CONTRACT_ADDRESS } from "./midnight/contract";

type InjectedMidnightWallet = {
  name?: string;
  apiVersion?: string;
  rdns?: string;
  connect: (networkId: string) => Promise<WalletConnectedAPI>;
};

type WalletOption = {
  id: string;
  name: string;
  rdns: string;
  apiVersion: string;
  api: InjectedMidnightWallet;
};

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [secretValue, setSecretValue] = useState<string>("25");

  const [proofLoading, setProofLoading] = useState<boolean>(false);

  const [proofVerified, setProofVerified] = useState<boolean>(false);

  const [availableWallets, setAvailableWallets] = useState<WalletOption[]>([]);

  const [selectedWalletId, setSelectedWalletId] = useState<string>("");

  const [connectedWalletName, setConnectedWalletName] = useState<string>("");

  // In the Connected API, it is stored in a ref rather than in React state.
  const walletApiRef = useRef<WalletConnectedAPI | null>(null);

  /**
   * The wallet extension may inject its provider a few hundred
   * milliseconds after the initial React render.
   */
  const detectWallets = (): WalletOption[] => {
    const injected = (window as any).midnight;

    if (!injected) {
      console.warn("[Wallet] window.midnight was not detected.");

      setAvailableWallets([]);
      setSelectedWalletId("");

      return [];
    }

    console.log("[Wallet] Raw window.midnight:", injected);

    const detected = Object.entries(injected)
      .map(([id, value]) => {
        const wallet = value as InjectedMidnightWallet;

        if (!wallet || typeof wallet.connect !== "function") {
          return null;
        }

        return {
          id,
          name: wallet.name || id || "Unknown Midnight Wallet",
          rdns: wallet.rdns || "unknown",
          apiVersion: wallet.apiVersion || "unknown",
          api: wallet,
        };
      })
      .filter((wallet): wallet is WalletOption => wallet !== null);

    console.log(
      "[Wallet] ✅ Detected Midnight wallets:",
      detected.map((wallet) => ({
        id: wallet.id,
        name: wallet.name,
        rdns: wallet.rdns,
        apiVersion: wallet.apiVersion,
      })),
    );

    setAvailableWallets(detected);

    /*
     * If there is only one wallet, select it automatically.
     *
     * If there are multiple wallets, the user will make the selection.
     */
    if (detected.length === 1) {
      setSelectedWalletId(detected[0].id);
    } else if (
      selectedWalletId &&
      !detected.some((wallet) => wallet.id === selectedWalletId)
    ) {
      setSelectedWalletId("");
    }

    return detected;
  };

  /**
   * Detect available Midnight wallet extensions when the application loads.
   *
   * Some wallet extensions inject the window.midnight provider shortly after
   * the initial React render, so additional detection attempts are scheduled
   * to ensure late-injected providers are discovered.
   */
  useEffect(() => {
    detectWallets();

    const timer1 = window.setTimeout(() => {
      detectWallets();
    }, 500);

    const timer2 = window.setTimeout(() => {
      detectWallets();
    }, 1500);

    return () => {
      window.clearTimeout(timer1);
      window.clearTimeout(timer2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    setProofVerified(false);

    try {
      console.log("[Wallet] Looking for Midnight wallets...");

      const injected = (window as any).midnight;

      if (!injected) {
        throw new Error(
          "Midnight wallet API was not detected. Ensure that the Lace or 1AM extension is installed, enabled, and unlocked.",
        );
      }

      /*
       * Re-scan for available wallets before each connection attempt.
       * This ensures that wallet extensions initialized after the initial
       * page load can still be detected.
       */
      const wallets = detectWallets();

      if (wallets.length === 0) {
        throw new Error(
          "No compatible Midnight wallet was detected. Ensure that the Lace or 1AM extension is installed, enabled, and unlocked.",
        );
      }

      let selectedWallet = wallets.find(
        (wallet) => wallet.id === selectedWalletId,
      );

      /*
       * Automatically select the wallet when only one compatible
       * Midnight wallet is available.
       */
      if (!selectedWallet && wallets.length === 1) {
        selectedWallet = wallets[0];

        setSelectedWalletId(wallets[0].id);
      }

      if (!selectedWallet) {
        throw new Error(
          "Multiple Midnight wallets were detected. Select the wallet you want to connect.",
        );
      }

      console.log("[Wallet] Selected wallet:", {
        id: selectedWallet.id,
        name: selectedWallet.name,
        rdns: selectedWallet.rdns,
        apiVersion: selectedWallet.apiVersion,
      });

      console.log(
        `[Wallet] Calling ${selectedWallet.name}.connect("preprod") ONCE...`,
      );

      const connectedApi = await selectedWallet.api.connect("preprod");

      console.log(`[Wallet] ✅ ${selectedWallet.name} CONNECT RETURNED`);

      console.log("[Wallet] Calling getConnectionStatus...");

      const connectionStatus = await connectedApi.getConnectionStatus();

      console.log("[Wallet] ✅ STATUS:", connectionStatus);

      if (connectionStatus.status !== "connected") {
        throw new Error(`Wallet connection status: ${connectionStatus.status}`);
      }

      if (connectionStatus.networkId?.toLowerCase() !== "preprod") {
        throw new Error(
          `${selectedWallet.name} must be connected to the Preprod network. ` +
            `Current network: ${connectionStatus.networkId}`,
        );
      }

      console.log("[Wallet] Calling getConfiguration...");

      const configuration = await connectedApi.getConfiguration();

      console.log("[Wallet] ✅ CONFIG:", configuration);

      if (configuration.networkId?.toLowerCase() !== "preprod") {
        throw new Error(
          `${selectedWallet.name} must be configured for the Preprod network. ` +
            `Current network: ${configuration.networkId}`,
        );
      }

      console.log("[Wallet] Calling getUnshieldedAddress...");

      const { unshieldedAddress } = await connectedApi.getUnshieldedAddress();

      console.log("[Wallet] ✅ ADDRESS:", unshieldedAddress);

      /*
       * Use the Connected API instance of the selected wallet
       * for all subsequent Midnight provider operations.
       */
      walletApiRef.current = connectedApi;

      setWalletAddress(unshieldedAddress);

      setConnectedWalletName(selectedWallet.name);

      setIsConnected(true);

      localStorage.setItem("midnight_wallet_addr", unshieldedAddress);

      localStorage.setItem("midnight_wallet_name", selectedWallet.name);

      localStorage.setItem("midnight_wallet_id", selectedWallet.id);

      console.log(
        `🔥 ${selectedWallet.name.toUpperCase()} MIDNIGHT CONNECTOR WORKS IN REACT`,
      );
    } catch (err: any) {
      console.error("=== WALLET ERROR FULL ===");

      console.error("RAW:", err);
      console.error("NAME:", err?.name);
      console.error("MESSAGE:", err?.message);
      console.error("REASON:", err?.reason);
      console.error("CODE:", err?.code);
      console.error("CAUSE:", err?.cause);
      console.error("STACK:", err?.stack);

      walletApiRef.current = null;

      setWalletAddress(null);
      setConnectedWalletName("");
      setIsConnected(false);

      localStorage.removeItem("midnight_wallet_addr");
      localStorage.removeItem("midnight_wallet_name");

      setError(
        err?.reason ||
          err?.message ||
          "Failed to connect to the Midnight wallet.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    walletApiRef.current = null;

    setWalletAddress(null);
    setConnectedWalletName("");
    setIsConnected(false);
    setProofVerified(false);
    setSecretValue("25");
    setError("");

    localStorage.removeItem("midnight_wallet_addr");
    localStorage.removeItem("midnight_wallet_name");
    localStorage.removeItem("midnight_wallet_id");

    console.log("[Wallet] Disconnected locally.");
  };

  const handleRefreshWallets = () => {
    setError("");

    const wallets = detectWallets();

    if (wallets.length === 0) {
      setError(
        "No Midnight wallet was detected. Ensure that the Lace or 1AM extension is installed, enabled, and unlocked.",
      );
    }
  };

  const handleProof = async () => {
    const walletApi = walletApiRef.current;

    if (!walletApi) {
      setError(
        "Connect a Lace or 1AM Midnight wallet before generating a proof.",
      );
      return;
    }

    const parsedValue = Number(secretValue);

    if (
      !Number.isInteger(parsedValue) ||
      parsedValue < 0 ||
      parsedValue > 65535
    ) {
      setError("The secret value must be an integer between 0 and 65535.");
      return;
    }

    setProofLoading(true);
    setProofVerified(false);
    setError("");

    try {
      console.log("[Midnight] Preparing private threshold proof...");

      console.log("[Midnight] Active wallet:", connectedWalletName);

      const providers = await createMidnightProviders(walletApi);

      console.log("[Midnight] Providers created.");

      await provePrivateThreshold(providers, BigInt(parsedValue));

      setProofVerified(true);

      console.log(
        `[Midnight] ✅ Threshold proof verified on Preprod using ${connectedWalletName}.`,
      );
    } catch (err: any) {
      console.error("[Midnight] Proof failed:", err);

      console.error("[Midnight] Proof error cause:", err?.cause);

      setError(
        err instanceof Error ? err.message : "Private threshold proof failed.",
      );
    } finally {
      setProofLoading(false);
    }
  };

  const shortenAddress = (addr: string) => {
    if (!addr) {
      return "";
    }

    return `${addr.slice(0, 12)}...${addr.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}

        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Lock className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">
                  Midnight Privacy-Preserving Voting
                </h1>

                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  • ZK Proofs
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-0.5">
                Zero-Knowledge shielded state architecture on Cardano /
                Midnight.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs">
              <Radio className="w-3.5 h-3.5 text-purple-400 animate-pulse" />

              <span className="text-slate-400">Network:</span>

              <strong className="text-purple-300 font-mono">PREPROD</strong>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-emerald-400" : "bg-rose-500"
                }`}
              />

              <span className="text-slate-400">Status:</span>

              <strong
                className={isConnected ? "text-emerald-400" : "text-rose-400"}
              >
                {isConnected ? "Connected" : "Disconnected"}
              </strong>
            </div>
          </div>
        </header>

        {/* ERROR */}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />

              <span>{error}</span>
            </div>

            <button
              onClick={() => setError("")}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN PANEL */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* WALLET CARD */}

          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-4 shadow-lg">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-purple-400" />
                  Wallet Identity
                </span>

                {isConnected && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    Verified
                  </span>
                )}
              </div>

              {isConnected ? (
                <div className="mt-4 space-y-3">
                  {/* CONNECTED WALLET */}

                  <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">
                      Connected Wallet
                    </span>

                    <span className="text-xs font-semibold text-purple-300">
                      {connectedWalletName || "Midnight Wallet"}
                    </span>
                  </div>

                  {/* ADDRESS */}

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">
                      Unshielded Public Address
                    </span>

                    <span
                      className="text-xs font-mono text-purple-300 break-all select-all block"
                      title={walletAddress ?? ""}
                    >
                      {walletAddress ? shortenAddress(walletAddress) : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />

                    <span>Identity shielded via ZK-Proof Engine</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-4">
                  <div className="text-center space-y-2">
                    <Lock className="w-8 h-8 text-slate-600 mx-auto" />

                    <p className="text-xs text-slate-400">
                      Connect a compatible Midnight wallet to interact with the
                      ZK Voting Contract.
                    </p>
                  </div>

                  {/* WALLET SELECTOR */}

                  {availableWallets.length > 0 ? (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-wider text-slate-500 font-mono">
                        Midnight Wallet
                      </label>

                      <select
                        value={selectedWalletId}
                        disabled={loading}
                        onChange={(event) => {
                          setSelectedWalletId(event.target.value);

                          setError("");
                        }}
                        className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-purple-200 outline-none focus:border-purple-500 disabled:opacity-50"
                      >
                        {availableWallets.length > 1 && (
                          <option value="">Select Midnight wallet</option>
                        )}

                        {availableWallets.map((wallet) => (
                          <option key={wallet.id} value={wallet.id}>
                            {wallet.name} — API {wallet.apiVersion}
                          </option>
                        ))}
                      </select>

                      <div className="space-y-1">
                        {availableWallets.map((wallet) => (
                          <div
                            key={`${wallet.id}-info`}
                            className="text-[9px] font-mono text-slate-600 break-all"
                          >
                            {wallet.name}: {wallet.rdns}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-2">
                      <p className="text-[11px] text-amber-400">
                        No compatible Midnight wallet detected.
                      </p>

                      <button
                        onClick={handleRefreshWallets}
                        className="text-[10px] text-purple-300 hover:text-purple-200 underline"
                      >
                        Scan wallets again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              {!isConnected ? (
                <div className="space-y-2">
                  <button
                    onClick={handleConnect}
                    disabled={
                      loading ||
                      availableWallets.length === 0 ||
                      (availableWallets.length > 1 && !selectedWalletId)
                    }
                    className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wallet className="w-4 h-4" />

                    {loading
                      ? "Waiting for wallet approval..."
                      : selectedWalletId
                        ? `Connect ${
                            availableWallets.find(
                              (wallet) => wallet.id === selectedWalletId,
                            )?.name || "Midnight Wallet"
                          }`
                        : "Connect Midnight Wallet"}
                  </button>

                  <button
                    onClick={handleRefreshWallets}
                    disabled={loading}
                    className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] border border-slate-800 transition-all disabled:opacity-50"
                  >
                    Refresh Wallet List
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect {connectedWalletName ? connectedWalletName : ""}
                </button>
              )}
            </div>
          </div>

          {/* PROOF CARD */}

          <div className="md:col-span-2 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Vote className="w-4 h-4 text-purple-400" />
                Private Threshold Proof
              </span>

              <span className="text-[10px] font-mono text-purple-300">
                PREPROD
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-200 font-semibold">
                Prove your secret value is at least 18
              </p>

              <p className="text-xs text-slate-400 leading-relaxed">
                The secret value is used as a private circuit input. Only the
                statement{" "}
                <span className="text-purple-300 font-mono">
                  secretValue ≥ 18
                </span>{" "}
                is proven.
              </p>
            </div>

            {isConnected && connectedWalletName && (
              <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-center justify-between gap-3">
                <span className="text-[10px] text-slate-500 uppercase font-mono">
                  Transaction Wallet
                </span>

                <span className="text-xs text-purple-300 font-semibold">
                  {connectedWalletName}
                </span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">
                Secret value — never displayed on-chain
              </label>

              <input
                type="password"
                inputMode="numeric"
                value={secretValue}
                disabled={!isConnected || proofLoading}
                onChange={(event) => {
                  setSecretValue(event.target.value);

                  setProofVerified(false);
                }}
                placeholder="Enter a private number"
                className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-purple-200 font-mono outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                Preprod Contract
              </span>

              <span
                className="text-[11px] font-mono text-slate-300 break-all"
                title={CONTRACT_ADDRESS}
              >
                {CONTRACT_ADDRESS}
              </span>
            </div>

            {!isConnected ? (
              <span className="text-xs text-amber-400/80 font-mono">
                ⚠️ Connect a Midnight wallet before generating the proof.
              </span>
            ) : proofVerified ? (
              <div className="space-y-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Private threshold proof verified on Preprod.
                </div>

                <p className="text-[11px] text-slate-300 font-mono">
                  Public result: thresholdProofVerified = true
                </p>

                <p className="text-[11px] text-purple-300">
                  🔒 The secret value was not disclosed to the public ledger.
                </p>

                {connectedWalletName && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Wallet: {connectedWalletName}
                  </p>
                )}
              </div>
            ) : (
              <button
                disabled={proofLoading || !secretValue || !isConnected}
                onClick={handleProof}
                className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />

                {proofLoading
                  ? "Generating ZK Proof..."
                  : "Generate Private Proof"}
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}

        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40 shadow-xl">
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              Verified Zero-Knowledge Execution Stream
            </span>

            <span className="text-[11px] font-mono text-purple-300">
              Midnight Preprod Network
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-5 py-3">Public Nullifier</th>

                  <th className="px-5 py-3">Proof Type</th>

                  <th className="px-5 py-3">Status</th>

                  <th className="px-5 py-3 text-right">Explorer</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 font-mono">
                <tr className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 text-purple-300 font-semibold">
                    0x8a91...4c92
                  </td>

                  <td className="px-5 py-3">
                    <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded text-[11px]">
                      ZK_VOTE_RECORD
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Shielded & Proven
                    </span>
                  </td>

                  <td className="px-5 py-3 text-right">
                    <a
                      href="https://midnightexplorer.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-end gap-1.5 text-[11px] text-slate-400 hover:text-purple-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 transition-colors ml-auto"
                    >
                      <span>Proof</span>

                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
