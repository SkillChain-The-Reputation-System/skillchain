"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.id;
  
  const job = {
    id: jobId,
    title: "Senior Blockchain Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    posted: "May 10, 2025",
    status: "active"
  };

  const applicants = [
    {
      id: 1,
      name: "Alex Johnson",
      email: "alex.johnson@example.com",
      location: "Berlin, Germany",
      experience: "5 years",
      skills: ["Solidity", "React", "TypeScript", "Hardhat"],
      status: "review",
      appliedDate: "May 15, 2025"
    },
    {
      id: 2,
      name: "Jamie Smith",
      email: "jamie.smith@example.com",
      location: "Remote",
      experience: "7 years",
      skills: ["Solidity", "Ethereum", "JavaScript", "Smart Contracts"],
      status: "interview",
      appliedDate: "May 14, 2025"
    },
    {
      id: 3,
      name: "Morgan Lee",
      email: "morgan.lee@example.com",
      location: "New York, USA",
      experience: "3 years",
      skills: ["Solidity", "Web3.js", "React"],
      status: "review",
      appliedDate: "May 14, 2025"
    },
    {
      id: 4,
      name: "Taylor Swift",
      email: "taylor.swift@example.com",
      location: "Remote",
      experience: "8 years",
      skills: ["Solidity", "Ethereum", "DeFi", "TypeScript"],
      status: "rejected",
      appliedDate: "May 12, 2025"
    },
    {
      id: 5,
      name: "Jordan Casey",
      email: "jordan.casey@example.com",
      location: "London, UK",
      experience: "4 years",
      skills: ["Smart Contracts", "JavaScript", "React"],
      status: "review",
      appliedDate: "May 11, 2025"
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <Link href="/recruiter/jobs" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4">
          <ArrowLeftIcon /> Back to Jobs
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-slate-600">
              <span>{job.department}</span>
              <span>•</span>
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.type}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-lg">
              Edit Job
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              View Job Post
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold">{applicants.length}</div>
          <div className="text-slate-600">Total Applicants</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold">{applicants.filter(a => a.status === 'review').length}</div>
          <div className="text-slate-600">In Review</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold">{applicants.filter(a => a.status === 'interview').length}</div>
          <div className="text-slate-600">Interviews</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <div className="text-2xl font-bold">{applicants.filter(a => a.status === 'rejected').length}</div>
          <div className="text-slate-600">Rejected</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex items-center p-4 border-b">
          <input
            type="text"
            placeholder="Search applicants..."
            className="flex-1 px-3 py-2 border rounded-lg mr-4"
          />
          <select className="px-3 py-2 border rounded-lg bg-white">
            <option value="all">All statuses</option>
            <option value="review">In Review</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Applicant</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Location</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Experience</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Skills</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Applied</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applicants.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium mr-3">
                        {applicant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-slate-600 text-sm">{applicant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{applicant.location}</td>
                  <td className="px-6 py-4 text-slate-600">{applicant.experience}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {applicant.skills.map((skill, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{applicant.appliedDate}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={applicant.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1 rounded text-sm">
                        View
                      </button>
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">
                        Schedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-slate-500">
            Showing {applicants.length} applicants
          </div>
          <div className="flex space-x-1">
            <button className="px-3 py-1 border rounded bg-white text-slate-600">
              Previous
            </button>
            <button className="px-3 py-1 border rounded bg-blue-50 text-blue-600 font-medium">
              1
            </button>
            <button className="px-3 py-1 border rounded bg-white text-slate-600">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bgColor = "bg-slate-100";
  let textColor = "text-slate-800";

  if (status === "review") {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-800";
  } else if (status === "interview") {
    bgColor = "bg-blue-100";
    textColor = "text-blue-800";
  } else if (status === "rejected") {
    bgColor = "bg-red-100";
    textColor = "text-red-800";
  }

  const statusDisplay = {
    review: "In Review",
    interview: "Interview",
    rejected: "Rejected"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {statusDisplay[status as keyof typeof statusDisplay]}
    </span>
  );
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );
}
