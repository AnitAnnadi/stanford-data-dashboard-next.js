import EmptyList from "@/components/global/EmptyList";
import StanfordAdminCard from "@/components/manageStanfordAdmins/StanfordAdminCard";
import StanfordAdminsTable from "@/components/manageStanfordAdmins/StanfordAdminsTable";
import {
  getPendingStanfordUsers,
  getStanfordAdmins,
  isStanfordApprover,
} from "@/utils/actions";
import { redirect } from "next/navigation";
import React from "react";

const ManageStanfordAdminsPage = async () => {
  if (!(await isStanfordApprover())) {
    redirect("/dashboard/metrics");
  }

  const [pendingUsers, admins] = await Promise.all([
    getPendingStanfordUsers(),
    getStanfordAdmins(),
  ]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
        {pendingUsers.length === 0 ? (
          <EmptyList heading="No Stanford admin requests pending approval." />
        ) : (
          <>
            {pendingUsers.map((user) => {
              return <StanfordAdminCard key={user.id} user={user} />;
            })}
          </>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">All Stanford Admins</h2>
        <StanfordAdminsTable admins={admins} />
      </section>
    </div>
  );
};

export default ManageStanfordAdminsPage;
