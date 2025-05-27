"use client";

import { Card } from "@/components/ui/card";

interface JobApplicantsMetricsProps {
  counts: {
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    interviewing: number;
    rejected: number;
    withdrawn: number;
    hired: number;
  };
}

export function JobApplicantsMetrics({ counts }: JobApplicantsMetricsProps) {
  return (
    <>
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 select-none">
        <Card className="p-4 shadow-sm">
          <div className="text-2xl font-bold">{counts.total}</div>
          <div className="text-slate-600">Total Applicants</div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <div className="text-2xl font-bold">{counts.pending}</div>
          <div className="text-slate-600">Pending</div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <div className="text-2xl font-bold">{counts.reviewing + counts.shortlisted + counts.interviewing}</div>
          <div className="text-slate-600">In Progress</div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <div className="text-2xl font-bold">{counts.rejected + counts.withdrawn}</div>
          <div className="text-slate-600">Rejected</div>
        </Card>

        <Card className="p-4 shadow-sm">
          <div className="text-xl font-bold">{counts.reviewing}</div>
          <div className="text-slate-600">Reviewing</div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <div className="text-xl font-bold">{counts.shortlisted}</div>
          <div className="text-slate-600">Shortlisted</div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <div className="text-xl font-bold">{counts.interviewing}</div>
          <div className="text-slate-600">Interviewing</div>
        </Card>
        
        <Card className="p-4 shadow-sm">
          <div className="text-xl font-bold">{counts.hired}</div>
          <div className="text-slate-600">Hired</div>
        </Card>
      </div>
    </>
  );
}
