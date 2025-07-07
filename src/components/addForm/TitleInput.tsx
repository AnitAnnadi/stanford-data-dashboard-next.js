import { Card, CardContent } from "@/components/ui/card";

const TitleInput = () => {
  return (
    <Card className="border-t-6 border-t-primary">
      <CardContent>
        <input
          type="text"
          name="formName"
          defaultValue="Untitled form"
          placeholder="Form title"
          className="w-full text-3xl pb-2 border-b-2 transition-colors duration-200 ease-in-out focus:border-primary focus:outline-none"
          required
        />
      </CardContent>
    </Card>
  );
};

export default TitleInput;
