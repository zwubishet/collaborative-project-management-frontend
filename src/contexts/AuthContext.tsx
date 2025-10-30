import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION, LOGOUT_MUTATION, REGISTER_MUTATION } from "../graphql/mutations";
import { ME_QUERY } from "../graphql/queries";
import { client } from "../apollo/client";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

interface LoginData {
  login: {
    accessToken: string;
    user: User;
  };
}
interface LoginVars {
  email: string;
  password: string;
}

interface RegisterData {
  register: {
    accessToken: string;
    user: User;
  };
}
interface RegisterVars {
  name: string;
  email: string;
  password: string;
}

interface LogoutData {
  logout: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [loginMutation] = useMutation<LoginData, LoginVars>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<RegisterData, RegisterVars>(REGISTER_MUTATION);
  const [logoutMutation] = useMutation<LogoutData>(LOGOUT_MUTATION);

useEffect(() => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    setLoading(false);
    return;
  }

  interface MeData {
  me: User | null;
}

  // fetch current user from backend
  const fetchUser = async () => {
    try {
      const { data } = await client.query<MeData>({
        query: ME_QUERY,
        context: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        fetchPolicy: "no-cache", // avoid cached stale data
      });

      if (data?.me) {
        setUser(data.me); // assume 'me' returns { id, name, email }
      } else {
        localStorage.removeItem("authToken");
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user", err);
      localStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);

const login = async (email: string, password: string) => {
  const { data } = await loginMutation({
    variables: { email, password },
  });

  if (!data?.login?.accessToken) {
    throw new Error("Invalid credentials");
  }

  localStorage.setItem("authToken", data.login.accessToken);
  setUser(data.login.user);
};


const register = async (name: string, email: string, password: string) => {
  const { data } = await axios.post("http://localhost:4000/auth/register", {
    withcridentials: true,
    name,
    email,
    password,
  });
  localStorage.setItem("authToken", data.accessToken);
  setUser(data.user);
};


  const logout = async () => {
    await logoutMutation();
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const refetchUser = async () => {
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
