import Image from "next/image";

const Logo = ({
  width = 250,
  height = 125,
}: {
  width?: number;
  height?: number;
}) => {
  return (
    <Image
      src="/image001.png"
      alt="logo"
      width={width}
      height={height}
      className="mx-auto"
    />
  );
};

export default Logo;
