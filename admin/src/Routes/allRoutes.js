import React from "react";
import { Redirect } from "react-router-dom";

import Posts from "../pages/Posts";
import HandlePost from "../pages/Posts/Create";
import EditPost from "../pages/Posts/Edit";
import Tags from "../pages/Tags";
import Menus from "../pages/Menus";
import Login from "../pages/Authentication/Login";
import Logout from "../pages/Authentication/Logout";
import Users from "../pages/Authentication/Users";
import Roles from "../pages/Authentication/Role";
import Actions from "../pages/Authentication/Action";
import RoleActions from "../pages/Authentication/RoleAction";
import Leagues from "../pages/FootBall/Leagues";
import Categories from "../pages/Categories";
import DashboardAnalytics from "../pages/DashboardAnalytics";

const authProtectedRoutes = [
  { path: "/dashboard-analytics", component: DashboardAnalytics },
  { path: "/posts", component: Posts },
  { path: "/post/:id", component: EditPost },
  { path: "/post", component: HandlePost },
  { path: "/tags", component: Tags },
  { path: "/menus", component: Menus },
  { path: "/categories", component: Categories },
  { path: "/users", component: Users },
  { path: "/roles", component: Roles },
  { path: "/actions", component: Actions },
  { path: "/roleActions", component: RoleActions },
  {
    path: "/",
    exact: true,
    component: () => <Redirect to="/dashboard" />,
  },
  { path: "/leagues", component: Leagues },
];

const publicRoutes = [
  // Authentication Page
  { path: "/login", component: Login },
  { path: "/logout", component: Logout },
];

export { authProtectedRoutes, publicRoutes };
