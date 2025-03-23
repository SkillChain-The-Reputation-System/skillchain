import { Metadata } from 'next';
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard page of SkillChain.'
};

export default async function Dashboard() {
  redirect("/dashboard/overview");
}
