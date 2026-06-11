import { createBrowserRouter } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { Home } from "@/pages/Home"
import { PostPage } from "@/pages/PostPage"
import { CreatePost } from "@/pages/CreatePost"
import { Profile } from "@/pages/Profile"
import { Search } from "@/pages/Search"

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/post/:id", element: <PostPage /> },
      { path: "/create", element: <CreatePost /> },
      { path: "/profile/:username", element: <Profile /> },
      { path: "/search", element: <Search /> },
    ],
  },
])
