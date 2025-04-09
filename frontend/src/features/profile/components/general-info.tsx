import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GeneralInfoProps {
  username?: string | undefined;
  address: `0x${string}` | undefined; 
  avatar?: string | undefined;
  bio?: string | undefined;
}

export default function GeneralInfo({ username, address, avatar, bio }: GeneralInfoProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center space-y-3">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={avatar}
            alt={"User's avatar"}
          />
          <AvatarFallback>SK</AvatarFallback>
        </Avatar>

        <CardTitle className="text-center">{username || "Unnamed"}</CardTitle>
        <CardDescription className="text-sm text-center break-all">{address}</CardDescription>
        <CardDescription className="text-sm text-center italic max-w-xs break-words">{bio}</CardDescription>
      </CardContent>
    </Card>
  );
}
