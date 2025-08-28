import Logo from "@repo/ui/components/ui/logo";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between py-4 px-6 bg-background">
      <Logo />
    </header>
  );
};
