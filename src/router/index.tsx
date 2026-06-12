import { createHashRouter } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Home } from "@/pages/Home"
import { PostPage } from "@/pages/PostPage"
import { CreatePost } from "@/pages/CreatePost"
import { EditPost } from "@/pages/EditPost"
import { Profile } from "@/pages/Profile"
import { Search } from "@/pages/Search"
import { StatusPage } from "@/pages/StatusPage"
import { ChangelogPage } from "@/pages/ChangelogPage"
import { AdminPage } from "@/pages/AdminPage"
import { NotFound } from "@/pages/NotFound"

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/post/:id", element: <PostPage /> },
      { path: "/post/:id/edit", element: <EditPost /> },
      { path: "/create", element: <CreatePost /> },
      { path: "/profile/:username", element: <Profile /> },
      { path: "/search", element: <Search /> },
      { path: "/status", element: <StatusPage /> },
      { path: "/changelog", element: <ChangelogPage /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
])
