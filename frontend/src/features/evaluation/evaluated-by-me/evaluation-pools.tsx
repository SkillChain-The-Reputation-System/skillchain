'use client'

// Import hooks
import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

// Import UI components
import { Button } from "@/components/ui/button";
import { SolutionCard } from "@/features/evaluation/solution-card"
import { SolutionSkeleton } from "@/features/evaluation/solution-skeleton"
import { EmptySolution } from "@/features/evaluation/empty-solution";
import SearchBar from "@/features/evaluation/evaluated-by-me/search-bar"
import { Pagination } from "@/components/pagination";

// Import utils
import { fetchUnderReviewSolutionsEvaluator } from "@/lib/fetching-onchain-data-utils";
import { BriefUnderReviewSolution } from "@/lib/interfaces";
import { Domain } from "@/constants/system"
import { pageUrlMapping } from "@/constants/navigation";

interface EvaluationPoolsProps {
  query: string;
  // sort: ChallengeSortOption;
  domain: Domain | null;
  page: number
}

export default function EvaluationPools({ query, domain, page }: EvaluationPoolsProps) {
  const { address } = useAccount();
  const firstLoad = useRef(true);   // avoiding replace url multiple times at first load 
  const router = useRouter();       // programmatically change routes

  const [isLoading, setIsLoading] = useState(false);
  const [solutions, setSolution] = useState<BriefUnderReviewSolution[]>([]);

  const [searchQuery, setSearchQuery] = useState(query);
  const [domainFilter, setDomainFilter] = useState<Domain | null>(domain);

  // pagination state
  const [currentPage, setCurrentPage] = useState(page);
  const itemsPerPage = 8;  // number of challenges displayed per page

  const cardOnClick = (solutionId: `0x${string}`) => {
    router.push(
      pageUrlMapping.evaluation_evaluatedbyme + `/${solutionId}`
    );
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
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

    // params.set("sort", sortOption.toString());

    if (domainFilter != null)
      params.set("domain", domainFilter.toString());

    params.set("page", currentPage.toString());

    router.replace("?" + params.toString());
  }, [searchQuery, domainFilter, currentPage]);

  const searchedSolutions = useMemo(() => {
    return solutions
      .filter(solution => {
        const matchesDomain = domainFilter != null ? solution.category == domainFilter : true;
        const matchesQuery = searchQuery ? solution.challengeTitle?.toLowerCase().includes(searchQuery.toLowerCase()) : true;

        return matchesDomain && matchesQuery;
      })
  }, [solutions, searchQuery, domainFilter]);

  // caculate total pages to display total searched challenges
  const totalPages = Math.ceil(searchedSolutions.length / itemsPerPage);

  // get current page challenges
  const currentSearchedSolutions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, searchedSolutions.length);
    return searchedSolutions.slice(startIndex, endIndex);
  }, [searchedSolutions, currentPage, itemsPerPage])

  useEffect(() => {
    const fetchData = async () => {
      if (!address)
        return;

      setIsLoading(true);
      try {
        const fetchedSolutions = await fetchUnderReviewSolutionsEvaluator(address);
        setSolution(fetchedSolutions);
      } catch (error) {
        console.error("Error fetching under review solutions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [address]);

  return (
    <>
      <SearchBar
        searchQuery={searchQuery}
        domainFilterQuery={domainFilter}
        onSearch={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {
        address && (
          isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
              {[...Array(8)].map((_, index) => (
                <SolutionSkeleton key={index} />
              ))}
            </div>
          ) : solutions.length > 0 ? (
            currentSearchedSolutions.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl mx-auto">
                  {currentSearchedSolutions.map((solution) => (
                    <SolutionCard key={solution.solutionId} solutionPreview={solution} onClick={cardOnClick} forEvaluator />
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center space-y-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-lg font-bold mb-2">No matching evaluations found</h3>
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
            <EmptySolution evaluationWorkspace />
          )
        )
      }
    </>
  );
}