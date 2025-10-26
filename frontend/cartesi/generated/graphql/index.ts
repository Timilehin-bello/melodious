import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
};

/** Application information */
export type Application = {
  __typename?: 'Application';
  /** Application contract address */
  address: Scalars['String']['output'];
  /** Application identifier */
  id: Scalars['String']['output'];
  /** Application name */
  name: Scalars['String']['output'];
};

/** Request submitted to the application to advance its state */
export type Input = {
  __typename?: 'Input';
  /** Number of the base layer block in which the input was recorded */
  blockNumber: Scalars['BigInt']['output'];
  /** Input identifier */
  id: Scalars['String']['output'];
  /** Input index starting from genesis */
  index: Scalars['Int']['output'];
  /** Address responsible for submitting the input */
  msgSender: Scalars['String']['output'];
  /** Get notice from this particular input given the notice's index */
  notice: Notice;
  /** Get notices from this particular input with support for pagination */
  notices: NoticeConnection;
  /** Input payload in Ethereum hex binary format, starting with '0x' */
  payload: Scalars['String']['output'];
  /** Get report from this particular input given the report's index */
  report: Report;
  /** Get reports from this particular input with support for pagination */
  reports: ReportConnection;
  /** Timestamp associated with the input submission, as defined by the base layer's block in which it was recorded */
  timestamp: Scalars['BigInt']['output'];
  /** Get voucher from this particular input given the voucher's index */
  voucher: Voucher;
  /** Get vouchers from this particular input with support for pagination */
  vouchers: VoucherConnection;
};


/** Request submitted to the application to advance its state */
export type InputNoticeArgs = {
  index: Scalars['Int']['input'];
};


/** Request submitted to the application to advance its state */
export type InputNoticesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Request submitted to the application to advance its state */
export type InputReportArgs = {
  index: Scalars['Int']['input'];
};


/** Request submitted to the application to advance its state */
export type InputReportsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Request submitted to the application to advance its state */
export type InputVoucherArgs = {
  index: Scalars['Int']['input'];
};


/** Request submitted to the application to advance its state */
export type InputVouchersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Pagination result */
export type InputConnection = {
  __typename?: 'InputConnection';
  /** Pagination entries returned for the current page */
  edges: Array<InputEdge>;
  /** Pagination metadata */
  pageInfo: PageInfo;
  /** Total number of entries that match the query */
  totalCount: Scalars['Int']['output'];
};

/** Pagination entry */
export type InputEdge = {
  __typename?: 'InputEdge';
  /** Pagination cursor */
  cursor: Scalars['String']['output'];
  /** Node instance */
  node: Input;
};

/** Filter object to restrict results depending on input properties */
export type InputFilter = {
  /** Filter only inputs with index greater than a given value */
  indexGreaterThan?: InputMaybe<Scalars['Int']['input']>;
  /** Filter only inputs with index lower than a given value */
  indexLowerThan?: InputMaybe<Scalars['Int']['input']>;
};

/** Informational statement that can be validated in the base layer blockchain */
export type Notice = {
  __typename?: 'Notice';
  /** Notice index within the context of the input that produced it */
  index: Scalars['Int']['output'];
  /** Input whose processing produced the notice */
  input: Input;
  /** Notice data as a payload in Ethereum hex binary format, starting with '0x' */
  payload: Scalars['String']['output'];
  /** Proof object that allows this notice to be validated by the base layer blockchain */
  proof?: Maybe<Proof>;
};

/** Pagination result */
export type NoticeConnection = {
  __typename?: 'NoticeConnection';
  /** Pagination entries returned for the current page */
  edges: Array<NoticeEdge>;
  /** Pagination metadata */
  pageInfo: PageInfo;
  /** Total number of entries that match the query */
  totalCount: Scalars['Int']['output'];
};

/** Pagination entry */
export type NoticeEdge = {
  __typename?: 'NoticeEdge';
  /** Pagination cursor */
  cursor: Scalars['String']['output'];
  /** Node instance */
  node: Notice;
};

/** Validity proof for an output */
export type OutputValidityProof = {
  __typename?: 'OutputValidityProof';
  /** Array of sibling hashes for merkle proof */
  outputHashesSiblings: Array<Scalars['String']['output']>;
  /** Output index for this output */
  outputIndex: Scalars['Int']['output'];
};

