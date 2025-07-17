"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";

import {
  DataTable,
  columns,
  JoinedChallengeRow,
} from "./joined-challenges-table";
import {
  fetchJoinedReviewPoolChallenges,
  getModeratorReviewOfChallenge,
} from "@/lib/fetching-onchain-data-utils";

export default function JoinedChallengesView() {
  const { address } = useAccount();
  const [data, setData] = useState<JoinedChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!address) return;
      setLoading(true);
      try {
        const challenges = await fetchJoinedReviewPoolChallenges(address);
        const rows: JoinedChallengeRow[] = await Promise.all(
          challenges.map(async (ch) => {
            const review = await getModeratorReviewOfChallenge(
              ch.id,
              address
            );
            return {
              id: ch.id,
              title: ch.title,
              category: ch.category,
              status: ch.status,
              reviewSubmitted: review?.is_submitted ?? false,
              reviewTxId: review?.review_txid ?? "",
            };
          })
        );
        setData(rows);
      } catch (error) {
        toast.error(
          `Error fetching joined challenges: ${(error as Error).message}`
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [address]);

  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="title"
      searchPlaceholder="Search challenges..."
      isLoading={loading}
    />
  );
}
