import { serverApi } from "@/app/_trpc/server";
import UserContent from "@/components/pages/user/User";
import UserTableSkeleton from "@/components/pages/user/sekeletons/UserTableSkeleton";
import { db } from "@/lib/db";
import { authOptions } from "@/server/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const User = async () => {
  return (
    <Suspense fallback={<UserTableSkeleton />}>
      <UserContent />
    </Suspense>
  );
};

export default User;
