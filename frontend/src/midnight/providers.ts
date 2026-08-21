import type { WalletConnectedAPI } from '@midnight-ntwrk/dapp-connector-api'

import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider'
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider'
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider'
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider'
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id'

import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types'

import { createWalletProviders } from './walletAdapter'

export type HelloWorldCircuitId =
  | 'proveThreshold'
  | 'storeMessage'

const PREPROD_PROOF_SERVER =
  'https://lace-proof-pub.preprod.midnight.network'

function getPrivateStatePassword(): string {
  const key = 'midnight-level2-private-state-password'

  let password = sessionStorage.getItem(key)

  if (!password) {
    const random = crypto.randomUUID().replaceAll('-', '')

    password = `Midnight-L2-${random}!Aa9`
    sessionStorage.setItem(key, password)
  }

  return password
}

export async function createMidnightProviders(
  api: WalletConnectedAPI,
): Promise<MidnightProviders<HelloWorldCircuitId>> {
  console.log('[Midnight] Reading Lace configuration...')

  const configuration = await api.getConfiguration()

  console.log('[Midnight] Network:', configuration.networkId)
  console.log('[Midnight] Indexer:', configuration.indexerUri)

  if (configuration.networkId.toLowerCase() !== 'preprod') {
    throw new Error(
      `Lace must be connected to Preprod. Current network: ${configuration.networkId}`,
    )
  }

  setNetworkId(configuration.networkId)

  const shieldedAddress = await api.getShieldedAddresses()
  const { unshieldedAddress } =
    await api.getUnshieldedAddress()

  const zkConfigProvider =
    new FetchZkConfigProvider<HelloWorldCircuitId>(
      window.location.origin,
    )

  const proofServer =
    configuration.proverServerUri ??
    PREPROD_PROOF_SERVER

  console.log('[Midnight] Proof server:', proofServer)

  const proofProvider =
    httpClientProofProvider(
      proofServer,
      zkConfigProvider,
    )

  const publicDataProvider =
    indexerPublicDataProvider(
      configuration.indexerUri,
      configuration.indexerWsUri,
    )

  const privateStateProvider =
    levelPrivateStateProvider({
      midnightDbName: 'midnight-level2',
      accountId: unshieldedAddress,
      privateStoragePasswordProvider:
        getPrivateStatePassword,
    })

  const {
    walletProvider,
    midnightProvider,
  } = createWalletProviders(
    api,
    shieldedAddress,
  )

  console.log('[Midnight] Providers ready.')

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  }
}