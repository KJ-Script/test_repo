import { MainNav } from "@/components/layouts/header/main-nav";
import { siteConfig } from "@/config/site";
import { MobileNav } from "./moblie-nav";
import Link from "next/link";
import { Button, buttonVariants } from "../../ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import Logout from "./Logout";
import { ModeToggle } from "../../theme/ThemeToggle";
import TransactionDialog from "./dialog/TransactionDialog";
import { BadgeDollarSignIcon } from "lucide-react";
import ManagerRequestDialog from "./dialog/ManagerRequestDialog";
import UpdatePasswordDialog from "./dialog/UpdatePassword";

export async function SiteHeader() {
  const session: any = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <MainNav items={siteConfig.mainNav} session={session} />
        <MobileNav mainNavItems={siteConfig.mainNav} session={session} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {session?.user?.image?.role?.privileges.includes(
              "RequestToCashier"
            ) && <TransactionDialog />}
            {session?.user?.image?.role?.privileges.includes(
              "AuditCashier"
            ) && <ManagerRequestDialog />}

            {session?.user?.image?.role?.privileges.includes(
              "AcceptTicketerRequest"
            ) && (
              <Link href="/finance/ticketer-requests">
                <BadgeDollarSignIcon className="mr-2" />
              </Link>
            )}
            {!session?.user ? (
              <Link
                href="/signin"
                className={buttonVariants({
                  size: "sm",
                })}
              >
                login
                <span className="sr-only">Sign In</span>
              </Link>
            ) : (
              <Logout />
            )}
            <ModeToggle />
            <UpdatePasswordDialog />
          </nav>
        </div>
      </div>
    </header>
  );
}
