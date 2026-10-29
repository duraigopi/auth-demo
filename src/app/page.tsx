/* Library imports */
import { Suspense } from "react";

/* Lib module imports */
import { HomePage } from "@lib/pages/home";

const Home = () => (
  <Suspense>
    <HomePage />
  </Suspense>
);

export default Home;
