import { Form, Link } from "@remix-run/react";
import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { type Navigation } from "~/types";
import { NavList } from "./NavList";
export const MobileSidebar = ({
  setState,
  state,
  navigation,
  cookie,
}: {
  setState: React.Dispatch<React.SetStateAction<boolean>>;
  state: boolean;
  navigation: Navigation;
  cookie: any;
}) => {
  return (
    <Transition.Root show={state} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={setState}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex flex-1 w-full max-w-xs mr-16">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 flex justify-center w-16 pt-5 left-full">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5"
                    onClick={() => setState(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <div className="w-6 h-6 text-white" aria-hidden="true">
                      X
                    </div>
                  </button>
                </div>
              </Transition.Child>
              <div className="flex flex-col px-6 pb-4 overflow-y-auto bg-white grow gap-y-5">
                <div className="flex flex-col justify-center h-16 shrink-0">
                  <h1 className="text-lg font-semibold tracking-wide">
                    AI APP
                  </h1>
                  <h4 className="text-sm text-gray-600">{cookie.title}</h4>
                </div>
                <nav className="flex flex-col flex-1">
                  <div className="flex flex-col flex-1 gap-y-7">
                    <div className="-mx-2 space-y-1">
                      <NavList navigation={navigation} />
                    </div>

                    <div className="mt-auto ">
                      <Link
                        to="/dashboard/settings/profile"
                        className="flex p-2 -mx-2 text-sm font-semibold leading-6 text-gray-700 rounded-md outline-none focus:outline-none group gap-x-3 hover:bg-gray-100 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 my-auto"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                          />
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <div className="my-auto">Settings</div>
                      </Link>
                      <Form
                        action="/logout"
                        method="post"
                        className="flex p-2 -mx-2 text-sm font-semibold leading-6 text-gray-700 rounded-md outline-none focus:outline-none group gap-x-3 hover:bg-gray-100 hover:text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          className="w-[18px] h-[18px] my-auto"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        <button type="submit" className="my-auto">
                          Logout
                        </button>
                      </Form>
                    </div>
                  </div>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
