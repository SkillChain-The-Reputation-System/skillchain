import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownSquare,
  ArrowUpSquare,
  BarChart2,
  Bitcoin,
  CheckCircle,
  ClipboardList,
  Cloud,
  Code,
  Code2,
  Cpu,
  Database,
  Layout,
  Server,
  Shield,
  TrendingUp,
  Trophy,
  Wifi,
} from "lucide-react";
import { Domain, DomainLabels } from "@/constants/system";

interface GeneralInfoProps {
  username?: string | undefined;
  address: `0x${string}` | undefined;
  avatar?: string | undefined;
  bio?: string | undefined;
  global_reputation?: number;
  domain_reputation?: number[];
}

export default function GeneralInfo({
  username,
  address,
  avatar,
  bio,
  global_reputation,
  domain_reputation,
}: GeneralInfoProps) {
  const [isBioCollapsed, setIsBioCollapsed] = useState(true);

  // Map each domain key to an icon component
  const DomainIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    [Domain.COMPUTER_SCIENCE_FUNDAMENTALS]: Code,
    [Domain.SOFTWARE_DEVELOPMENT]: Code2,
    [Domain.SYSTEMS_AND_NETWORKING]: Server,
    [Domain.CYBERSECURITY]: Shield,
    [Domain.DATA_SCIENCE_AND_ANALYTICS]: BarChart2,
    [Domain.DATABASE_ADMINISTRATION]: Database,
    [Domain.QUALITY_ASSURANCE_AND_TESTING]: CheckCircle,
    [Domain.PROJECT_MANAGEMENT]: ClipboardList,
    [Domain.USER_EXPERIENCE_AND_DESIGN]: Layout,
    [Domain.BUSINESS_ANALYSIS]: TrendingUp,
    [Domain.ARTIFICIAL_INTELLIGENCE]: Cpu,
    [Domain.BLOCKCHAIN_AND_CRYPTOCURRENCY]: Bitcoin,
    [Domain.NETWORK_ADMINISTRATION]: Wifi,
    [Domain.CLOUD_COMPUTING]: Cloud,
  };

  return (
    <Card className="border-black dark:border-white">
      <CardContent className="flex flex-col items-center space-y-3">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatar} alt={"User's avatar"} />
          <AvatarFallback>SK</AvatarFallback>
        </Avatar>

        <CardTitle className="text-center">{username || "Unnamed"}</CardTitle>
        <CardDescription className="text-sm text-center break-all">
          {address}
        </CardDescription>

        <Separator className="w-full bg-black dark:bg-white" />

        <CardTitle className="text-sm">Reputation Scores</CardTitle>
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <span className="text-2xl font-bold">{global_reputation}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          {Object.entries(DomainLabels).map(([key, label]) => {
            const Icon = DomainIcons[key as keyof typeof DomainIcons];
            return (
              <div
                key={key}
                className="flex justify-between items-center p-2 rounded-lg gap-4"
              >
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-xs">{label}</span>
                </div>
                <span className="text-sm font-medium">
                  {domain_reputation
                    ? domain_reputation[Object.keys(DomainLabels).indexOf(key)]
                    : "N/A"}
                </span>
              </div>
            );
          })}
        </div>

        <Separator className="w-full bg-black dark:bg-white" />
        <CardTitle className="text-sm">Biography</CardTitle>
        <CardDescription
          className={cn(
            "text-sm italic max-w-xs break-words",
            isBioCollapsed && "line-clamp-3"
          )}
        >
          {bio}
        </CardDescription>
        <p
          className="cursor-pointer flex items-center gap-1 text-sm italic text-muted-foreground"
          onClick={() => setIsBioCollapsed(!isBioCollapsed)}
        >
          {isBioCollapsed ? (
            <ArrowDownSquare className="h-4 w-4" />
          ) : (
            <ArrowUpSquare className="h-4 w-4" />
          )}
          {isBioCollapsed ? "Expand" : "Collapse"}
        </p>
      </CardContent>
    </Card>
  );
}
