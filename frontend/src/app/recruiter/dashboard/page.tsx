"use client";

export default function RecruiterDashboardPage() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Active Jobs" value={5} trend="up" percentage={12} />
        <StatCard title="Total Applicants" value={48} trend="up" percentage={8} />
        <StatCard title="Upcoming Interviews" value={7} trend="neutral" percentage={0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((index) => (
              <ApplicationItem 
                key={index}
                name={`Applicant ${index}`}
                position="Senior Blockchain Developer"
                skills={["Solidity", "React", "TypeScript"]}
                date="May 15, 2025"
              />
            ))}
          </div>
          <button className="w-full mt-6 text-center text-sm text-blue-600 hover:text-blue-800">
            View All Applications
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Upcoming Interviews</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <InterviewItem 
                key={index}
                name={`Candidate ${index}`}
                position="Full Stack Engineer"
                date="May 20, 2025"
                time="10:00 AM"
              />
            ))}
          </div>
          <button className="w-full mt-6 text-center text-sm text-blue-600 hover:text-blue-800">
            View All Interviews
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, percentage }: { title: string; value: number; trend: 'up' | 'down' | 'neutral'; percentage: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="flex items-end gap-2 mt-2">
        <span className="text-3xl font-bold">{value}</span>
        {trend !== 'neutral' && (
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}

function ApplicationItem({ name, position, skills, date }: { name: string; position: string; skills: string[]; date: string }) {
  return (
    <div className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium mr-3">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-slate-600">{position}</p>
        <div className="flex gap-1 mt-1">
          {skills.map((skill, index) => (
            <span key={index} className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="text-sm text-slate-500">{date}</div>
    </div>
  );
}

function InterviewItem({ name, position, date, time }: { name: string; position: string; date: string; time: string }) {
  return (
    <div className="flex items-center p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-medium mr-3">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-slate-600">{position}</p>
        <p className="text-sm text-slate-500 mt-1">
          {date} at {time}
        </p>
      </div>
      <button className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-lg hover:bg-blue-100">
        Join
      </button>
    </div>
  );
}
