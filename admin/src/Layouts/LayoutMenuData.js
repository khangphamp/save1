import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

const Navdata = () => {
  const history = useHistory();
  //state data
  const [isDashboard, setIsDashboard] = useState(false);
  const [isPosts, setIsPost] = useState(false);
  const [isCategories, setIsCategory] = useState(false);
  const [isMenus, setIsMenu] = useState(false);
  const [isArticles, setIsArticles] = useState(false);
  const [isFootball, setFootball] = useState(false);
  const [isAuthentications, setAuthentications] = useState(false);

  const [iscurrentState, setIscurrentState] = useState("Dashboard");

  function updateIconSidebar(e) {
    if (e && e.target && e.target.getAttribute("subitems")) {
      const ul = document.getElementById("two-column-menu");
      const iconItems = ul.querySelectorAll(".nav-icon.active");
      let activeIconItems = [...iconItems];
      activeIconItems.forEach((item) => {
        item.classList.remove("active");
        var id = item.getAttribute("subitems");
        if (document.getElementById(id))
          document.getElementById(id).classList.remove("show");
      });
    }
  }

  useEffect(() => {
    document.body.classList.remove("twocolumn-panel");
    if (iscurrentState !== "Dashboard") {
      setIsDashboard(false);
    }
    if (iscurrentState !== "Posts") {
      setIsPost(false);
    }
    if (iscurrentState !== "Menus") {
      setIsMenu(false);
    }
    if (iscurrentState !== "Football") {
      setIsArticles(false);
    }
  }, [history, iscurrentState, isDashboard, isPosts, isMenus, isFootball]);

  const menuItems = [
    {
      label: "Menu",
      isHeader: true,
    },
      {
      id: "dashboard",
      label: "Dashboard",
      icon: "ri-dashboard-2-line",
      link: "/dashboard-analytics",
      subItems: []
    },

    {
      id: "posts",
      label: "Bài viết",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isPosts,
      click: function (e) {
        e.preventDefault();
        setIsPost(!isPosts);
        setIscurrentState("Posts");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "posts",
          label: "Danh sách bài viết",
          link: "/posts",
          parentId: "posts",
        },
        {
          id: "tags",
          label: "Tags",
          link: "/tags",
          parentId: "post",
        },
      ],
    },
    {
      id: "menus",
      label: "Menus",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isMenus,
      click: function (e) {
        e.preventDefault();
        setIsMenu(!isMenus);
        setIscurrentState("Menus");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "menus",
          label: "Menus",
          link: "/menus",
          parentId: "post",
        },
      ],
    },
    {
      id: "categories",
      label: "Danh mục",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isCategories,
      click: function (e) {
        e.preventDefault();
        setIsCategory(!isCategories);
        setIscurrentState("Categories");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "categories",
          label: "Danh sách danh mục",
          link: "/categories",
        },
      ],
    },
    {
      id: "authentications",
      label: "Người dùng",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isAuthentications,
      click: function (e) {
        e.preventDefault();
        setAuthentications(!isAuthentications);
        setIscurrentState("Authentications");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "users",
          label: "Danh sách người dùng",
          link: "/users",
          parentId: "user",
        },
        {
          id: "roles",
          label: "Quyền người dùng",
          link: "/roles",
          parentId: "role",
        },
        {
          id: "actions",
          label: "Danh sách quyền",
          link: "/actions",
          parentId: "action",
        },

        {
          id: "roleActions",
          label: "Phân quyền",
          link: "/roleActions",
          parentId: "roleAction",
        },
      ],
    },
    {
      id: "football",
      label: "Thể Thao",
      icon: "ri-dashboard-2-line",
      link: "/#",
      stateVariables: isFootball,
      click: function (e) {
        e.preventDefault();
        setFootball(!isFootball);
        setIscurrentState("Football");
        updateIconSidebar(e);
      },
      subItems: [
        {
          id: "leagues",
          label: "Danh sách giải đấu",
          link: "/leagues",
          parentId: "football",
        },
      ],
    },

  ];
  return <React.Fragment>{menuItems}</React.Fragment>;
};
export default Navdata;