/** Page metadata for the cursor-based Connection pagination pattern */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** Cursor pointing to the last entry of the page */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** Indicates if there are additional entries after the end curs */
  hasNextPage: Scalars['Boolean']['output'];
  /** Indicates if there are additional entries before the start curs */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** Cursor pointing to the first entry of the page */
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** Data that can be used as proof to validate notices and execute vouchers on the base layer blockchain */
export type Proof = {
  __typename?: 'Proof';
  /** Data that allows the validity proof to be contextualized within submitted claims, given as a payload in Ethereum hex binary format, starting with '0x' */
  context: Scalars['String']['output'];
  /** Validity proof for an output */
  validity: OutputValidityProof;
};

/** Top level queries */
export type Query = {
  __typename?: 'Query';
  /** Get input based on its identifier */
  input: Input;
  /** Get inputs with support for pagination */
  inputs: InputConnection;
  /** Get notice based on its index */
  notice: Notice;
  /** Get notices with support for pagination */
  notices: NoticeConnection;
  /** Get report based on its index */
  report: Report;
  /** Get reports with support for pagination */
  reports: ReportConnection;
  /** Get voucher based on its output index */
  voucher: Voucher;
  /** Get vouchers with support for pagination */
  vouchers: VoucherConnection;
};


/** Top level queries */
export type QueryInputArgs = {
  id: Scalars['String']['input'];
};


/** Top level queries */
export type QueryInputsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<InputFilter>;
};


/** Top level queries */
export type QueryNoticeArgs = {
  inputIndex: Scalars['Int']['input'];
  noticeIndex: Scalars['Int']['input'];
};


/** Top level queries */
export type QueryNoticesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Top level queries */
export type QueryReportArgs = {
  inputIndex: Scalars['Int']['input'];
  reportIndex: Scalars['Int']['input'];
};


/** Top level queries */
export type QueryReportsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Top level queries */
export type QueryVoucherArgs = {
  outputIndex: Scalars['Int']['input'];
};


/** Top level queries */
export type QueryVouchersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Application log or diagnostic information */
export type Report = {
  __typename?: 'Report';
  /** Report index within the context of the input that produced it */
  index: Scalars['Int']['output'];
  /** Input whose processing produced the report */
  input: Input;
  /** Report data as a payload in Ethereum hex binary format, starting with '0x' */
  payload: Scalars['String']['output'];
};

/** Pagination result */
export type ReportConnection = {
  __typename?: 'ReportConnection';
  /** Pagination entries returned for the current page */
  edges: Array<ReportEdge>;
  /** Pagination metadata */
  pageInfo: PageInfo;
  /** Total number of entries that match the query */
  totalCount: Scalars['Int']['output'];
};

/** Pagination entry */
export type ReportEdge = {
  __typename?: 'ReportEdge';
  /** Pagination cursor */
  cursor: Scalars['String']['output'];
  /** Node instance */
  node: Report;
};

/** Representation of a transaction that can be carried out on the base layer blockchain, such as a transfer of assets */
export type Voucher = {
  __typename?: 'Voucher';
  /** Application that generated this voucher */
  application: Application;
  /** Transaction destination address in Ethereum hex binary format (20 bytes), starting with '0x' */
  destination: Scalars['String']['output'];
  /** Whether the voucher has been executed on the base layer */
  executed: Scalars['Boolean']['output'];
  /** Voucher index within the context of the input that produced it */
  index: Scalars['Int']['output'];
  /** Input whose processing produced the voucher */
  input: Input;
  /** Transaction payload in Ethereum hex binary format, starting with '0x' */
  payload: Scalars['String']['output'];
  /** Proof object that allows this voucher to be validated and executed on the base layer blockchain */
  proof?: Maybe<VoucherProof>;
  /** Transaction hash of the voucher execution, if executed */
  transactionHash?: Maybe<Scalars['String']['output']>;
  /** Value in wei to be transferred along with the voucher execution */
  value: Scalars['String']['output'];
};

/** Pagination result */
export type VoucherConnection = {
  __typename?: 'VoucherConnection';
  /** Pagination entries returned for the current page */
  edges: Array<VoucherEdge>;
  /** Pagination metadata */
  pageInfo: PageInfo;
  /** Total number of entries that match the query */
  totalCount: Scalars['Int']['output'];
};

/** Pagination entry */
export type VoucherEdge = {
  __typename?: 'VoucherEdge';
  /** Pagination cursor */
  cursor: Scalars['String']['output'];
  /** Node instance */
  node: Voucher;
};

/** Proof data for voucher validation and execution */
export type VoucherProof = {
  __typename?: 'VoucherProof';
  /** Array of sibling hashes for merkle proof */
  outputHashesSiblings: Array<Scalars['String']['output']>;
  /** Output index for this voucher */
  outputIndex: Scalars['Int']['output'];
};

