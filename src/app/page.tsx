/* Library imports */
import { Suspense } from "react";

/* Lib module imports */
import { HomePage } from "@lib/pages/home";

/* The users list reads the URL query, so the page needs a Suspense boundary */
const Home = () => (
  <Suspense>
    <HomePage />
  </Suspense>
);

export default Home;
