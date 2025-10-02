import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import ProfileImage from "./ProfileImage";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { userActions } from "../store/user-slice";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state?.user?.currentUser);
  const userId = user?.id;
  const token = user?.token;

  // GET USER FROM DB and update Redux
  const getUser = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch(userActions.changeCurrentUser({ ...user, ...response?.data })); // update Redux
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userId && token) {
      getUser();
    }
  }, [userId, token]);

  // REDIRECT USER TO LOGIN PAGE WHEN USER DOESN'T HAVE A TOKEN
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token]);

  // LOG USER OUT AFTER AN HOUR
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/logout");
    }, 1000 * 60 * 60);

    return () => clearTimeout(timer);
  }, []);

  return (
    <nav className="navbar">
      <div className="container navbar__container">
        <Link to="/" className="navbar__logo">
          LetsChat
        </Link>
        <form className="navbar__search">
          <input type="search" placeholder="Search" />
          <button type="submit">
            <CiSearch />
          </button>
        </form>
        <div className="navbar__right">
          <Link to={`/users/${userId}`} className="navbar__profile">
            <ProfileImage image={user?.profilePhoto} />
          </Link>
          {token ? (
            <Link to="/logout">Logout</Link>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
