"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, CalendarCheck, Clock, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JobInterface } from "@/lib/interfaces";
import { JobDurationLabels } from "@/constants/system";
import { format } from "date-fns";

interface JobDetailsCardProps {
  job: JobInterface;
}

export default function JobDetailsCard({ job }: JobDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Job Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 w-full">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <span className="truncate" title={job.location || "Remote"}>
              {job.location || "Remote"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <span>{JobDurationLabels[job.duration]}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-slate-500 flex-shrink-0" />
            <span
              className="truncate"
              title={
                job.deadline
                  ? `Apply by ${format(new Date(job.deadline), "MMMM d, yyyy")}`
                  : "No deadline"
              }
            >
              {job.deadline
                ? `Apply by ${format(new Date(job.deadline), "MMMM d, yyyy")}`
                : "No deadline"}
            </span>
          </div>
        </div>

        <Separator />
        <Tabs defaultValue="description" className="mt-4">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="compensation">Compensation</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-6">
            <ScrollArea className="">
              <div className="prose max-w-none">
                {job.description ? (
                  <div
                    style={{
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      hyphens: "auto",
                    }}
                  >
                    {job.description}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    No description provided.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="requirements" className="pt-6">
            <ScrollArea className="">
              <div className="prose max-w-none">
                {job.requirements ? (
                  <div
                    style={{
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      hyphens: "auto",
                    }}
                  >
                    {job.requirements}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    No specific requirements provided.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="compensation" className="pt-6">
            <ScrollArea className="">
              <div className="prose max-w-none">
                {job.compensation ? (
                  <div
                    style={{
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      hyphens: "auto",
                    }}
                  >
                    {job.compensation}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    Compensation details not specified.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
