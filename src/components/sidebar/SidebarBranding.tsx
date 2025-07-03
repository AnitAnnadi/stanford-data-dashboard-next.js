import { Avatar, AvatarImage } from "@/components/ui/avatar";

const SidebarBranding = () => {
  return (
    <div className="flex items-center focus:outline-none overflow-hidden">
      <Avatar>
        <AvatarImage src="https://identity.stanford.edu/wp-content/uploads/sites/3/2020/07/block-s-right.png" />
      </Avatar>
      <div className="justify-items-start ml-4 mr-2 whitespace-nowrap">
        <h4 className="font-semibold capitalize">Stanford REACH Lab</h4>
        <p className="text-sm">Curriculum Data Dashboard</p>
      </div>
    </div>
  );
};

export default SidebarBranding;
