import InfoCard from "@/components/dashboard/InfoCard";
import { getResponsesWithTeacherCount, getUserFromDb } from "@/utils/actions";

const DashboardPage = async () => {
  const { code } = await getUserFromDb();
  const { numPreResponses, numPostResponses } =
    await getResponsesWithTeacherCount();

  return (
    <>
      <InfoCard data={code} caption="teacher code" />
      <div className="grid md:grid-cols-2 items-center gap-4 mt-4">
        <InfoCard data={`${numPreResponses}`} caption="pre-survey responses" />
        <InfoCard
          data={`${numPostResponses}`}
          caption="post-survey responses"
        />
      </div>
    </>
  );
};

export default DashboardPage;
