import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const students = ["Anit Annadi", "Cyril Joby", "Scott Gerbert"];

const HealthyFutures = ({ title }: { title: string }) => {
  return (
    <Card className="mt-6 border-0 border-b-4 border-accent rounded-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        {/* <h4 className="text-muted-foreground capitalize">No responses yet</h4> */}
        {students.map((student, index) => {
          return (
            <Badge key={index} variant="secondary" className="text-[15px]">
              {student}
            </Badge>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default HealthyFutures;
