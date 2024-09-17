"use client";

import * as React from "react";
import Link from "next/link";
import type { MainNavItem, NavItem } from "@/types";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Icons } from "@/components/icons";
import { useSession } from "next-auth/react";

interface MainNavProps {
  items?: MainNavItem[];
  session: any;
}

export function MainNav({ items, session }: MainNavProps) {
  return (
    <div className="hidden gap-6 lg:flex">
      <Link
        aria-label="Home"
        href="/"
        className="hidden items-center space-x-2 lg:flex"
      >
        <span className="hidden font-bold lg:inline-block">
          {`${siteConfig.name}
           -
          ${
            session?.user?.image?.role?.privileges.includes(
              "ViewRegionalAnalytics"
            )
              ? session?.user?.image?.station?.region == "South Ethiopia"
                ? "Central Ethiopia"
                : session?.user?.image?.station?.region
              : session?.user?.image?.station?.name
          }`}
        </span>
      </Link>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Records</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <NavigationMenuLink>
                  <Link
                    href="/records/station"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Station
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update station data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/records/provider"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Mahber
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update Mahber data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/records/vehicle"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Vehicle
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update vehicle data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/records/user"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">User</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update user data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/records/route"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Route
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update route data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/records/schedule"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Schedule
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update schedule data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/records/price"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Price
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update price data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                {/* {!session?.user?.image?.role?.privileges.includes(
                  "ViewRegionalAnalytics"
                ) && ( */}
                <NavigationMenuLink>
                  <Link
                    href="/records/role"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">Role</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update role data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/records/contact"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Contact
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update contact data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                {/* )} */}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>Analytics</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <NavigationMenuLink>
                  <Link
                    href="/analytics/journey-history"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Journey History
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update journey data.
                    </p>
                  </Link>
                </NavigationMenuLink>

                <NavigationMenuLink>
                  <Link
                    href="/analytics/warning"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Warning
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, add and update warning data.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/analytics/vehicle-performance"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Vehicle Performance
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View vehicle performance report.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/analytics/passenger-history"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Passenger History
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, passenger history.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/analytics/association-report"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Association report
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View, association report.
                    </p>
                  </Link>
                </NavigationMenuLink>
                <NavigationMenuLink>
                  <Link
                    href="/analytics/vehicle-performance-history"
                    className={
                      "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    }
                  >
                    <div className="text-sm font-medium leading-none">
                      Vehicle Checkout History
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                      View vehicle checkout history report.
                    </p>
                  </Link>
                </NavigationMenuLink>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {!session?.user?.image?.role?.privileges.includes(
            "ViewRegionalAnalytics"
          ) && (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Finance</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <NavigationMenuLink>
                    <Link
                      href="/finance/requests-to-cashier"
                      className={
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      }
                    >
                      <div className="text-sm font-medium leading-none">
                        Requests to Cashier
                      </div>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink>
                    <Link
                      href="/finance/ticketer-requests"
                      className={
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      }
                    >
                      <div className="text-sm font-medium leading-none">
                        Ticketer Requests
                      </div>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink>
                    <Link
                      href="/finance/audit-ticketer"
                      className={
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      }
                    >
                      <div className="text-sm font-medium leading-none">
                        Audit Ticketers
                      </div>
                    </Link>
                  </NavigationMenuLink>

                  <NavigationMenuLink>
                    <Link
                      href="/finance/audit-cashiers"
                      className={
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      }
                    >
                      <div className="text-sm font-medium leading-none">
                        Audit Cashiers
                      </div>
                    </Link>
                  </NavigationMenuLink>
                  {session?.user?.image?.role?.privileges.includes(
                    "AuditManager"
                  ) && (
                    <NavigationMenuLink>
                      <Link
                        href="/finance/manager-requests"
                        className={
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        }
                      >
                        <div className="text-sm font-medium leading-none">
                          Manager Requests
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
      </NavigationMenu>
      {!session?.user?.image?.role?.privileges.includes(
        "ViewRegionalAnalytics"
      ) && (
        <Link href="/queue" className="flex items-center justify-center">
          Queue
        </Link>
      )}
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={String(href)}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
