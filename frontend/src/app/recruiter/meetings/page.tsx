"use client";

import { useState } from "react";
import Link from "next/link";

export default function MeetingsPage() {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  
  const meetings = [
    {
      id: "room1",
      candidate: "Alex Johnson",
      position: "Senior Blockchain Developer",
      date: "May 20, 2025",
      time: "10:00 AM - 11:00 AM",
      status: "upcoming"
    },
    {
      id: "room2",
      candidate: "Jamie Smith",
      position: "Full Stack Engineer",
      date: "May 20, 2025",
      time: "2:00 PM - 3:00 PM",
      status: "upcoming"
    },
    {
      id: "room3",
      candidate: "Morgan Lee",
      position: "Senior Blockchain Developer",
      date: "May 21, 2025",
      time: "9:30 AM - 10:30 AM",
      status: "upcoming"
    },
    {
      id: "room4",
      candidate: "Jordan Casey",
      position: "Full Stack Engineer",
      date: "May 22, 2025",
      time: "11:00 AM - 12:00 PM",
      status: "upcoming"
    },
    {
      id: "room5",
      candidate: "Taylor Swift",
      position: "Senior Blockchain Developer",
      date: "May 19, 2025",
      time: "3:00 PM - 4:00 PM",
      status: "completed"
    },
  ];

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8">
        <div className="flex items-center p-4 border-b">
          <div className="flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search meetings..."
              className="flex-1 px-3 py-2 border rounded-lg mr-4"
            />
            <select className="px-3 py-2 border rounded-lg bg-white mr-4">
              <option value="all">All statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex border rounded-lg overflow-hidden">
            <button 
              className={`px-4 py-2 ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
              onClick={() => setViewMode("list")}
            >
              List View
            </button>
            <button 
              className={`px-4 py-2 ${viewMode === "calendar" ? "bg-blue-600 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-4 text-sm font-medium text-slate-500">Candidate</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-500">Position</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-500">Date</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-500">Time</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="px-6 py-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium mr-3">
                          {meeting.candidate.charAt(0)}
                        </div>
                        <div className="font-medium">{meeting.candidate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{meeting.position}</td>
                    <td className="px-6 py-4 text-slate-600">{meeting.date}</td>
                    <td className="px-6 py-4 text-slate-600">{meeting.time}</td>
                    <td className="px-6 py-4">
                      <MeetingStatusBadge status={meeting.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/recruiter/meetings/${meeting.id}`}
                          className={`px-3 py-1 rounded text-sm ${
                            meeting.status === "upcoming" ? "bg-blue-50 hover:bg-blue-100 text-blue-700" : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          {meeting.status === "upcoming" ? "Join" : "View"}
                        </Link>
                        {meeting.status === "upcoming" && (
                          <button className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1 rounded text-sm">
                            Reschedule
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <CalendarView meetings={meetings} />
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-slate-500">
            Showing {meetings.length} meetings
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

function MeetingStatusBadge({ status }: { status: string }) {
  let bgColor = "bg-slate-100";
  let textColor = "text-slate-800";

  if (status === "upcoming") {
    bgColor = "bg-green-100";
    textColor = "text-green-800";
  } else if (status === "completed") {
    bgColor = "bg-blue-100";
    textColor = "text-blue-800";
  } else if (status === "cancelled") {
    bgColor = "bg-red-100";
    textColor = "text-red-800";
  }

  const statusDisplay = {
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {statusDisplay[status as keyof typeof statusDisplay]}
    </span>
  );
}

function CalendarView({ meetings }: { meetings: any[] }) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();
  
  const firstDay = new Date(currentYear, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
  
  const calendar: number[] = [];
  
  // Add empty cells for days before the 1st
  for (let i = 0; i < firstDay; i++) {
    calendar.push(0);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendar.push(i);
  }
  
  // Group meetings by date
  const meetingsByDate: Record<string, any[]> = {};
  meetings.forEach(meeting => {
    if (!meetingsByDate[meeting.date]) {
      meetingsByDate[meeting.date] = [];
    }
    meetingsByDate[meeting.date].push(meeting);
  });
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{`${currentMonth} ${currentYear}`}</h2>
        <div className="flex gap-2">
          <button className="p-2 border rounded hover:bg-slate-50">
            <ChevronLeftIcon />
          </button>
          <button className="p-2 border rounded hover:bg-slate-50">
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-4">
        {days.map(day => (
          <div key={day} className="text-center font-medium text-slate-500 pb-2">
            {day.substring(0, 3)}
          </div>
        ))}
        
        {calendar.map((day, index) => {
          const dateString = day ? `May ${day}, 2025` : "";
          const dayMeetings = meetingsByDate[dateString] || [];
          
          return (
            <div 
              key={index} 
              className={`border rounded-lg min-h-[120px] p-2 ${
                day === 0 ? 'bg-slate-50' : day === currentDate.getDate() ? 'border-blue-300 bg-blue-50' : ''
              }`}
            >
              {day > 0 && (
                <>
                  <div className="text-right font-medium">{day}</div>
                  <div className="mt-1">
                    {dayMeetings.slice(0, 2).map((meeting, idx) => (
                      <Link 
                        key={idx} 
                        href={`/recruiter/meetings/${meeting.id}`}
                        className="block p-1 text-xs bg-blue-100 text-blue-800 rounded mb-1 truncate"
                      >
                        {meeting.time.split(" - ")[0]} - {meeting.candidate}
                      </Link>
                    ))}
                    {dayMeetings.length > 2 && (
                      <div className="text-xs text-blue-600 mt-1">
                        +{dayMeetings.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );
}
