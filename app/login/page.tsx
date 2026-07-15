"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === "user") {
      localStorage.setItem("role", "user");
      // Store username to associate leave requests
      localStorage.setItem("username", username || "User");
      router.push("/dashboard/user");
    } else if (password === "manager") {
      localStorage.setItem("role", "manager");
      localStorage.setItem("username", username || "Manager");
      router.push("/dashboard/manager");
    } else {
      setError("Invalid password. Use 'user' or 'manager'.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#454545] relative overflow-hidden font-sans">
      {/* Abstract Shapes */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[150vh] h-[150vh] bg-[#ffaa00] rounded-full"></div>
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[60vh] h-[60vh] bg-[#002fff] rounded-full"></div>

      {/* Logo Top Right */}
      <div className="absolute top-10 right-12 z-20 flex flex-col items-center">
        <div className="flex items-center text-white text-5xl font-light tracking-widest">
          <span>N</span>
          <span className="relative mx-1">
            I
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 bg-[#ffaa00] rounded-full"></span>
          </span>
          <span>D</span>
        </div>
        <div className="text-[9px] text-gray-300 tracking-[0.25em] mt-1.5 text-center">
          PROGRESS TECHNOLOGY
        </div>
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full flex items-center justify-end pr-[8%] lg:pr-[15%] xl:pr-[20%]">
        <div className="w-full max-w-[450px]">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-12 tracking-wide">LOGIN</h1>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-transparent border-gray-500 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#ffaa00] focus-visible:border-[#ffaa00] rounded text-base"
              />
            </div>
            
            <div>
              <Input 
                type="password" 
                placeholder="Password (user / manager)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-transparent border-gray-500 text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-[#ffaa00] focus-visible:border-[#ffaa00] rounded text-base"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              <div className="flex justify-end mt-2">
                <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors underline decoration-gray-400 underline-offset-4">
                  forgot your password?
                </Link>
              </div>
            </div>
            
            <div className="pt-4">
              <Button type="submit" className="w-full h-12 bg-[#ffaa00] hover:bg-[#e69900] text-black font-bold text-lg rounded uppercase tracking-wider transition-colors">
                LOGIN
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

