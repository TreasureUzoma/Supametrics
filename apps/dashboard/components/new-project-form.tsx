import { useSession } from "@/store/use-session";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@repo/ui/components/ui/select";
const { user, isLoading } = useSession();

const personalWorkspace = {
  id: "personal", // fixed id
  name: "My Workspace",
  logo: {
    src: `https://avatar.vercel.sh/${user?.email}`,
    alt: "My Workspace",
  },
  subscriptionType: user?.subscriptionType,
  isPersonal: true,
};

const formFields = [
  {
    label: "Team",
    component: (
      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a team" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    label: "Project Name",
    component: <Input placeholder="Enter project name" />,
  },
  {
    label: "Description",
    component: <Input placeholder="https://project-site.com" />,
  },
];

export const NewProjectForm = () => {
  return (
    <form className="flex flex-col items-center justify-center md:px-4 md:py-10">
      <Card className="w-full max-w-lg md:w-[700px] text-sm">
        <CardContent>
          <CardTitle className="text-lg md:text-2xl">New Project</CardTitle>
          <CardDescription className="mb-5">
            Define your project with team, name and URL.
          </CardDescription>
          {formFields.map((field, index) => (
            <div key={index} className="space-y-2 mb-4">
              <Label className="text-sm font-medium">{field.label}</Label>
              {field.component}
            </div>
          ))}
          <Button className="block mt-2 w-full">Create Project</Button>
        </CardContent>
      </Card>
    </form>
  );
};
