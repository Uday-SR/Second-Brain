import StarField from "./Starfield";
import backgroundImage from "../assets/background.png";

export default function Backdrop() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden bg-[#12141c] bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <StarField />
    </div>
  );
}
