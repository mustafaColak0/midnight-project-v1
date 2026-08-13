interface WalletCardProps {
  isConnected: boolean;
  walletAddress: string | null;
  errorMessage: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

function WalletCard({
  isConnected,
  walletAddress,
  errorMessage,
  onConnect,
  onDisconnect,
}: WalletCardProps) {
  return (
    <div className="wallet-card">
      <div className="status-row">
        <span>Wallet Status</span>

        <strong className={isConnected ? "connected" : "disconnected"}>
          {isConnected ? "● Connected" : "● Disconnected"}
        </strong>
      </div>

      <div className="network-box">
        <span>Network</span>
        <strong>PREPROD</strong>
      </div>

      {isConnected && walletAddress ? (
        <div className="address-box">
          <span>Connected Wallet</span>
          <code>{walletAddress}</code>
        </div>
      ) : (
        <p className="description">
          Connect your Midnight wallet to access the privacy-preserving voting
          application.
        </p>
      )}

      {errorMessage && <div className="error-box">{errorMessage}</div>}

      <button
        className={isConnected ? "disconnect-button" : "connect-button"}
        onClick={isConnected ? onDisconnect : onConnect}
      >
        {isConnected ? "Disconnect Wallet" : "Connect Midnight Wallet"}
      </button>
    </div>
  );
}

export default WalletCard;