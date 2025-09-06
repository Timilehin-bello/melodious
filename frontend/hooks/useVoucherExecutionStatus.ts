import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useRollups } from "@/cartesi/hooks/useRollups";
import { Voucher } from "@/cartesi/hooks/useVouchers";

// Query key factory for voucher execution status
export const voucherExecutionKeys = {
  all: ["voucherExecution"] as const,
  lists: () => [...voucherExecutionKeys.all, "list"] as const,
  list: (dappAddress: string, vouchers: Voucher[]) =>
    [
      ...voucherExecutionKeys.lists(),
      {
        dappAddress,
        voucherIds: vouchers.map((v) => `${v.input.index}-${v.index}`),
      },
    ] as const,
};

// Hook to check execution status for multiple vouchers using TanStack Query
export const useVoucherExecutionStatus = (
  dappAddress: string,
  vouchers: Voucher[]
) => {
  const rollups = useRollups(dappAddress);

  return useQuery({
    queryKey: voucherExecutionKeys.list(dappAddress, vouchers),
    queryFn: async (): Promise<{ [key: string]: boolean }> => {
      if (!rollups || !vouchers.length) {
        return {};
      }

      const statuses: { [key: string]: boolean } = {};

      // Check execution status for all vouchers in parallel
      const statusPromises = vouchers.map(async (voucher) => {
        try {
          const executed = await rollups.dappContract.wasVoucherExecuted(
            ethers.BigNumber.from(voucher.input.index),
            ethers.BigNumber.from(voucher.index)
          );
          const key = `${voucher.input.index}-${voucher.index}`;
          return { key, executed };
        } catch (error) {
          console.log(
            `Error checking voucher ${voucher.input.index}-${voucher.index} execution status:`,
            error
          );
          const key = `${voucher.input.index}-${voucher.index}`;
          return { key, executed: false };
        }
      });

      const results = await Promise.all(statusPromises);

      results.forEach(({ key, executed }) => {
        statuses[key] = executed;
      });

      return statuses;
    },
    enabled: !!rollups && vouchers.length > 0,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

// Hook to check execution status for a single voucher
export const useSingleVoucherExecutionStatus = (
  dappAddress: string,
  voucher: Voucher | null
) => {
  const rollups = useRollups(dappAddress);

  return useQuery({
    queryKey: [
      "voucherExecution",
      "single",
      dappAddress,
      voucher ? `${voucher.input.index}-${voucher.index}` : null,
    ],
    queryFn: async (): Promise<boolean> => {
      if (!rollups || !voucher) {
        return false;
      }

      try {
        const executed = await rollups.dappContract.wasVoucherExecuted(
          ethers.BigNumber.from(voucher.input.index),
          ethers.BigNumber.from(voucher.index)
        );
        return executed;
      } catch (error) {
        console.log(
          `Error checking voucher ${voucher.input.index}-${voucher.index} execution status:`,
          error
        );
        return false;
      }
    },
    enabled: !!rollups && !!voucher,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
