'use client'

// Import hooks
import { useState, useEffect } from "react"

// Import lucide-react icons
import {
  Search,
  X,
  Filter,
  Check,
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
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

// Import utils
import {
  Domain,
  DomainLabels,
} from "@/constants/system"
import type React from "react"

interface SolutionSearchProps {
  onSearch: (query: string) => void,
  onFilterChange: (filters: {
    domain: Domain | null,
  }) => void,
  searchQuery: string,
  domainFilterQuery: Domain | null,
}

export default function SearchBar({ onSearch, onFilterChange, searchQuery, domainFilterQuery }: SolutionSearchProps) {
  const [query, setQuery] = useState(searchQuery);
  const [domainFilter, setDomainFilter] = useState<Domain | null>(domainFilterQuery);

  const handleSearchChange = (input: string) => {
    onSearch(input);
  }

  const handleDomainChange = (domain: Domain | null) => {
    onFilterChange({
      domain,
    })
  }

  const handleClearFilters = () => {
    onFilterChange({
      domain: null,
    })
  }

  useEffect(() => {
    setQuery(searchQuery);;
    setDomainFilter(domainFilterQuery);
  }, [searchQuery, domainFilterQuery]);

  const activeFilterCount = (domainFilter != null ? 1 : 0)

  return (
    <div className="w-full max-w-6xl mb-6">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search solutions..."
            className="pl-10 pr-10 border-black dark:border-white border"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => handleSearchChange("")}
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
                    {domainFilter != null && (
                      <Badge variant="secondary" className="ml-auto">
                        {DomainLabels[domainFilter as Domain]}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="border-black dark:border-white border">
                      <DropdownMenuItem onClick={() => handleDomainChange(null)}>
                        <span>All Domains</span>
                        {domainFilter == null && <Check className="ml-auto h-4 w-4" />}
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
          {domainFilter != null && (
            <Badge variant="secondary" className="gap-1">
              Domain: {DomainLabels[domainFilter as Domain]}
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