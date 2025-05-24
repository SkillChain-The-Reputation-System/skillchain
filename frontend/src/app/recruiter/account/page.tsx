"use client";

import { useState } from "react";

export default function RecruiterAccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden sticky top-6">
            <div className="p-6 flex flex-col items-center text-center border-b">
              <div className="w-24 h-24 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl font-medium mb-4">
                JD
              </div>
              <h2 className="text-xl font-semibold">John Doe</h2>
              <p className="text-slate-600">Technical Recruiter</p>
              <p className="text-blue-600 mt-1">john.doe@company.com</p>
            </div>

            <nav className="p-2">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "profile" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Profile
              </button>
              <button 
                onClick={() => setActiveTab("company")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "company" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Company Info
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "notifications" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Notifications
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "security" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Security
              </button>
              <button 
                onClick={() => setActiveTab("billing")}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === "billing" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Subscription & Billing
              </button>
            </nav>
          </div>
        </div>
        
        <div className="lg:flex-1">
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "company" && <CompanyTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "billing" && <BillingTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <p className="text-slate-600 mt-1">Update your personal information</p>
      </div>
      
      <div className="p-6">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue="Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue="john.doe@company.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue="+1 (555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-slate-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue="Technical Recruiter"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue="Experienced technical recruiter specializing in blockchain and web3 talent acquisition. Passionate about connecting innovative companies with top-tier developers."
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-slate-700 mb-1">
              Profile Image
            </label>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-xl mr-4">
                JD
              </div>
              <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg">
                Upload New Image
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CompanyTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Company Information</h2>
        <p className="text-slate-600 mt-1">Update your company details</p>
      </div>
      
      <div className="p-6">
        <form className="space-y-6">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue="SkillChain Technologies"
            />
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">
              Website
            </label>
            <input
              type="url"
              id="website"
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue="https://skillchain.example.com"
            />
          </div>
          
          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-1">
              Industry
            </label>
            <select id="industry" className="w-full px-3 py-2 border rounded-lg">
              <option>Blockchain</option>
              <option>Software Development</option>
              <option>Fintech</option>
              <option>Web3</option>
              <option>Cryptocurrency</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-slate-700 mb-1">
              Company Size
            </label>
            <select id="companySize" className="w-full px-3 py-2 border rounded-lg">
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>201-500 employees</option>
              <option>501+ employees</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="companyLogo" className="block text-sm font-medium text-slate-700 mb-1">
              Company Logo
            </label>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                  <line x1="16" y1="8" x2="2" y2="22"></line>
                  <line x1="17.5" y1="15" x2="9" y2="15"></line>
                </svg>
              </div>
              <label className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg">
                Upload Logo
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Company Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg"
              defaultValue="SkillChain is a blockchain-based platform that connects talented developers with innovative companies. We leverage blockchain technology to verify skills and create transparent hiring processes."
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Notification Preferences</h2>
        <p className="text-slate-600 mt-1">Manage how you receive notifications</p>
      </div>
      
      <div className="p-6">
        <form className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium">Application Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Applicants</p>
                <p className="text-sm text-slate-600">Receive notifications when someone applies to your job posting</p>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center mr-4">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">In-app</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Application Status Changes</p>
                <p className="text-sm text-slate-600">Receive notifications when an application status changes</p>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center mr-4">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">In-app</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Interview Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Upcoming Interviews</p>
                <p className="text-sm text-slate-600">Receive notifications about upcoming interviews</p>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center mr-4">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">In-app</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Interview Reminders</p>
                <p className="text-sm text-slate-600">Receive reminders before scheduled interviews</p>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center mr-4">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">In-app</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">System Notifications</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Platform Updates</p>
                <p className="text-sm text-slate-600">Receive notifications about platform updates and new features</p>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center mr-4">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">In-app</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Alerts</p>
                <p className="text-sm text-slate-600">Receive important alerts about your account</p>
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center mr-4">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">Email</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" defaultChecked />
                  <span className="ml-2 text-sm">In-app</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Security Settings</h2>
        <p className="text-slate-600 mt-1">Manage your account security</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-medium">Change Password</h3>
            <form className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
          
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </p>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-medium">Session Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-slate-600">Windows • Chrome • May 18, 2025</p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Sign Out of All Other Sessions
              </button>
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-medium">Device History</h3>
            <div className="space-y-4">
              {[
                { device: "Windows PC", browser: "Chrome", date: "May 18, 2025", status: "active" },
                { device: "iPhone", browser: "Safari", date: "May 15, 2025", status: "inactive" },
                { device: "MacBook Pro", browser: "Firefox", date: "May 10, 2025", status: "inactive" },
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{session.device}</p>
                    <p className="text-sm text-slate-600">{session.browser} • Last active: {session.date}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {session.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillingTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Subscription & Billing</h2>
        <p className="text-slate-600 mt-1">Manage your subscription and billing information</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-8">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg">Pro Plan</p>
                <p className="text-blue-600 mt-1">$99/month</p>
                <p className="text-sm text-slate-600 mt-2">Your next payment is on June 18, 2025</p>
              </div>
              <button
                type="button"
                className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg"
              >
                Change Plan
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Plan Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Unlimited job postings",
                "Advanced candidate search",
                "Interview scheduling tools",
                "Skill assessment integration",
                "Analytics dashboard",
                "Custom branding",
                "Priority support",
                "API access"
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckIcon className="text-green-500 mr-2" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-medium">Payment Method</h3>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center mr-3">
                  <CreditCardIcon className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-slate-600">Expires 09/26</p>
                </div>
              </div>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
            </div>
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Add Payment Method
            </button>
          </div>
          
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-medium">Billing History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-2 text-sm font-medium text-slate-500">Date</th>
                    <th className="px-4 py-2 text-sm font-medium text-slate-500">Amount</th>
                    <th className="px-4 py-2 text-sm font-medium text-slate-500">Status</th>
                    <th className="px-4 py-2 text-sm font-medium text-slate-500 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { date: "May 18, 2025", amount: "$99.00", status: "paid" },
                    { date: "April 18, 2025", amount: "$99.00", status: "paid" },
                    { date: "March 18, 2025", amount: "$99.00", status: "paid" },
                  ].map((invoice, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">{invoice.date}</td>
                      <td className="px-4 py-3">{invoice.amount}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Paid
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function CreditCardIcon({ className = "w-5 h-5" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  );
}
