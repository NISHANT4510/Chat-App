import axios from "axios";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch} from "react-redux";
import { userActions } from "../store/user-slice";
import { connectSocket } from "../utils/socket";

const Login = () => {
  const [userData, setUserData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setshowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  //function to change userdata
  const changeInputHandler = (e) => {
    setUserData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  //function to login user
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/login`,
        userData
      );
      // Connect to socket after successful login
      connectSocket(response.data._id);
      // console.log(response.data)
      if (response.status == 200) {
        dispatch(userActions.changeCurrentUser(response?.data))
        localStorage.setItem("currentUser", JSON.stringify(response?.data))
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message);
    }
  };

  // console.log(userData)
  return (
    <section className="register">
      <div className="container register__container">
        <h2>Sign In</h2>
        <form onSubmit={loginUser}>
          {error && <p className="form__error-message">{error}</p>}
          <input
            type="text"
            name="email"
            placeholder="Email"
            onChange={changeInputHandler}
            autoFocus
          />
          <div className="password__controller">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={changeInputHandler}
            />
            <span onClick={() => setshowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <p>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
          <button type="submit" className="btn primary">
            Login
          </button>
        </form>
      </div>
    </section>
  );
};

export default Login;
