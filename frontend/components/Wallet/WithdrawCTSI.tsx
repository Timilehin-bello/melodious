"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { toast } from "react-hot-toast";
import { useMelodiousContext } from "@/contexts/melodious";
import { X, Loader2, ArrowUpRight, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface WithdrawalCTSIModalProps {
  isOpen: boolean;
  onClose: () => void;
  updateTransactionStatus: (status: boolean) => void;
  userDetails: any;
}

export default function WithdrawCTSIModal({
  isOpen,
  onClose,
  userDetails,
}: WithdrawalCTSIModalProps) {
  const [ctsiAmount, setCtsiAmount] = useState<string>("");
  const [loadWithdrawCTSI, setLoadWithdrawCTSI] = useState(false);
  const { withdrawCTSI } = useMelodiousContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (Number(value) >= 0 || value === "") {
      setCtsiAmount(value);
    }
  };

  const handleWithdrawCTSI = async () => {
    const amount = Number(ctsiAmount);
    const availableBalance = Number(userDetails?.cartesiTokenBalance || 0);
    
    if (!amount) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    if (amount > availableBalance) {
      toast.error(`Insufficient balance. Available: ${availableBalance} CTSI`);
      return;
    }

    setLoadWithdrawCTSI(true);
    try {
      const res = await withdrawCTSI(amount);

      if (!res.status) {
        toast.error(res.message || "Withdrawal failed");
      } else {
        toast.success("CTSI withdrawn successfully");
        onClose();
        setCtsiAmount("");
      }
    } catch (error) {
      toast.error("An error occurred during withdrawal");
    } finally {
      setLoadWithdrawCTSI(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#181425] p-6 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#950844]" />
              Withdraw CTSI Reward
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">
                Enter Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.0"
                  value={ctsiAmount}
                  onChange={handleChange}
                  className={cn(
                    "w-full px-4 py-3 pr-20 bg-zinc-800/50 border border-zinc-700 rounded-lg",
                    "focus:outline-none focus:ring-2 focus:ring-[#950844] focus:border-transparent",
                    "placeholder-zinc-500 text-white text-lg",
                    "transition-all duration-200"
                  )}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCtsiAmount(userDetails?.cartesiTokenBalance || "0")}
                    className="text-xs px-2 py-1 bg-[#950844] text-white rounded hover:bg-[#7a0636] transition-colors"
                  >
                    MAX
                  </button>
                  <span className="text-zinc-400 font-medium">CTSI</span>
                </div>
              </div>
            </div>

            {/* Balance Info (Optional) */}
            <div className="flex justify-between items-center text-sm text-zinc-400">
              <span>Available Balance</span>
              <span className="font-medium">
                {userDetails?.cartesiTokenBalance} CTSI
              </span>
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleWithdrawCTSI}
              disabled={loadWithdrawCTSI || !ctsiAmount}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium",
                "bg-gradient-to-r from-[#950844] to-[#7e0837]",
                "hover:from-[#7e0837] hover:to-[#950844]",
                "text-white transition-all duration-200",
                "flex items-center justify-center gap-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loadWithdrawCTSI ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5" />
                  Withdraw CTSI
                </>
              )}
            </button>

            {/* Info Text */}
            <p className="text-xs text-zinc-500 text-center">
              Withdrawing CTSI may take a few moments to process
            </p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
