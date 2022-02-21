import react, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import LoadingScreen from "../PageChange/PageChange";
import {api} from "../../api/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromCookies() {
      const token = Cookies.get("token");
      if (token) {
        console.log("Got a token in the cookies, let's see if it is valid");
        api.defaults.headers.Authorization = `Bearer ${token}`;
        const { data: user } = await api.get("users/me");
        if (user) setUser(user);
      }
      setLoading(false);
    }
    console.log("loadUserFromCookies");
    setTimeout(() => {
      setUser(true), setLoading(false);
    }, 1000);
    // loadUserFromCookies();
  }, []);

  const login = async (email, password) => {
    const { data: token } = await api.post("auth/login", { email, password });
    if (token) {
      console.log("Got token");
      Cookies.set("token", token, { expires: 60 });
      api.defaults.headers.Authorization = `Bearer ${token.token}`;
      const { data: user } = await api.get("users/me");
      setUser(user);
      console.log("Got user", user);
    }
  };

  const logout = (email, password) => {
    Cookies.remove("token");
    setUser(null);
    delete api.defaults.headers.Authorization;
    window.location.pathname = "/signIn";
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, login, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const ProtectRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading || !isAuthenticated) {
    //  && window.location.pathname !== "/signIn"
    return <LoadingScreen />;
  }
  return children;
};
