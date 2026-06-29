import { useSession } from "./use-session";
import type { ReactNode } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

function AuthSection({ children }: Props) {
  const session = useSession();

  if (session.status !== "signedIn") {
    const isBusy = session.status === "initializing";
    return (
      <Button
        variant={isBusy ? "outline" : "destructive"}
        disabled={isBusy}
        onClick={() => void session.signIn()}
      >
        <User />
        <span>Sign In</span>
      </Button>
    );
  }

  return <>{children}</>;
}

export default AuthSection;
