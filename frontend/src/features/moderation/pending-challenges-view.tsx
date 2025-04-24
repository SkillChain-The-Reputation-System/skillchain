"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function PendingChallengesView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("date-desc");
  const [allPendingChallenges, setAllPendingChallenges] =
    useState<ChallengeInterface[]>();
  const { address } = useAccount();

  async function handleFetchingAllPendingChallenges() {
    await fetchPendingChallenges()
      .then((pending_challenges_array: ChallengeInterface[]) => {
        setAllPendingChallenges(pending_challenges_array);
      })
      .catch((error) => {
        toast.error(`Error fetching user data: ${error.message}`);
      });
  }

  async function handleJoiningReviewPool(challenge_id: string | undefined) {
    if (!challenge_id) {
      toast.error("Cannot join review pool: Challenge ID is undefined.");
      return;
    }
    // Implement the logic to join the review pool for the challenge
    // This could involve calling a smart contract function or an API endpoint
    toast.success(`Joining review pool for challenge: ${challenge_id}`);
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
            return (b.date || "").localeCompare(a.date || "");
          if (sortOption === "date-asc")
            return (a.date || "").localeCompare(b.date || "");
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
            <SelectItem value="algorithms">Algorithms</SelectItem>
            <SelectItem value="software-development">
              Software Development
            </SelectItem>
            <SelectItem value="system-design">System Design</SelectItem>
            <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
            <SelectItem value="data-engineering">Data Engineering</SelectItem>
            <SelectItem value="soft-skills">Soft Skills</SelectItem>
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

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((challenge) => (
          <Card key={challenge.title} className="hover:shadow-lg transition">
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{challenge.title}</h2>
                <Badge>{challenge.status}</Badge>
              </div>
              <div className="text-sm text-gray-500">
                {challenge.category} | By {challenge.contributor}
              </div>
              <div className="text-sm">Submitted: {challenge.date}</div>
              <Button
                variant="outline"
                className="mt-2"
                // TODO: Change this to the challenge ID
                onClick={() => handleJoiningReviewPool(challenge.title)}
              >
                Join Review Pool
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
