"use client";

import ProfileCompanyInfo from "./profile-company-info";
import AccountSettings from "./account-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RecruiterAccountSettingsContainer() {
  return (
    <div className="mx-auto">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile & Company</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <ProfileCompanyInfo />
        </TabsContent>

        <TabsContent value="account">
          <AccountSettings/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
