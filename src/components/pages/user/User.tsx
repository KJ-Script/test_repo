"use server";
import UserTable from "./tables/UserTable";
import { serverApi } from "@/app/_trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";

const UserContent = async () => {
  let session;
  try {
    session = await getServerSession(authOptions);
    const user = await serverApi.user.getById.query({
      id: Number(session?.user.id),
    });

    if (!user?.role.privileges.includes("UserView")) {
      redirect("/");
    }
  } catch (e) {
    console.log(e);
  }
  let users: Awaited<
    ReturnType<(typeof serverApi)["user"]["getAll"]["query"]>
  > = [];
  try {
    users = await serverApi.user.getAll.query();
  } catch (e) {
    console.log("Error fetching users", e);
  }
  return (
    <div className="w-full">
      <UserTable initialData={users} session={session} />
    </div>
  );
};

export default UserContent;
