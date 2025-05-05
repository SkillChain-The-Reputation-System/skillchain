'use client'

import { useState, useEffect, useMemo } from "react";
import SearchBar from "./search-bar"
import { ExploreChallengeCard } from "./explore-challenge-card";
import { EmptyChallenge } from "./empty-challenge";
import { fetchApprovedChallenges } from "@/lib/fetching-onchain-data-utils"
import { Button } from "@/components/ui/button";
import { ChallengeInterface } from "@/lib/interfaces";
import { ChallengeSortOption, Domain } from "@/constants/system"

export default function Explore() {
  const [isLoading, setIsLoading] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeInterface[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<ChallengeSortOption>(ChallengeSortOption.NEWEST);
  const [domainFilter, setDomainFilter] = useState<Domain | null | undefined>();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  }

  const handleSort = (sort: ChallengeSortOption) => {
    setSortOption(sort);
  }

  const handleFilterChange = (filters: {
    domain: Domain | null,
    // status: StatusFilter
    // difficulty: DifficultyFilter
  }) => {
    setDomainFilter(filters.domain);
  }

  const handleClearFilter = () => {
    setSearchQuery("");
    setDomainFilter(null);
  }

  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true);
      try {
        const fetchedChallenges = await fetchApprovedChallenges();
        setChallenges(fetchedChallenges);
      } catch (error) {
        console.error("Error fetching approved challenges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const searchedChallenges = useMemo(() => {
    return challenges
      .filter(challenge => {
        const matchesDomain = domainFilter != null ? challenge.category == domainFilter : true;
        const matchesQuery = searchQuery ?
          challenge.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          challenge.description?.toLowerCase().includes(searchQuery.toLowerCase()) : true;

        return matchesDomain && matchesQuery;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case ChallengeSortOption.QUALITY:
            return Number(b.qualityScore) - Number(a.qualityScore);
          // case ChallengeSortOption.VOTES:
          //   return Number(b.totalVotes ?? 0) - Number(a.totalVotes ?? 0);
          // case ChallengeSortOption.PARTICIPANTS:
          //   return Number(b.totalParticipants ?? 0) - Number(a.totalParticipants ?? 0);
          case ChallengeSortOption.NEWEST:
          default:
            return Number(b.contributeAt) - Number(a.contributeAt);
        }
      });
  }, [challenges, domainFilter, searchQuery, sortOption])

  return (
    <>
      <SearchBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onSortChange={handleSort}
        searchQuery={searchQuery}
        sortOption={sortOption}
        domainFilter={domainFilter}
      />

      {
        isLoading ? (
          <p>
            Loading...
          </p>
        ) : challenges.length > 0 ? (
          searchedChallenges.length > 0 ? (
            <div className="grid grid-cols-4 gap-5 w-full max-w-6xl mx-auto">
              {searchedChallenges.map((challenge, index) => (
                <ExploreChallengeCard key={index} challenge={challenge} primaryButton={null} showModerators={false} allowShowDetailDialog={false} showStatus={false} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-bold mb-2">No matching challenges found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button
                variant="outline"
                className="bg-gray-300"
                onClick={handleClearFilter}
              >
                Clear All Filters
              </Button>
            </div>
          )
        ) : (
          <div>
            <EmptyChallenge />
          </div>
        )
      }
    </>
  )
}