import { useRef, useState } from "react";

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

async function waitForMidnightWallet(
  timeoutMs = 5000,
): Promise<InjectedMidnightWallet> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const injected = (window as any).midnight;

    const wallets = Object.values(injected ?? {}).filter(
      (wallet: any) =>
        wallet &&
        typeof wallet === "object" &&
        typeof wallet.connect === "function",
    ) as InjectedMidnightWallet[];

    const laceWallet = wallets.find(
      (wallet) =>
        wallet.rdns === "io.lace.wallet" ||
        wallet.name?.toLowerCase() === "lace",
    );

    if (laceWallet) {
      console.log(
        `[Wallet] Lace detected. API ${laceWallet.apiVersion ?? "unknown"}`,
      );

      return laceWallet;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  throw new Error(
    "Midnight Lace wallet bulunamadı. Lace'in açık ve kilidi çözülmüş olduğundan emin ol.",
  );
}

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [isConnected, setIsConnected] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [walletApi, setWalletApi] = useState<WalletConnectedAPI | null>(null);

  const [secretValue, setSecretValue] = useState<string>("25");

  const [proofLoading, setProofLoading] = useState<boolean>(false);

  const [proofVerified, setProofVerified] = useState<boolean>(false);

  /*
   * Aynı anda birden fazla Lace connect()
   * çağrısı yapılmasını engeller.
   */
  const connectionInFlightRef = useRef<boolean>(false);

  const handleConnect = async () => {
    if (connectionInFlightRef.current) {
      console.warn("[Wallet] Connect request already in progress.");

      return;
    }

    connectionInFlightRef.current = true;

    setLoading(true);
    setError("");

    try {
      console.log("[Wallet] Waiting for fresh Lace injection...");

      /*
       * Her bağlantıda window.midnight üzerinden
       * güncel Lace nesnesini yeniden alıyoruz.
       */
      const wallet = await waitForMidnightWallet();

      console.log(
        `[Wallet] Lace detected. API ${wallet.apiVersion ?? "unknown"} (${
          wallet.rdns ?? wallet.name ?? "unknown"
        })`,
      );

      console.log("[Wallet] Connecting to Preprod...");

      /*
       * ÖNEMLİ:
       * Standalone testte çalışan ağ PREPROD.
       */
      const connectedApi = await wallet.connect("preprod");

      console.log("[Wallet] Connected API received.");

      console.log("[Wallet] Checking connection status...");

      const connectionStatus = await connectedApi.getConnectionStatus();

      console.log("[Wallet] Connection status:", connectionStatus);

      if (connectionStatus.status !== "connected") {
        throw new Error(
          `Lace connection is not active. Status: ${connectionStatus.status}`,
        );
      }

      if (connectionStatus.networkId?.toLowerCase() !== "preprod") {
        throw new Error(
          `Lace network mismatch. Expected preprod, received ${connectionStatus.networkId}`,
        );
      }

      console.log("[Wallet] Reading Lace configuration...");

      const configuration = await connectedApi.getConfiguration();

      console.log("[Wallet] Configuration:", configuration);

      if (configuration.networkId.toLowerCase() !== "preprod") {
        throw new Error(
          `Lace must use Preprod. Current network: ${configuration.networkId}`,
        );
      }

      console.log("[Wallet] Reading unshielded address...");

      const { unshieldedAddress } = await connectedApi.getUnshieldedAddress();

      console.log("[Wallet] Connected:", unshieldedAddress);

      /*
       * Connected API sadece bütün kontroller
       * başarılı olduktan sonra state'e alınır.
       */
      setWalletApi(connectedApi);

      setWalletAddress(unshieldedAddress);

      setIsConnected(true);

      localStorage.setItem("midnight_wallet_addr", unshieldedAddress);

      console.log("[Wallet] ✅ Lace Preprod connection ready.");
    } catch (err: any) {
      console.error("=== WALLET ERROR FULL ===");

      console.error("RAW:", err);

      console.error("NAME:", err?.name);

      console.error("MESSAGE:", err?.message);

      console.error("CODE:", err?.code);

      console.error("REASON:", err?.reason);

      console.error("STACK:", err?.stack);

      setWalletApi(null);
      setWalletAddress(null);
      setIsConnected(false);

      localStorage.removeItem("midnight_wallet_addr");

      const name = String(err?.name ?? "");

      const message = String(err?.message ?? "");

      const fullMessage = `${name} ${message}`.toLowerCase();

      if (
        name === "RemoteApiShutdownError" ||
        fullMessage.includes("shutdown")
      ) {
        setError(
          "Lace bağlantı kanalı kapandı. Lace kilidinin açık olduğundan emin olup tekrar dene.",
        );
      } else if (
        fullMessage.includes("network") &&
        fullMessage.includes("mismatch")
      ) {
        setError("Lace yanlış ağda. Midnight ağını Preprod olarak seç.");
      } else {
        setError(
          err?.reason ||
            err?.message ||
            "Cüzdana bağlanırken bir sorun oluştu. Lace'te Preprod ağının seçili olduğunu kontrol et.",
        );
      }
    } finally {
      connectionInFlightRef.current = false;

      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setWalletApi(null);

    setWalletAddress(null);

    setIsConnected(false);

    setProofVerified(false);

    setSecretValue("25");

    setError("");

    localStorage.removeItem("midnight_wallet_addr");

    console.log("[Wallet] Disconnected locally.");
  };

  const handleProof = async () => {
    if (!walletApi) {
      setError("Önce Lace wallet bağlantısını kurmalısın.");

      return;
    }

    const parsedValue = Number(secretValue);

    if (
      !Number.isInteger(parsedValue) ||
      parsedValue < 0 ||
      parsedValue > 65535
    ) {
      setError("Secret value 0 ile 65535 arasında bir tam sayı olmalı.");

      return;
    }

    setProofLoading(true);

    setProofVerified(false);

    setError("");

    try {
      console.log("[Midnight] Preparing private threshold proof...");

      const providers = await createMidnightProviders(walletApi);

      console.log("[Midnight] Providers created.");

      await provePrivateThreshold(providers, BigInt(parsedValue));

      setProofVerified(true);

      console.log("[Midnight] ✅ Threshold proof verified on Preprod.");
    } catch (err) {
      console.error("[Midnight] Proof failed:", err);

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
                  Level 1 • ZK Proofs
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
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center justify-between">
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
                <div className="py-8 text-center space-y-2">
                  <Lock className="w-8 h-8 text-slate-600 mx-auto" />

                  <p className="text-xs text-slate-400">
                    Connect your Midnight Lace wallet to interact with the ZK
                    Voting Contract.
                  </p>
                </div>
              )}
            </div>

            <div>
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />

                  {loading
                    ? "Waiting for Lace approval..."
                    : "Connect Midnight Wallet"}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
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
                ⚠️ Connect Lace wallet before generating the proof.
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
              </div>
            ) : (
              <button
                disabled={proofLoading || !secretValue}
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
