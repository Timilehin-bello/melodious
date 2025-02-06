/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "../../common";

export interface SelfHostedApplicationFactoryInterface extends utils.Interface {
  functions: {
    "calculateAddresses(address,address,bytes32,bytes32)": FunctionFragment;
    "deployContracts(address,address,bytes32,bytes32)": FunctionFragment;
    "getApplicationFactory()": FunctionFragment;
    "getAuthorityHistoryPairFactory()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "calculateAddresses"
      | "deployContracts"
      | "getApplicationFactory"
      | "getAuthorityHistoryPairFactory"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "calculateAddresses",
    values: [string, string, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "deployContracts",
    values: [string, string, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getApplicationFactory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAuthorityHistoryPairFactory",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "calculateAddresses",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "deployContracts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getApplicationFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAuthorityHistoryPairFactory",
    data: BytesLike
  ): Result;

  events: {};
}

export interface SelfHostedApplicationFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: SelfHostedApplicationFactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    /**
     * Calculate the addresses of the application, authority and history contracts to be deployed deterministically.
     * @param _authorityOwner The initial authority owner
     * @param _dappOwner The initial DApp owner
     * @param _salt The salt used to deterministically generate the addresses
     * @param _templateHash The initial machine state hash
     */
    calculateAddresses(
      _authorityOwner: string,
      _dappOwner: string,
      _templateHash: BytesLike,
      _salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string] & {
        application_: string;
        authority_: string;
        history_: string;
      }
    >;

    /**
     * Deploy new application, authority and history contracts deterministically.
     * @param _authorityOwner The initial authority owner
     * @param _dappOwner The initial DApp owner
     * @param _salt The salt used to deterministically generate the addresses
     * @param _templateHash The initial machine state hash
     */
    deployContracts(
      _authorityOwner: string,
      _dappOwner: string,
      _templateHash: BytesLike,
      _salt: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<ContractTransaction>;

    /**
     * Get the factory used to deploy `CartesiDApp` contracts
     */
    getApplicationFactory(overrides?: CallOverrides): Promise<[string]>;

    /**
     * Get the factory used to deploy `Authority` and `History` contracts
     */
    getAuthorityHistoryPairFactory(
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  /**
   * Calculate the addresses of the application, authority and history contracts to be deployed deterministically.
   * @param _authorityOwner The initial authority owner
   * @param _dappOwner The initial DApp owner
   * @param _salt The salt used to deterministically generate the addresses
   * @param _templateHash The initial machine state hash
   */
  calculateAddresses(
    _authorityOwner: string,
    _dappOwner: string,
    _templateHash: BytesLike,
    _salt: BytesLike,
    overrides?: CallOverrides
  ): Promise<
    [string, string, string] & {
      application_: string;
      authority_: string;
      history_: string;
    }
  >;

  /**
   * Deploy new application, authority and history contracts deterministically.
   * @param _authorityOwner The initial authority owner
   * @param _dappOwner The initial DApp owner
   * @param _salt The salt used to deterministically generate the addresses
   * @param _templateHash The initial machine state hash
   */
  deployContracts(
    _authorityOwner: string,
    _dappOwner: string,
    _templateHash: BytesLike,
    _salt: BytesLike,
    overrides?: Overrides & { from?: string }
  ): Promise<ContractTransaction>;

  /**
   * Get the factory used to deploy `CartesiDApp` contracts
   */
  getApplicationFactory(overrides?: CallOverrides): Promise<string>;

  /**
   * Get the factory used to deploy `Authority` and `History` contracts
   */
  getAuthorityHistoryPairFactory(overrides?: CallOverrides): Promise<string>;

  callStatic: {
    /**
     * Calculate the addresses of the application, authority and history contracts to be deployed deterministically.
     * @param _authorityOwner The initial authority owner
     * @param _dappOwner The initial DApp owner
     * @param _salt The salt used to deterministically generate the addresses
     * @param _templateHash The initial machine state hash
     */
    calculateAddresses(
      _authorityOwner: string,
      _dappOwner: string,
      _templateHash: BytesLike,
      _salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string] & {
        application_: string;
        authority_: string;
        history_: string;
      }
    >;

    /**
     * Deploy new application, authority and history contracts deterministically.
     * @param _authorityOwner The initial authority owner
     * @param _dappOwner The initial DApp owner
     * @param _salt The salt used to deterministically generate the addresses
     * @param _templateHash The initial machine state hash
     */
    deployContracts(
      _authorityOwner: string,
      _dappOwner: string,
      _templateHash: BytesLike,
      _salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<
      [string, string, string] & {
        application_: string;
        authority_: string;
        history_: string;
      }
    >;

    /**
     * Get the factory used to deploy `CartesiDApp` contracts
     */
    getApplicationFactory(overrides?: CallOverrides): Promise<string>;

    /**
     * Get the factory used to deploy `Authority` and `History` contracts
     */
    getAuthorityHistoryPairFactory(overrides?: CallOverrides): Promise<string>;
  };

  filters: {};

  estimateGas: {
    /**
     * Calculate the addresses of the application, authority and history contracts to be deployed deterministically.
     * @param _authorityOwner The initial authority owner
     * @param _dappOwner The initial DApp owner
     * @param _salt The salt used to deterministically generate the addresses
     * @param _templateHash The initial machine state hash
     */
    calculateAddresses(
      _authorityOwner: string,
      _dappOwner: string,
      _templateHash: BytesLike,
      _salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    /**
     * Deploy new application, authority and history contracts deterministically.
     * @param _authorityOwner The initial authority owner
     * @param _dappOwner The initial DApp owner
     * @param _salt The salt used to deterministically generate the addresses
     * @param _templateHash The initial machine state hash
     */
    deployContracts(
      _authorityOwner: string,
      _dappOwner: string,
      _templateHash: BytesLike,
      _salt: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<BigNumber>;

    /**
     * Get the factory used to deploy `CartesiDApp` contracts
     */
    getApplicationFactory(overrides?: CallOverrides): Promise<BigNumber>;

    /**
     * Get the factory used to deploy `Authority` and `History` contracts
     */
    getAuthorityHistoryPairFactory(
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    /**
     * Calculate the addresses of the application, authority and history contracts to be deployed deterministically.
     * @param _authorityOwner The initial authority owner
     * @param _dappOwner The initial DApp owner
     * @param _salt The salt used to deterministically generate the addresses
     * @param _templateHash The initial machine state hash
     */
    calculateAddresses(
      _authorityOwner: string,
      _dappOwner: string,
      _templateHash: BytesLike,
      _salt: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    /**
     * Deploy new application, authority and history contracts deterministically.
     * @param _authorityOwner The initial authority owner
     * @param _dappOwner The initial DApp owner
     * @param _salt The salt used to deterministically generate the addresses
     * @param _templateHash The initial machine state hash
     */
    deployContracts(
      _authorityOwner: string,
      _dappOwner: string,
      _templateHash: BytesLike,
      _salt: BytesLike,
      overrides?: Overrides & { from?: string }
    ): Promise<PopulatedTransaction>;

    /**
     * Get the factory used to deploy `CartesiDApp` contracts
     */
    getApplicationFactory(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    /**
     * Get the factory used to deploy `Authority` and `History` contracts
     */
    getAuthorityHistoryPairFactory(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
