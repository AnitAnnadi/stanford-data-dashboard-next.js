import { Card, CardContent } from "@/components/ui/card";

const InfoCard = ({ data, caption }: { data: string; caption: string }) => {
  return (
    <Card className="w-full border-0 border-b-4 border-accent rounded-sm">
      <CardContent>
        <h2 className="text-5xl font-medium tracking-wider mb-4">{data}</h2>
        <p className="capitalize">{caption}</p>
      </CardContent>
    </Card>
  );
};

export default InfoCard;
