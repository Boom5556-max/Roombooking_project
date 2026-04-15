import React, { useState } from "react";
// 🌟 เพิ่ม FileText สำหรับใช้เป็นไอคอนของหมายเหตุเพิ่มเติม
import { X, User, Calendar, Timer, Edit3, Trash2, Save, Ban, MessageSquare, CheckCircle, XCircle, Clock as ClockIcon, ChevronRight, FileText } from "lucide-react";
import { DetailItem, EditField, TextAreaField } from "./Manage_BookingComponents";
import Button from "../common/Button";

// สร้างช่วงเวลา 08:00 - 20:00 (ห่างกันทุก 30 นาที)
const baseTimes = [];
for (let i = 8; i <= 20; i++) {
  const h = i.toString().padStart(2, "0");
  baseTimes.push(`${h}:00`);
  if (i !== 20) baseTimes.push(`${h}:30`);
}

const BookingDetailModal = ({ 
  booking, userRole, onClose, onUpdateStatus, onCancel, onBan, onUpdateBooking, getFullName, showAlert 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // 🌟 เพิ่ม additional_notes ใน state สำหรับการแก้ไข
  const [editForm, setEditForm] = useState({ purpose: "", additional_notes: "", date: "", start_time: "", end_time: "" });

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    if (typeof dateString === 'string' && dateString.length === 10) return dateString;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return typeof dateString === 'string' ? dateString.split('T')[0] : "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startEditing = () => {
    setEditForm({
      purpose: booking.purpose || "",
      additional_notes: booking.additional_notes || "", // 🌟 โหลดข้อมูลหมายเหตุเดิมมาใส่
      date: formatDateForDisplay(booking.date),
      start_time: booking.start_time?.slice(0, 5) || "",
      end_time: booking.end_time?.slice(0, 5) || "",
    });
    setIsEditing(true);
  };

  const onSaveEdit = async () => {
    const bId = booking.booking_id || booking.id;
    const result = await onUpdateBooking(bId, editForm);
    if (result?.success) {
      setIsEditing(false);
      onClose();
      showAlert("บันทึกการแก้ไขสำเร็จ", <CheckCircle size={50} className="text-[#B2BB1E]" />, null, false, "primary", false, true, false);
    } else {
      showAlert("แก้ไขไม่สำเร็จ", <XCircle size={50} className="text-red-500" />, null, false, "danger", true, false, true);
    }
  };

  const renderTimeDropdown = (key, label) => {
    const availableTimes = baseTimes.filter((t) => {
      if (key === "end_time" && t === "08:00") return false;
      if (key === "start_time" && t === "20:00") return false;
      if (key === "end_time" && editForm.start_time) return t > editForm.start_time;
      if (key === "start_time" && editForm.end_time) return t < editForm.end_time;
      return true;
    });

    return (
      <div className="flex flex-col gap-2 w-full font-sans group relative">
        <label className="text-xs font-medium text-black dark:text-white ml-1">{label}</label>
        <details className="group/dropdown w-full" id={`dropdown-${key}`}>
          <summary className="list-none outline-none cursor-pointer">
            <div className="relative flex items-center">
              <ClockIcon size={18} className="absolute left-4 text-black dark:text-white group-focus-within/dropdown:text-[#B2BB1E] transition-colors z-10" />
              <div className="w-full pl-11 pr-10 py-4 rounded-[16px] border-2 border-gray-50 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700 text-base font-bold text-[#302782] dark:text-white flex justify-between items-center group-hover:border-[#B2BB1E]/50 transition-all">
                <span>{editForm[key] ? `${editForm[key]} น.` : "เลือกเวลา"}</span>
                <ChevronRight size={18} className="text-black dark:text-white rotate-90 group-open/dropdown:-rotate-90 transition-transform" />
              </div>
            </div>
          </summary>
          <div className="fixed z-[9999] mt-1 w-[calc(100vw-80px)] max-w-[200px] animate-in fade-in zoom-in duration-200">
            <ul className="bg-white dark:bg-gray-700 rounded-[20px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-600 overflow-hidden">
              <div className="max-h-[200px] overflow-y-auto py-2 custom-scrollbar">
                {availableTimes.map((t) => (
                  <li key={t} className="px-6 py-3 text-[#302782] dark:text-white text-sm font-bold hover:bg-[#B2BB1E] hover:text-white cursor-pointer transition-colors"
                    onClick={() => {
                      setEditForm({ ...editForm, [key]: t });
                      document.getElementById(`dropdown-${key}`).removeAttribute("open");
                    }}>
                    {t} น.
                  </li>
                ))}
              </div>
            </ul>
          </div>
        </details>
      </div>
    );
  };
  
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-[#302782]/30 dark:bg-black/40 backdrop-blur-md p-0 sm:p-4" onClick={onClose}>
      <div className="bg-[#FFFFFF] dark:bg-gray-800 w-full max-w-lg rounded-t-[40px] sm:rounded-[32px] p-6 sm:p-8 flex flex-col shadow-2xl animate-in slide-in-from-bottom sm:zoom-in duration-300 max-h-[95vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-6 sm:hidden" />
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h3 className="text-2xl font-black text-[#302782] dark:text-white">
            {isEditing ? "แก้ไขข้อมูลจอง" : `ห้อง ${booking.room_id}`}
          </h3>
          <button onClick={onClose} className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full text-black dark:text-white transition-all active:scale-90">
            <X size={20}/>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-1 custom-scrollbar space-y-4">
          {isEditing ? (
            <div className="space-y-5 py-2">
              <EditField icon={MessageSquare} label="วัตถุประสงค์การใช้ห้อง" value={editForm.purpose} onChange={v => setEditForm({...editForm, purpose: v})} />
              
              {/* 🌟 เพิ่มช่องแก้ไขหมายเหตุเพิ่มเติม (ถ้าต้องการให้แก้ได้ด้วย) */}
              <EditField icon={FileText} label="หมายเหตุเพิ่มเติม" value={editForm.additional_notes} onChange={v => setEditForm({...editForm, additional_notes: v})} />

              <EditField icon={Calendar} label="วันที่ต้องการใช้งาน" type="date" value={editForm.date} onChange={v => setEditForm({...editForm, date: v})} />
              <div className="grid grid-cols-2 gap-4">
                {renderTimeDropdown("start_time", "เวลาเริ่ม")}
                {renderTimeDropdown("end_time", "เวลาสิ้นสุด")}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-[24px] p-5 sm:p-6 space-y-4 border border-gray-100 dark:border-gray-600">
              <DetailItem icon={User} label="ผู้ขอใช้งาน" value={getFullName(booking)} />
              <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
              <DetailItem icon={Calendar} label="วันที่จอง" value={formatDateForDisplay(booking.date)} />
              <DetailItem icon={Timer} label="ช่วงเวลา" value={`${booking.start_time?.slice(0,5)} - ${booking.end_time?.slice(0,5)} น.`} />
              <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
              <DetailItem icon={MessageSquare} label="วัตถุประสงค์" value={booking.purpose} />

              {/* 🌟 เพิ่มช่องแสดงหมายเหตุเพิ่มเติม (จะแสดงก็ต่อเมื่อมีข้อมูล) */}
              {booking.additional_notes && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
                  <DetailItem icon={FileText} label="หมายเหตุเพิ่มเติม" value={booking.additional_notes} />
                </>
              )}

              {(booking.status === "rejected" || booking.status === "cancelled") && (
                <>
                  <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
                  <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20">
                    <div className="flex gap-3 text-red-600 dark:text-red-400">
                      <XCircle size={20} className="mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold mb-1">เหตุผลที่{booking.status === "rejected" ? "ไม่อนุมัติ" : "ยกเลิก"}</p>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300 break-words whitespace-pre-wrap">{booking.cancel_reason || "ไม่ได้ระบุเหตุผล"}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {!booking.isHistory && (
          <div className="pt-6 sm:pt-8 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 mt-4">
            {isEditing ? (
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-[2] py-4" onClick={onSaveEdit}><Save size={18} /> บันทึกการแก้ไข</Button>
                <Button variant="dangerOutline" className="flex-1 py-4" onClick={() => setIsEditing(false)}>ยกเลิก</Button>
              </div>
            ) : (
              <ActionButtons userRole={userRole} booking={booking} onUpdateStatus={onUpdateStatus} onCancel={onCancel} onBan={onBan} onEdit={startEditing} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButtons = ({ userRole, booking, onUpdateStatus, onCancel, onBan, onEdit }) => {
  const bId = booking.booking_id || booking.id;
  const isPending = booking.status === "pending";
  const isApproved = booking.status === "approved";

  const [actionType, setActionType] = useState(null); // 'reject' หรือ 'ban'
  const [reason, setReason] = useState("");

  const handleConfirmWithReason = () => {
    if (actionType === "ban") {
      onBan(bId, reason);
    } else if (actionType === "reject") {
      onCancel(bId, reason);
    }
    setActionType(null);
    setReason("");
  };

  if (actionType) {
    const config = {
      reject: { title: "เหตุผลการไม่อนุมัติ", icon: <XCircle size={18} />, btnText: "ยืนยันไม่อนุมัติ" },
      ban: { title: "เหตุผลการงดใช้ห้อง", icon: <Ban size={18} />, btnText: "ยืนยันงดใช้ห้อง" }
    }[actionType];

    return (
      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div>
          <label className="block text-sm font-bold text-[#302782] dark:text-white mb-2 ml-1">
            {config.title} <span className="text-red-500">*</span>
          </label>
          <TextAreaField 
            icon={MessageSquare} 
            placeholder={`ระบุ${config.title}...`} 
            value={reason} 
            onChange={setReason} 
          />
        </div>
        <div className="flex gap-3 mt-2">
          <Button 
            disabled={!reason.trim()} 
            variant="danger"
            className="flex-[2] py-4.5 border-none transition-all duration-300 flex justify-center items-center gap-2"
            onClick={handleConfirmWithReason}
          >
            {config.icon} {config.btnText}
          </Button>
          <Button variant="secondary" className="flex-1 py-4.5" onClick={() => { setActionType(null); setReason(""); }}>ย้อนกลับ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {userRole === "staff" && isPending && (
        <div className="flex gap-4">
          <Button variant="primary" className="flex-1 py-4.5" onClick={() => onUpdateStatus(bId)}>อนุมัติคำขอ</Button>
          <Button variant="danger" className="flex-1 py-4.5" onClick={() => setActionType("reject")}>
            ไม่อนุมัติ
          </Button>
        </div>
      )}
      
      {isApproved && (
        <Button variant="danger" className="w-full py-4.5" onClick={() => setActionType("ban")}>
          <Ban size={18} /> แจ้งงดใช้ห้องเรียนนี้
        </Button>
      )}

      {userRole === "teacher" && isPending && (
        <div className="space-y-3">
          <Button variant="secondary" className="w-full py-4.5" onClick={onEdit}>
            <Edit3 size={18} /> แก้ไขข้อมูลการจอง
          </Button>
          <Button 
            variant="ghost" 
            className="w-full py-4 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold" 
            onClick={() => onCancel(bId, "")}
          >
            <Trash2 size={18} /> ยกเลิกคำขอจอง
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingDetailModal;