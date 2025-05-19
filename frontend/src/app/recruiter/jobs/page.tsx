"use client";

import Link from "next/link";

export default function RecruiterJobsPage() {
  const jobs = [
    {
      id: 1,
      title: "Senior Blockchain Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      applicants: 18,
      posted: "May 10, 2025",
      status: "active"
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      department: "Engineering",
      location: "New York, NY",
      type: "Full-time",
      applicants: 24,
      posted: "May 8, 2025",
      status: "active"
    },
    {
      id: 3,
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      applicants: 32,
      posted: "May 5, 2025",
      status: "active"
    },
    {
      id: 4,
      title: "UI/UX Designer",
      department: "Design",
      location: "Berlin, Germany",
      type: "Contract",
      applicants: 15,
      posted: "May 3, 2025",
      status: "active"
    },
    {
      id: 5,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      applicants: 9,
      posted: "April 28, 2025",
      status: "closed"
    }
  ];

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="flex items-center p-4 border-b">
          <input
            type="text"
            placeholder="Search jobs..."
            className="flex-1 px-3 py-2 border rounded-lg mr-4"
          />
          <select className="px-3 py-2 border rounded-lg bg-white">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Job Title</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Department</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Location</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Applicants</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Posted</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{job.title}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{job.department}</td>
                  <td className="px-6 py-4 text-slate-600">{job.location}</td>
                  <td className="px-6 py-4 text-slate-600">{job.type}</td>
                  <td className="px-6 py-4">
                    <Link href={`/recruiter/jobs/${job.id}/applicants`} className="text-blue-600 hover:text-blue-800">
                      {job.applicants} applicants
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{job.posted}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {job.status === 'active' ? 'Active' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-slate-600 hover:text-blue-600">
                        <EditIcon />
                      </button>
                      <button className="text-slate-600 hover:text-red-600">
                        <DeleteIcon />
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
            Showing 5 of 5 jobs
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

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"></path>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}
