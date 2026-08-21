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

/**
 * Uint8Array -> hexadecimal string
 */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) =>
      byte.toString(16).padStart(2, '0'),
    )
    .join('')
}

/**
 * Hexadecimal string -> Uint8Array
 */
function fromHex(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x')
    ? hex.slice(2)
    : hex

  if (cleanHex.length === 0) {
    throw new Error(
      'Lace returned an empty transaction.',
    )
  }

  if (cleanHex.length % 2 !== 0) {
    throw new Error(
      'Invalid transaction hex returned by Lace.',
    )
  }

  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error(
      'Lace returned non-hex transaction data.',
    )
  }

  const bytes = new Uint8Array(
    cleanHex.length / 2,
  )

  for (
    let i = 0;
    i < cleanHex.length;
    i += 2
  ) {
    bytes[i / 2] = Number.parseInt(
      cleanHex.slice(i, i + 2),
      16,
    )
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
  /**
   * WALLET PROVIDER
   */
  const walletProvider: WalletProvider = {
    getCoinPublicKey(): CoinPublicKey {
      return (
        shieldedAddress
          .shieldedCoinPublicKey as CoinPublicKey
      )
    },

    getEncryptionPublicKey(): EncPublicKey {
      return (
        shieldedAddress
          .shieldedEncryptionPublicKey as EncPublicKey
      )
    },

    async balanceTx(
      tx: UnboundTransaction,
      _ttl?: Date,
    ): Promise<FinalizedTransaction> {
      console.log(
        '[Midnight] Balancing transaction with Lace...',
      )

      try {
        /**
         * DEBUG: DUST
         */
        try {
          const dustBalance =
            await api.getDustBalance()

          console.log(
            '[Lace DEBUG] DUST balance:',
            dustBalance,
          )
        } catch (balanceError) {
          console.warn(
            '[Lace DEBUG] Could not read DUST balance:',
            balanceError,
          )
        }

        /**
         * DEBUG: UNSHIELDED BALANCES
         */
        try {
          const unshieldedBalances =
            await api.getUnshieldedBalances()

          console.log(
            '[Lace DEBUG] Unshielded balances:',
            unshieldedBalances,
          )
        } catch (balanceError) {
          console.warn(
            '[Lace DEBUG] Could not read unshielded balances:',
            balanceError,
          )
        }

        /**
         * DEBUG: SHIELDED BALANCES
         */
        try {
          const shieldedBalances =
            await api.getShieldedBalances()

          console.log(
            '[Lace DEBUG] Shielded balances:',
            shieldedBalances,
          )
        } catch (balanceError) {
          console.warn(
            '[Lace DEBUG] Could not read shielded balances:',
            balanceError,
          )
        }

        /**
         * Serialize unbalanced Midnight transaction.
         */
        const serializedTx =
          toHex(tx.serialize())

        console.log(
          '[Midnight] Unbalanced TX length:',
          serializedTx.length,
        )

        console.log(
          '[Midnight] Calling Lace balanceUnsealedTransaction...',
        )

        /**
         * Lace transaction balancing.
         */
        const balanced =
          await api.balanceUnsealedTransaction(
            serializedTx,
          )

        console.log(
          '[Midnight] ✅ Lace balance response received.',
        )

        /**
         * Connector versions may expose the TX
         * directly or inside { tx }.
         */
        const balancedHex =
          typeof balanced === 'string'
            ? balanced
            : (
                balanced as {
                  tx?: string
                }
              )?.tx

        if (
          typeof balancedHex !== 'string' ||
          balancedHex.length === 0
        ) {
          console.error(
            '[Midnight] Invalid Lace balance response:',
            balanced,
          )

          throw new Error(
            'Lace did not return a valid balanced transaction.',
          )
        }

        console.log(
          '[Midnight] Balanced TX hex length:',
          balancedHex.length,
        )

        const balancedBytes =
          fromHex(balancedHex)

        /**
         * Convert Lace transaction back into
         * Midnight FinalizedTransaction.
         */
        const finalizedTx =
          Transaction.deserialize<
            SignatureEnabled,
            Proof,
            Binding
          >(
            'signature',
            'proof',
            'binding',
            balancedBytes,
          )

        console.log(
          '[Midnight] ✅ Balanced transaction deserialized.',
        )

        return finalizedTx
      } catch (err: any) {
        /**
         * IMPORTANT:
         * We want the real Lace error here instead
         * of only the generic Midnight wrapper error.
         */
        console.error(
          '========== LACE BALANCE ERROR ==========',
        )

        console.error(
          '[Lace ERROR] RAW:',
          err,
        )

        console.error(
          '[Lace ERROR] NAME:',
          err?.name,
        )

        console.error(
          '[Lace ERROR] MESSAGE:',
          err?.message,
        )

        console.error(
          '[Lace ERROR] CODE:',
          err?.code,
        )

        console.error(
          '[Lace ERROR] REASON:',
          err?.reason,
        )

        console.error(
          '[Lace ERROR] TYPE:',
          err?.type,
        )

        console.error(
          '[Lace ERROR] DATA:',
          err?.data,
        )

        console.error(
          '[Lace ERROR] CAUSE:',
          err?.cause,
        )

        console.error(
          '[Lace ERROR] STACK:',
          err?.stack,
        )

        console.error(
          '========================================',
        )

        throw err
      }
    },
  }

  /**
   * MIDNIGHT PROVIDER
   */
  const midnightProvider: MidnightProvider = {
    async submitTx(
      tx: FinalizedTransaction,
    ): Promise<TransactionId> {
      console.log(
        '[Midnight] Submitting transaction with Lace...',
      )

      try {
        const serializedTx =
          toHex(tx.serialize())

        console.log(
          '[Midnight] Final TX length:',
          serializedTx.length,
        )

        await api.submitTransaction(
          serializedTx,
        )

        console.log(
          '[Midnight] ✅ Lace accepted transaction submission.',
        )

        const identifiers =
          tx.identifiers()

        const txId =
          identifiers[0]

        if (!txId) {
          throw new Error(
            'Transaction submitted but no transaction ID was available.',
          )
        }

        console.log(
          '[Midnight] Transaction ID:',
          txId,
        )

        return txId
      } catch (err: any) {
        console.error(
          '========== LACE SUBMIT ERROR ==========',
        )

        console.error(
          '[Lace ERROR] RAW:',
          err,
        )

        console.error(
          '[Lace ERROR] NAME:',
          err?.name,
        )

        console.error(
          '[Lace ERROR] MESSAGE:',
          err?.message,
        )

        console.error(
          '[Lace ERROR] CODE:',
          err?.code,
        )

        console.error(
          '[Lace ERROR] REASON:',
          err?.reason,
        )

        console.error(
          '[Lace ERROR] TYPE:',
          err?.type,
        )

        console.error(
          '[Lace ERROR] DATA:',
          err?.data,
        )

        console.error(
          '[Lace ERROR] CAUSE:',
          err?.cause,
        )

        console.error(
          '=======================================',
        )

        throw err
      }
    },
  }

  return {
    walletProvider,
    midnightProvider,
  }
}