import type { WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api'

import {
  Binding,
  Proof,
  SignatureEnabled,
  Transaction,
  type CoinPublicKey,
  type EncPublicKey,
  type FinalizedTransaction,
  type TransactionId,
} from '@midnight-ntwrk/midnight-js-protocol/ledger'

import type {
  UnboundTransaction,
  WalletProvider,
  MidnightProvider,
} from '@midnight-ntwrk/midnight-js-types'

export type ShieldedAddress = {
  shieldedAddress: string
  shieldedCoinPublicKey: string
  shieldedEncryptionPublicKey: string
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

function fromHex(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex

  if (clean.length % 2 !== 0) {
    throw new Error('Invalid transaction hex returned by Lace.')
  }

  const bytes = new Uint8Array(clean.length / 2)

  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16)
  }

  return bytes
}

export function createWalletProviders(
  api: WalletConnectedAPI,
  shieldedAddress: ShieldedAddress,
): {
  walletProvider: WalletProvider
  midnightProvider: MidnightProvider
} {
  const walletProvider: WalletProvider = {
    getCoinPublicKey(): CoinPublicKey {
      return shieldedAddress.shieldedCoinPublicKey
    },

    getEncryptionPublicKey(): EncPublicKey {
      return shieldedAddress.shieldedEncryptionPublicKey
    },

    async balanceTx(
      tx: UnboundTransaction,
      _ttl?: Date,
    ): Promise<FinalizedTransaction> {
      console.log('[Midnight] Balancing transaction with Lace...')

      const serializedTx = toHex(tx.serialize())

      const balanced = await api.balanceUnsealedTransaction(serializedTx)

      return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
        'signature',
        'proof',
        'binding',
        fromHex(balanced.tx),
      )
    },
  }

  const midnightProvider: MidnightProvider = {
    async submitTx(tx: FinalizedTransaction): Promise<TransactionId> {
      console.log('[Midnight] Submitting transaction with Lace...')

      await api.submitTransaction(toHex(tx.serialize()))

      const txId = tx.identifiers()[0]

      if (!txId) {
        throw new Error(
          'Transaction submitted but no transaction ID was available.',
        )
      }

      console.log('[Midnight] Transaction ID:', txId)

      return txId
    },
  }

  return {
    walletProvider,
    midnightProvider,
  }
}