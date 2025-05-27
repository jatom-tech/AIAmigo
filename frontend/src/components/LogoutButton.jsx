import { useNavigate } from "react-router-dom";
import { logoutAndRedirect } from "../utils/auth";

export default function LogoutButton() {
  const navigate = useNavigate();
  return (
    <button onClick={() => logoutAndRedirect(navigate)}>
      Log ud
    </button>
  );
}