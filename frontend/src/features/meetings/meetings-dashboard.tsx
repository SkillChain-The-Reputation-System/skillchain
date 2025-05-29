'use client'

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { usePathname, useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toaster, toast } from "sonner"

import {
  Briefcase,
  CalendarDays,
  CalendarPlus2,
  Check,
  Clock,
  Eye,
  Filter,
  Info,
  Loader,
  MoreHorizontal,
  MoveLeft,
  MoveRight,
  PenLine,
  UserRound,
  X
} from "lucide-react";

import { meetingStatusStyles } from "@/constants/styles";
import {
  JobDuration,
  JobDurationLabels,
  MeetingStatus,
  MeetingStatusLabels
} from "@/constants/system";
import { fetchMeetingsByRecruiter } from "@/lib/fetching-onchain-data-utils";
import { cancelMeeting } from "@/lib/write-onchain-utils";
import { BriefMeetingInterface } from "@/lib/interfaces";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { renderMeetingUntilTime } from "./time-utils";

export default function MeetingsDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const [meetingList, setMeetingList] = useState<BriefMeetingInterface[]>([]);
  const { address } = useAccount();
  const pathname = usePathname();

  const handleCancelMeeting = async (meeting_id: string) => {
    if (!address) {
      return;
    }

    try {
      await cancelMeeting(address, meeting_id);

      setMeetingList(meetingList.map(meeting => {
        if (meeting.id === meeting_id) {
          return { ...meeting, status: MeetingStatus.CANCELLED }
        } else {
          return meeting
        }
      }))
      toast.info("You've cancelled this meeting");
    } catch (error) {
      console.log("Error occurs: ", error)
      toast.error("Error occurs. Please try again")
    } finally {

    }
  }

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!address) {
        return;
      }

      try {
        setIsLoading(true);
        const fetchedMeetings = await fetchMeetingsByRecruiter(address);
        setMeetingList(fetchedMeetings);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to fetch jobs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeeting();
  }, [address])

  const columns: ColumnDef<BriefMeetingInterface>[] = [
    {
      accessorKey: "applicant",
      header: () => {
        return (
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            Applicant
          </div>
        )
      },
      cell: ({ row }) => {
        const applicant = row.original.applicant;
        return (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={applicant.avatar_url || ""}
                alt={applicant.address || "Applicant"}
              />
              <AvatarFallback>
                {applicant.fullname
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "AP"}
              </AvatarFallback>
            </Avatar>
            <div className="line-clamp-1">
              {applicant.fullname || applicant.address}
            </div>
          </div>
        )
      },
      accessorFn: (row) => {
        const applicant = row.applicant;
        return applicant.fullname ?? applicant.address;
      },
    },
    {
      id: "job",
      header: () => {
        return (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Position
          </div>
        )
      },
      cell: ({ row }) => {
        const job = row.original.job
        return (
          <div className="space-y-1">
            <div>{job.position}</div>
            <div className="text-muted-foreground text-xs">{JobDurationLabels[job.duration as JobDuration]}</div>
          </div>
        )
      },
      accessorFn: (row) => {
        const job = row.job
        return job.position;
      },
    },
    {
      accessorKey: "scheduledAt",
      header: () => {
        return (
          <div className="flex items-center gap-2">
            <CalendarPlus2 className="h-4 w-4" />
            Scheduled on
          </div>
        )
      },
      cell: ({ row }) => {
        const scheduledAt = row.original.scheduledAt

        return (
          <div>{format(scheduledAt, "PPP")}</div>
        )
      }
    },
    {
      id: "meetingDate",
      header: () => {
        return (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Meeting Date
          </div>
        )
      },
      cell: ({ row }) => {
        const meetingDate = row.original.meetingDate
        return (
          <div className="space-y-1">
            <div>{format(meetingDate.date, "PPP")}</div>
            <div className="text-muted-foreground text-xs">{meetingDate.fromTime} - {meetingDate.toTime}</div>
          </div>
        )
      }
    },
    {
      id: "untilEvent",
      header: () => {
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Until Event
          </div>
        )
      },
      cell: ({ row }) => {
        const meetingDate = row.original.meetingDate

        return (
          renderMeetingUntilTime(meetingDate.date, meetingDate.fromTime, meetingDate.toTime)
        )
      }
    },
    {
      accessorKey: "status",
      header: () => {
        return (
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Status
          </div>
        )
      },
      cell: ({ row }) => {
        const status = row.original.status

        return (
          <Badge className={cn(meetingStatusStyles[status as MeetingStatus])}>
            {MeetingStatusLabels[status as MeetingStatus]}
          </Badge>
        )
      },
      filterFn: "equals"
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const id = row.original.id
        const status = row.original.status

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="cursor-pointer h-8 w-8"
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-bold">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push(pathname + `/${id}`)}
              >
                <Eye />
                View meeting
              </DropdownMenuItem>

              {status == MeetingStatus.PENDING && (
                <>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push(pathname + `/${id}/reschedule`)}
                  >
                    <PenLine />
                    Reschedule
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleCancelMeeting(id)}
                  >
                    <X className="stroke-red-600 dark:stroke-red-400" />
                    <span className="text-red-600 dark:text-red-400">Cancel</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }
  ]

  const table = useReactTable({
    data: meetingList,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      columnFilters,
      globalFilter,
    },
  })

  const statusValue = table.getColumn("status")?.getFilterValue();

  return (
    <div>
      <Toaster position="top-right" richColors />

      <div className="flex items-center my-4 gap-2">
        <Input
          placeholder="Search applicant or position..."
          value={table.getState().globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="cursor-pointer">
              <Filter />
              {MeetingStatusLabels[statusValue as MeetingStatus] ?? "All Statuses"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                table.getColumn("status")?.setFilterValue(null)
              }}
            >
              <div className="w-full flex items-center justify-between">
                All Statuses
                {statusValue == null && <Check className="h-4 w-4" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(Object.values(MeetingStatus) as unknown as number[])
              .filter((v) => typeof v === "number")
              .map((value) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => table.getColumn("status")?.setFilterValue(value)}
                  className="cursor-pointer"
                >
                  <div className="w-full flex items-center justify-between">
                    <div>{MeetingStatusLabels[value as MeetingStatus]}</div>
                    {statusValue == value && <Check className="h-4 w-4" />}
                  </div>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border border-gray-300 dark:border-input">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-accent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
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
                    <div>Loading meeting data...</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-18 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )
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
  )
}