import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import { ScrollProgress, BackToTop } from "./components/Chrome.jsx";
import CursorGlow from "./components/CursorGlow.jsx";
import Home from "./pages/Home.jsx";
import Games from "./pages/Games.jsx";
import GameDetail from "./pages/GameDetail.jsx";
import Platforms from "./pages/Platforms.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import Admin from "./pages/Admin.jsx";
import AdminEdit from "./pages/AdminEdit.jsx";
import AdminCompanyEdit from "./pages/AdminCompanyEdit.jsx";
import AdminTeamEdit from "./pages/AdminTeamEdit.jsx";
import Companies from "./pages/Companies.jsx";
import CompanyDetail from "./pages/CompanyDetail.jsx";
import Teams from "./pages/Teams.jsx";
import TeamDetail from "./pages/TeamDetail.jsx";
import Profile from "./pages/Profile.jsx";

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname, search]);
  return null;
}

export default function App() {
  return (
    <>
      <CursorGlow />
      <ScrollProgress />
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/game/:slug" element={<GameDetail />} />
          <Route path="/platforms" element={<Platforms />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/new" element={<AdminEdit />} />
          <Route path="/admin/edit/:slug" element={<AdminEdit />} />
          <Route path="/admin/companies/new" element={<AdminCompanyEdit />} />
          <Route path="/admin/companies/edit/:slug" element={<AdminCompanyEdit />} />
          <Route path="/admin/teams/new" element={<AdminTeamEdit />} />
          <Route path="/admin/teams/edit/:slug" element={<AdminTeamEdit />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/company/:slug" element={<CompanyDetail />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/team/:slug" element={<TeamDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
