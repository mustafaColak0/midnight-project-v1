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


function getPrivateStatePassword(): string {
  const key =
    'midnight-level2-private-state-password-v2'

  let password =
    localStorage.getItem(key)

  if (!password) {
    const random =
      crypto.randomUUID().replaceAll('-', '')

    password =
      `Midnight-L2-${random}!Aa9`

    localStorage.setItem(
      key,
      password,
    )

    console.log(
      '[Midnight] New persistent private-state password created.',
    )
  }

  return password
}


export async function createMidnightProviders(
  api: WalletConnectedAPI,
): Promise<MidnightProviders<HelloWorldCircuitId>> {

  console.log(
    '[Midnight] Reading Lace configuration...',
  )

  const configuration =
    await api.getConfiguration()

  console.log(
    '[Midnight] Network:',
    configuration.networkId,
  )

  console.log(
    '[Midnight] Indexer:',
    configuration.indexerUri,
  )


  // --------------------------------------------------
  // NETWORK CHECK
  // --------------------------------------------------

  if (
    configuration.networkId.toLowerCase() !==
    'preprod'
  ) {
    throw new Error(
      `Lace must be connected to Preprod. Current network: ${configuration.networkId}`,
    )
  }

  setNetworkId(configuration.networkId)


  // --------------------------------------------------
  // WALLET ADDRESSES
  // --------------------------------------------------

  const shieldedAddress =
    await api.getShieldedAddresses()

  const {
    unshieldedAddress,
  } =
    await api.getUnshieldedAddress()


  // --------------------------------------------------
  // SAFE BROWSER FETCH
  // --------------------------------------------------

  const browserFetch: typeof fetch =
    window.fetch.bind(window)


  // --------------------------------------------------
  // ZK CONFIG
  // --------------------------------------------------

  const zkConfigProvider =
    new FetchZkConfigProvider<HelloWorldCircuitId>(
      window.location.origin,
      browserFetch,
    )


  // --------------------------------------------------
  // PROOF PROVIDER
  // --------------------------------------------------

const proofServer =
  import.meta.env.VITE_PROOF_SERVER_URL ||
  (import.meta.env.PROD
    ? `${window.location.origin}/midnight-proof`
    : 'http://localhost:6300')

  console.log(
    '[Midnight] Proof server:',
    proofServer,
  )

  const proofProvider =
    httpClientProofProvider(
      proofServer,
      zkConfigProvider,
    )


  // --------------------------------------------------
  // PUBLIC DATA PROVIDER
  // --------------------------------------------------

 const indexerHttp =
  import.meta.env.VITE_INDEXER_HTTP_URL ||
  'https://indexer.preprod.midnight.network/api/v3/graphql'

const indexerWs =
  import.meta.env.VITE_INDEXER_WS_URL ||
  'wss://indexer.preprod.midnight.network/api/v3/graphql/ws'

console.log('[Midnight] Indexer HTTP:', indexerHttp)
console.log('[Midnight] Indexer WS:', indexerWs)

const publicDataProvider = indexerPublicDataProvider(
  indexerHttp,
  indexerWs,
)


  // --------------------------------------------------
  // PRIVATE STATE PROVIDER
  // --------------------------------------------------

  const privateStateProvider =
    levelPrivateStateProvider({
      midnightDbName:
        'midnight-level2-v2',

      accountId:
        unshieldedAddress,

      privateStoragePasswordProvider:
        getPrivateStatePassword,
    })


  // --------------------------------------------------
  // LACE WALLET PROVIDERS
  // --------------------------------------------------

  const {
    walletProvider,
    midnightProvider,
  } =
    createWalletProviders(
      api,
      shieldedAddress,
    )


  console.log(
    '[Midnight] Providers ready.',
  )


  // --------------------------------------------------
  // FINAL PROVIDERS
  // --------------------------------------------------

  return {
    privateStateProvider,
    publicDataProvider,
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  }
}