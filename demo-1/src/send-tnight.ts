import { WebSocket } from 'ws'

import {
  MidnightBech32m,
  UnshieldedAddress,
} from '@midnight-ntwrk/wallet-sdk/address-format'

import {
  resolveNetwork,
  getOrCreateWallet,
  formatWalletBackupNotice,
} from './network'

import {
  createWallet,
  persistWalletState,
  unshieldedToken,
} from './wallet'

// Wallet SDK GraphQL subscriptions need WebSocket in Node.
globalThis.WebSocket = WebSocket as any

// ─────────────────────────────────────────────────────────────
// TARGET
// ─────────────────────────────────────────────────────────────

const TARGET_ADDRESS =
  'mn_addr_preprod1k5wlvukgvrltn9cjx35ny0esl7cg3ff3aksh6u3qyp6nse423jvq7d24vq'

// Raw tNIGHT units.
// Source wallet currently has 1,000,000,000.
const AMOUNT = 900_000_000n

// Transaction TTL: 30 minutes.
const TTL_MS = 30 * 60 * 1000

// ─────────────────────────────────────────────────────────────
// NETWORK + EXISTING WALLET
// ─────────────────────────────────────────────────────────────

const {
  network,
  config: networkConfig,
} = resolveNetwork()

if (networkConfig.networkId !== 'preprod') {
  throw new Error(
    `This script is intended for Preprod. Current network: ${networkConfig.networkId}`,
  )
}

const WALLET = getOrCreateWallet(network)
const SEED = WALLET.seed

const notice =
  formatWalletBackupNotice(
    WALLET,
    network,
  )

if (notice) {
  console.log(notice)
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────

async function main() {
  let walletCtx:
    | Awaited<ReturnType<typeof createWallet>>
    | undefined

  try {
    console.log('')
    console.log(
      '╔══════════════════════════════════════════════════════════════╗',
    )
    console.log(
      '║                     Send tNIGHT                              ║',
    )
    console.log(
      '╚══════════════════════════════════════════════════════════════╝',
    )
    console.log('')

    console.log(
      '  Building existing Codespaces wallet...',
    )

    walletCtx = await createWallet({
      network,
      networkConfig,
      seed: SEED,
    })

    const restoredCount =
      Object.values(
        walletCtx.restored,
      ).filter(Boolean).length

    console.log(
      `  Restored ${restoredCount}/3 child wallets.`,
    )

    console.log(
      '  Syncing with Preprod...',
    )

    const state =
      await walletCtx.wallet.waitForSyncedState()

    console.log(
      '  ✓ Wallet synced.',
    )

    // ─────────────────────────────────────────────────────────
    // CHECK SOURCE BALANCE
    // ─────────────────────────────────────────────────────────

    const sourceAddress =
      walletCtx.unshieldedKeystore
        .getBech32Address()
        .toString()

    const balance =
      state.unshielded.balances[
        unshieldedToken().raw
      ] ?? 0n

    const dustBalance =
      state.dust.balance(
        new Date(),
      )

    console.log('')
    console.log(
      '─── Source Wallet ─────────────────────────────────────────────',
    )
    console.log('')
    console.log(
      `  Address: ${sourceAddress}`,
    )
    console.log(
      `  tNIGHT:  ${balance.toLocaleString()}`,
    )
    console.log(
      `  DUST:    ${dustBalance.toLocaleString()}`,
    )

    if (balance < AMOUNT) {
      throw new Error(
        `Not enough tNIGHT. Balance=${balance}, requested=${AMOUNT}`,
      )
    }

    if (dustBalance <= 0n) {
      throw new Error(
        'Source wallet has no DUST to pay transaction fees.',
      )
    }

    // ─────────────────────────────────────────────────────────
    // PARSE LACE ADDRESS
    // ─────────────────────────────────────────────────────────

    console.log('')
    console.log(
      '─── Destination ───────────────────────────────────────────────',
    )
    console.log('')
    console.log(
      `  Lace:   ${TARGET_ADDRESS}`,
    )
    console.log(
      `  Amount: ${AMOUNT.toLocaleString()} raw tNIGHT units`,
    )

    const receiverAddress =
      MidnightBech32m
        .parse(TARGET_ADDRESS)
        .decode(
          UnshieldedAddress,
          networkConfig.networkId,
        )

    console.log(
      '  ✓ Lace address decoded.',
    )

    // ─────────────────────────────────────────────────────────
    // CREATE TRANSFER RECIPE
    // ─────────────────────────────────────────────────────────

    const ttl =
      new Date(
        Date.now() + TTL_MS,
      )

    console.log('')
    console.log(
      '─── Building Transaction ──────────────────────────────────────',
    )
    console.log('')

    console.log(
      '  Creating tNIGHT transfer recipe...',
    )

    const recipe =
      await walletCtx.wallet.transferTransaction(
        [
          {
            type: 'unshielded',
            outputs: [
              {
                type:
                  unshieldedToken().raw,
                receiverAddress,
                amount: AMOUNT,
              },
            ],
          },
        ],
        {
          shieldedSecretKeys:
            walletCtx.shieldedSecretKeys,

          dustSecretKey:
            walletCtx.dustSecretKey,
        },
        {
          ttl,
          payFees: true,
        },
      )

    console.log(
      '  ✓ Transfer recipe created.',
    )

    // ─────────────────────────────────────────────────────────
    // SIGN UNSHIELDED NIGHT INPUTS
    // ─────────────────────────────────────────────────────────

    console.log(
      '  Signing NIGHT inputs...',
    )

    const signedRecipe =
      await walletCtx.wallet.signRecipe(
        recipe,
        (payload) =>
          walletCtx!
            .unshieldedKeystore
            .signData(payload),
      )

    console.log(
      '  ✓ Recipe signed.',
    )

    // ─────────────────────────────────────────────────────────
    // FINALIZE
    // ─────────────────────────────────────────────────────────

    console.log(
      '  Finalizing transaction...',
    )

    const finalized =
      await walletCtx.wallet.finalizeRecipe(
        signedRecipe,
      )

    console.log(
      '  ✓ Transaction finalized.',
    )

    // ─────────────────────────────────────────────────────────
    // SUBMIT
    // ─────────────────────────────────────────────────────────

    console.log('')
    console.log(
      '─── Submitting ────────────────────────────────────────────────',
    )
    console.log('')

    const txId =
      await walletCtx.wallet.submitTransaction(
        finalized,
      )

    console.log(
      '  ✅ Transaction submitted!',
    )

    console.log('')
    console.log(
      `  TX ID: ${txId}`,
    )

    console.log('')
    console.log(
      '  Waiting for wallet state to catch up...',
    )

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 10_000),
    )

    const newState =
      await walletCtx.wallet.waitForSyncedState()

    const newBalance =
      newState.unshielded.balances[
        unshieldedToken().raw
      ] ?? 0n

    console.log('')
    console.log(
      `  Source tNIGHT after transaction: ${newBalance.toLocaleString()}`,
    )

    await persistWalletState(
      network,
      walletCtx,
    )

    console.log('')
    console.log(
      '  ✅ Wallet state persisted.',
    )
    console.log('')
  } catch (error) {
    console.error('')
    console.error(
      '❌ tNIGHT transfer failed:',
    )

    console.error(error)

    process.exitCode = 1
  } finally {
    if (walletCtx) {
      try {
        await persistWalletState(
          network,
          walletCtx,
        )
      } catch {
        // Ignore secondary persistence errors here.
      }

      try {
        await walletCtx.wallet.stop()
      } catch {
        // Ignore shutdown errors.
      }
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
