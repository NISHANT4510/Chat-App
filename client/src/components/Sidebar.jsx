import React from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { GoMail } from "react-icons/go";
import { FaRegBookmark } from "react-icons/fa";
import { PiPaintBrushBold } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { uiSliceActions } from "../store/ui-slice";

const Sidebar = () => {
  const dispatch = useDispatch();

  const openThemeModal = () => {
    dispatch(uiSliceActions.openThemeModal());
  };

  const menuItems = [
    { to: "/", icon: AiOutlineHome, label: "Home" },
    { to: "/messages", icon: GoMail, label: "Messages" },
    { to: "/bookmarks", icon: FaRegBookmark, label: "Bookmarks" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-3 sticky top-20 h-fit">
        <nav className="flex flex-col gap-1 mb-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`
              }
            >
              <item.icon className="text-xl flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            onClick={openThemeModal}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <PiPaintBrushBold className="text-xl flex-shrink-0" />
            <span>Themes</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300"
                }`
              }
            >
              <item.icon className="text-2xl" />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          ))}

          <button
            onClick={openThemeModal}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 text-gray-700 dark:text-gray-300"
          >
            <PiPaintBrushBold className="text-2xl" />
            <span className="text-xs">Themes</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
