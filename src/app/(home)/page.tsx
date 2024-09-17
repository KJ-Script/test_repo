import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/server/auth";
import { serverApi } from "../_trpc/server";
import Counts from "@/components/pages/analytics/counts/Counts";
import Analytics from "@/components/pages/analytics/Analytics";
import StationsMap from "@/components/pages/analytics/map/Map";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import StationFilter from "@/components/pages/analytics/stations/layout/StationFilter";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const nonce = headers().get("x-nonce");

  const session: any = await getServerSession(authOptions);
  if (!session || !session?.user) {
    redirect("/signin");
  }

  if (session?.user?.image?.role?.privileges.includes("ViewFinanceAnalytics")) {
    return (
      <Suspense
        fallback={
          <div>
            <Loader2 className="animate-spin" />
          </div>
        }
      >
        <StationFilter initialData={[session?.user?.image?.station]} />
      </Suspense>
    );
  }

  if (
    !session?.user?.image?.role?.privileges.includes("ViewRegionalAnalytics")
  ) {
    redirect("/queue");
  }

  // return <Analytics />;
  if (
    session?.user?.image?.role?.privileges.includes("ViewRegionalAnalytics")
  ) {
    return (
      <Suspense
        fallback={
          <div>
            <Loader2 className="animate-spin" />
          </div>
        }
      >
        <StationFilter
          type={"regional"}
          initialData={[session?.user?.image?.station]}
        />
      </Suspense>
    );
  }
}
