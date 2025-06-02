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

interface OpeningJobsTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function OpeningJobsTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  isLoading = false,
}: OpeningJobsTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [selectedDomains, setSelectedDomains] = React.useState<Domain[]>([]);
  const [selectedDurations, setSelectedDurations] = React.useState<
    JobDuration[]
  >([]);
  const [filteredData, setFilteredData] = React.useState<TData[]>(data);

  // Update filtered data when data, search term, or filters change
  React.useEffect(() => {
    let filtered = [...data];

    // Filter by search term (in title or location)
    if (searchTerm) {
      filtered = filtered.filter((item: any) => {
        return (
          (item.title &&
            item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.location &&
            item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (item.description &&
            item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Filter by selected domains
    if (selectedDomains.length > 0) {
      filtered = filtered.filter((item: any) => {
        // Check if job has any of the selected domains
        return selectedDomains.some((domain) => item.domains.includes(domain));
      });
    }

    // Filter by selected durations
    if (selectedDurations.length > 0) {
      filtered = filtered.filter((item: any) => {
        // Check if job duration matches any of the selected durations
        return selectedDurations.includes(item.duration);
      });
    }

    setFilteredData(filtered);
  }, [data, searchTerm, selectedDomains, selectedDurations]);

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  // Toggle domain selection
  const toggleDomainSelection = (domain: Domain) => {
    setSelectedDomains((prev) => {
      if (prev.includes(domain)) {
        return prev.filter((d) => d !== domain);
      } else {
        return [...prev, domain];
      }
    });
  };

  // Toggle duration selection
  const toggleDurationSelection = (duration: JobDuration) => {
    setSelectedDurations((prev) => {
      if (prev.includes(duration)) {
        return prev.filter((d) => d !== duration);
      } else {
        return [...prev, duration];
      }
    });
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                Filter
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Domain Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>By Domain</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                  {Object.values(Domain)
                    .filter((value) => !isNaN(Number(value)))
                    .map((domain) => {
                      const numDomain = Number(domain) as Domain;
                      const iconName = DomainIconMap[numDomain];
                      const DomainIcon = Icons[iconName as keyof typeof Icons];

                      return (
                        <DropdownMenuItem
                          key={domain}
                          onClick={() => toggleDomainSelection(numDomain)}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          {DomainIcon && <DomainIcon className="h-4 w-4" />}
                          {DomainLabels[numDomain]}
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Duration Filter */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>By Duration</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {Object.entries(JobDurationLabels).map(([key, label]) => (
                    <DropdownMenuItem
                      key={key}
                      onClick={() =>
                        toggleDurationSelection(Number(key) as JobDuration)
                      }
                      className="cursor-pointer"
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Selected filters display section */}
        {(selectedDomains.length > 0 || selectedDurations.length > 0) && (
          <div className="flex flex-col gap-2">
            {/* Filter categories */}
            <div className="flex flex-wrap gap-2">
              {/* Domain filters */}
              {selectedDomains.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDomains.map((domain) => {
                    const iconName = DomainIconMap[domain];
                    const DomainIcon = Icons[iconName as keyof typeof Icons];

                    return (
                      <Badge
                        key={`domain-${domain}`}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {DomainIcon && <DomainIcon className="h-3 w-3" />}
                        {DomainLabels[domain]}
                        <span
                          className="h-3 w-3 cursor-pointer flex items-center"
                          onClick={() => toggleDomainSelection(domain)}
                        >
                          <X className="pointer-events-none" />
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Duration filters */}
              {selectedDurations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDurations.map((duration) => (
                    <Badge
                      key={`duration-${duration}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      {JobDurationLabels[duration]}
                      <span
                        className="h-3 w-3 cursor-pointer flex items-center"
                        onClick={() => toggleDurationSelection(duration)}
                      >
                        <X className="pointer-events-none" />
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Jobs Table */}
      <div className="w-full">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredData.length > 0 ? (
          <div className="rounded-md border border-gray-300 dark:border-input shadow-sm w-full">
            <Table className="border-collapse table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      const size = header.column.columnDef.size;
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
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const size = cell.column.columnDef.size;
                        return (
                          <TableCell
                            key={cell.id}
                            style={size ? { width: `${size}px` } : {}}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-lg font-medium mb-2">No jobs found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search filters or check back later for new
              opportunities.
            </p>
          </div>
        )}

        {filteredData.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
