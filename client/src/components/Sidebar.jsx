import React from "react";
import { NavLink } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";
import { GoMail } from "react-icons/go";
import {FaRegBookmark } from "react-icons/fa";
import {PiPaintBrushBold } from "react-icons/pi";
import {useDispatch } from "react-redux";
import {uiSliceActions } from "../store/ui-slice";


const Sidebar = () => {
const dispatch = useDispatch()

const openThemeModal = () =>{
  dispatch(uiSliceActions.openThemeModal())
}


  return (
    // <menu className="sidebar">
    //   <NavLink
    //     to="/"
    //     className={`sidebar__items ${({ isActive }) =>
    //       isActive ? "active" : ""}`}
    //   >
    //     <i className="sidebar__icon"><AiOutlineHome/></i>
    //     <p>Home</p>
    //   </NavLink>

    //   <NavLink
    //     to="/messages"
    //     className={`sidebar__items ${({ isActive }) =>
    //       isActive ? "active" : ""}`}
    //   >
    //     <i className="sidebar__icon"><GoMail/></i>
    //     <p>Message</p>
    //   </NavLink>
    //   <NavLink
    //     to="/bookmarks"
    //     className={`sidebar__items ${({ isActive }) =>
    //       isActive ? "active" : ""}`}
    //   >
    //     <i className="sidebar__icon"><FaRegBookmark/></i>
    //     <p>Bookmarks</p>
    //   </NavLink>

    //   <a
    //     className={`sidebar__items ${({ isActive }) =>
    //       isActive ? "active" : ""}`} onClick={openThemeModal}
    //   >
    //     <i className="sidebar__icon"><PiPaintBrushBold/></i>
    //     <p>Themes</p>
    //   </a>
    // </menu>

      <menu className="sidebar">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `sidebar__item ${isActive ? "active" : ""}`
        }
      >
        <span className="sidebar__icon"><AiOutlineHome /></span>
        <span className="sidebar__text">Home</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) =>
          `sidebar__item ${isActive ? "active" : ""}`
        }
      >
        <span className="sidebar__icon"><GoMail /></span>
        <span className="sidebar__text">Message</span>
      </NavLink>

      <NavLink
        to="/bookmarks"
        className={({ isActive }) =>
          `sidebar__item ${isActive ? "active" : ""}`
        }
      >
        <span className="sidebar__icon"><FaRegBookmark /></span>
        <span className="sidebar__text">Bookmarks</span>
      </NavLink>

      <button
        type="button"
        onClick={openThemeModal}
        className="sidebar__item"
      >
        <span className="sidebar__icon"><PiPaintBrushBold /></span>
        <span className="sidebar__text">Themes</span>
      </button>
    </menu>
  );
};

export default Sidebar;
