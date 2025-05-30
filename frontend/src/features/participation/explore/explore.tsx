'use client'

// Impork hooks
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

// Import UI components
import SearchBar from "@/features/participation/explore/search-bar"
import { Button } from "@/components/ui/button";
import { ChallengeCard } from "@/features/participation/explore/challenge-card";
import { ChallengeSkeleton } from "@/features/participation/challenge-skeleton";
import { EmptyChallenge } from "@/features/participation/empty-challenge";
import { Pagination } from "@/components/pagination";

// Import utils
import { ChallengeInterface } from "@/lib/interfaces";
import { ChallengeSortOption, Domain } from "@/constants/system"
import { fetchApprovedChallenges } from "@/lib/fetching-onchain-data-utils"
import { pageUrlMapping } from "@/constants/navigation";

interface ExploreProps {
  query: string;
  sort: ChallengeSortOption;
  domain: Domain | null;
  page: number
}

export default function Explore({ query, sort, domain, page }: ExploreProps) {
  const firstLoad = useRef(true);   // avoiding replace url multiple times at first load 
  const router = useRouter();       // programmatically change routes
  const [isLoading, setIsLoading] = useState(false);      // loading state while fetching data
  const [challenges, setChallenges] = useState<ChallengeInterface[]>([]);   // store fetched challenges

  // search and filter state
  const [searchQuery, setSearchQuery] = useState(query);
  const [sortOption, setSortOption] = useState<ChallengeSortOption>(sort);
  const [domainFilter, setDomainFilter] = useState<Domain | null>(domain);
  // pagination state
  const [currentPage, setCurrentPage] = useState(page);
  const itemsPerPage = 8;  // number of challenges displayed per page

  const cardOnClick = (id: string) => {
    router.push(
      pageUrlMapping.participation_explore + `/${id}`
    );
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
    setCurrentPage(1);
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
      params.set("query", searchQuery);

    params.set("sort", sortOption.toString());

    if (domainFilter != null)
      params.set("domain", domainFilter.toString());

    params.set("page", currentPage.toString());

    router.replace("?" + params.toString());
  }, [searchQuery, sortOption, domainFilter, currentPage]);

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
          case ChallengeSortOption.PARTICIPANTS:
            return Number(b.completed ?? 0) - Number(a.completed ?? 0);
          case ChallengeSortOption.NEWEST:
          default:
            return Number(b.contributeAt) - Number(a.contributeAt);
        }
      });
  }, [challenges, domainFilter, searchQuery, sortOption]);

  // caculate total pages to display total searched challenges
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
            {[...Array(itemsPerPage)].map((_, index) => (
              <ChallengeSkeleton key={index} />
            ))}
          </div>
        ) : challenges.length > 0 ? (
          currentSearchedChallenges.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
                {currentSearchedChallenges.map((challenge, index) => (
                  <ChallengeCard key={index} challenge={challenge} onClick={cardOnClick} />
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center space-y-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-lg font-bold mb-2">No matching challenges found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              <Button
                className="cursor-pointer"
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