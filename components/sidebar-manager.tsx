"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, PieChart, FileEdit, Activity, BookOpen, Calendar, User, FileCheck } from "lucide-react";

export function ManagerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState("ชื่อ xxxxx xxxx");

  useEffect(() => {
    const storedName = sessionStorage.getItem("username");
    if (storedName && storedName !== "Manager") {
      setUsername(storedName);
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("username");
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard/manager", icon: PieChart },
    { name: "สร้างคำขอลา", href: "/dashboard/manager/request", icon: FileEdit },
    { name: "สถานะการลา", href: "/dashboard/manager/status", icon: Activity },
    { name: "ประวัติการลา", href: "/dashboard/manager/history", icon: BookOpen },
    { name: "ปฏิทินวันลา", href: "/dashboard/manager/calendar", icon: Calendar },
    { name: "อนุมัติการลา", href: "/dashboard/manager/approve", icon: FileCheck },
  ];

  return (
    <aside className="w-[280px] bg-[#0B0F4E] text-white flex flex-col h-screen font-sans shrink-0 border-r border-white/10 sticky top-0">
      {/* Logo */}
      <div className="pt-8 pb-6 px-6 flex flex-col items-center border-b border-white/10">
        <div className="flex items-center text-white text-[2.75rem] font-light tracking-widest relative">
          <span>N</span>
          <span className="relative mx-1">
            I
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2.5 h-2.5 bg-[#ffaa00] rounded-full"></span>
          </span>
          <span>D</span>
        </div>
        <div className="text-[8px] text-gray-300 tracking-[0.25em] mt-1.5 text-center w-full">
          PROGRESS TECHNOLOGY
        </div>
      </div>

      {/* User Profile */}
      <div className="px-5 py-6">
        <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/10">
          <div className="bg-zinc-500 rounded-full w-11 h-11 flex items-center justify-center shrink-0">
             <User className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-[13px] truncate">{username}</h3>
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">ตำแหน่ง xxxxxxxxxx</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-3 overflow-y-auto mt-2">
        {menuItems.map((item) => {
          const isExactActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all relative overflow-hidden ${
                isExactActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {isExactActive && (
                <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-blue-400 rounded-r-full shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
              )}
              <item.icon className="w-[22px] h-[22px]" strokeWidth={2.5} />
              <span className="font-semibold text-sm tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-5 mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3.5 rounded-xl transition-colors font-semibold text-sm tracking-wide border border-red-500/20"
        >
          <LogOut className="w-5 h-5" strokeWidth={2.5} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
