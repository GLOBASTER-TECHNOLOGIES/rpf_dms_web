"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
    _id: string;
    role: "officer" | "post";
    // officer fields
    name?: string;
    forceNumber?: string;
    rank?: string;
    postCode?: string;
    division?: string;
    active?: boolean;
    // post fields
    postName?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/auth/me")
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (!data) return;
                if (data.officer) setUser({ ...data.officer, role: "officer" });
                else if (data.post) setUser({ ...data.post, role: "post" });
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (identifier: string, password: string) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        if (data.officer) {
            setUser({ ...data.officer, role: data.officer.role });
            router.push(data.officer.role === "post" ? "/post" : "/admin");
        }
    };

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};