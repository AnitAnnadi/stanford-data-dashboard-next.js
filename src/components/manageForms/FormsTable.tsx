"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Form } from "@prisma/client";
import { useState } from "react";
import { Input } from "../ui/input";
import RowActions from "./RowActions";

const FormsTable = ({ forms }: { forms: Form[] }) => {
  const [searchText, setSearchText] = useState("");

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="mt-4">
      <Input
        type="text"
        placeholder="Search..."
        className="max-w-md"
        onChange={(e) => setSearchText(e.target.value)}
      />
      <div className="border rounded-lg mt-3">
        <Table>
          <TableHeader>
            <TableRow className="grid grid-cols-[2fr_1fr_1fr_1fr_60px]">
              <TableHead className="flex items-center">Title</TableHead>
              <TableHead className="flex items-center">Type</TableHead>
              <TableHead className="flex items-center">Is Active?</TableHead>
              <TableHead className="flex items-center">Created On</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredForms.length === 0 ? (
              <TableRow className="text-center capitalize">
                <TableCell>No forms to display.</TableCell>
              </TableRow>
            ) : (
              filteredForms.map((form) => {
                const formType =
                  form.type === "pre" ? "pre-survey" : "post-survey";

                return (
                  <TableRow
                    key={form.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_60px] capitalize"
                  >
                    <TableCell className="overflow-hidden">
                      {form.title}
                    </TableCell>
                    <TableCell>{formType}</TableCell>
                    <TableCell>{form.active ? "active" : "inactive"}</TableCell>
                    <TableCell>
                      {new Date(form.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <RowActions
                        formId={form.id}
                        formTitle={form.title}
                        formType={formType}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FormsTable;
