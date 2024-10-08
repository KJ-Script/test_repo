"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MainNavItem, SidebarNavItem } from "@/types";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Icons } from "@/components/icons";

interface MobileNavProps {
  mainNavItems?: MainNavItem[];
  session: any;
}

export function MobileNav({ mainNavItems, session }: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Icons.menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0">
        <div className="px-7">
          <Link
            aria-label="Home"
            href="/"
            className="flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <span className="font-bold">
              {`${siteConfig.name}
           - 
          ${
            session?.user?.image?.role?.privileges.includes(
              "ViewRegionalAnalytics"
            )
              ? session?.user?.image?.station?.region
              : session?.user?.image?.station?.name
          }`}
            </span>
          </Link>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="pl-1 pr-7">
            <Accordion type="single" collapsible className="w-full">
              <div className="my-3 font-bold">
                <MobileLink href="/" pathname={pathname} setIsOpen={setIsOpen}>
                  Home
                </MobileLink>
              </div>
              {mainNavItems?.map((item, index) => {
                if (
                  session?.user?.image?.role?.privileges.includes(
                    "ViewRegionalAnalytics"
                  ) &&
                  item.title == "Finance"
                ) {
                  return;
                }
                return (
                  <AccordionItem value={item.title} key={index}>
                    <AccordionTrigger className="text-sm capitalize">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-2">
                        {item.subCategories?.map((subItem, index) =>
                          subItem.href ? (
                            <MobileLink
                              key={index}
                              href={String(subItem.href)}
                              pathname={pathname}
                              setIsOpen={setIsOpen}
                            >
                              {subItem.title}
                            </MobileLink>
                          ) : (
                            <div
                              key={index}
                              className="text-foreground/70 transition-colors"
                            >
                              {item.title}
                            </div>
                          )
                        )}
                        {item.title == "Finance" &&
                          session?.user?.image?.role?.privileges.includes(
                            "AuditManager"
                          ) && (
                            <MobileLink
                              href="/finance/manager-requests"
                              pathname={pathname}
                              setIsOpen={setIsOpen}
                            >
                              Manager Requests
                            </MobileLink>
                          )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
              {!session?.user?.image?.role?.privileges.includes(
                "ViewRegionalAnalytics"
              ) && (
                <div className="my-3">
                  <MobileLink
                    setIsOpen={setIsOpen}
                    href="/queue"
                    pathname="queue"
                  >
                    Queue
                  </MobileLink>
                </div>
              )}
            </Accordion>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface MobileLinkProps {
  children?: React.ReactNode;
  href: string;
  disabled?: boolean;
  pathname: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function MobileLink({
  children,
  href,
  disabled,
  pathname,
  setIsOpen,
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "text-foreground/70 transition-colors hover:text-foreground",
        pathname === href && "text-foreground",
        disabled && "pointer-events-none opacity-60"
      )}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  );
}
