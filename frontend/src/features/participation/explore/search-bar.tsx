'use client'

// Import hooks
import { useState, useEffect } from "react"

// Import lucide-react icons
import {
  Search,
  X,
  Filter,
  Check,
  ArrowUpDown
} from "lucide-react"

// Import UI components
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Import utils
import {
  ChallengeSortOption,
  ChallengeSortOptionLabels,
  Domain,
  DomainLabels
} from "@/constants/system"
import type React from "react"

interface ChallengeSearchProps {
  onSearch: (query: string) => void,
  onFilterChange: (filters: {
    domain: Domain | null,
  }) => void,
  onSortChange: (sort: ChallengeSortOption) => void,
  searchQuery?: string,
  sortOption?: ChallengeSortOption,
  domainFilter?: Domain | null | undefined,
}

export default function SearchBar({
  onSearch,
  onFilterChange,
  onSortChange,
  searchQuery = "",
  sortOption = ChallengeSortOption.NEWEST,
  domainFilter = null
}: ChallengeSearchProps
) {
  const [searchLocalQuery, setSearchLocalQuery] = useState(searchQuery);
  const [sortLocalOption, setSortLocalOption] = useState<ChallengeSortOption>(sortOption);
  const [domainLocalFilter, setDomainLocalFilter] = useState<Domain | null | undefined>(domainFilter);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    onSearch(query);
  };

  const handleClearSearch = () => {
    onSearch("");
  }

  const handleSortChange = (sort: ChallengeSortOption) => {
    onSortChange(sort);
  };

  const handleDomainChange = (domain: Domain | null) => {
    onFilterChange({
      domain,
      // status: statusFilter,
      // difficulty: difficultyFilter,
    })
  }

  const handleClearFilters = () => {
    onFilterChange({
      domain: null,
      // status: statusFilter,
      // difficulty: difficultyFilter,
    })
  }

  const activeFilterCount = (domainLocalFilter != null ? 1 : 0);
  // + (statusFilter !== "all" ? 1 : 0) + (difficultyFilter !== "all" ? 1 : 0)

  useEffect(() => {
    setSearchLocalQuery(searchQuery);
    setSortLocalOption(sortOption);
    setDomainLocalFilter(domainFilter);
  }, [searchQuery, sortOption, domainFilter]);

  return (
    <div className="w-full max-w-6xl mb-6">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchLocalQuery}
            onChange={handleSearchChange}
            placeholder="Search challenges..."
            className="pl-10 pr-10 border-black dark:border-white border"
          />
          {searchLocalQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-full px-3 text-sm gap-1 border-black dark:border-white border">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                {ChallengeSortOptionLabels[sortLocalOption as ChallengeSortOption]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-50 border-black dark:border-white border">
              <DropdownMenuLabel>Sort Challenges</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortLocalOption.toString()}
                onValueChange={(value) => handleSortChange(Number(value) as ChallengeSortOption)}
              >
                {
                  (Object.values(ChallengeSortOption) as unknown as number[])
                    .filter((v) => typeof v === "number")
                    .map((num) => (
                      <DropdownMenuRadioItem key={num} value={num.toString()}>
                        {ChallengeSortOptionLabels[num as ChallengeSortOption]}
                      </DropdownMenuRadioItem>
                    ))
                }
              </DropdownMenuRadioGroup>

            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-full px-3 text-sm gap-1 border-black dark:border-white border">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-black dark:border-white border">
              <DropdownMenuLabel>Filter Challenges</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>Domain</span>
                    {domainLocalFilter != null && (
                      <Badge variant="secondary" className="ml-auto">
                        {DomainLabels[domainLocalFilter as Domain]}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="border-black dark:border-white border">
                      <DropdownMenuItem onClick={() => handleDomainChange(null)}>
                        <span>All Domains</span>
                        {domainLocalFilter == null && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {
                        (Object.values(Domain) as unknown as number[])
                          .filter((v) => typeof v === "number")
                          .map((num) => (
                            <DropdownMenuItem key={num} onClick={() => handleDomainChange(num)}>
                              {DomainLabels[num as Domain]}
                            </DropdownMenuItem>
                          ))
                      }
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>

                {/* Add more filter with dropdown menu sub here */}

              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={activeFilterCount === 0}
                onClick={handleClearFilters}
                className="text-center justify-center font-medium"
              >
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {domainLocalFilter != null && (
            <Badge variant="secondary" className="gap-1">
              Domain: {DomainLabels[domainLocalFilter as Domain]}
              <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1 cursor-pointer" onClick={() => handleDomainChange(null)}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove domain filter</span>
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}