import HealthyFutures from "@/components/dashboard/HealthyFutures";
import InfoCard from "@/components/dashboard/InfoCard";
import { getUserFromDb } from "@/utils/actions";

const DashboardPage = async () => {
  const { code } = await getUserFromDb();

  return (
    <>
      <div className="grid md:grid-cols-2 items-center gap-4">
        <InfoCard data={code} caption="teacher code" />
        <InfoCard data="11292" caption="total responses" />
      </div>
      <HealthyFutures title="Students Who Completed Healthy Futures: Tobacco/Nicotine/Vaping" />
      <HealthyFutures title="Students Who Completed Healthy Futures: Cannabis" />
    </>
  );
};

export default DashboardPage;
