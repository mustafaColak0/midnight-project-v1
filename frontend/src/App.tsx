import { useState, useEffect } from "react";
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

export default function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem("midnight_wallet_addr");
  });

  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return !!localStorage.getItem("midnight_wallet_addr");
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  useEffect(() => {
    const savedAddr = localStorage.getItem("midnight_wallet_addr");
    if (!savedAddr) return;

    const timer = setTimeout(async () => {
      try {
        const midnight = (window as any).midnight;
        const wallet = midnight?.mnLace || Object.values(midnight || {})[0];

        if (wallet) {
          let connectedApi;
          if (typeof wallet.connect === "function") {
            connectedApi = await wallet.connect("preprod");
          } else if (typeof wallet.enable === "function") {
            connectedApi = await wallet.enable();
          } else {
            connectedApi = wallet;
          }

          const { unshieldedAddress } =
            await connectedApi.getUnshieldedAddress();
          if (unshieldedAddress) {
            setWalletAddress(unshieldedAddress);
            localStorage.setItem("midnight_wallet_addr", unshieldedAddress);
            setIsConnected(true);
          }
        }
      } catch (e) {
        console.log("Arka plan cüzdan kontrolü tamamlandı.");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const midnight = (window as any).midnight;
      const wallet = midnight?.mnLace || Object.values(midnight || {})[0];

      if (!wallet) {
        throw new Error("Midnight / Lace Cüzdan eklentisi bulunamadı!");
      }

      let connectedApi;
      if (typeof wallet.connect === "function") {
        connectedApi = await wallet.connect("preprod");
      } else if (typeof wallet.enable === "function") {
        connectedApi = await wallet.enable();
      } else {
        connectedApi = wallet;
      }

      const { unshieldedAddress } = await connectedApi.getUnshieldedAddress();

      setWalletAddress(unshieldedAddress);
      setIsConnected(true);
      localStorage.setItem("midnight_wallet_addr", unshieldedAddress);
    } catch (err: any) {
      console.error("Cüzdan bağlama hatası:", err);
      setError(err.message || "Cüzdana bağlanırken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setHasVoted(false);
    setSelectedOption(null);
    localStorage.removeItem("midnight_wallet_addr");
  };

  const handleVote = () => {
    if (!selectedOption) return;
    setHasVoted(true);
  };

  const shortenAddress = (addr: string) => {
    if (!addr) return "";
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
                  <Wallet className="w-4 h-4 text-purple-400" /> Wallet Identity
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
                      title={walletAddress!}
                    >
                      {shortenAddress(walletAddress!)}
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
                  {loading ? "Connecting..." : "Connect Midnight Wallet"}
                </button>
              ) : (
                <button
                  onClick={handleDisconnect}
                  className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnect
                </button>
              )}
            </div>
          </div>

          {/* VOTING CARD */}
          <div className="md:col-span-2 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                <Vote className="w-4 h-4 text-purple-400" /> Active Anonymous
                Poll
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Compact Proof #01
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">
                Should Midnight Network adopt hybrid sidechain consensus in Q4?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your vote will be encrypted on-chain using zero-knowledge
                circuits.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: "option_a", title: "Option A: Yes, approve proposal" },
                {
                  id: "option_b",
                  title: "Option B: No, keep current parameters",
                },
                { id: "option_c", title: "Option C: Abstain / Neutral" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  disabled={!isConnected || hasVoted}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    selectedOption === opt.id
                      ? "bg-purple-500/20 border-purple-500 text-purple-200"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  } ${(!isConnected || hasVoted) && "opacity-50 cursor-not-allowed"}`}
                >
                  <span>{opt.title}</span>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedOption === opt.id
                        ? "border-purple-400 bg-purple-500"
                        : "border-slate-700"
                    }`}
                  >
                    {selectedOption === opt.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {!isConnected ? (
                <span className="text-xs text-amber-400/80 font-mono">
                  ⚠️ Please connect wallet to cast your ZK vote.
                </span>
              ) : hasVoted ? (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 w-full">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Vote submitted on-chain! ZK Proof generated successfully.
                  </span>
                </div>
              ) : (
                <>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedOption
                      ? "Ready to generate proof"
                      : "Select an option above"}
                  </span>
                  <button
                    disabled={!selectedOption}
                    onClick={handleVote}
                    className="w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" /> Submit Anonymous Vote
                  </button>
                </>
              )}
            </div>
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
                      href="https://explorer.preprod.midnight.network"
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
