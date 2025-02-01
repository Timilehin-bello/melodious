/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IAuthorityFactory,
  IAuthorityFactoryInterface,
} from "../../../../contracts/consensus/authority/IAuthorityFactory";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "authorityOwner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "contract Authority",
        name: "authority",
        type: "address",
      },
    ],
    name: "AuthorityCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_authorityOwner",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_salt",
        type: "bytes32",
      },
    ],
    name: "calculateAuthorityAddress",
    outputs: [
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
        internalType: "bytes32",
        name: "_salt",
        type: "bytes32",
      },
    ],
    name: "newAuthority",
    outputs: [
      {
        internalType: "contract Authority",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_authorityOwner",
        type: "address",
      },
    ],
    name: "newAuthority",
    outputs: [
      {
        internalType: "contract Authority",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IAuthorityFactory__factory {
  static readonly abi = _abi;
  static createInterface(): IAuthorityFactoryInterface {
    return new utils.Interface(_abi) as IAuthorityFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IAuthorityFactory {
    return new Contract(address, _abi, signerOrProvider) as IAuthorityFactory;
  }
}
