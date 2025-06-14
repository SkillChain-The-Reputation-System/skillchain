"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  useReactTable,
} from "@tanstack/react-table";

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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  ArrowDown01,
  ArrowDown10,
  ArrowUpDown,
  Check,
  Eye,
  Filter,
  Loader,
  MoreHorizontal,
  MoveLeft,
  MoveRight,
} from "lucide-react";

import { ChallengeInterface } from "@/lib/interfaces";
import { fetchChallengesByContributor } from "@/lib/fetching-onchain-data-utils";
import { getErrorMessage } from "@/lib/error-utils";
import {
  DomainLabels,
  Domain,
  ChallengeStatusLabels,
  ChallengeStatus,
} from "@/constants/system";
import { statusStyles } from "@/constants/styles";
import { cn } from "@/lib/utils";

export default function ContributionDashboard() {
  const { address, isConnected } = useAccount();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [challenges, setChallenges] = useState<ChallengeInterface[]>([]);

  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) {
        return;
      }

      try {
        setIsLoading(true);
        const fetchedChallenge = await fetchChallengesByContributor(address);
        setChallenges(fetchedChallenge);
      } catch (error: any) {
        console.log(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isConnected]);

  const columns: ColumnDef<ChallengeInterface>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <Link className="text-blue-600" href={pathname + `/${row.original.id}`}>
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "category",
      header: "Domain",
      cell: ({ row }) => DomainLabels[row.original.category as Domain],
      filterFn: "equals",
    },
    {
      accessorKey: "bounty",
      header: ({ column }) => {
        return (
          <div className="flex items-center">
            Bounty Amount (ETH)
            <Button
              variant="ghost"
              onClick={() => {
                if (column.getIsSorted() === "asc") column.toggleSorting(true);
                else if (column.getIsSorted() === "desc") column.clearSorting();
                else column.toggleSorting(false);
              }}
            >
              {column.getIsSorted() === "asc" ? (
                <ArrowDown01 className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown10 className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={cn(statusStyles[status as ChallengeStatus])}>
            {ChallengeStatusLabels[status as ChallengeStatus]}
          </Badge>
        );
      },
      size: 50,
      filterFn: "equals",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link
                href={pathname + `/${row.original.id}`}
                className="flex gap-1.5 items-center"
              >
                <Eye />
                View challenge
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 40,
    },
  ];

  const table = useReactTable({
    data: challenges,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
  });

  const statusValue = table.getColumn("status")?.getFilterValue();
  const domainValue = table.getColumn("category")?.getFilterValue();

  const handleClearFilters = () => {
    table.getColumn("status")?.setFilterValue(null);
    table.getColumn("category")?.setFilterValue(null);
  };

  const activeFilterCount =
    (statusValue != null ? 1 : 0) + (domainValue != null ? 1 : 0);

  return (
    <div>
      <div className="flex items-center my-4 gap-2">
        <Input
          placeholder="Search your challenges..."
          value={table.getState().globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
        />

        {/* Filter button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              <Filter />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter Challenges</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Status filter */}
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <span>Status</span>
                  {statusValue != null && (
                    <Badge variant="secondary" className="ml-auto">
                      {ChallengeStatusLabels[statusValue as ChallengeStatus]}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        table.getColumn("status")?.setFilterValue(null);
                      }}
                    >
                      <div className="w-full flex items-center justify-between">
                        All Statuses
                        {statusValue == null && <Check className="h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(Object.values(ChallengeStatus) as unknown as number[])
                      .filter((v) => typeof v === "number")
                      .map((value) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() =>
                            table.getColumn("status")?.setFilterValue(value)
                          }
                          className="cursor-pointer"
                        >
                          <div className="w-full flex items-center justify-between">
                            <div>
                              {ChallengeStatusLabels[value as ChallengeStatus]}
                            </div>
                            {statusValue == value && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            {/* Domain filter */}
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer flex items-center justify-between gap-2">
                  <span>Domain</span>
                  {domainValue != null && (
                    <Badge variant="secondary" className="ml-auto">
                      {DomainLabels[domainValue as Domain]}
                    </Badge>
                  )}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => {
                        table.getColumn("category")?.setFilterValue(null);
                      }}
                    >
                      <div className="w-full flex items-center justify-between">
                        All Domains
                        {domainValue == null && <Check className="h-4 w-4" />}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(Object.values(Domain) as unknown as number[])
                      .filter((v) => typeof v === "number")
                      .map((value) => (
                        <DropdownMenuItem
                          key={value}
                          onClick={() =>
                            table.getColumn("category")?.setFilterValue(value)
                          }
                          className="cursor-pointer"
                        >
                          <div className="w-full flex items-center justify-between">
                            <div>{DomainLabels[value as Domain]}</div>
                            {domainValue == value && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={activeFilterCount === 0}
              onClick={handleClearFilters}
              className="text-center justify-center font-medium cursor-pointer"
            >
              Clear All Filters
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border border-gray-300 dark:border-input">
        <Table>
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader className="animate-spin duration-2500" />
                    <div>Loading your challenges...</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell key={cell.id}>
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
                  className="h-18 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="cursor-pointer"
        >
          <MoveLeft />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="cursor-pointer"
        >
          Next
          <MoveRight />
        </Button>
      </div>
    </div>
  );
}
