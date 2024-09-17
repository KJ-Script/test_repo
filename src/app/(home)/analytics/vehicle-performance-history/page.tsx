import VehiclePerformanceContent from "@/components/pages/vehicle-performance/VehiclePerformance";
import { Loader2 } from "lucide-react";
import React, { Suspense } from "react";

const VehiclePerformanceHistory = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[80vh] flex items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <VehiclePerformanceContent />
    </Suspense>
  );
};

export default VehiclePerformanceHistory;
