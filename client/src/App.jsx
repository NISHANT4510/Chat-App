import React, { Children } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./RootLayout";
import Home from "./pages/Home";
import ErrorPage from "./pages/ErrorPage";
import MessageList from "./components/MessageList";
import Messages from "./pages/Messages";
import Bookmarks from "./pages/Bookmarks";
import Profile from "./pages/Profile";
import SinglePost from "./pages/SinglePost";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
import {Provider} from "react-redux";
import store from "./store/store";
import UserProfile from "./components/UserProfile";
import MessagesLayout from "./components/MessagesLayout";
import ProtectedRoute from "./components/ProtectedRoute";





const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><RootLayout /></ProtectedRoute>,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { 
        path: "messages",
        element: <MessagesLayout />,
        children: [
          { index: true, element: <div className="flex items-center justify-center h-full text-gray-500">Select a conversation to start messaging</div> },
          { path: ":receiverId", element: <Messages /> }
        ]
      },
      { path: "bookmarks", element: <Bookmarks /> },
      { path: "users/:id", element: <Profile /> },
      { path: "posts/:id", element: <SinglePost /> },
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/logout", element: <Logout /> },
]);



const App = () => {
  return (
    <Provider store={store}>
    <RouterProvider router={router}/>

    </Provider>
  )
};

export default App;
