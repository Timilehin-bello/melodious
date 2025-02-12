"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";
import { useMelodiousContext } from "@/contexts/melodious";

interface WithdrawalCTSIModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateTransactionStatus: (status: boolean) => void;
}

export default function WithdrawCTSIModal({
  isOpen,
  onClose,
}: WithdrawalCTSIModalProps) {
  const [ctsiAmount, setCtsiAmount] = useState<number>();

  const { withdrawCTSI } = useMelodiousContext();

  const [loadWithdrawCTSI, setLoadWithdrawCTSI] = useState(false);

  const handleWithdrawCTSI = async () => {
    if (!ctsiAmount) return toast.error("Fields required!");
    setLoadWithdrawCTSI(true);
    const res = await withdrawCTSI(ctsiAmount);
    if (!res) {
      setLoadWithdrawCTSI(false);
      return toast.error(res);
    }
    setLoadWithdrawCTSI(false);
    return toast.success(res);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center z-50"
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold mb-4 text-2xl">Withdraw CTSI Reward</h2>

          <button
            onClick={onClose}
            className="text-gray-700 font-bold text-medium"
          >
            X
          </button>
        </div>
        <div className="mt-4">
          <input
            type="number"
            placeholder="Amount"
            value={ctsiAmount}
            onChange={(e) => setCtsiAmount(e.target.value as any)}
            className="border border-gray-300 rounded-lg w-full p-2"
          />
          <button
            onClick={handleWithdrawCTSI}
            className="bg-blue-500 text-white rounded-lg w-full p-2 mt-4"
          >
            {loadWithdrawCTSI ? "Loading..." : "Withdraw"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
