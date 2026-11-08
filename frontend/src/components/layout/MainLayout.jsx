
import { Outlet } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "../common/Navbar";
import Footer from "../common/Footer";

function MainLayout() {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant"
    });
  }, []);

  return (
    <div className="main-layout">
      <Navbar />

      <main className="main-layout-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
