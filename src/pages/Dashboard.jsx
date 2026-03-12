import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  ArrowRight,
  FilePlus,
  CheckCircle2,
  Search,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import Navbar from "../components/layout/Navbar.jsx";
import Button from "../components/common/Button.jsx";
import StatusCards from "../components/dashboard/StatusCards";
import UploadModal from "../components/dashboard/UploadModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { role, roomCount, pendingCount, approvedCount } = useDashboard();

  const [searchQuery, setSearchQuery] = useState({
    date: "",
    start_time: "",
    end_time: "",
    capacity: "",
  });

  const handleSmartSearch = (e) => {
    e.preventDefault();
    navigate("/room-results", { state: searchQuery });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-gray-900 flex flex-col relative font-sans pb-20 md:pb-0">
      <Navbar />

      {/* Container หลัก: ปรับ Padding ตามขนาดจอ */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-grow">
        {/* Header: ปรับการจัดวางชื่อสิทธิ์ผู้ใช้ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#B2BB1E] inline-block text-[#302782] dark:text-white">
            ภาพรวมระบบ
          </h2>
          <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold bg-gray-50 dark:bg-gray-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-gray-100 dark:border-gray-700 uppercase tracking-wider">
            สิทธิ์ผู้ใช้งาน: {role}
          </span>
        </div>

        {/* สถิติ: (ตัว Component StatusCards รองรับ responsive อยู่แล้ว) */}
        <StatusCards
          role={role}
          roomCount={roomCount}
          pendingCount={pendingCount}
          approvedCount={approvedCount}
        />

        {/* ปุ่มไปหน้าห้องเรียนปกติ: ปรับขนาด icon และ text ให้เล็กลงในมือถือ */}
        <Button
          variant="secondary"
          size="none"
          onClick={() => navigate("/Rooms")}
          className="w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl justify-between flex mb-6 border border-gray-100 dark:border-gray-700 bg-[#FFFFFF] dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-[#B2BB1E] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-[#FFFFFF]">
              <LayoutGrid size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-base sm:text-lg text-[#302782] dark:text-white leading-none">
                ดูรายการห้องเรียน
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                ตรวจสอบตารางการใช้ห้องทั้งหมด
              </p>
            </div>
          </div>
          <ArrowRight className="text-[#B2BB1E] w-6 h-6 sm:w-7 sm:h-7" />
        </Button>

        {/* Smart Search Section */}
        {(role === "staff" || role === "teacher") && (
          <div className="bg-[#302782] dark:bg-gray-800 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 mb-6 shadow-xl dark:border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#B2BB1E] rounded-xl text-[#FFFFFF]">
                <Search size={18} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#FFFFFF]">
                จองห้องเรียน
              </h3>
            </div>

            {/* Form Grid: 1 คอลัมน์บนมือถือ, 2 บนแท็บเล็ต, 3 บน Desktop ขนาดกลาง, 4 บนจอกว้างพิเศษ */}
            <form
              onSubmit={handleSmartSearch}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            >
              {/* 1. วันที่ */}
              <div className="space-y-2">
                {" "}
                {/* เปลี่ยน space-y-1 เป็น 2 ให้ Label มีช่องไฟหายใจ */}
                <label className="text-[11px] text-gray-300 ml-2 font-bold uppercase tracking-wide">
                  วันที่เข้าใช้งาน
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFFFFF]/70 pointer-events-none"
                    size={20}
                  />
                  <input
                    required
                    type="date"
                    className="w-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/10 rounded-xl sm:rounded-2xl h-[48px] pl-12 pr-4 text-[#FFFFFF] focus:bg-[#FFFFFF] focus:text-[#302782] outline-none text-sm font-bold transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    onChange={(e) =>
                      setSearchQuery({ ...searchQuery, date: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* 2. เวลา */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-300 ml-2 font-bold uppercase tracking-wide">
                  ช่วงเวลา (เริ่ม - สิ้นสุด)
                </label>
                <div className="flex gap-2 sm:gap-3">
                  {/* เริ่ม */}
                  <div className="relative flex-1 min-w-0">
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFFFFF]/70 pointer-events-none"
                      size={18}
                    />
                    <input
                      required
                      type="time"
                      className="w-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/10 rounded-xl sm:rounded-2xl h-[48px] pl-10 pr-2 sm:pr-4 text-[#FFFFFF] focus:bg-[#FFFFFF] focus:text-[#302782] outline-none text-xs sm:text-[13px] font-bold transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-time-value]:text-left"
                      onChange={(e) =>
                        setSearchQuery({
                          ...searchQuery,
                          start_time: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* สิ้นสุด */}
                  <div className="relative flex-1 min-w-0">
                    <Clock
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FFFFFF]/70 pointer-events-none"
                      size={18}
                    />
                    <input
                      required
                      type="time"
                      className="w-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/10 rounded-xl sm:rounded-2xl h-[48px] pl-10 pr-2 sm:pr-4 text-[#FFFFFF] focus:bg-[#FFFFFF] focus:text-[#302782] outline-none text-xs sm:text-[13px] font-bold transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-time-value]:text-left"
                      onChange={(e) =>
                        setSearchQuery({
                          ...searchQuery,
                          end_time: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* 3. จำนวนนิสิต */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-300 ml-2 font-bold uppercase tracking-wide">
                  จำนวนนิสิต
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="เช่น 50"
                    className="w-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/10 rounded-xl sm:rounded-2xl min-h-[48px] pl-11 pr-4 text-[#FFFFFF] focus:bg-[#FFFFFF] focus:text-[#302782] outline-none text-sm font-bold placeholder:text-gray-400 transition-all appearance-none"
                    onChange={(e) => {
                      // Prevent negative numbers
                      const val = e.target.value;
                      if (val === "" || parseInt(val, 10) >= 1) {
                        setSearchQuery({
                          ...searchQuery,
                          capacity: val,
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {/* 4. ปุ่ม Submit */}
              <div className="flex items-end">
                <button
                  type="submit"
                  // เปลี่ยน py-3.5 เป็น min-h-[48px] ให้ความสูงปุ่มเท่ากับช่อง Input เป๊ะๆ
                  className="w-full bg-[#B2BB1E] hover:bg-[#FFFFFF] text-[#302782] font-bold min-h-[48px] rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all text-sm sm:text-base"
                >
                  ค้นหาห้องว่าง <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ระบบจัดการไฟล์สำหรับ Staff */}
        {role === "staff" && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="bg-gray-50 dark:bg-gray-800 rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 cursor-pointer hover:border-[#B2BB1E] hover:bg-white dark:hover:bg-gray-700 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#302782] dark:text-white flex items-center gap-2">
                  <FilePlus size={20} className="text-[#B2BB1E]" />{" "}
                  ระบบจัดการไฟล์
                </h3>
                <p className="text-gray-500 text-[11px] sm:text-xs mt-1">
                  อัปโหลดตารางเรียน (.xlsx, .csv)
                </p>
              </div>
              <FilePlus
                size={32}
                className="text-[#302782] opacity-10 sm:opacity-20 group-hover:opacity-40 transition-opacity"
              />
            </div>
          </div>
        )}

        {/* Teacher Empty State */}
        {role === "teacher" && (
          <div className="p-6 sm:p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-[30px] sm:rounded-[40px] border border-gray-100 dark:border-gray-700 mt-6">
            <div className="bg-[#FFFFFF] w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#B2BB1E] shadow-sm">
              <CheckCircle2 size={24} className="sm:w-7 sm:h-7" />
            </div>
            <p className="text-[#302782] dark:text-white font-bold text-sm sm:text-base">
              ระบบจองห้องเรียนออนไลน์
            </p>
          </div>
        )}
      </div>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Booking Guidelines Footer: ปรับ Grid ให้รองรับมือถือ */}
      <footer className="mt-8 sm:mt-12 mb-24 md:mb-8 px-4 w-full max-w-7xl mx-auto">
        <div className="bg-[#FFFFFF] dark:bg-gray-800 rounded-[24px] sm:rounded-[30px] p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-6 text-[#302782] dark:text-white">
            <div className="p-2 bg-gray-50 rounded-xl">
              
            </div>
            <h2 className="text-lg sm:text-xl font-bold">
              ระเบียบการให้บริการ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-4">
              <GuideItem
                num="01"
                text={
                  <>
                    ให้บริการ{" "}
                    <span className="text-[#302782] font-bold">
                      จันทร์ – ศุกร์ (08.30 - 16.30 น.)
                    </span>
                  </>
                }
              />
              <GuideItem
                num="02"
                text={
                  <>
                    ทำรายการล่วงหน้าอย่างน้อย{" "}
                    <span className="text-[#302782] font-bold underline">
                      3 วันทำการ
                    </span>
                  </>
                }
              />
              <GuideItem
                num="03"
                text={
                  <>
                    สถานะต้องได้รับ{" "}
                    <span className="text-[#B2BB1E] font-bold">"อนุมัติ"</span>{" "}
                    เท่านั้น
                  </>
                }
              />
            </div>

            <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-12">
              <GuideItem
                num="04"
                text="ยกเลิกการจองล่วงหน้าอย่างน้อย 1 วัน"
                color="bg-[#302782]"
              />
              <GuideItem
                num="05"
                text="สำหรับอาจารย์และเจ้าหน้าที่ คณะวิทยาศาสตร์ ศรีราชา"
                color="bg-[#302782]"
              />
            </div>
          </div>
        </div>
        <p className="text-center text-gray-400 text-[10px] sm:text-xs mt-6 font-medium">
          คณะวิทยาศาสตร์ ศรีราชา - ระบบจองห้องเรียน v1.0
        </p>
      </footer>
    </div>
  );
};

// Helper Component เพื่อลดโค้ดซ้ำและจัดการสไตล์ทีเดียว
const GuideItem = ({ num, text, color = "bg-[#302782]" }) => (
  <div className="flex gap-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium items-start">
    <span
      className={`flex-none w-5 h-5 sm:w-6 sm:h-6 ${color} text-[#FFFFFF] text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center mt-0.5`}
    >
      {num}
    </span>
    <p className="leading-relaxed">{text}</p>
  </div>
);

export default Dashboard;
