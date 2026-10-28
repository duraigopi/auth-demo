/* Library imports */
import { Suspense } from "react";

/* Lib module imports */
import { UsersPage } from "@lib/pages/users";

/* The page reads the URL query, so it needs a Suspense boundary */
const Home = () => (
  <Suspense>
    <UsersPage />
  </Suspense>
);

export default Home;
