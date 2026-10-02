import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
}

export type ImpureCircuits<PS> = {
  voteYes(context: __compactRuntime.CircuitContext<PS>, secretValue_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  voteNo(context: __compactRuntime.CircuitContext<PS>, secretValue_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  voteYes(context: __compactRuntime.CircuitContext<PS>, secretValue_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  voteNo(context: __compactRuntime.CircuitContext<PS>, secretValue_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  voteYes(context: __compactRuntime.CircuitContext<PS>, secretValue_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  voteNo(context: __compactRuntime.CircuitContext<PS>, secretValue_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly proposalActive: boolean;
  readonly yesVotes: bigint;
  readonly noVotes: bigint;
  readonly totalVotes: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
