import { serverApi } from "@/app/_trpc/server";
import PriceContent from "@/components/pages/price/Price";
import PriceTableSkeleton from "@/components/pages/price/sekeletons/PriceTableSkeleton";
import React, { Suspense } from "react";

const Price = async () => {
  return (
    <Suspense fallback={<PriceTableSkeleton />}>
      <PriceContent />
    </Suspense>
  );
};

export default Price;
