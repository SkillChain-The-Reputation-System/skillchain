'use client'

// Import hooks
import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation";

// Import UI components
import { Button } from "@/components/ui/button";
import { SolutionCard } from "@/features/evaluation/solution-card"
import { SolutionSkeleton } from "@/features/evaluation/solution-skeleton"
import { EmptySolution } from "@/features/evaluation/empty-solution";
import SearchBar from "@/features/evaluation/pending-solutions/search-bar"
import { Pagination } from "@/components/pagination";

// Import utils
import { fetchUnderReviewSolutions } from "@/lib/fetching-onchain-data-utils";
import { BriefUnderReviewSolution } from "@/lib/interfaces";
import { Domain, SolutionSortOption } from "@/constants/system"
import { pageUrlMapping } from "@/constants/navigation";

interface PendingSolutionsProps {
  query: string;
  sort: SolutionSortOption;
  domain: Domain | null;
  page: number
}

export default function PendingSolutions({ query, sort, domain, page }: PendingSolutionsProps) {
  const firstLoad = useRef(true);   // avoiding replace url multiple times at first load 
  const router = useRouter();       // programmatically change routes

  const [isLoading, setIsLoading] = useState(false);
  const [solutions, setSolution] = useState<BriefUnderReviewSolution[]>([]);

  // for searching and filtering
  const [searchQuery, setSearchQuery] = useState(query);
  const [sortOption, setSortOption] = useState<SolutionSortOption>(sort);
  const [domainFilter, setDomainFilter] = useState<Domain | null>(domain);

  // pagination state
  const [currentPage, setCurrentPage] = useState(page);
  const itemsPerPage = 8;  // number of challenges displayed per page

  const cardOnClick = (solutionId: `0x${string}`) => {
    router.push(
      pageUrlMapping.evaluation_pendingsolutions + `/${solutionId}`
    );
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  const handleSort = (sort: SolutionSortOption) => {
    setSortOption(sort);
  }

  const handleFilterChange = (filters: {
    domain: Domain | null,
  }) => {
    setDomainFilter(filters.domain);
    setCurrentPage(1);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  const handleClearFilter = (): void => {
    setSearchQuery("");
    setDomainFilter(null);
    setSortOption(SolutionSortOption.NEWEST); // Reset to default sort option
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

  const searchedSolutions = useMemo(() => {
    return solutions
      .filter(solution => {
        const matchesDomain = domainFilter != null ? solution.category == domainFilter : true;
        const matchesQuery = searchQuery ? solution.challengeTitle?.toLowerCase().includes(searchQuery.toLowerCase()) : true;

        return matchesDomain && matchesQuery;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case SolutionSortOption.LEAST_EVALUATORS:
            return Number(a.numberOfEvaluators ?? 0) - Number(b.numberOfEvaluators ?? 0);
          case SolutionSortOption.MOST_EVALUATORS:
            return Number(b.numberOfEvaluators ?? 0) - Number(a.numberOfEvaluators ?? 0);
          case SolutionSortOption.NEWEST:
          default:
            return Number(b.submittedAt) - Number(a.submittedAt);
        }
      });
  }, [solutions, searchQuery, sortOption, domainFilter]);

  // caculate total pages to display total searched challenges
  const totalPages = Math.ceil(searchedSolutions.length / itemsPerPage);

  // get current page challenges
  const currentSearchedSolutions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, searchedSolutions.length);
    return searchedSolutions.slice(startIndex, endIndex);
  }, [searchedSolutions, currentPage, itemsPerPage])

  // fetch data once
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedSolutions = await fetchUnderReviewSolutions();
        setSolution(fetchedSolutions);
      } catch (error) {
        console.error("Error fetching under review solutions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <SearchBar
        onSearch={handleSearchChange}
        onSortChange={handleSort}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        sortOptionQuery={sortOption}
        domainFilterQuery={domainFilter}
      />

      {
        isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {[...Array(8)].map((_, index) => (
              <SolutionSkeleton key={index} />
            ))}
          </div>
        ) : solutions.length > 0 ? (
          currentSearchedSolutions.length > 0 ? (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
                {currentSearchedSolutions.map((solution) => (
                  <SolutionCard key={solution.solutionId} solutionPreview={solution} onClick={cardOnClick} />
                ))}
              </div>

              <div className="mt-8 flex flex-col items-center space-y-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-lg font-bold mb-2">No matching solutions found</h3>
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
          <EmptySolution />
        )
      }
    </div>
  );
}