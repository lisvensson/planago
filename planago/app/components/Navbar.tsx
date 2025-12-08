import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import logo from "../assets/planago-logo-brown.svg";
import { Form, NavLink } from "react-router";
import { authClient } from "~/shared/auth/client";

const navigation = [
  { name: "Börja planera", href: "/planago/filter", current: false },
  { name: "Hur fungerar det?", href: "/how-to-use", current: false },
  { name: "Om oss", href: "/about", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {},
      },
    });
  };
  return (
    <Disclosure
      as="nav"
      className="relative bg-background border-b border-accent/25 text-primary"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-primary hover:bg-accent/10 hover:text-accent focus:outline-2 focus:-outline-offset-1 focus:outline-primary">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block size-6 group-data-open:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden size-6 group-data-open:block"
              />
            </DisclosureButton>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <a href="/" className="flex items-center h-16">
                <img
                  src={logo}
                  alt="Planago logo"
                  className="h-full w-auto object-contain"
                />
              </a>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      classNames(
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-primary hover:bg-accent/10 hover:text-accent",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Menu as="div" className="relative ml-3">
              <MenuButton className="relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <img
                  alt=""
                  src="https://i0.wp.com/digitalhealthskills.com/wp-content/uploads/2022/11/3da39-no-user-image-icon-27.png?fit=500%2C500&ssl=1"
                  className="size-8 rounded-full bg-gray-800 outline -outline-offset-1 outline-white/10"
                />
              </MenuButton>

              <MenuItems
                transition
                className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-background py-1 shadow-lg outline outline-border ..."
              >
                <MenuItem>
                  <a
                    href="/account/saved-plans"
                    className="block px-4 py-2 text-sm text-primary hover:bg-accent/10 hover:text-accent data-focus:outline-hidden"
                  >
                    Sparade planer
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="/account/settings"
                    className="block px-4 py-2 text-sm text-primary hover:bg-accent/10 hover:text-accent data-focus:outline-hidden"
                  >
                    Inställningar
                  </a>
                </MenuItem>
                <MenuItem>
                  <Form
                    method="post"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleSignOut();
                    }}
                  >
                    <button
                      type="submit"
                      className="block w-full px-4 py-2 text-left text-sm font-medium text-accent hover:bg-accent/10 hover:text-accent data-focus:outline-hidden"
                    >
                      Logga ut
                    </button>
                  </Form>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                classNames(
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-primary hover:bg-accent/10 hover:text-accent",
                  "block rounded-md px-3 py-2 text-base font-medium"
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
