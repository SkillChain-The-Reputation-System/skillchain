'use client'

// Import hooks
import { useState, useEffect, useMemo, useRef } from "react"
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

// Import UI components
import { WorkspaceCard } from "@/features/participation/workspace/workspace-card";
import { ChallengeSkeleton } from "@/features/participation/challenge-skeleton";
import { EmptyChallenge } from "@/features/participation/empty-challenge";
import SearchBar from "@/features/participation/workspace/search-bar"
import { Pagination } from "@/features/participation/pagination";

// Import utils
import { JoinedChallengePreview } from "@/lib/interfaces"
import { fetchJoinedChallengesPreviewByUser } from "@/lib/fetching-onchain-data-utils";
import { pageUrlMapping } from "@/constants/navigation";
import { ChallengeSolutionProgress, Domain } from "@/constants/system"
import { Button } from "@/components/ui/button";

interface WorkspaceProps {
  query: string;
  // sort: ChallengeSortOption;
  domain: Domain | null;
  progress: ChallengeSolutionProgress | null;
  page: number
}

export default function Workspace({ query, domain, progress, page }: WorkspaceProps) {
  const firstLoad = useRef(true);   // avoiding replace url multiple times at first load 

  const { address } = useAccount();
  const [previewList, setPreviewList] = useState<JoinedChallengePreview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(query);
  const [domainFilter, setDomainFilter] = useState<Domain | null>(domain);
  const [progressFilter, setProgressFilter] = useState<ChallengeSolutionProgress | null>(progress);

  // pagination state
  const [currentPage, setCurrentPage] = useState(page);
  const itemsPerPage = 6;  // number of challenges displayed per page

  const cardOnClick = (id: string) => {
    router.push(
      pageUrlMapping.participation_workspace + `/${id}`
    );
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }

  const handleFilterChange = (filters: {
    domain: Domain | null,
    progress: ChallengeSolutionProgress | null
  }) => {
    setDomainFilter(filters.domain);
    setProgressFilter(filters.progress);
    setCurrentPage(1);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  }

  const handleClearFilter = () => {
    setSearchQuery("");
    setDomainFilter(null);
    setProgressFilter(null);
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

    if (progressFilter != null)
      params.set("progress", progressFilter.toString());

    params.set("page", currentPage.toString());

    router.replace("?" + params.toString());
  }, [searchQuery, domainFilter, progressFilter, currentPage]);

  // fetch data once
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!address)
        return;

      setIsLoading(true);
      try {
        const fetchedLists = await fetchJoinedChallengesPreviewByUser(address);
        setPreviewList(fetchedLists);
      } catch (error) {
        console.error("Error fetching approved challenges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [address]);

  const searchedPreviews = useMemo(() => {
    return previewList
      .filter(preview => {
        const matchesDomain = domainFilter != null ? preview.category == domainFilter : true;
        const matchesProgress = progressFilter != null ? preview.progress == progressFilter : true;
        const matchesQuery = searchQuery ? preview.title?.toLowerCase().includes(searchQuery.toLowerCase()) : true;

        return matchesDomain && matchesProgress && matchesQuery;
      })
    // .sort((a, b) => {
    //   switch (true) {
    //     // case ChallengeSortOption.QUALITY:
    //     //   return Number(b.qualityScore) - Number(a.qualityScore);
    //     // // case ChallengeSortOption.VOTES:
    //     // //   return Number(b.totalVotes ?? 0) - Number(a.totalVotes ?? 0);
    //     // // case ChallengeSortOption.PARTICIPANTS:
    //     // //   return Number(b.totalParticipants ?? 0) - Number(a.totalParticipants ?? 0);
    //     // case ChallengeSortOption.NEWEST:
    //     default:
    //       return Number(b.joinedAt) - Number(a.joinedAt);
    //   }
    // });
  }, [previewList, searchQuery, domainFilter, progressFilter]);

  // caculate total pages to display total searched challenges
  const totalPages = Math.ceil(searchedPreviews.length / itemsPerPage);

  // get current page challenges
  const currentSearchedPreviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, searchedPreviews.length);
    return searchedPreviews.slice(startIndex, endIndex);
  }, [searchedPreviews, currentPage, itemsPerPage])

  return (
    <>
      <SearchBar
        searchQuery={searchQuery}
        domainFilterQuery={domainFilter}
        progressFilterQuery={progressFilter}
        onSearch={handleSearchChange}
        onFilterChange={handleFilterChange}
      />

      {
        address && (
          isLoading ? (
            <div className="grid grid-cols-1 w-full max-w-5xl mx-auto">
              {[...Array(8)].map((_, index) => (
                <ChallengeSkeleton key={index} />
              ))}
            </div>
          ) : previewList.length > 0 ? (
            currentSearchedPreviews.length > 0 ? (
              <div className="w-full max-w-6xl mx-auto">
                <div className="grid grid-cols-3 gap-4">
                  {currentSearchedPreviews.map((challengePreview, index) => (
                    <WorkspaceCard key={index} previewChallenge={challengePreview} onClick={cardOnClick} />
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center space-y-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-bold mb-2">No matching works found</h3>
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
              <EmptyChallenge workSpacePreview={true} />
            </div>
          )
        )
      }
    </>
  )
}