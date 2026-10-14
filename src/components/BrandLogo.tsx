import Image from "next/image";
import logo from "../../public/images/logo-transparent.png";

/** Original artwork from the public landing page's menu bar. */
export function BrandLogo() {
  return <Image src={logo} alt="VAVI Tile Studio" className="brand-logo" loading="eager" sizes="(max-width: 1023px) 53px, 67px" />;
}
