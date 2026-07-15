"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, CheckCircle2, XCircle, Plus } from "lucide-react";
import { getLeaveRequests } from "@/lib/store";

export default function UserDashboard() {
  const [username, setUsername] = useState("ชื่อ xxxxx xxxx");
  const [selectedYear, setSelectedYear] = useState(2026);
  
  const [stats, setStats] = useState({ remainingLeaves: 8, pending: 1, approved: 5, rejected: 1 });
  const [chartData, setChartData] = useState([
    { month: "ม.ค.", value: 1 }, { month: "ก.พ.", value: 0 }, { month: "มี.ค.", value: 2 },
    { month: "เม.ย.", value: 4 }, { month: "พ.ค.", value: 0 }, { month: "มิ.ย.", value: 3 },
    { month: "ก.ค.", value: 1 }, { month: "ส.ค.", value: 0 }, { month: "ก.ย.", value: 0 },
    { month: "ต.ค.", value: 0 }, { month: "พ.ย.", value: 0 }, { month: "ธ.ค.", value: 0 }
  ]);
  const [activities, setActivities] = useState([
    { title: "ส่งคำขอลาพักร้อน 3 วัน", time: "15 ชม. ที่แล้ว", color: "bg-orange-400" },
    { title: "หัวหน้าอนุมัติ", time: "เมื่อวาน, 14:30", color: "bg-emerald-400" },
    { title: "ระบบอัปเดตสิทธิ์วันลาประจำปี", time: "1 วันที่แล้ว", color: "bg-blue-400" }
  ]);
  
  const maxChartValue = Math.max(4, ...chartData.map(d => d.value));

  useEffect(() => {
    const storedUsername = localStorage.getItem("username") || "Employee";
    if (storedUsername && storedUsername !== "User") {
      setUsername(storedUsername);
    }

    const allRequests = getLeaveRequests();
    const myRequests = allRequests.filter(r => r.userId === storedUsername);

    if (myRequests.length > 0) {
      const pendingCount = myRequests.filter(r => r.status === "Pending").length;
      const approvedCount = myRequests.filter(r => r.status === "Approved").length;
      const rejectedCount = myRequests.filter(r => r.status === "Rejected").length;
      
      setStats({
        remainingLeaves: Math.max(0, 12 - approvedCount),
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount
      });

      const thaiMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const monthlyData = thaiMonths.map(month => ({ month, value: 0 }));

      myRequests.forEach(r => {
        const d = new Date(r.startDate);
        if (d.getFullYear() === selectedYear) {
          monthlyData[d.getMonth()].value += 1;
        }
      });
      setChartData(monthlyData);

      const sortedRequests = [...myRequests].sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime());
      
      const recentActivities = sortedRequests.slice(0, 3).map(r => {
        let color = "bg-orange-400";
        let statusText = "ส่งคำขอแล้ว";
        if (r.status === "Approved") {
            color = "bg-emerald-400";
            statusText = "อนุมัติแล้ว";
        } else if (r.status === "Rejected") {
            color = "bg-red-400";
            statusText = "ถูกปฏิเสธ";
        }
        
        return {
          title: `${r.type} - ${statusText}`,
          time: new Date(r.createdAt || r.startDate).toLocaleDateString('th-TH'),
          color
        };
      });
      
      if (recentActivities.length > 0) {
        setActivities(recentActivities);
      }
    }
  }, [selectedYear]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#E2E4E9] p-6 font-sans text-slate-800">
      
      {/* Top Banner */}
      <div className="bg-[#0B1038] rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-6 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white mb-1">สวัสดี,{username}</h1>
          <p className="text-blue-200/80 text-sm">ยินดีต้อนรับสู่ Dashboard ของคุณ</p>
        </div>
        
        <div className="flex items-center gap-4 mt-6 md:mt-0 relative z-10">
          <Link href="/dashboard/user/status">
            <button className="bg-white hover:bg-gray-100 text-[#0B1038] font-bold py-2.5 px-6 rounded-lg transition-colors text-sm shadow-sm">
              ตรวจสอบสถานะ
            </button>
          </Link>
          <Link href="/dashboard/user/request">
            <button className="bg-[#1F2456] hover:bg-[#2A316E] border border-[#3C4280] text-white font-medium py-2.5 px-6 rounded-lg transition-colors text-sm flex items-center gap-2 shadow-sm">
              <Plus className="w-4 h-4" />
              ยื่นคำขอลา
            </button>
          </Link>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Remaining Leaves */}
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">วันลาพักร้อนคงเหลือ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-800">{stats.remainingLeaves}</span>
              <span className="text-sm font-bold text-gray-500">วัน</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending */}
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">รายการรออนุมัติ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-800">{stats.pending}</span>
              <span className="text-sm font-bold text-gray-500">รายการ</span>
            </div>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">อนุมัติแล้ว (ปีนี้)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-800">{stats.approved}</span>
              <span className="text-sm font-bold text-gray-500">รายการ</span>
            </div>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">คำขอที่ถูกปฏิเสธ</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-800">{stats.rejected}</span>
              <span className="text-sm font-bold text-gray-500">รายการ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        
        {/* Chart */}
        <div className="lg:col-span-5 bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col h-[340px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">สถิติการลารายเดือน</h2>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-gray-100 border-none text-sm font-bold text-gray-600 rounded-md py-1 px-3 outline-none"
            >
              <option value={2026}>ปี 2026</option>
              <option value={2025}>ปี 2025</option>
              <option value={2024}>ปี 2024</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end gap-1 md:gap-2 mt-4 relative overflow-x-auto overflow-y-hidden custom-scrollbar">
            {/* Y-axis Labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] text-gray-400 font-bold pr-2 bg-white z-10 w-8">
              <span>4.0</span>
              <span>3.0</span>
              <span>2.0</span>
              <span>1.0</span>
              <span>0</span>
            </div>
            
            {/* Grid lines */}
            <div className="absolute left-8 right-0 top-1.5 bottom-6 flex flex-col justify-between z-0">
              <div className="w-full border-b border-gray-100 h-0"></div>
              <div className="w-full border-b border-gray-100 h-0"></div>
              <div className="w-full border-b border-gray-100 h-0"></div>
              <div className="w-full border-b border-gray-100 h-0"></div>
              <div className="w-full border-b border-gray-200 h-0"></div>
            </div>

            {/* Bars */}
            <div className="flex-1 flex items-end justify-between pl-10 pr-2 z-10 h-[calc(100%-1.5rem)] pb-1">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 w-full">
                  <div className="w-full max-w-[28px] bg-[#009DE0] rounded-sm relative group"
                       style={{ height: `${(data.value / maxChartValue) * 100}%`, minHeight: data.value > 0 ? '4px' : '0' }}>
                    {data.value > 0 && (
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity font-bold">
                        {data.value}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-4 bg-[#0B1038] rounded-xl shadow-sm p-6 flex flex-col h-[340px]">
          <h2 className="text-lg font-bold text-white mb-5">ประกาศบริษัท</h2>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            
            <div className="bg-[#2B3B7B] p-4 rounded-xl border border-white/5 hover:bg-[#34468f] transition-colors cursor-pointer">
              <h3 className="font-bold text-white text-sm mb-1">อัปเดตสวัสดิการ 2026</h3>
              <p className="text-blue-200/70 text-xs">เติมของกินให้แล้วเย้</p>
            </div>
            
            <div className="bg-[#2B3B7B] p-4 rounded-xl border border-white/5 hover:bg-[#34468f] transition-colors cursor-pointer">
              <h3 className="font-bold text-white text-sm mb-1">อัปเดตด่วน!</h3>
              <p className="text-blue-200/70 text-xs">วันนี้ WFH ให้ทำงานที่พักตัวเอง</p>
            </div>
            
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col h-[340px]">
          <h2 className="text-lg font-bold text-gray-800 mb-5">กิจกรรมล่าสุด</h2>
          <div className="flex-1 relative">
            {/* Vertical Line */}
            <div className="absolute left-[7px] top-2 bottom-4 w-px bg-gray-200 z-0"></div>
            
            <div className="space-y-6 relative z-10">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className={`w-[15px] h-[15px] rounded-full mt-0.5 border-2 border-white shadow-sm shrink-0 ${activity.color}`}></div>
                  <div className="-mt-1">
                    <h3 className="font-bold text-sm text-gray-800">{activity.title}</h3>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
