import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { QueryProvider } from "./providers/QueryProvider";
import { AuthProvider } from "./providers/AuthProvider";
import AppRoutes from "./routes";
import EmergencyBar from "./components/common/EmergencyBar";
import Navbar from "./components/common/Navbar";
// import Footer from "./components/common/Footer";
import { useLocation } from "react-router-dom";
import AdminSidebar from "./components/common/AdminSidebar";

function Layout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <EmergencyBar />
      <Navbar />

      <div className="flex flex-1">
        {isAdminRoute && <AdminSidebar />}

        <main className={`flex-1 ${isAdminRoute ? "ml-0" : ""}`}>
          <AppRoutes />
        </main>
      </div>

      {!isAdminRoute }
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <QueryProvider>
          <AuthProvider>
            <Layout />
          </AuthProvider>
        </QueryProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