export type NoticeQueryVariables = Exact<{
  noticeIndex: Scalars['Int']['input'];
  inputIndex: Scalars['Int']['input'];
}>;


export type NoticeQuery = { __typename?: 'Query', notice: { __typename?: 'Notice', index: number, payload: string, input: { __typename?: 'Input', index: number }, proof?: { __typename?: 'Proof', context: string, validity: { __typename?: 'OutputValidityProof', outputIndex: number, outputHashesSiblings: Array<string> } } | null } };

export type NoticesQueryVariables = Exact<{ [key: string]: never; }>;


export type NoticesQuery = { __typename?: 'Query', notices: { __typename?: 'NoticeConnection', edges: Array<{ __typename?: 'NoticeEdge', node: { __typename?: 'Notice', index: number, payload: string, input: { __typename?: 'Input', index: number } } }> } };

export type NoticesByInputQueryVariables = Exact<{
  inputId: Scalars['String']['input'];
}>;


export type NoticesByInputQuery = { __typename?: 'Query', input: { __typename?: 'Input', notices: { __typename?: 'NoticeConnection', edges: Array<{ __typename?: 'NoticeEdge', node: { __typename?: 'Notice', index: number, payload: string, input: { __typename?: 'Input', id: string } } }> } } };

export type VoucherQueryVariables = Exact<{
  outputIndex: Scalars['Int']['input'];
}>;


export type VoucherQuery = { __typename?: 'Query', voucher: { __typename?: 'Voucher', index: number, destination: string, payload: string, value: string, executed: boolean, transactionHash?: string | null, input: { __typename?: 'Input', index: number }, proof?: { __typename?: 'VoucherProof', outputIndex: number, outputHashesSiblings: Array<string> } | null, application: { __typename?: 'Application', id: string, name: string, address: string } } };

export type VouchersQueryVariables = Exact<{ [key: string]: never; }>;


export type VouchersQuery = { __typename?: 'Query', vouchers: { __typename?: 'VoucherConnection', totalCount: number, edges: Array<{ __typename?: 'VoucherEdge', node: { __typename?: 'Voucher', index: number, destination: string, payload: string, value: string, executed: boolean, transactionHash?: string | null, input: { __typename?: 'Input', index: number, msgSender: string }, proof?: { __typename?: 'VoucherProof', outputIndex: number, outputHashesSiblings: Array<string> } | null, application: { __typename?: 'Application', id: string, name: string, address: string } } }> } };

export type VouchersByInputQueryVariables = Exact<{
  inputIndex: Scalars['String']['input'];
}>;


export type VouchersByInputQuery = { __typename?: 'Query', input: { __typename?: 'Input', id: string, index: number, payload: string, msgSender: string, vouchers: { __typename?: 'VoucherConnection', totalCount: number, edges: Array<{ __typename?: 'VoucherEdge', node: { __typename?: 'Voucher', index: number, destination: string, payload: string, value: string, executed: boolean, transactionHash?: string | null, input: { __typename?: 'Input', index: number, msgSender: string }, proof?: { __typename?: 'VoucherProof', outputIndex: number, outputHashesSiblings: Array<string> } | null, application: { __typename?: 'Application', id: string, name: string, address: string } } }> } } };

export type ReportQueryVariables = Exact<{
  reportIndex: Scalars['Int']['input'];
  inputIndex: Scalars['Int']['input'];
}>;


export type ReportQuery = { __typename?: 'Query', report: { __typename?: 'Report', index: number, payload: string, input: { __typename?: 'Input', index: number } } };

export type ReportsQueryVariables = Exact<{ [key: string]: never; }>;


export type ReportsQuery = { __typename?: 'Query', reports: { __typename?: 'ReportConnection', edges: Array<{ __typename?: 'ReportEdge', node: { __typename?: 'Report', index: number, payload: string, input: { __typename?: 'Input', index: number } } }> } };

export type ReportsByInputQueryVariables = Exact<{
  inputId: Scalars['String']['input'];
}>;


export type ReportsByInputQuery = { __typename?: 'Query', input: { __typename?: 'Input', reports: { __typename?: 'ReportConnection', edges: Array<{ __typename?: 'ReportEdge', node: { __typename?: 'Report', index: number, payload: string, input: { __typename?: 'Input', id: string } } }> } } };


export const NoticeDocument = gql`
    query notice($noticeIndex: Int!, $inputIndex: Int!) {
  notice(noticeIndex: $noticeIndex, inputIndex: $inputIndex) {
    index
    input {
      index
    }
    payload
    proof {
      validity {
        outputIndex
        outputHashesSiblings
      }
      context
    }
  }
}
    `;

