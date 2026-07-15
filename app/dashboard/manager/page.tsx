"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  stats: {
    remaining: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  monthlyStats: { month: string; value: number }[];
  announcements: { id: string; title: string; subtitle: string; isImportant?: boolean }[];
  activities: { id: string; title: string; time: string; type: 'leave' | 'approve' | 'system' }[];
}

export default function ManagerPersonalDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [username, setUsername] = useState("ชื่อ xxxxx xxxx");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername && storedUsername !== "Manager") {
      setUsername(storedUsername);
    }
    
    // Simulate API Fetch with Mock Data Fallback
    const fetchData = async () => {
      try {
        // Attempt to fetch from real API here
        // const response = await fetch('/api/user/dashboard');
        // if (!response.ok) throw new Error('API not available');
        // const result = await response.json();
        // setData(result);
        throw new Error("API not implemented yet");
      } catch (error) {
        // Fallback to Mock Data
        setData({
          stats: {
            remaining: 8,
            pending: 1,
            approved: 5,
            rejected: 1
          },
          monthlyStats: [
            { month: "ม.ค.", value: 1 },
            { month: "ก.พ.", value: 0 },
            { month: "มี.ค.", value: 2 },
            { month: "เม.ย.", value: 4 },
            { month: "พ.ค.", value: 0 },
            { month: "มิ.ย.", value: 3 },
            { month: "ก.ค.", value: 1 },
            { month: "ส.ค.", value: 0 },
            { month: "ก.ย.", value: 0 },
            { month: "ต.ค.", value: 0 },
            { month: "พ.ย.", value: 0 },
            { month: "ธ.ค.", value: 0 }
          ],
          announcements: [
            { id: "1", title: "อัปเดตสวัสดิการ 2026", subtitle: "เติมของกินให้แล้วเย้", isImportant: false },
            { id: "2", title: "อัปเดตด่วน!", subtitle: "วันนี้ WFH ให้ทำงานที่พักตัวเอง", isImportant: true }
          ],
          activities: [
            { id: "1", title: "ส่งคำขอลาพักร้อน 3 วัน", time: "15 ชม. ที่แล้ว", type: "leave" },
            { id: "2", title: "หัวหน้าอนุมัติ", time: "เมื่อวาน, 14:30", type: "approve" },
            { id: "3", title: "ระบบอัปเดตสิทธิวันลาประจำปี", time: "1 วันที่แล้ว", type: "system" },
          ]
        });
      }
    };

    fetchData();
  }, []);

  if (!data) return <div className="p-8 text-white flex justify-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 text-black bg-[#E5E7EB] min-h-full">
      {/* Banner */}
      <div className="bg-[#0B0F4E] rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between text-white relative overflow-hidden shadow-md">
        <div className="z-10">
          <h1 className="text-2xl font-semibold mb-1">สวัสดี, {username}</h1>
          <p className="text-[#9EA1FF] text-sm font-medium">ยินดีต้อนรับสู่ Dashboard ของคุณ</p>
        </div>
        
        <div className="flex items-center gap-4 mt-6 md:mt-0 z-10">
          <Button variant="secondary" className="bg-white text-black hover:bg-gray-100 font-semibold rounded-xl px-6 py-5 shadow-sm">
            ตรวจสอบสถานะ
          </Button>
          <Button className="bg-[#2A3175] hover:bg-[#343d8a] text-white border border-[#3A4590] font-semibold rounded-xl px-6 py-5 shadow-sm flex items-center gap-2">
            <span className="text-lg leading-none">+</span> ยื่นคำลา
          </Button>
        </div>
        
        <div className="absolute bottom-4 right-6 z-10">
          <Link href="/dashboard/manager/team" className="text-xs text-[#9EA1FF] hover:text-white underline-offset-4 hover:underline font-medium">
            ดู Dashboard ของแผนก
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Remaining */}
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-6">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-[13px] font-bold text-gray-600 mb-1">วันลาพักร้อนคงเหลือ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-bold text-gray-800 leading-none">{data.stats.remaining}</span>
              <span className="text-sm font-semibold text-gray-500">วัน</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center mb-6">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-[13px] font-bold text-gray-600 mb-1">รายการรออนุมัติ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-bold text-gray-800 leading-none">{data.stats.pending}</span>
              <span className="text-sm font-semibold text-gray-500">รายการ</span>
            </div>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-[13px] font-bold text-gray-600 mb-1">อนุมัติแล้ว (ปีนี้)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-bold text-gray-800 leading-none">{data.stats.approved}</span>
              <span className="text-sm font-semibold text-gray-500">รายการ</span>
            </div>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-6">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-[13px] font-bold text-gray-600 mb-1">คำขอที่ถูกปฏิเสธ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] font-bold text-gray-800 leading-none">{data.stats.rejected}</span>
              <span className="text-sm font-semibold text-gray-500">รายการ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        
        {/* Chart */}
        <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm h-[320px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-0 pt-6 px-6">
            <CardTitle className="text-[17px] font-bold text-gray-800">สถิติการลารายเดือน</CardTitle>
            <div className="bg-gray-100/80 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200/50">
              ปี 2026 <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-end justify-between px-6 pb-6 pt-6 gap-2">
             {/* Y-axis labels */}
             <div className="flex flex-col justify-between h-full text-[11px] font-medium text-gray-400 py-1 pr-3 border-r border-gray-100">
               <span>4.0</span>
               <span>3.5</span>
               <span>3.0</span>
               <span>2.5</span>
               <span>2.0</span>
               <span>1.5</span>
               <span>1.0</span>
               <span>0.5</span>
               <span>0</span>
             </div>
             
             {/* Bars */}
             <div className="flex-1 flex justify-around items-end h-full pt-2">
                {data.monthlyStats.map((stat, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 w-full group">
                    <div className="w-[70%] max-w-[32px] bg-[#00AEEF] rounded-t-sm transition-all group-hover:bg-[#0090D0]" 
                         style={{ height: `${(stat.value / 4) * 100}%`, minHeight: stat.value > 0 ? '4px' : '0' }}></div>
                    <span className="text-[11px] font-medium text-gray-500">{stat.month}</span>
                  </div>
                ))}
             </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card className="lg:col-span-1 rounded-2xl border-none shadow-sm bg-[#1C215A] text-white flex flex-col h-[320px]">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-[17px] font-bold">ประกาศบริษัท</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-6 space-y-3 overflow-y-auto custom-scrollbar">
            {data.announcements.map((ann, i) => (
              <div key={i} className={`p-4 rounded-xl ${ann.isImportant ? 'bg-[#3C4A8D]' : 'bg-[#2A3175]'} border border-white/10 shadow-sm`}>
                <h4 className="font-bold text-[13px] mb-1">{ann.title}</h4>
                <p className="text-xs text-[#9EA1FF] font-medium">{ann.subtitle}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Activities */}
        <Card className="lg:col-span-1 rounded-2xl border-none shadow-sm flex flex-col h-[320px]">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-[17px] font-bold text-gray-800">กิจกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 overflow-y-auto custom-scrollbar">
            <div className="relative pl-5 space-y-6 mt-2">
              {/* Vertical line connecting timeline items */}
              <div className="absolute left-[7px] top-1 bottom-4 w-0.5 bg-gray-100"></div>
              
              {data.activities.map((act, i) => (
                <div key={i} className="relative">
                  {/* Timeline dot */}
                  <div className={`absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-white shadow-sm ${
                    act.type === 'leave' ? 'bg-[#F59E0B]' : 
                    act.type === 'approve' ? 'bg-[#10B981]' : 
                    'bg-[#3B82F6]'
                  }`}></div>
                  
                  <h4 className="text-[13px] font-bold text-gray-800 leading-tight">{act.title}</h4>
                  <p className="text-[11px] font-medium text-gray-400 mt-1.5">{act.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
