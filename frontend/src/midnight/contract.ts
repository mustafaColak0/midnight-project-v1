import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js'
import { findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts'
import { validateSecretValue } from './eligibility'
import * as HelloWorld from '../generated/hello-world/index.js'

import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types'
import type { HelloWorldCircuitId } from './providers'

export const CONTRACT_ADDRESS =
  '022d78119bca01fa590c08d0a0209bdbd1e1baef1e8fae6a49670e75ca8b3695'

export type GovernanceVote = 'yes' | 'no'

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
    '[Midnight] Connecting to Preprod governance contract:',
    CONTRACT_ADDRESS,
  )

  const contract = await findDeployedContract(
    providers,
    {
      compiledContract: compiledHelloWorldContract,
      contractAddress: CONTRACT_ADDRESS,
    },
  )

  const rawState =
    await providers.publicDataProvider.queryContractState(
      CONTRACT_ADDRESS,
    )

  if (!rawState) {
    throw new Error(
      'Governance contract state could not be loaded from Preprod.',
    )
  }

  const decodedLedger = HelloWorld.ledger(rawState.data)

  console.log(
    '[Midnight] Governance contract state loaded.',
    decodedLedger,
  )

  return contract
}

export async function castPrivateGovernanceVote(
  providers: MidnightProviders<HelloWorldCircuitId>,
  secretValue: bigint,
  vote: GovernanceVote,
) {
  validateSecretValue(secretValue)

  const contract =
    await findHelloWorldContract(providers)

  console.log(
    `[Midnight] Submitting ${vote.toUpperCase()} governance vote.`,
  )

  const result =
    vote === 'yes'
      ? await contract.callTx.voteYes(secretValue)
      : await contract.callTx.voteNo(secretValue)

  console.log(
    '[Midnight] Governance vote transaction completed.',
    result,
  )

  return result
}
