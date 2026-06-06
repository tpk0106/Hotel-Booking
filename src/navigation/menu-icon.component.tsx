import HotelOutlinedIcon from "@mui/icons-material/HotelOutlined";
import HotelSharpIcon from "@mui/icons-material/HotelSharp";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
type Icn = {
  name: string;
};
const MenuIcon = ({ name }: Icn) => {
  switch (name) {
    case "General":
    case "Branches":
    case "Hall event Types":
      return <HotelOutlinedIcon className="text-blue-400" />;
    case "Booking":
    case "Bookings":
    case "Hall":
    case "Customer":
      return <HotelSharpIcon className="text-blue-400" />;
    case "Reports":
      return <SummarizeOutlinedIcon className="text-blue-400" />;
  }
};

export default MenuIcon;
