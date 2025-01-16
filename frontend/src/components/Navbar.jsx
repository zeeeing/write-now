import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../services/api";

export const StyledNavbar = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      setUserId(userId);
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getUserById(userId);
        setUser(response);
      } catch (err) {
        setIsLoading(false);
      } finally {
        setIsLoading(true);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const handleLogOut = () => {
    setUser(null);
    localStorage.clear();
    setIsLoading(false);
    navigate("/");
  };

  return (
    <Navbar isBordered>
      <NavbarBrand>
        <p className="font-bold text-inherit">SBC</p>
      </NavbarBrand>

      <NavbarContent className="gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="/email">
            Email
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link aria-current="page" href="/dashboard">
            Dashboard
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/programmes">
            Programmes
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent as="div" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              className="transition-transform"
              color="default"
              name=""
              size="sm"
              src=""
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">
                {isLoading ? "Loading..." : user?.email ? user?.email : "--"}
              </p>
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onPress={handleLogOut}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};
