"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccount } from "wagmi";
import { fetchPendingChallenges } from "@/lib/fetching-onchain-challenge";
import { ChallengeInterface } from "@/lib/interfaces";
import { toast } from "react-toastify";
import { joinReviewPool, waitForTransaction } from "@/lib/write-onchain-utils";
import { ChallengeCard } from "./pending-challenge-card";
import { Domain, DomainLabels } from "@/constants/system";
import { Loader2 } from "lucide-react";

export default function PendingChallengesView() {
  const { address } = useAccount();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("date-desc");
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [allPendingChallenges, setAllPendingChallenges] =
    useState<ChallengeInterface[]>();

  async function handleFetchingAllPendingChallenges() {
    setIsLoading(true);
    await fetchPendingChallenges()
      .then((pending_challenges_array: ChallengeInterface[]) => {
        setAllPendingChallenges(pending_challenges_array);
      })
      .catch((error) => {
        toast.error(`Error fetching user data: ${error.message}`);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function handleJoiningReviewPool(challenge_id: string | undefined) {
    if (!challenge_id) {
      toast.error("Cannot join review pool: Challenge ID is undefined.");
      return;
    }
    if (!address) {
      toast.error("Connect wallet first to join review pool.");
      return;
    }
    try {
      const txHash = await joinReviewPool(Number(challenge_id), address);
      toast.success(`Review pool join transaction sent: ${txHash}`);
      await waitForTransaction(txHash);
      setReload((prev) => !prev); // Trigger a reload to fetch updated data
    } catch (error: any) {
      toast.error(`Failed to join review pool: ${error.message}`);
    }
  }

  // Fetch user data when the component mounts
  useEffect(() => {
    if (address) {
      handleFetchingAllPendingChallenges();
    }
  }, [address]);

  const filtered = allPendingChallenges
    ? allPendingChallenges
        .filter(
          (challenge) =>
            challenge.title?.toLowerCase().includes(search.toLowerCase()) &&
            (categoryFilter === "All" || challenge.category === categoryFilter)
        )
        .sort((a, b) => {
          if (sortOption === "date-desc")
            return Number(b.contributeAt) - Number(a.contributeAt);
          if (sortOption === "date-asc")
            return Number(a.contributeAt) - Number(b.contributeAt);
          return 0;
        })
    : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search challenges..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-grow"
        />
        <Select onValueChange={setCategoryFilter} defaultValue="All">
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {(Object.values(Domain) as unknown as number[])
              .filter((v) => typeof v === "number")
              .map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {DomainLabels[num as Domain]}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Select onValueChange={setSortOption} defaultValue="date-desc">
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            No pending challenges available.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((challenge) => (
            <ChallengeCard
              key={challenge.title}
              challenge={challenge}
              reload={reload}
              handleJoiningReviewPool={handleJoiningReviewPool}
            ></ChallengeCard>
          ))}
        </div>
      )}
    </div>
  );
}
