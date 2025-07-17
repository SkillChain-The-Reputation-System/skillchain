"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown } from "lucide-react";
import { Icons } from "@/components/icons";
import { useAccount } from "wagmi";
import {
  fetchPendingChallenges,
  getJoinReviewPoolStatus,
} from "@/lib/fetching-onchain-data-utils";
import { ChallengeInterface } from "@/lib/interfaces";
import { toast } from "react-toastify";
import { joinReviewPool, waitForTransaction } from "@/lib/write-onchain-utils";
import { ChallengeCard } from "./pending-challenge-card";
import { Domain, DomainLabels } from "@/constants/system";
import { Loader2 } from "lucide-react";

export default function PendingChallengesView() {
  const { address } = useAccount();

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Domain[]>([]);
  const [sortOption, setSortOption] = useState("date-desc");
  const [joinFilters, setJoinFilters] = useState<string[]>([]);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleClearSearch = () => setSearch("");
  const handleClearCategoryFilters = () => setSelectedCategories([]);
  const handleClearJoinFilters = () => setJoinFilters([]);
  const handleClearAll = () => {
    handleClearSearch();
    handleClearCategoryFilters();
    handleClearJoinFilters();
    setSortOption("date-desc");
  };

  const toggleCategoryFilter = (cat: Domain) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleJoinFilter = (status: string) => {
    setJoinFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const [allPendingChallenges, setAllPendingChallenges] =
    useState<ChallengeInterface[]>();

  async function handleFetchingAllPendingChallenges() {
    setIsLoading(true);
    await fetchPendingChallenges()
      .then(async (pending_challenges_array: ChallengeInterface[]) => {
        if (address) {
          const withJoin = await Promise.all(
            pending_challenges_array.map(async (ch) => {
              const joined = await getJoinReviewPoolStatus(address, ch.id);
              return { ...ch, isJoined: joined };
            })
          );
          setAllPendingChallenges(withJoin);
        } else {
          setAllPendingChallenges(pending_challenges_array);
        }
      })
      .catch((error: any) => {
        if (error.shortMessage) {
          toast.error(error.shortMessage);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("An error occurred while fetching challenges.");
        }
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
      const txHash = await joinReviewPool(challenge_id as `0x${string}`, address);
      await waitForTransaction(txHash);
      setReload((prev) => !prev); // Trigger a reload to fetch updated data
      toast.success("Successfully joined the review pool!");
    } catch (error: any) {
      if (error.shortMessage) {
        toast.error(error.shortMessage);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred while joining the review pool.");
      }
    } 
  }

  // Fetch user data when the component mounts
  useEffect(() => {
    if (address) {
      handleFetchingAllPendingChallenges();
    }
  }, [address, reload]);

  const hasActiveFilters =
    search.length > 0 ||
    selectedCategories.length > 0 ||
    joinFilters.length > 0 ||
    sortOption !== "date-desc";

  const activeFilterCount =
    selectedCategories.length + joinFilters.length + (sortOption !== "date-desc" ? 1 : 0);

  const filtered = allPendingChallenges
    ? allPendingChallenges
        .filter((challenge) => {
          const matchesSearch = challenge.title
            ?.toLowerCase()
            .includes(search.toLowerCase());
          const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(challenge.category);
          const joinState = challenge.isJoined ? "joined" : "not_joined";
          const matchesJoin =
            joinFilters.length === 0 || joinFilters.includes(joinState);
          return matchesSearch && matchesCategory && matchesJoin;
        })
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
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 py-2">
        <div className="relative w-full">
          <Input
            placeholder="Search challenges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-4 pr-10 rounded-md border border-gray-300 dark:border-gray-700 text-sm w-full"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 w-full md:w-auto flex items-center gap-1">
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="px-1">
                    {activeFilterCount}
                  </Badge>
                )}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <span>Category</span>
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                      {(Object.values(Domain) as unknown as number[])
                        .filter((v) => typeof v === "number")
                        .map((num) => (
                          <DropdownMenuItem
                            key={num}
                            onSelect={(e) => {
                              e.preventDefault();
                              toggleCategoryFilter(num as Domain);
                            }}
                            className="flex items-center justify-between cursor-pointer"
                          >
                            <span>{DomainLabels[num as Domain]}</span>
                            {selectedCategories.includes(num as Domain) && (
                              <Icons.check className="h-4 w-4" />
                            )}
                          </DropdownMenuItem>
                        ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={handleClearCategoryFilters}
                        disabled={selectedCategories.length === 0}
                        className={`${
                          selectedCategories.length === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        Clear filter
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <span>Time</span>
                    {sortOption !== "date-desc" && (
                      <Badge variant="secondary" className="ml-auto">1</Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setSortOption("date-desc");
                        }}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span>Newest First</span>
                        {sortOption === "date-desc" && <Icons.check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setSortOption("date-asc");
                        }}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <span>Oldest First</span>
                        {sortOption === "date-asc" && <Icons.check className="h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setSortOption("date-desc")}
                        disabled={sortOption === "date-desc"}
                        className={`${
                          sortOption === "date-desc"
                            ? "text-gray-400 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        Clear filter
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <span>Participation</span>
                    {joinFilters.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {joinFilters.length}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {[
                        { key: "joined", label: "Participated" },
                        { key: "not_joined", label: "Not Participated" },
                      ].map((opt) => (
                        <DropdownMenuItem
                          key={opt.key}
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleJoinFilter(opt.key);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>{opt.label}</span>
                          {joinFilters.includes(opt.key) && (
                            <Icons.check className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={handleClearJoinFilters}
                        disabled={joinFilters.length === 0}
                        className={`${
                          joinFilters.length === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        Clear filter
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={!hasActiveFilters}
                onSelect={handleClearAll}
                className="text-center justify-center font-medium cursor-pointer"
              >
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 my-2">
          {search && (
            <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
              Search: {search}
              <span className="cursor-pointer" onClick={handleClearSearch}>
                <X size={14} />
              </span>
            </Badge>
          )}
          {selectedCategories.map((cat) => (
            <Badge key={`cat-${cat}`} variant="secondary" className="px-3 py-1 flex items-center gap-1">
              Category: {DomainLabels[cat]}
              <span className="cursor-pointer" onClick={() => toggleCategoryFilter(cat)}>
                <X size={14} />
              </span>
            </Badge>
          ))}
          {joinFilters.map((j) => (
            <Badge key={`join-${j}`} variant="secondary" className="px-3 py-1 flex items-center gap-1">
              {j === "joined" ? "Participated" : "Not Participated"}
              <span className="cursor-pointer" onClick={() => toggleJoinFilter(j)}>
                <X size={14} />
              </span>
            </Badge>
          ))}
          {sortOption !== "date-desc" && (
            <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
              Sort: {sortOption === "date-asc" ? "Oldest First" : "Newest First"}
              <span className="cursor-pointer" onClick={() => setSortOption("date-desc")}>
                <X size={14} />
              </span>
            </Badge>
          )}
        </div>
      )}

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
