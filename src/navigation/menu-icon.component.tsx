import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import HotelSharpIcon from "@mui/icons-material/HotelSharp";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
type Icn = {
  name: string;
};
const MenuIcon = ({ name }: Icn) => {
  switch (name) {
    case "General":
      return <HotelOutlinedIcon className="text-blue-400" />;
    case "Booking":
      return <HotelSharpIcon className="text-blue-400" />;
    case "Reports":
      return <SummarizeOutlinedIcon className="text-blue-400" />;
  }
};

export default MenuIcon;
