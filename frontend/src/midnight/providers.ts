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

  /*
   * window.fetch doğrudan başka bir provider'a
   * geçirildiğinde "Illegal invocation" hatası
   * alabiliyorduk.
   *
   * Bu yüzden Window'a bind ediyoruz.
   */

  const browserFetch: typeof fetch =
    window.fetch.bind(window)


  // --------------------------------------------------
  // ZK CONFIG
  // --------------------------------------------------

  /*
   * Vite public klasöründen:
   *
   * /keys/...
   * /zkir/...
   *
   * dosyalarını okuyacak.
   */

  const zkConfigProvider =
    new FetchZkConfigProvider<HelloWorldCircuitId>(
      window.location.origin,
      browserFetch,
    )


  // --------------------------------------------------
  // PROOF PROVIDER
  // --------------------------------------------------

  /*
   * Browser doğrudan:
   *
   * https://proof-server.preprod.midnight.network
   *
   * adresine POST yaptığında CORS 403 alıyoruz.
   *
   * Bu yüzden request önce Vite'a gidiyor:
   *
   * localhost:5173/midnight-proof
   *
   * Vite proxy daha sonra Preprod proof server'a
   * iletiyor.
   */
const proofServer =
  'https://solid-space-journey-p7gxj6rjgjp3rwgj-6300.app.github.dev'

console.log(
  '[Midnight] Direct proof server:',
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

  const publicDataProvider =
    indexerPublicDataProvider(
      configuration.indexerUri,
      configuration.indexerWsUri,
    )


  // --------------------------------------------------
  // PRIVATE STATE PROVIDER
  // --------------------------------------------------

const privateStateProvider =
  levelPrivateStateProvider({
    midnightDbName: 'midnight-level2-v2',
    accountId: unshieldedAddress,
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