"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, CheckCircle2, Info, Megaphone } from "lucide-react";
import { UserSidebar } from "@/components/sidebar-user";
import { ManagerSidebar } from "@/components/sidebar-manager";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type?: 'success' | 'info' | 'warning';
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "อนุมัติคำขอลา",
    message: "คำขอลาป่วยของคุณได้รับการอนุมัติแล้ว",
    time: "2 ชั่วโมงที่แล้ว",
    read: false,
    type: 'success'
  },
  {
    id: "2",
    title: "อัปเดตระบบ",
    message: "ระบบจะปิดปรับปรุงคืนนี้เวลา 22:00 น.",
    time: "5 ชั่วโมงที่แล้ว",
    read: true,
    type: 'info'
  },
  {
    id: "3",
    title: "ประกาศจากบริษัท",
    message: "การประชุม Townhall พรุ่งนี้เวลา 10:00 น.",
    time: "1 วันที่แล้ว",
    read: true,
    type: 'warning'
  }
];

const getNotificationIcon = (type?: string) => {
  switch (type) {
    case 'success': return <CheckCircle2 className="w-9 h-9 p-2 rounded-full bg-emerald-100 text-emerald-600" />;
    case 'warning': return <Megaphone className="w-9 h-9 p-2 rounded-full bg-amber-100 text-amber-600" />;
    case 'info':
    default: return <Info className="w-9 h-9 p-2 rounded-full bg-blue-100 text-blue-600" />;
  }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        } else {
          setNotifications(mockNotifications);
        }
      } catch (error) {
        setNotifications(mockNotifications);
      }
    };
    fetchNotifications();
    
    const storedRole = sessionStorage.getItem("role");
    const storedName = sessionStorage.getItem("username");
    if (!storedRole) {
      router.push("/login");
    } else {
      // Route protection to strictly separate user and manager roles
      if (storedRole === "manager" && pathname.startsWith("/dashboard/user")) {
        router.push("/dashboard/manager");
        return;
      }
      if (storedRole === "user" && pathname.startsWith("/dashboard/manager")) {
        router.push("/dashboard/user");
        return;
      }
      
      setRole(storedRole);
      setUsername(storedName || (storedRole === "manager" ? "Manager" : "User"));
    }
  }, [router, pathname]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };


  if (!role) return null; // loading

  return (
    <div className="min-h-screen bg-[#0B0F4E] text-white flex selection:bg-blue-500/30">
      {/* Sidebar */}
      {role === "manager" ? (
        <ManagerSidebar />
      ) : (
        <UserSidebar />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-end px-6 border-b border-gray-200 bg-white z-[100] sticky top-0 shrink-0 shadow-sm relative">
          <div className="flex items-center gap-6 text-black relative">
            <button 
              className="hover:bg-gray-100 p-2 rounded-full transition-all relative focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-full right-0 mt-3 w-[360px] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2">
                <div className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 text-base">การแจ้งเตือน</h3>
                  {notifications.filter(n => !n.read).length > 0 ? (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        อ่านทั้งหมด
                      </button>
                      <span className="text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full font-semibold tracking-wide">
                        ใหม่ {notifications.filter(n => !n.read).length}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">ไม่มีรายการใหม่</span>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto bg-gray-50/30">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors flex gap-4 ${!notification.read ? 'bg-white' : ''}`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm truncate ${!notification.read ? 'text-gray-900 font-semibold' : 'text-gray-700 font-medium'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && <span className="w-2 h-2 shrink-0 rounded-full bg-blue-500 mt-1.5"></span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{notification.message}</p>
                          <p className="text-[10px] text-gray-400 mt-2 font-medium">{notification.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Bell className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">ไม่มีการแจ้งเตือน</p>
                      <p className="text-xs text-gray-500 mt-1">คุณได้อ่านการแจ้งเตือนทั้งหมดแล้ว</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-medium tracking-wide">แสดงรายการแจ้งเตือนทั้งหมดแล้ว</p>
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
