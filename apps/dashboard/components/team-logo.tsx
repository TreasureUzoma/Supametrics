import { Avatar, AvatarImage } from "@repo/ui/components/ui/avatar";
import Image from "next/image";

export const TeamLogo = ({ src, name }: { src: string; name: string }) => {
  return (
    <div>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={src} alt={`${name} Logo`} />
      </Avatar>
    </div>
  );
};
