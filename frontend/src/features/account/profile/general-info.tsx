import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowDownSquare, ArrowUpSquare } from "lucide-react";

interface GeneralInfoProps {
  username?: string | undefined;
  address: `0x${string}` | undefined;
  avatar?: string | undefined;
  bio?: string | undefined;
}

export default function GeneralInfo({
  username,
  address,
  avatar,
  bio,
}: GeneralInfoProps) {
  const [isBioCollapsed, setIsBioCollapsed] = useState(true);

  return (
    <Card>
      <CardContent className="flex flex-col items-center space-y-3">
        <Avatar className="h-20 w-20">
          <AvatarImage src={avatar} alt={"User's avatar"} />
          <AvatarFallback>SK</AvatarFallback>
        </Avatar>

        <CardTitle className="text-center">{username || "Unnamed"}</CardTitle>
        <CardDescription className="text-sm text-center break-all">
          {address}
        </CardDescription>
        <Separator></Separator>
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
