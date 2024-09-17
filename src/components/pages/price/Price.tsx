import { serverApi } from "@/app/_trpc/server";
import PriceTable from "./tables/PriceTable";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

const PriceContent = async () => {
  let prices: Awaited<
    ReturnType<(typeof serverApi)["price"]["getAll"]["query"]>
  > = [];
  let session: any;
  try {
    session = await getServerSession(authOptions);
    prices = await serverApi.price.getAll.query();
  } catch (e) {}
  return (
    <div className="w-full">
      <PriceTable initialData={prices} session={session} />
    </div>
  );
};

export default PriceContent;
