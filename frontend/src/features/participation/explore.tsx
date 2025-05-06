'use client'

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "./search-bar"
import { ExploreChallengeCard } from "./explore-challenge-card";
import { Pagination } from './pagination'
import { EmptyChallenge } from "./empty-challenge";
import { ExploreSkeleton } from "./explore-skeleton";
import { fetchApprovedChallenges } from "@/lib/fetching-onchain-data-utils"
import { Button } from "@/components/ui/button";
import { ChallengeInterface } from "@/lib/interfaces";
import { ChallengeSortOption, Domain } from "@/constants/system"

export default function Explore() {
  const firstLoad = useRef(true);           // avoiding replace url multiple times at first load 

  const searchParams = useSearchParams();   // read current url's query string
  const router = useRouter();               // programmatically change routes

  const [isLoading, setIsLoading] = useState(false);         // loading state while fetching data

  // search and filter state
  const [challenges, setChallenges] = useState<ChallengeInterface[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<ChallengeSortOption>(ChallengeSortOption.NEWEST);
  const [domainFilter, setDomainFilter] = useState<Domain | null | undefined>();

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;  // number of challenges displayed per page

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleClearFilter = () => {
    setSearchQuery("");
    setDomainFilter(null);
  }

  // replace url when user passes new query
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (searchQuery)
      params.set("search", searchQuery);

    params.set("sort", sortOption.toString());

    if (domainFilter != null)
      params.set("domain", domainFilter.toString());

    params.set("page", currentPage.toString());

    router.replace("?" + params.toString());
  }, [searchQuery, sortOption, domainFilter, currentPage]);

  // search challenges based on url
  useEffect(() => {
    const query = searchParams.get("search") ?? "";
    const sort = (Number(searchParams.get("sort")) as ChallengeSortOption) ?? ChallengeSortOption.NEWEST;
    const domain = searchParams.has("domain") ? (Number(searchParams.get("domain")) as Domain) : null;
    const page = searchParams.has("page") ? Number(searchParams.get("page")) : 1;

    setSearchQuery(query);
    setSortOption(sort);
    setDomainFilter(domain);
    setCurrentPage(page)
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortOption, domainFilter]);

  // fetch data once
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

  // filter and sort challenges
  const searchedChallenges = useMemo(() => {
    return challenges
      .filter(challenge => {
        const matchesDomain = domainFilter != null ? challenge.category == domainFilter : true;
        const matchesQuery = searchQuery ? challenge.title?.toLowerCase().includes(searchQuery.toLowerCase()) : true;

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
  }, [challenges, domainFilter, searchQuery, sortOption]);

  const totalPages = Math.ceil(searchedChallenges.length / itemsPerPage);

  // get current page challenges
  const currentSearchedChallenges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, searchedChallenges.length);
    return searchedChallenges.slice(startIndex, endIndex);
  }, [searchedChallenges, currentPage, itemsPerPage])

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
          <div className="grid grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {[...Array(8)].map((_, index) => (
              <ExploreSkeleton key={index} />
            ))}
          </div>
        ) : challenges.length > 0 ? (
          currentSearchedChallenges.length > 0 ? (
            <div>
              <div className="grid grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
                {currentSearchedChallenges.map((challenge, index) => (
                  <ExploreChallengeCard key={index} challenge={challenge} />
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center space-y-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
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