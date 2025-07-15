"use client";

import Link from "next/link";
import { navItems } from "@/constants/data";
import { Icons } from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Separator } from "@/components/ui/separator";

export default function Overview() {
  const items = navItems.filter((item) => item.title !== "Overview");

  return (
    <div className="flex flex-col px-4 space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Manage your SkillChain activity and explore all available features."
      />
      <Separator className="my-4 bg-gray-300 dark:bg-gray-700" />
      <p>
        SkillChain is a decentralized platform for verified skills, peer review
        and job matching. Use the links below to access each section of the
        system.
      </p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon ? Icons[item.icon] : Icons.logo;
          return (
            <Card key={item.title} className="hover:shadow-elevation-dark">
              <CardHeader className="flex-row items-center gap-2 pb-2">
                <Icon className="text-primary" />
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {item.items && item.items.length > 0 ? (
                  <ul className="list-none pl-0 space-y-1 text-sm">
                    {item.items.map((sub) => (
                      <li key={sub.title}>
                        <Link
                          href={sub.url}
                          className="text-primary hover:underline"
                        >
                          {sub.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Link
                    href={item.url}
                    className="text-primary text-sm hover:underline"
                  >
                    Go to {item.title}
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
