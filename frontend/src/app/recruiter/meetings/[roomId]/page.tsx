"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MeetingRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
    interface MeetingData {
    id: string;
    candidate: string;
    email: string;
    position: string;
    date: string;
    time: string;
    status: string;
    notes: string;
    isJoined: boolean;
  }

  const [meeting, setMeeting] = useState<MeetingData>({
    id: roomId,
    candidate: "Alex Johnson",
    email: "alex.johnson@example.com",
    position: "Senior Blockchain Developer",
    date: "May 20, 2025",
    time: "10:00 AM - 11:00 AM",
    status: "upcoming",
    notes: "",
    isJoined: false
  });
  
  const [activeTab, setActiveTab] = useState("video");
  const [notes, setNotes] = useState("");
  const [resumeUrl, setResumeUrl] = useState("/dummy-resume.pdf");
  const [ratingValue, setRatingValue] = useState(0);
    // Simulate join meeting
  const handleJoinMeeting = () => {
    setMeeting((prev: MeetingData) => ({ ...prev, isJoined: true }));
  };
  
  // Simulate leave meeting
  const handleLeaveMeeting = () => {
    setMeeting((prev: MeetingData) => ({ ...prev, isJoined: false }));
  };
  
  // Simulate saving notes
  const handleSaveNotes = () => {
    setMeeting((prev: MeetingData) => ({ ...prev, notes }));
    alert("Notes saved successfully!");
  };
  
  return (
    <div>
      <Link href="/recruiter/meetings" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-4">
        <ArrowLeftIcon /> Back to Meetings
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {meeting.isJoined ? (
            <div className="bg-slate-900 rounded-xl shadow-lg overflow-hidden h-[500px] flex flex-col">
              <div className="relative flex-1">
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <div className="text-white text-center">
                    <VideoCameraIcon className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg">Video meeting is active</p>
                    <p className="text-slate-400 mt-2">Connected with {meeting.candidate}</p>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-slate-700 rounded-lg p-2 w-48 h-36 flex items-center justify-center">
                  <div className="text-white text-sm text-center">
                    <UserIcon className="w-8 h-8 mx-auto mb-2" />
                    <p>You</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-800 p-4 flex items-center justify-center space-x-4">
                <button className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 text-white">
                  <MicIcon />
                </button>
                <button className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 text-white">
                  <VideoCameraIcon />
                </button>
                <button className="p-3 bg-slate-700 rounded-full hover:bg-slate-600 text-white">
                  <ScreenShareIcon />
                </button>
                <button 
                  onClick={handleLeaveMeeting}
                  className="p-3 px-6 bg-red-600 rounded-full hover:bg-red-700 text-white"
                >
                  End Call
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">Meeting with {meeting.candidate}</h1>
                    <div className="mt-2 text-slate-600">
                      {meeting.date} • {meeting.time}
                    </div>
                  </div>
                  <button 
                    onClick={handleJoinMeeting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                  >
                    Join Meeting
                  </button>
                </div>
                
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-4">Meeting Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Candidate</p>
                      <p>{meeting.candidate}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Email</p>
                      <p>{meeting.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Position</p>
                      <p>{meeting.position}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Status</p>
                      <MeetingStatusBadge status={meeting.status} />
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-4">Meeting Instructions</h2>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Click the "Join Meeting" button above when you're ready to start the video call. 
                      Make sure your camera and microphone are working properly before joining.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="border-b">
              <nav className="flex">
                <button 
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'video' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('video')}
                >
                  Video Settings
                </button>
                <button 
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'resources' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('resources')}
                >
                  Resources
                </button>
                <button 
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'questions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('questions')}
                >
                  Interview Questions
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'video' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Video Call Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Camera</label>
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option>Default Camera</option>
                        <option>External Webcam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Microphone</label>
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option>Default Microphone</option>
                        <option>Headset Microphone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Speaker</label>
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option>Default Speaker</option>
                        <option>Headphones</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'resources' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Candidate Resources</h3>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span>Resume - Alex Johnson.pdf</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </div>
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <LinkIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span>GitHub Portfolio</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">Open</button>
                    </div>
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <DocumentIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span>Skills Assessment Results</span>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">View</button>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'questions' && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Suggested Interview Questions</h3>
                  <div className="space-y-4">
                    {[
                      "Can you explain your experience with Solidity and smart contract development?",
                      "Tell us about a challenging blockchain project you've worked on and how you approached it.",
                      "How do you stay updated with the latest developments in blockchain technology?",
                      "What security considerations do you keep in mind when developing smart contracts?",
                      "Can you explain a complex blockchain concept in simple terms?",
                      "What interests you most about our company and this position?"
                    ].map((question, index) => (
                      <div key={index} className="p-4 bg-slate-50 border rounded-lg">
                        <p>{question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Candidate Profile</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-xl mr-4">
                  AJ
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{meeting.candidate}</h3>
                  <p className="text-slate-600">{meeting.email}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Solidity", "React", "TypeScript", "Ethereum", "Smart Contracts", "Hardhat"].map((skill, index) => (
                      <span key={index} className="bg-slate-100 text-slate-700 text-sm px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Experience</h4>
                  <p className="text-slate-700">5 years</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-2">Location</h4>
                  <p className="text-slate-700">Berlin, Germany</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Interview Notes</h2>
            </div>
            <div className="p-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes during the interview..."
                className="w-full h-32 p-3 border rounded-lg resize-none"
              ></textarea>
              <button 
                onClick={handleSaveNotes}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full"
              >
                Save Notes
              </button>
            </div>
          </div>
          
          <div className="mt-6 bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Evaluation</h2>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-500 mb-2">Overall Rating</h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button 
                      key={rating}
                      className={`w-8 h-8 rounded-full ${rating <= ratingValue ? 'bg-yellow-400 text-yellow-800' : 'bg-slate-100 text-slate-400'}`}
                      onClick={() => setRatingValue(rating)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Technical Skills</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Average</option>
                    <option>Below Average</option>
                    <option>Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cultural Fit</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Average</option>
                    <option>Below Average</option>
                    <option>Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Decision</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Select Decision</option>
                    <option>Move to Next Round</option>
                    <option>Make Offer</option>
                    <option>Reject</option>
                    <option>Hold</option>
                  </select>
                </div>
              </div>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full">
                Submit Evaluation
              </button>
            </div>
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

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  );
}

function VideoCameraIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  );
}

function UserIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}

function MicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>
  );
}

function ScreenShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  );
}

function DocumentIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function LinkIcon({ className = "w-6 h-6" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>
  );
}
