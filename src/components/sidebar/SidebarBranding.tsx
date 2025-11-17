import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Logo from "../global/Logo";

const SidebarBranding = () => {
  return (
    <div>
      <div className="group-data-[state=expanded]:flex group-data-[state=collapsed]:hidden">
        <Logo />
      </div>

      <div className="group-data-[state=collapsed]:flex group-data-[state=expanded]:hidden">
        <Avatar>
          <AvatarImage src="https://images.crunchbase.com/image/upload/c_pad,h_256,w_256,f_auto,q_auto:eco,dpr_1/issvqcgzdqxshyitbkne?ik-sanitizeSvg=true" />
        </Avatar>
      </div>
    </div>
  );
};

export default SidebarBranding;