export function useNoticeQuery(options: Omit<Urql.UseQueryArgs<NoticeQueryVariables>, 'query'>) {
  return Urql.useQuery<NoticeQuery, NoticeQueryVariables>({ query: NoticeDocument, ...options });
};
export const NoticesDocument = gql`
    query notices {
  notices {
    edges {
      node {
        index
        input {
          index
        }
        payload
      }
    }
  }
}
    `;

export function useNoticesQuery(options?: Omit<Urql.UseQueryArgs<NoticesQueryVariables>, 'query'>) {
  return Urql.useQuery<NoticesQuery, NoticesQueryVariables>({ query: NoticesDocument, ...options });
};
export const NoticesByInputDocument = gql`
    query noticesByInput($inputId: String!) {
  input(id: $inputId) {
    notices {
      edges {
        node {
          index
          input {
            id
          }
          payload
        }
      }
    }
  }
}
    `;

export function useNoticesByInputQuery(options: Omit<Urql.UseQueryArgs<NoticesByInputQueryVariables>, 'query'>) {
  return Urql.useQuery<NoticesByInputQuery, NoticesByInputQueryVariables>({ query: NoticesByInputDocument, ...options });
};
export const VoucherDocument = gql`
    query voucher($outputIndex: Int!) {
  voucher(outputIndex: $outputIndex) {
    index
    input {
      index
    }
    destination
    payload
    value
    executed
    transactionHash
    proof {
      outputIndex
      outputHashesSiblings
    }
    application {
      id
      name
      address
    }
  }
}
    `;

export function useVoucherQuery(options: Omit<Urql.UseQueryArgs<VoucherQueryVariables>, 'query'>) {
  return Urql.useQuery<VoucherQuery, VoucherQueryVariables>({ query: VoucherDocument, ...options });
};
export const VouchersDocument = gql`
    query vouchers {
  vouchers {
    totalCount
    edges {
      node {
        index
        input {
          index
          msgSender
        }
        destination
        payload
        value
        executed
        transactionHash
        proof {
          outputIndex
          outputHashesSiblings
        }
        application {
          id
          name
          address
        }
      }
    }
  }
}
    `;

export function useVouchersQuery(options?: Omit<Urql.UseQueryArgs<VouchersQueryVariables>, 'query'>) {
  return Urql.useQuery<VouchersQuery, VouchersQueryVariables>({ query: VouchersDocument, ...options });
};
export const VouchersByInputDocument = gql`
    query vouchersByInput($inputIndex: String!) {
  input(id: $inputIndex) {
    id
    index
    payload
    msgSender
    vouchers {
      totalCount
      edges {
        node {
          index
          input {
            index
            msgSender
          }
          destination
          payload
          value
          executed
          transactionHash
          proof {
            outputIndex
            outputHashesSiblings
          }
          application {
            id
            name
            address
          }
        }
      }
    }
  }
}
    `;

export function useVouchersByInputQuery(options: Omit<Urql.UseQueryArgs<VouchersByInputQueryVariables>, 'query'>) {
  return Urql.useQuery<VouchersByInputQuery, VouchersByInputQueryVariables>({ query: VouchersByInputDocument, ...options });
};
export const ReportDocument = gql`
    query report($reportIndex: Int!, $inputIndex: Int!) {
  report(reportIndex: $reportIndex, inputIndex: $inputIndex) {
    index
    input {
      index
    }
    payload
  }
}
    `;

export function useReportQuery(options: Omit<Urql.UseQueryArgs<ReportQueryVariables>, 'query'>) {
  return Urql.useQuery<ReportQuery, ReportQueryVariables>({ query: ReportDocument, ...options });
};
export const ReportsDocument = gql`
    query reports {
  reports {
    edges {
      node {
        index
        input {
          index
        }
        payload
      }
    }
  }
}
    `;

export function useReportsQuery(options?: Omit<Urql.UseQueryArgs<ReportsQueryVariables>, 'query'>) {
  return Urql.useQuery<ReportsQuery, ReportsQueryVariables>({ query: ReportsDocument, ...options });
};
export const ReportsByInputDocument = gql`
    query reportsByInput($inputId: String!) {
  input(id: $inputId) {
    reports {
      edges {
        node {
          index
          input {
            id
          }
          payload
        }
      }
    }
  }
}
    `;

export function useReportsByInputQuery(options: Omit<Urql.UseQueryArgs<ReportsByInputQueryVariables>, 'query'>) {
  return Urql.useQuery<ReportsByInputQuery, ReportsByInputQueryVariables>({ query: ReportsByInputDocument, ...options });
};