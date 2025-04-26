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
import { ChallengeInterface } from "@/lib/interfaces";
import { toast } from "react-toastify";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { Domain, DomainLabels } from "@/constants/system";

// Placeholder function - replace with actual implementation to fetch joined challenges
async function fetchJoinedChallenges(address: `0x${string}`) {
  // This is a placeholder - implement the actual API call
  // For example: return from API or contract call that returns challenges the user has joined
  return []; // You'll implement the actual fetching logic
}

export default function JoinedChallengesView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("date-desc");
  const [joinedChallenges, setJoinedChallenges] = useState<ChallengeInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  async function handleFetchingJoinedChallenges() {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const challenges = await fetchJoinedChallenges(address);
      setJoinedChallenges(challenges);
    } catch (error) {
      toast.error(`Error fetching joined challenges: ${(error as Error).message}`);
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
        return new Date(b.contributeAt || "").getTime() - new Date(a.contributeAt || "").getTime();
      if (sortOption === "date-asc")
        return new Date(a.contributeAt || "").getTime() - new Date(b.contributeAt || "").getTime();
      return 0;
    });

  // Format the category for display (e.g., "software-development" -> "Software Development")
  const formatCategory = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((challenge) => (
            <Card key={challenge.title} className="hover:shadow-lg transition">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">{challenge.title}</h2>
                  <Badge variant={challenge.status === "Pending" ? "outline" : "default"}>
                    {challenge.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {formatCategory(challenge.category || "Undefined")} • Added {formatDistanceToNow(new Date(challenge.contributeAt || ""), { addSuffix: true })}
                </div>
                <div className="flex justify-end mt-4">
                  <Link href={`/dashboard/moderation/review-challenges/${challenge.title}`} passHref>
                    <Button variant="outline">
                      Review Challenge
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
