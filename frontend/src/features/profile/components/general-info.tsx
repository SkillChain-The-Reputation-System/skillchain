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
  username: string | null;
  address: `0x${string}` | undefined; 
}

export default function GeneralInfo({ username, address }: GeneralInfoProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center space-y-3">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={"https://github.com/shadcn.png"}
            alt={"ShadCN Avartar"}
          />
          <AvatarFallback className="">CN</AvatarFallback>
        </Avatar>

        <CardTitle className="text-center">{username ? (username) : ("Unnamed User")}</CardTitle>
        <CardDescription>{address}</CardDescription>
      </CardContent>
    </Card>
  );
}
