/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../../common";

export interface AuthorityHistoryPairFactoryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "calculateAuthorityHistoryAddressPair"
      | "getAuthorityFactory"
      | "getHistoryFactory"
      | "newAuthorityHistoryPair(address)"
      | "newAuthorityHistoryPair(address,bytes32)"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "AuthorityHistoryPairFactoryCreated"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "calculateAuthorityHistoryAddressPair",
    values: [AddressLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getAuthorityFactory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getHistoryFactory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "newAuthorityHistoryPair(address)",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "newAuthorityHistoryPair(address,bytes32)",
    values: [AddressLike, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "calculateAuthorityHistoryAddressPair",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAuthorityFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getHistoryFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "newAuthorityHistoryPair(address)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "newAuthorityHistoryPair(address,bytes32)",
    data: BytesLike
  ): Result;
}

export namespace AuthorityHistoryPairFactoryCreatedEvent {
  export type InputTuple = [
    authorityFactory: AddressLike,
    historyFactory: AddressLike
  ];
  export type OutputTuple = [authorityFactory: string, historyFactory: string];
  export interface OutputObject {
    authorityFactory: string;
    historyFactory: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface AuthorityHistoryPairFactory extends BaseContract {
  connect(runner?: ContractRunner | null): AuthorityHistoryPairFactory;
  waitForDeployment(): Promise<this>;

  interface: AuthorityHistoryPairFactoryInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  /**
   * Beware that only the `newAuthorityHistoryPair` function with the `_salt` parameter      is able to deterministically deploy an authority-history pair.
   * Calculate the address of an authority-history pair to be deployed deterministically.
   * @param _authorityOwner The initial authority owner
   * @param _salt The salt used to deterministically generate the authority-history address pair
   */
  calculateAuthorityHistoryAddressPair: TypedContractMethod<
    [_authorityOwner: AddressLike, _salt: BytesLike],
    [[string, string] & { authorityAddress_: string; historyAddress_: string }],
    "view"
  >;

  /**
   * Get the factory used to deploy `Authority` contracts
   */
  getAuthorityFactory: TypedContractMethod<[], [string], "view">;

  /**
   * Get the factory used to deploy `History` contracts
   */
  getHistoryFactory: TypedContractMethod<[], [string], "view">;

  /**
   * Deploy a new authority-history pair.
   * @param _authorityOwner The initial authority owner
   */
  "newAuthorityHistoryPair(address)": TypedContractMethod<
    [_authorityOwner: AddressLike],
    [[string, string] & { authority_: string; history_: string }],
    "nonpayable"
  >;

  /**
   * Deploy a new authority-history pair deterministically.
   * @param _authorityOwner The initial authority owner
   * @param _salt The salt used to deterministically generate the authority-history pair address
   */
  "newAuthorityHistoryPair(address,bytes32)": TypedContractMethod<
    [_authorityOwner: AddressLike, _salt: BytesLike],
    [[string, string] & { authority_: string; history_: string }],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "calculateAuthorityHistoryAddressPair"
  ): TypedContractMethod<
    [_authorityOwner: AddressLike, _salt: BytesLike],
    [[string, string] & { authorityAddress_: string; historyAddress_: string }],
    "view"
  >;
  getFunction(
    nameOrSignature: "getAuthorityFactory"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getHistoryFactory"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "newAuthorityHistoryPair(address)"
  ): TypedContractMethod<
    [_authorityOwner: AddressLike],
    [[string, string] & { authority_: string; history_: string }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "newAuthorityHistoryPair(address,bytes32)"
  ): TypedContractMethod<
    [_authorityOwner: AddressLike, _salt: BytesLike],
    [[string, string] & { authority_: string; history_: string }],
    "nonpayable"
  >;

  getEvent(
    key: "AuthorityHistoryPairFactoryCreated"
  ): TypedContractEvent<
    AuthorityHistoryPairFactoryCreatedEvent.InputTuple,
    AuthorityHistoryPairFactoryCreatedEvent.OutputTuple,
    AuthorityHistoryPairFactoryCreatedEvent.OutputObject
  >;

  filters: {
    "AuthorityHistoryPairFactoryCreated(address,address)": TypedContractEvent<
      AuthorityHistoryPairFactoryCreatedEvent.InputTuple,
      AuthorityHistoryPairFactoryCreatedEvent.OutputTuple,
      AuthorityHistoryPairFactoryCreatedEvent.OutputObject
    >;
    AuthorityHistoryPairFactoryCreated: TypedContractEvent<
      AuthorityHistoryPairFactoryCreatedEvent.InputTuple,
      AuthorityHistoryPairFactoryCreatedEvent.OutputTuple,
      AuthorityHistoryPairFactoryCreatedEvent.OutputObject
    >;
  };
}
