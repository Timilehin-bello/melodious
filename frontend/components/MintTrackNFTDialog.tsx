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

interface MintTrackNFTFormData {
  trackId: string;
  ipfsHash: string;
  royaltyPercentage: number;
}

interface MintTrackNFTDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tracks: Track[] | undefined;
  formData: MintTrackNFTFormData;
  onFormChange: (data: MintTrackNFTFormData) => void;
  onMint: () => void;
  isPending: boolean;
}

const MintTrackNFTDialog: React.FC<MintTrackNFTDialogProps> = ({
  open,
  onOpenChange,
  tracks,
  formData,
  onFormChange,
  onMint,
  isPending,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-[#950844] to-[#7a0635] hover:from-[#7a0635] hover:to-[#950844] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
          <Plus className="w-4 h-4 mr-2" />
          Mint Track NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">
            Mint Track NFT
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create a unique NFT for one of your tracks.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label htmlFor="trackId" className="text-white font-medium">
              Track
            </Label>
            <select
              id="trackId"
              value={formData.trackId}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  trackId: e.target.value,
                })
              }
              className="flex h-12 w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#950844] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
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
            <Label htmlFor="ipfsHash" className="text-white font-medium">
              IPFS Hash
            </Label>
            <Input
              id="ipfsHash"
              value={formData.ipfsHash}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  ipfsHash: e.target.value,
                })
              }
              placeholder="QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              className="h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl px-4 focus-visible:ring-[#950844] transition-all duration-200"
            />
          </div>
          <div className="grid gap-3">
            <Label
              htmlFor="royaltyPercentage"
              className="text-white font-medium"
            >
              Royalty Percentage
            </Label>
            <Input
              id="royaltyPercentage"
              type="number"
              min="0"
              max="100"
              value={formData.royaltyPercentage}
              onChange={(e) =>
                onFormChange({
                  ...formData,
                  royaltyPercentage: parseInt(e.target.value) || 0,
                })
              }
              placeholder="10"
              className="h-12 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 rounded-xl px-4 focus-visible:ring-[#950844] transition-all duration-200"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={onMint}
            disabled={isPending}
            className="bg-gradient-to-r from-[#950844] to-[#7a0635] hover:from-[#7a0635] hover:to-[#950844] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl h-12"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mint NFT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MintTrackNFTDialog;
