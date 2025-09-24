"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { Track } from "@/hooks/useTracks";

interface MintArtistTokensFormData {
  trackId: string;
  amount: number;
  pricePerToken: number;
}

interface MintArtistTokensDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: MintArtistTokensFormData;
  onFormDataChange: (data: MintArtistTokensFormData) => void;
  tracks: Track[] | undefined;
  onMint: () => void;
  isPending: boolean;
}

export const MintArtistTokensDialog: React.FC<MintArtistTokensDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  tracks,
  onMint,
  isPending,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
          <Plus className="w-4 h-4 mr-2" />
          Mint Artist Tokens
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            Mint Artist Tokens
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create fungible tokens for one of your tracks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label
              htmlFor="artistTokenTrackId"
              className="text-white font-medium"
            >
              Track
            </Label>
            <select
              id="artistTokenTrackId"
              value={formData.trackId}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  trackId: e.target.value,
                })
              }
              className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            >
              <option value="" className="bg-zinc-800 text-white">
                Select a track
              </option>
              {tracks?.map((track: Track) => (
                <option
                  key={track.id}
                  value={track.id}
                  className="bg-zinc-800 text-white"
                >
                  {track.title}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3">
            <Label htmlFor="amount" className="text-white font-medium">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  amount: parseInt(e.target.value) || 0,
                })
              }
              placeholder="100"
              className="h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl px-4 focus-visible:ring-emerald-600 transition-all duration-200"
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="pricePerToken" className="text-white font-medium">
              Price per Token (CTSI)
            </Label>
            <Input
              id="pricePerToken"
              type="number"
              step="0.001"
              min="0"
              value={formData.pricePerToken}
              onChange={(e) =>
                onFormDataChange({
                  ...formData,
                  pricePerToken: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="0.01"
              className="h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl px-4 focus-visible:ring-emerald-600 transition-all duration-200"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={onMint}
            disabled={isPending}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl h-12"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mint Tokens
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
