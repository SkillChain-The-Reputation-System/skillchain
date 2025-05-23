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
import { ChevronDown, Loader2, X, Clock } from "lucide-react";

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
  Domain,
  DomainLabels,
  JobDuration,
  JobDurationLabels,
  JobApplicationStatus,
  ApplicationStatusLabels,
} from "@/constants/system";
import { DomainIconMap } from "@/constants/data";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { JobApplicationWithJobDataInterface } from "@/lib/interfaces";

interface ApplicationsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function ApplicationsTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  isLoading = false,
}: ApplicationsTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedDurations, setSelectedDurations] = React.useState<
    JobDuration[]
  >([]);
  const [selectedStatuses, setSelectedStatuses] = React.useState<
    JobApplicationStatus[]
  >([]);
  const [filteredData, setFilteredData] = React.useState<TData[]>(data);

  // Update filtered data when data, search term, or filters change
  React.useEffect(() => {
    let filtered = [...data]; // Filter by search term (in title or location)
    if (searchTerm) {
      filtered = filtered.filter((item: any) => {
        return (
          (item.job?.title &&
            item.job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.job?.description &&
            item.job.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Filter by selected durations
    if (selectedDurations.length > 0) {
      filtered = filtered.filter((item: any) => {
        if (!item.job?.duration) return false;
        return selectedDurations.includes(item.job.duration);
      });
    }

    // Filter by selected statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((item: any) => {
        return selectedStatuses.includes(item.status);
      });
    }

    setFilteredData(filtered);
  }, [data, searchTerm, selectedDurations, selectedStatuses]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  }); // Get all durations and statuses for filtering from enums
  const getAllDurations = () => {
    return Object.keys(JobDuration)
      .filter((key) => !isNaN(Number(key)))
      .map((key) => Number(key) as JobDuration);
  };

  const getAllStatuses = () => {
    return Object.keys(JobApplicationStatus)
      .filter((key) => !isNaN(Number(key)))
      .map((key) => Number(key) as JobApplicationStatus);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };
  const handleClearFilters = () => {
    setSelectedDurations([]);
    setSelectedStatuses([]);
  };
  const toggleDurationFilter = (duration: JobDuration) => {
    setSelectedDurations((prev) =>
      prev.includes(duration)
        ? prev.filter((d) => d !== duration)
        : [...prev, duration]
    );
  };

  const toggleStatusFilter = (status: JobApplicationStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };
  const allDurations = getAllDurations();
  const allStatuses = getAllStatuses();
  const hasActiveFilters =
    selectedDurations.length > 0 ||
    selectedStatuses.length > 0 ||
    searchTerm.length > 0;

  return (
    <div className="mb-10 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 py-2">
        <div className="relative w-full md:w-1/3">
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

        <div className="flex space-x-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 w-full md:w-auto">
                <span>Filter</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Duration filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Duration</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {allDurations.map((duration) => (
                    <DropdownMenuItem
                      key={duration}
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleDurationFilter(duration);
                      }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{JobDurationLabels[duration]}</span>
                      </div>
                      {selectedDurations.includes(duration) && (
                        <Icons.check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {/* Status filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Status</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {allStatuses.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleStatusFilter(status);
                      }}
                      className="flex items-center justify-between"
                    >
                      <span>{ApplicationStatusLabels[status]}</span>
                      {selectedStatuses.includes(status) && (
                        <Icons.check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleClearFilters}
                disabled={!hasActiveFilters}
                className={`${
                  !hasActiveFilters
                    ? "text-gray-400 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                Clear all filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Show active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 my-2">
          {searchTerm && (
            <Badge
              variant="secondary"
              className="px-3 py-1 flex items-center gap-1"
            >
              Search: {searchTerm}
              <span className="cursor-pointer" onClick={handleClearSearch}>
                <X size={14} />
              </span>
            </Badge>
          )}
          {selectedDurations.map((duration) => (
            <Badge
              key={duration}
              variant="secondary"
              className="px-3 py-1 flex items-center gap-1"
            >
              {JobDurationLabels[duration]}
              <span
                className="cursor-pointer"
                onClick={() => toggleDurationFilter(duration)}
              >
                <X size={14} />
              </span>
            </Badge>
          ))}
          {selectedStatuses.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="px-3 py-1 flex items-center gap-1"
            >
              {ApplicationStatusLabels[status]}
              <span
                className="cursor-pointer"
                onClick={() => toggleStatusFilter(status)}
              >
                <X size={14} />
              </span>
            </Badge>
          ))}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading applications...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No applications found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {hasActiveFilters
            ? `Showing ${table.getRowModel().rows.length} of ${
                data.length
              } applications`
            : `${data.length} applications total`}
        </div>
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
