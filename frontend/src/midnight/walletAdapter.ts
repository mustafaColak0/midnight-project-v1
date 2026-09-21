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
      'Wallet returned an empty transaction.',
    )
  }

  if (cleanHex.length % 2 !== 0) {
    throw new Error(
      'Invalid transaction hex returned by wallet.',
    )
  }

  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error(
      'Wallet returned non-hex transaction data.',
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

/**
 * Wallet / Effect FiberFailure içindeki gerçek hatayı
 * mümkün olduğunca derin şekilde loglar.
 */
function logWalletError(
  title: string,
  err: any,
): void {
  console.error(
    `========== ${title} ==========`,
  )

  console.error(
    '[Wallet ERROR] RAW:',
    err,
  )

  console.error(
    '[Wallet ERROR] NAME:',
    err?.name,
  )

  console.error(
    '[Wallet ERROR] MESSAGE:',
    err?.message,
  )

  console.error(
    '[Wallet ERROR] CODE:',
    err?.code,
  )

  console.error(
    '[Wallet ERROR] REASON:',
    err?.reason,
  )

  console.error(
    '[Wallet ERROR] TYPE:',
    err?.type,
  )

  console.error(
    '[Wallet ERROR] DATA:',
    err?.data,
  )

  console.error(
    '[Wallet ERROR] CAUSE:',
    err?.cause,
  )

  console.error(
    '[Wallet ERROR] STACK:',
    err?.stack,
  )

  const cause = err?.cause
  const failure = cause?.failure

  console.log(
    '[Wallet ERROR] CAUSE OBJECT:',
    cause,
  )

  console.log(
    '[Wallet ERROR] CAUSE KEYS:',
    cause && typeof cause === 'object'
      ? Object.keys(cause)
      : [],
  )

  console.log(
    '[Wallet ERROR] FAILURE OBJECT:',
    failure,
  )

  console.log(
    '[Wallet ERROR] FAILURE KEYS:',
    failure && typeof failure === 'object'
      ? Object.keys(failure)
      : [],
  )

  if (
    failure &&
    typeof failure === 'object'
  ) {
    for (
      const key of Object.keys(failure)
    ) {
      console.log(
        `[Wallet ERROR] failure.${key}:`,
        failure[key],
      )
    }
  }

  console.log(
    '[Wallet ERROR] FAILURE MESSAGE:',
    failure?.message,
  )

  console.log(
    '[Wallet ERROR] FAILURE CODE:',
    failure?.code,
  )

  console.log(
    '[Wallet ERROR] FAILURE REASON:',
    failure?.reason,
  )

  console.log(
    '[Wallet ERROR] FAILURE DATA:',
    failure?.data,
  )

  console.log(
    '[Wallet ERROR] FAILURE CAUSE:',
    failure?.cause,
  )

  try {
    const json = JSON.stringify(
      failure,
      (_key, value) => {
        if (typeof value === 'bigint') {
          return `${value.toString()}n`
        }

        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          }
        }

        return value
      },
      2,
    )

    console.log(
      '[Wallet ERROR] FAILURE JSON:',
      json,
    )
  } catch (jsonError) {
    console.log(
      '[Wallet ERROR] FAILURE JSON stringify failed:',
      jsonError,
    )
  }

  console.error(
    '========================================',
  )
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
        '[Midnight] Balancing transaction with wallet...',
      )

      try {
        /**
         * DEBUG: DUST
         */
        try {
          const dustBalance =
            await api.getDustBalance()

          console.log(
            '[Wallet DEBUG] DUST balance:',
            dustBalance,
          )
        } catch (balanceError) {
          console.warn(
            '[Wallet DEBUG] Could not read DUST balance:',
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
            '[Wallet DEBUG] Unshielded balances:',
            unshieldedBalances,
          )
        } catch (balanceError) {
          console.warn(
            '[Wallet DEBUG] Could not read unshielded balances:',
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
            '[Wallet DEBUG] Shielded balances:',
            shieldedBalances,
          )
        } catch (balanceError) {
          console.warn(
            '[Wallet DEBUG] Could not read shielded balances:',
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
          '[Midnight] Calling wallet balanceUnsealedTransaction...',
        )

        /**
         * Wallet transaction balancing.
         */
        const balanced =
          await api.balanceUnsealedTransaction(
            serializedTx,
          )

        console.log(
          '[Midnight] ✅ Wallet balance response received.',
        )

        console.log(
          '[Midnight] Raw wallet balance response:',
          balanced,
        )

        /**
         * Connector versions may expose TX
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
            '[Midnight] Invalid wallet balance response:',
            balanced,
          )

          throw new Error(
            'Wallet did not return a valid balanced transaction.',
          )
        }

        console.log(
          '[Midnight] Balanced TX hex length:',
          balancedHex.length,
        )

        const balancedBytes =
          fromHex(balancedHex)

        console.log(
          '[Midnight] Balanced TX bytes:',
          balancedBytes.length,
        )

        /**
         * Convert wallet transaction back into
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
        logWalletError(
          'WALLET BALANCE ERROR',
          err,
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
        '[Midnight] Submitting transaction with wallet...',
      )

      try {
        const serializedTx =
          toHex(tx.serialize())

        console.log(
          '[Midnight] Final TX length:',
          serializedTx.length,
        )

        console.log(
          '[Midnight] Calling wallet submitTransaction...',
        )

        const submitResult =
          await api.submitTransaction(
            serializedTx,
          )

        console.log(
          '[Midnight] ✅ Wallet accepted transaction submission.',
        )

        console.log(
          '[Midnight] Wallet submit response:',
          submitResult,
        )

        const identifiers =
          tx.identifiers()

        console.log(
          '[Midnight] Transaction identifiers:',
          identifiers,
        )

        const txId =
          identifiers[0]

        if (!txId) {
          throw new Error(
            'Transaction submitted but no transaction ID was available.',
          )
        }

        console.log(
          '[Midnight] ✅ Transaction ID:',
          txId,
        )

        return txId
      } catch (err: any) {
        logWalletError(
          'WALLET SUBMIT ERROR',
          err,
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