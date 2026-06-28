import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type StanfordAdmin = {
  id: string;
  name: string;
  email: string;
};

const StanfordAdminsTable = ({ admins }: { admins: StanfordAdmin[] }) => {
  if (admins.length === 0) {
    return (
      <p className="text-muted-foreground">No Stanford admins yet.</p>
    );
  }

  return (
    <Table>
      <TableCaption>
        {admins.length} Stanford admin{admins.length === 1 ? "" : "s"}.
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {admins.map((admin) => (
          <TableRow key={admin.id}>
            <TableCell className="font-medium">{admin.name}</TableCell>
            <TableCell>{admin.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StanfordAdminsTable;
