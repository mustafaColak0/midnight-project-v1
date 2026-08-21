import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js'
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts'

import * as HelloWorld from '../generated/hello-world/index.js'

import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types'
import type { HelloWorldCircuitId } from './providers'

export const CONTRACT_ADDRESS =
  "82265fe547d93fda1dcc12c31f9ccc2a5b3a421c8cd3f1fbc072bad332b8192a";

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
  const rawState =
  await providers.publicDataProvider.queryContractState(
    CONTRACT_ADDRESS,
  );

console.log(
  "[DEBUG] Raw contract state:",
  rawState,
);

console.log(
  "[DEBUG] State data constructor:",
  rawState?.data?.constructor?.name,
);

if (!rawState) {
  throw new Error(
    "Contract state could not be loaded from Preprod.",
  );
}

try {
  const decodedLedger =
    HelloWorld.ledger(rawState.data);

  console.log(
    "[DEBUG] Decoded ledger:",
    decodedLedger,
  );
} catch (error) {
  console.error(
    "[DEBUG] LEDGER DECODE FAILED:",
    error,
  );

  throw error;
}

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