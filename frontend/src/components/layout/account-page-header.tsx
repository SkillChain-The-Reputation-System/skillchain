import { cn } from "@/lib/utils";
import { Settings } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

interface AccountPageHeaderProps {
    title: string;
    description: string;
    includeButton?: boolean;
    buttonTitle?: string;
    buttonLink?: string;
    buttonIcon?: React.ReactNode;
}

export const AccountPageHeader = ({ title, description, includeButton, buttonTitle, buttonLink, buttonIcon }: AccountPageHeaderProps) => {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-0.5">
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {includeButton && buttonLink && buttonIcon && (
                <Link href={buttonLink} className={cn(buttonVariants(), "text-xs md:text-sm")}>
                    {buttonIcon} {buttonTitle}
                </Link>
            )}
        </div>
    );
}