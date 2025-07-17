"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Domain,
  DomainLabels,
  ChallengeStatus,
  ChallengeStatusLabels,
} from "@/constants/system";
import { statusStyles } from "@/constants/styles";
import { pageUrlMapping } from "@/constants/navigation";

export interface JoinedChallengeRow {
  id: `0x${string}`;
  title: string;
  category: Domain;
  status: ChallengeStatus;
  reviewSubmitted: boolean;
  reviewTxId: string;
}

export const columns: ColumnDef<JoinedChallengeRow>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="w-full justify-start"
      >
        Challenge Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium break-words line-clamp-2 overflow-hidden text-ellipsis">
        {row.getValue("title")}
      </div>
    ),
    size: 250,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="break-words line-clamp-2 overflow-hidden text-ellipsis">
        {DomainLabels[row.getValue("category") as Domain]}
      </div>
    ),
    size: 150,
  },
  {
    accessorKey: "status",
    header: "Challenge Status",
    filterFn: "equals",
    cell: ({ row }) => {
      const status = row.getValue("status") as ChallengeStatus;
      return (
        <Badge
          className={`${statusStyles[status]} font-medium text-xs capitalize`}
          variant="outline"
        >
          {ChallengeStatusLabels[status]}
        </Badge>
      );
    },
    size: 120,
  },
  {
    accessorKey: "reviewSubmitted",
    header: "Review Status",
    cell: ({ row }) => (
      <span>{row.getValue("reviewSubmitted") ? "Submitted" : "Not Submitted"}</span>
    ),
    size: 130,
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const challenge = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${pageUrlMapping.moderation_reviewchallenges}/${challenge.id}`} className="flex w-full">
                Show Review
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(challenge.id)}>
              <span className="text-sm cursor-pointer">Copy Challenge ID</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 70,
  },
];
