/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ISelfHostedApplicationFactory,
  ISelfHostedApplicationFactoryInterface,
} from "../../../contracts/dapp/ISelfHostedApplicationFactory";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_authorityOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_dappOwner",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_templateHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_salt",
        type: "bytes32",
      },
    ],
    name: "calculateAddresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_authorityOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "_dappOwner",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_templateHash",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "_salt",
        type: "bytes32",
      },
    ],
    name: "deployContracts",
    outputs: [
      {
        internalType: "contract CartesiDApp",
        name: "",
        type: "address",
      },
      {
        internalType: "contract Authority",
        name: "",
        type: "address",
      },
      {
        internalType: "contract History",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getApplicationFactory",
    outputs: [
      {
        internalType: "contract ICartesiDAppFactory",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAuthorityHistoryPairFactory",
    outputs: [
      {
        internalType: "contract IAuthorityHistoryPairFactory",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class ISelfHostedApplicationFactory__factory {
  static readonly abi = _abi;
  static createInterface(): ISelfHostedApplicationFactoryInterface {
    return new Interface(_abi) as ISelfHostedApplicationFactoryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ISelfHostedApplicationFactory {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as ISelfHostedApplicationFactory;
  }
}
