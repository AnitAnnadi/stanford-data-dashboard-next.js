import AdminMetricsFilters from "@/components/metrics/AdminMetricsFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUser, getUserLocation, getUserLocations } from "@/utils/actions";
import { Roles } from "@prisma/client";
import { getActiveForms } from "@/utils/actions";
import TeacherMetricsFilters from "@/components/metrics/TeacherMetricsFilters";

const MetricsPage = async () => {
  const { role, userId } = await getUser();
  const adminLocation =
    role !== Roles.stanford && role !== Roles.teacher
      ? await getUserLocation(userId)
      : null;
  const teacherLocations =
    role === Roles.teacher ? await getUserLocations(userId) : [];

  const forms = await getActiveForms();

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Form Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {role === Roles.teacher ? (
            <TeacherMetricsFilters
              teacherLocations={teacherLocations}
              forms={[...forms]}
            />
          ) : (
            <AdminMetricsFilters
              role={role}
              adminLocation={adminLocation}
              forms={[...forms]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsPage;
