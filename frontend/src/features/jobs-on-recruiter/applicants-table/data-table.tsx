"use client";

import * as React from "react";
import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	VisibilityState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	flexRender
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
	JobApplicationStatus,
	ApplicationStatusLabels,
} from "@/constants/system";
import { ApplicantInterface } from "@/lib/interfaces";

interface ApplicantsTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	searchPlaceholder?: string;
	isLoading?: boolean;
}

export function ApplicantsTable<TData, TValue>({
	columns,
	data,
	searchPlaceholder = "Search...",
	isLoading = false,
}: ApplicantsTableProps<TData, TValue>) {
	const [sorting, setSorting] = React.useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
		{}
	);
	const [rowSelection, setRowSelection] = React.useState({});
	const [searchTerm, setSearchTerm] = React.useState<string>("");
	const [selectedStatus, setSelectedStatus] = React.useState<
		JobApplicationStatus | null
	>(null);
	const [filteredData, setFilteredData] = React.useState<TData[]>(data);

	// Update filtered data when data, search term, or filters change
	React.useEffect(() => {
		let filtered = [...data];

		// Filter by search term (in address or id)
		if (searchTerm) {
			filtered = filtered.filter((item: any) => {
				return (
					(item.address &&
						item.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
					(item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()))
				);
			});
		}

		// Filter by selected status
		if (selectedStatus !== null) {
			filtered = filtered.filter((item: any) => {
				return item.status === selectedStatus;
			});
		}

		setFilteredData(filtered);
	}, [data, searchTerm, selectedStatus]);

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
	});

	// Get all statuses for filtering
	const getAllStatuses = () => {
		return Object.keys(JobApplicationStatus)
			.filter((key) => !isNaN(Number(key)))
			.map((key) => Number(key) as JobApplicationStatus);
	};

	const handleClearSearch = () => {
		setSearchTerm("");
	};
	const handleStatusFilter = (value: string) => {
		setSelectedStatus(value === "all" ? null : (Number(value) as JobApplicationStatus));
	};

	const allStatuses = getAllStatuses();
	const hasActiveFilters = selectedStatus !== null || searchTerm.length > 0;

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
						<Button
							variant="ghost"
							className="absolute right-2 top-0 h-10 w-10 p-0 hover:bg-transparent"
							onClick={handleClearSearch}
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Clear search</span>
						</Button>
					)}
				</div>

				<div className="flex space-x-2 w-full md:w-auto">
					<Select onValueChange={handleStatusFilter}>
						<SelectTrigger className="h-10 w-[180px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							{allStatuses.map((status) => (
								<SelectItem key={status} value={status.toString()}>
									{ApplicationStatusLabels[status]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
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
							<Button
								variant="ghost"
								size="sm"
								className="h-5 w-5 p-0 hover:bg-transparent"
								onClick={handleClearSearch}
							>
								<X className="h-3 w-3" />
								<span className="sr-only">Remove</span>
							</Button>
						</Badge>
					)}
					{selectedStatus !== null && (
						<Badge
							key={selectedStatus}
							variant="secondary"
							className="px-3 py-1 flex items-center gap-1"
						>
							{ApplicationStatusLabels[selectedStatus]}
							<Button
								variant="ghost"
								size="sm"
								className="h-5 w-5 p-0 hover:bg-transparent"
								onClick={() => setSelectedStatus(null)}
							>
								<X className="h-3 w-3" />
								<span className="sr-only">Remove</span>
							</Button>
						</Badge>
					)}
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
										>											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
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
									Loading...
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>											{flexRender(cell.column.columnDef.cell, cell.getContext())}
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
	);
}