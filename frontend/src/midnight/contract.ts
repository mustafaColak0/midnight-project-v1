import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js'
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts'

import * as HelloWorld from '../generated/hello-world/index.js'

import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types'
import type { HelloWorldCircuitId } from './providers'

export const CONTRACT_ADDRESS =
  'eed3a573690e9dcb9acaaea0d0ee1b078c3ab0678132fffb7ee8e3ccb91fee6f'

export const compiledHelloWorldContract =
  CompiledContract.make(
    'hello-world',
    HelloWorld.Contract,
  ).pipe(
    CompiledContract.withVacantWitnesses,
    CompiledContract.withCompiledFileAssets('.'),
  )

export async function findHelloWorldContract(
  providers: MidnightProviders<HelloWorldCircuitId>,
) {
  console.log(
    '[Midnight] Connecting to Preprod contract:',
    CONTRACT_ADDRESS,
  )

  const contract = await findDeployedContract(
    providers,
    {
      compiledContract: compiledHelloWorldContract,
      contractAddress: CONTRACT_ADDRESS,
    },
  )

  console.log('[Midnight] Contract found.')

  return contract
}

export async function provePrivateThreshold(
  providers: MidnightProviders<HelloWorldCircuitId>,
  secretValue: bigint,
) {
  if (secretValue < 0n || secretValue > 65535n) {
    throw new Error(
      'Secret value must be between 0 and 65535.',
    )
  }

  const contract =
    await findHelloWorldContract(providers)

  console.log(
    '[Midnight] Calling proveThreshold...',
  )

  const result =
    await contract.callTx.proveThreshold(
      secretValue,
    )

  console.log(
    '[Midnight] proveThreshold completed.',
    result,
  )

  return result
}