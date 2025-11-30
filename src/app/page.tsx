import Logo from "@/components/global/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid h-lvh place-items-center">
      <div className="flex flex-col items-center text-center">
        <Logo />
        <h1 className="text-4xl font-bold mt-6">Data Dashboard</h1>
        <div className="grid sm:grid-cols-2 gap-10 mt-10 text-2xl font-semibold">
          <div>
            <p>NEW USER</p>
            <Link href="/register">
              <Button className="w-full mt-4">Register Here</Button>
            </Link>
          </div>

          <div>
            <p>RETURNING USER</p>
            <Link href="/login">
              <Button className="w-full mt-4">Login Here</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
