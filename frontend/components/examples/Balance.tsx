import React from "react";
import { ethers } from "ethers";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Stack,
  Box,
} from "@chakra-ui/react";
import { useInspectCall } from "../../cartesi/hooks/useInspectCall";
import { useActiveAccount } from "thirdweb/react";

export const Balance: React.FC = () => {
  const account = useActiveAccount();
  const { reports, decodedReports, inspectCall } = useInspectCall();
  return (
    <Box borderWidth="0.1px" padding="4" borderRadius="lg" overflow="hidden">
      <TableContainer>
        <Stack width="100%">
          <Table variant="striped" size="lg" width="100%">
            <Thead>
              <Tr>
                <Th textAlign={"center"} textColor={"slategray"}>
                  Ether
                </Th>
                <Th textAlign={"center"} textColor={"slategray"}>
                  ERC-20
                </Th>
                <Th textAlign={"center"} textColor={"slategray"}>
                  ERC-721
                </Th>
                {/* <Th textAlign={'center'} textColor={'slategray'}>ERC-1155</Th> */}
              </Tr>
            </Thead>
            <Tbody>
              {reports?.length === 0 && (
                <Tr>
                  <Td
                    colSpan={4}
                    textAlign={"center"}
                    fontSize="14"
                    color="grey"
                  >
                    looks like your cartesi dapp balance is zero! 🙁
                  </Td>
                </Tr>
              )}

              {
                <Tr key={`${decodedReports && decodedReports}`}>
                  {decodedReports && decodedReports.ether && (
                    <Td textAlign={"center"}>
                      {ethers.utils.formatEther(decodedReports.ether)}
                    </Td>
                  )}
                  {decodedReports && decodedReports.erc20 && (
                    <Td textAlign={"center"}>
                      <div>📍 {String(decodedReports.erc20).split(",")[0]}</div>
                      <div>
                        🤑{" "}
                        {Number(String(decodedReports.erc20).split(",")[1]) > 0
                          ? Number(String(decodedReports.erc20).split(",")[1]) /
                            10 ** 18
                          : null}{" "}
                      </div>
                    </Td>
                  )}
                  {decodedReports && decodedReports.erc721 && (
                    <Td textAlign={"center"}>
                      <div>
                        📍 {String(decodedReports.erc721).split(",")[0]}
                      </div>
                      <div>
                        🆔 {String(decodedReports.erc721).split(",")[1]}
                      </div>
                    </Td>
                  )}

                  {/* {decodedReports && decodedReports.erc721 && (
                        <Td textAlign={'center'}>
                            <div>📍 {String(decodedReports.erc1155).split(",")[0]}</div>
                            <div>🆔 {String(decodedReports.erc1155).split(",")[1]}</div>
                        </Td>)} */}
                </Tr>
              }
            </Tbody>
          </Table>
          <Button
            width="100%"
            backgroundColor={"#9395D3"}
            onClick={() => inspectCall(`balance/${account?.address}`)}
          >
            Get Balance
          </Button>
        </Stack>
      </TableContainer>
    </Box>
  );
};
