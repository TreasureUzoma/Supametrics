import Link from "next/link";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@repo/ui/components/ui/dropdown-menu";
import { Plus } from "lucide-react";

export default function AddNewDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          <span className="ml-2 hidden md:inline">Add New</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href="/new"> Project</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/new/team">Team</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
