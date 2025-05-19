"use client";

export default function RecruiterInsightsPage() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Applicants" value={156} trend="up" percentage={12} />
        <StatCard title="Interviews Conducted" value={48} trend="up" percentage={8} />
        <StatCard title="Average Time to Hire" value="21" unit="days" trend="down" percentage={5} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Applicant Sources</h2>
          <div className="h-80">
            <PieChart />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Recruitment Funnel</h2>
          <div className="h-80">
            <FunnelChart />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Hiring Trends</h2>
            <select className="px-3 py-2 border rounded-lg bg-white">
              <option value="6months">Last 6 months</option>
              <option value="12months">Last 12 months</option>
              <option value="ytd">Year to date</option>
            </select>
          </div>
          <div className="h-80">
            <LineChart />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Top Skills in Demand</h2>
          <div className="space-y-4">
            <SkillBar name="Solidity" value={85} />
            <SkillBar name="React" value={78} />
            <SkillBar name="TypeScript" value={72} />
            <SkillBar name="Smart Contracts" value={68} />
            <SkillBar name="Blockchain" value={65} />
            <SkillBar name="Web3.js" value={58} />
            <SkillBar name="Node.js" value={52} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, unit = "", trend, percentage }: { title: string; value: number | string; unit?: string; trend: 'up' | 'down' | 'neutral'; percentage: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="flex items-end gap-2 mt-2">
        <span className="text-3xl font-bold">{value}{unit}</span>
        {trend !== 'neutral' && (
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {percentage}%
          </span>
        )}
      </div>
    </div>
  );
}

function PieChart() {
  // This is a placeholder for a real chart component
  // In a real application, you'd use a charting library like Chart.js or Recharts
  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white"></div>
        </div>
      </div>
      
      {/* Sample chart segments */}
      <svg className="w-40 h-40" viewBox="0 0 100 100">
        <path d="M50,50 L50,0 A50,50 0 0,1 85,15 Z" fill="#3b82f6" />
        <path d="M50,50 L85,15 A50,50 0 0,1 100,50 Z" fill="#10b981" />
        <path d="M50,50 L100,50 A50,50 0 0,1 85,85 Z" fill="#f59e0b" />
        <path d="M50,50 L85,85 A50,50 0 0,1 50,100 Z" fill="#ef4444" />
        <path d="M50,50 L50,100 A50,50 0 0,1 15,85 Z" fill="#8b5cf6" />
        <path d="M50,50 L15,85 A50,50 0 0,1 0,50 Z" fill="#ec4899" />
        <path d="M50,50 L0,50 A50,50 0 0,1 15,15 Z" fill="#6366f1" />
        <path d="M50,50 L15,15 A50,50 0 0,1 50,0 Z" fill="#14b8a6" />
      </svg>
      
      <div className="mt-8 grid grid-cols-2 gap-2 absolute bottom-0 left-0 right-0">
        <LegendItem color="#3b82f6" label="LinkedIn" percentage="35%" />
        <LegendItem color="#10b981" label="Job Boards" percentage="25%" />
        <LegendItem color="#f59e0b" label="Referrals" percentage="20%" />
        <LegendItem color="#ef4444" label="Website" percentage="10%" />
        <LegendItem color="#8b5cf6" label="Other" percentage="10%" />
      </div>
    </div>
  );
}

function LegendItem({ color, label, percentage }: { color: string; label: string; percentage: string }) {
  return (
    <div className="flex items-center text-sm">
      <div className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: color }}></div>
      <span className="text-slate-600">{label}</span>
      <span className="ml-auto font-medium">{percentage}</span>
    </div>
  );
}

function FunnelChart() {
  const steps = [
    { name: "Applications", value: 156, color: "#3b82f6" },
    { name: "Resume Screened", value: 98, color: "#10b981" },
    { name: "Phone Interview", value: 64, color: "#f59e0b" },
    { name: "Technical Interview", value: 32, color: "#8b5cf6" },
    { name: "Offers", value: 18, color: "#ef4444" },
    { name: "Hires", value: 12, color: "#14b8a6" },
  ];
  
  return (
    <div className="h-full flex flex-col justify-center">
      {steps.map((step, index) => {
        const width = 100 - (index * (100 / steps.length / 2));
        const value = step.value;
        
        return (
          <div key={index} className="flex flex-col items-center mb-3">
            <div className="flex justify-between w-full mb-1">
              <span className="text-sm font-medium text-slate-600">{step.name}</span>
              <span className="text-sm font-medium">{value}</span>
            </div>
            <div 
              className="w-full h-8 rounded-sm flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${width}%`, backgroundColor: step.color }}
            >
              {Math.round((value / steps[0].value) * 100)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineChart() {
  // This is a placeholder for a real chart component
  return (
    <div className="relative h-full w-full">
      {/* X and Y axis */}
      <div className="absolute left-0 bottom-0 top-8 w-px bg-slate-200"></div>
      <div className="absolute left-0 right-8 bottom-0 h-px bg-slate-200"></div>
      
      {/* Y axis labels */}
      <div className="absolute left-2 top-0 text-xs text-slate-500">40</div>
      <div className="absolute left-2 top-1/4 text-xs text-slate-500">30</div>
      <div className="absolute left-2 top-1/2 text-xs text-slate-500">20</div>
      <div className="absolute left-2 top-3/4 text-xs text-slate-500">10</div>
      <div className="absolute left-2 bottom-2 text-xs text-slate-500">0</div>
      
      {/* X axis labels */}
      <div className="absolute bottom-2 left-8 text-xs text-slate-500">Jan</div>
      <div className="absolute bottom-2 left-1/6 text-xs text-slate-500">Feb</div>
      <div className="absolute bottom-2 left-2/6 text-xs text-slate-500">Mar</div>
      <div className="absolute bottom-2 left-3/6 text-xs text-slate-500">Apr</div>
      <div className="absolute bottom-2 left-4/6 text-xs text-slate-500">May</div>
      <div className="absolute bottom-2 left-5/6 text-xs text-slate-500">Jun</div>
      
      {/* Chart lines */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points="10,70 25,60 40,65 55,40 70,30 85,20"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        <polyline
          points="10,80 25,75 40,80 55,65 70,70 85,60"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />
      </svg>
      
      {/* Legend */}
      <div className="absolute top-2 right-2 flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 mr-1"></div>
          <span className="text-xs">Applications</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 mr-1"></div>
          <span className="text-xs">Hires</span>
        </div>
      </div>
    </div>
  );
}

function SkillBar({ name, value }: { name: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-slate-700">{name}</span>
        <span className="text-sm font-medium text-slate-700">{value}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}
