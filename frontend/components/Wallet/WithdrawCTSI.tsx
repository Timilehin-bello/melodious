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
  const [ctsiAmount, setCtsiAmount] = useState<string>("");

  const { withdrawCTSI } = useMelodiousContext();

  const [loadWithdrawCTSI, setLoadWithdrawCTSI] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCtsiAmount(value);
  };
  const handleWithdrawCTSI = async () => {
    const amount = Number(ctsiAmount);
    if (!amount) return toast.error("Fields required!");

    setLoadWithdrawCTSI(true);
    try {
      const res = await withdrawCTSI(amount);

      if (!res.status) {
        toast.error(res.message || "Withdrawal failed");
      } else {
        onClose(); // Close the modal on success
        setCtsiAmount(""); // Reset the input field
      }
    } catch (error) {
      toast.error("An error occurred during withdrawal");
    } finally {
      setLoadWithdrawCTSI(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold mb-4 text-2xl">Withdraw CTSI Reward</h2>

            <button onClick={onClose} className="text-gray-700 font-bold">
              &times;
            </button>
          </div>
          <div className="mt-4">
            <input
              type="number"
              placeholder="Amount"
              value={ctsiAmount}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg w-full p-2"
            />
            <button
              onClick={handleWithdrawCTSI}
              className="bg-[#950844] hover:bg-[#7e0837] text-white rounded-lg w-full p-2 mt-4"
            >
              {loadWithdrawCTSI ? "Loading..." : "Withdraw"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
