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
import { ChallengeInterface } from "@/lib/interfaces";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Domain, DomainLabels } from "@/constants/system";
import { fetchJoinedReviewPoolChallenges } from "@/lib/fetching-onchain-data-utils";
import { ChallengeCard } from "./joined-review-pool-challenge-card";

export default function JoinedChallengesView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | Domain>("All");
  const [sortOption, setSortOption] = useState("date-desc");
  const [joinedChallenges, setJoinedChallenges] = useState<
    ChallengeInterface[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  async function handleFetchingJoinedChallenges() {
    if (!address) return;

    setIsLoading(true);
    try {
      const challenges = await fetchJoinedReviewPoolChallenges(address);
      setJoinedChallenges(challenges);
      console.log("Fetched joined challenges:", challenges);
    } catch (error) {
      toast.error(
        `Error fetching joined challenges: ${(error as Error).message}`
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch user data when the component mounts or address changes
  useEffect(() => {
    if (address) {
      handleFetchingJoinedChallenges();
    }
  }, [address]);

  const filtered = joinedChallenges
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
    });

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
            You haven&apos;t joined any challenges yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((challenge) => (
            <ChallengeCard challenge={challenge} key={challenge.id}></ChallengeCard>
          ))}
        </div>
      )}
    </div>
  );
}
