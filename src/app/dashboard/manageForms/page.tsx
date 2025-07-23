import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { GoPlus } from "react-icons/go";
import Link from "next/link";
import { getAllForms } from "@/utils/actions";
import FormsTable from "@/components/manageForms/FormsTable";

const ManageFormsPage = async () => {
  const forms = await getAllForms();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-medium tracking-wider capitalize">
          forms
        </h2>
        <Button variant="ghost" size="sm" className="gap-x-0.5" asChild>
          <Link href="/dashboard/manageForms/addForm">
            <GoPlus /> Add Form
          </Link>
        </Button>
      </div>
      <Separator />
      <FormsTable forms={forms} />
    </div>
  );
};

export default ManageFormsPage;
