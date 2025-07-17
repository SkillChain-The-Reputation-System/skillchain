"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { X, ChevronDown } from "lucide-react";
import { Icons } from "@/components/icons";
import {
  ChallengeStatus,
  Domain,
  DomainLabels,
  ChallengeStatusLabels,
  ReviewStatus,
  ReviewStatusLabels,
} from "@/constants/system";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Search...",
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedCategories, setSelectedCategories] = React.useState<Domain[]>([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<ChallengeStatus[]>([]);
  const [selectedReviewStatuses, setSelectedReviewStatuses] = React.useState<ReviewStatus[]>([]);
  const [filteredData, setFilteredData] = React.useState<TData[]>(data);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const getAllCategories = () => {
    return Object.keys(Domain)
      .filter((key) => !isNaN(Number(key)))
      .map((key) => Number(key) as Domain);
  };

  const getAllStatuses = () => {
    return Object.keys(ChallengeStatus)
      .filter((key) => !isNaN(Number(key)))
      .map((key) => Number(key) as ChallengeStatus);
  };

  const getAllReviewStatuses = () => {
    return [ReviewStatus.NOT_SUBMITTED, ReviewStatus.SUBMITTED];
  };

  const handleClearSearch = () => setSearchTerm("");
  const handleClearCategoryFilters = () => setSelectedCategories([]);
  const handleClearStatusFilters = () => setSelectedStatuses([]);
  const handleClearReviewStatusFilters = () => setSelectedReviewStatuses([]);
  const handleClearAll = () => {
    handleClearSearch();
    handleClearCategoryFilters();
    handleClearStatusFilters();
    handleClearReviewStatusFilters();
  };

  const toggleCategoryFilter = (cat: Domain) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleStatusFilter = (status: ChallengeStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const toggleReviewStatusFilter = (rs: ReviewStatus) => {
    setSelectedReviewStatuses((prev) =>
      prev.includes(rs) ? prev.filter((r) => r !== rs) : [...prev, rs]
    );
  };

  const hasActiveFilters =
    searchTerm.length > 0 ||
    selectedCategories.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedReviewStatuses.length > 0;

  const activeFilterCount =
    selectedCategories.length +
    selectedStatuses.length +
    selectedReviewStatuses.length;

  React.useEffect(() => {
    let filtered = [...data] as any[];

    if (searchTerm) {
      filtered = filtered.filter((item) => {
        return searchColumn
          ? (item as any)[searchColumn]
              ?.toString()
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          : true;
      });
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((item) =>
        selectedCategories.includes((item as any).category)
      );
    }

    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((item) =>
        selectedStatuses.includes((item as any).status)
      );
    }

    if (selectedReviewStatuses.length > 0) {
      filtered = filtered.filter((item) => {
        const submitted = (item as any).reviewSubmitted ? ReviewStatus.SUBMITTED : ReviewStatus.NOT_SUBMITTED;
        return selectedReviewStatuses.includes(submitted);
      });
    }

    setFilteredData(filtered as TData[]);
  }, [data, searchTerm, selectedCategories, selectedStatuses, selectedReviewStatuses, searchColumn]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 py-2">
        <div className="relative w-full">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-10 pl-4 pr-10 rounded-md border border-gray-300 dark:border-gray-700 text-sm"
          />
          {searchTerm && (
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
                      {getAllCategories().map((cat) => (
                        <DropdownMenuItem
                          key={cat}
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleCategoryFilter(cat);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>{DomainLabels[cat]}</span>
                          {selectedCategories.includes(cat) && (
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
                    <span>Challenge Status</span>
                    {selectedStatuses.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {selectedStatuses.length}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                      {getAllStatuses().map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleStatusFilter(status);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>{ChallengeStatusLabels[status]}</span>
                          {selectedStatuses.includes(status) && (
                            <Icons.check className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={handleClearStatusFilters}
                        disabled={selectedStatuses.length === 0}
                        className={`${
                          selectedStatuses.length === 0
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
                    <span>Review Status</span>
                    {selectedReviewStatuses.length > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {selectedReviewStatuses.length}
                      </Badge>
                    )}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                      {getAllReviewStatuses().map((rs) => (
                        <DropdownMenuItem
                          key={rs}
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleReviewStatusFilter(rs);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span>{ReviewStatusLabels[rs]}</span>
                          {selectedReviewStatuses.includes(rs) && (
                            <Icons.check className="h-4 w-4" />
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={handleClearReviewStatusFilters}
                        disabled={selectedReviewStatuses.length === 0}
                        className={`${
                          selectedReviewStatuses.length === 0
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
          {searchTerm && (
            <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1">
              Search: {searchTerm}
              <span className="cursor-pointer" onClick={handleClearSearch}>
                <X size={14} />
              </span>
            </Badge>
          )}
          {selectedCategories.map((cat) => (
            <Badge key={`cat-${cat}`} variant="secondary" className="px-3 py-1 flex items-center gap-1">
              Category: {DomainLabels[cat]}
              <span
                className="cursor-pointer"
                onClick={() =>
                  setSelectedCategories((prev) => prev.filter((c) => c !== cat))
                }
              >
                <X size={14} />
              </span>
            </Badge>
          ))}
          {selectedStatuses.map((status) => (
            <Badge key={`status-${status}`} variant="secondary" className="px-3 py-1 flex items-center gap-1">
              Status: {ChallengeStatusLabels[status]}
              <span
                className="cursor-pointer"
                onClick={() =>
                  setSelectedStatuses((prev) => prev.filter((s) => s !== status))
                }
              >
                <X size={14} />
              </span>
            </Badge>
          ))}
          {selectedReviewStatuses.map((rs) => (
            <Badge key={`review-${rs}`} variant="secondary" className="px-3 py-1 flex items-center gap-1">
              Review: {ReviewStatusLabels[rs]}
              <span
                className="cursor-pointer"
                onClick={() =>
                  setSelectedReviewStatuses((prev) => prev.filter((r) => r !== rs))
                }
              >
                <X size={14} />
              </span>
            </Badge>
          ))}
        </div>
      )}
      <div className="rounded-md border border-gray-300 dark:border-input shadow-sm w-full">
        <Table className="border-collapse table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const size = header.column.columnDef.size as number | undefined;
                  return (
                    <TableHead
                      key={header.id}
                      style={size ? { width: `${size}px` } : {}}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 p-0 border-b-0">
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    const size = cell.column.columnDef.size as number | undefined;
                    return (
                      <TableCell key={cell.id} style={size ? { width: `${size}px` } : {}}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
