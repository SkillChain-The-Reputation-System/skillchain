"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
  DollarSign,
  Eye,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { JobApplicationInterface } from "@/lib/interfaces";

interface ApplicationJobDetailsCardProps {
  application: JobApplicationInterface;
}

interface InfoDialogProps {
  title: string;
  content: string | null;
  icon: React.ReactNode;
  emptyMessage: string;
}

function InfoDialog({ title, content, icon, emptyMessage }: InfoDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </div>
          <Eye className="h-4 w-4 text-slate-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
            {content ? (
              <div
                style={{
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  hyphens: "auto",
                }}
              >
                {content}
              </div>
            ) : (
              <p className="text-slate-500 italic">{emptyMessage}</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function ApplicationJobDetailsCard({
  application,
}: ApplicationJobDetailsCardProps) {
  const job = application.job;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Job Details</CardTitle>
      </CardHeader>      <CardContent>
        {/* Job Information Dialogs */}
        <div className="space-y-3">
          <InfoDialog
            title="Job Description"
            content={job.description}
            icon={<Briefcase className="h-4 w-4" />}
            emptyMessage="No description provided."
          />

          <InfoDialog
            title="Requirements"
            content={job.requirements}
            icon={<FileText className="h-4 w-4" />}
            emptyMessage="No specific requirements provided."
          />

          <InfoDialog
            title="Compensation"
            content={job.compensation}
            icon={<DollarSign className="h-4 w-4" />}
            emptyMessage="Compensation details not specified."
          />
        </div>
      </CardContent>
    </Card>
  );
}
