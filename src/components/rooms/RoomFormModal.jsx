import React, { useState } from "react";
import { X, Monitor, Save, Check, AlertCircle, Plus, CornerUpLeft } from "lucide-react";
import Button from "../common/Button.jsx";
import InputField from "../common/InputField.jsx";

const RoomFormModal = ({ room, onClose, onSave, showAlert, buildings = [] }) => {
  const [isCustomLocation, setIsCustomLocation] = useState(false);
  const [formData, setFormData] = useState({
    room_id: room?.room_id || "",
    room_type: room?.room_type || "",
    location: room?.location || (buildings.length > 0 ? buildings[0] : ""),
    capacity: room?.capacity ?? 0,
    room_characteristics: room?.room_characteristics || "",
    repair: room?.repair ?? false,
    equipments: {
      projector: room?.equipments?.projector ?? 0,
      microphone: room?.equipments?.microphone ?? 0,
      computer: room?.equipments?.computer ?? 0,
      whiteboard: room?.equipments?.whiteboard ?? 0,
      type_of_computer: room?.equipments?.type_of_computer || "-",
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      room_id: formData.room_id.trim(),
      room_type: formData.room_type.trim(),
      capacity: parseInt(formData.capacity) || 0,
      equipments: {
        ...formData.equipments,
        projector: parseInt(formData.equipments.projector) || 0,
        microphone: parseInt(formData.equipments.microphone) || 0,
        computer: parseInt(formData.equipments.computer) || 0,
        whiteboard: parseInt(formData.equipments.whiteboard) || 0,
      },
    };
    const result = await onSave(payload.room_id, payload);
    if (result.success) {
      onClose();
      showAlert(
        "บันทึกข้อมูลสำเร็จ",
        <Check size={50} className="text-[#B2BB1E]" />,
        null,
        false,
        false,
        "primary",
        true,
        true,
        false,
      );
    } else {
      showAlert(
        "เกิดข้อผิดพลาด: " + (result.message || "ไม่สามารถบันทึกข้อมูลได้"),
        <AlertCircle size={50} className="text-red-500" />,
        null,
        false,
        false,
        "danger",
        true,
        true,
        false,
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-[#302782]/30 dark:bg-black/40 backdrop-blur-md p-0 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[#FFFFFF] dark:bg-gray-800 w-full max-w-2xl rounded-t-[40px] sm:rounded-[40px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 md:p-8 pb-4 border-b border-gray-50 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-black text-[#302782] dark:text-white">
              {room ? "แก้ไขข้อมูลห้อง" : "เพิ่มห้องเรียนใหม่"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full text-black dark:text-white transition-all active:scale-[0.98]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pt-4 custom-scrollbar space-y-6">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField
              label="รหัสห้องเรียน"
              disabled={!!room}
              placeholder="เช่น 26-301"
              value={formData.room_id}
              onChange={(e) =>
                setFormData({ ...formData, room_id: e.target.value })
              }
              required
            />
            <InputField
              label="ประเภทห้อง"
              placeholder="เช่น ห้องบรรยาย"
              value={formData.room_type}
              onChange={(e) =>
                setFormData({ ...formData, room_type: e.target.value })
              }
              required
            />
          </div>

          {/* Location Select */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-black text-[#302782] dark:text-white uppercase tracking-wider">
                สถานที่ตั้ง / อาคาร
              </label>
              <button
                type="button"
                onClick={() => setIsCustomLocation(!isCustomLocation)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-sm ${
                  isCustomLocation 
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200"
                    : "bg-[#B2BB1E]/10 text-[#B2BB1E] hover:bg-[#B2BB1E] hover:text-white"
                }`}
              >
                {isCustomLocation ? (
                  <>
                    <CornerUpLeft size={12} /> กลับไปเลือกรายการเดิม
                  </>
                ) : (
                  <>
                    <Plus size={12} /> เพิ่มอาคารใหม่
                  </>
                )}
              </button>
            </div>

            {isCustomLocation ? (
              <div className="animate-in fade-in slide-in-from-top-1 duration-300">
                <InputField
                  placeholder="ระบุชื่ออาคาร เช่น อาคาร 50 ปี"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
            ) : (
              <div className="relative group animate-in fade-in duration-300">
                <select
                  className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-[20px] border-2 border-transparent focus:border-[#B2BB1E] focus:bg-white dark:focus:bg-gray-600 outline-none font-bold text-[#302782] dark:text-white transition-all cursor-pointer appearance-none text-sm shadow-sm"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    -- เลือกอาคาร --
                  </option>
                  {buildings.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-[#B2BB1E] transition-colors">
                  <Plus size={16} className="rotate-45" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 🚩 แก้ไขช่องความจุตรงนี้ */}
            <InputField
              label="ความจุ (จำนวนที่นั่ง)"
              type="number"
              min="0"
              max="200"
              value={formData.capacity}
              onKeyDown={(e) => {
                // 🚩 ดักจับปุ่มบนคีย์บอร์ด ไม่ให้พิมพ์ ลบ(-), บวก(+), ทศนิยม(.), และตัวอักษร e
                if (["-", "+", "e", "E", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                // 🚩 กรองให้เหลือแต่ตัวเลขล้วน
                let sanitizedValue = String(e.target.value).replace(/[^0-9]/g, "");
                
                // 🚩 เช็คว่าถ้าเลขที่พิมพ์เข้ามาเกิน 200 ให้ปรับเป็น 200
                if (sanitizedValue !== "" && parseInt(sanitizedValue, 10) > 200) {
                  sanitizedValue = "200";
                }

                setFormData({ ...formData, capacity: sanitizedValue });
              }}
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-black dark:text-white ml-1">
                สถานะการเปิดใช้งาน
              </label>
              <select
                className={`w-full p-4 rounded-[20px] border-2 outline-none font-bold transition-all cursor-pointer appearance-none text-sm ${
                  formData.repair
                    ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 focus:border-red-400"
                    : "bg-gray-50 dark:bg-gray-700 border-transparent dark:border-gray-600 focus:border-[#B2BB1E] focus:bg-white dark:focus:bg-gray-600 text-[#302782] dark:text-white"
                }`}
                value={formData.repair.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    repair: e.target.value === "true",
                  })
                }
              >
                <option value="false">ใช้งานได้ปกติ</option>
                <option value="true">งดใช้งานชั่วคราว</option>
              </select>
            </div>
          </div>

          {/* Characteristics Area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-black dark:text-white ml-1">
              ลักษณะห้องเรียน / รายละเอียดเพิ่มเติม
            </label>
            <textarea
              rows="3"
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-[24px] border-2 border-transparent focus:border-[#B2BB1E] focus:bg-white dark:focus:bg-gray-600 outline-none font-bold text-[#302782] dark:text-white resize-none transition-all placeholder:text-black/30 dark:placeholder:text-white/30"
              value={formData.room_characteristics}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  room_characteristics: e.target.value,
                })
              }
              placeholder="ระบุรายละเอียด เช่น ห้อง Slope, มีแอร์ 2 ตัว..."
            />
          </div>

          {/* Equipment Section */}
          <div className="p-5 sm:p-6 bg-gray-50/50 dark:bg-gray-700/50 rounded-[32px] border border-gray-100 dark:border-gray-600">
            <h4 className="font-black text-[#302782] dark:text-white text-sm mb-5 flex items-center gap-2 uppercase tracking-wide">
              <Monitor size={18} className="text-[#B2BB1E]" />{" "}
              รายการอุปกรณ์ภายในห้อง
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <EqInput
                label="โปรเจกเตอร์"
                value={formData.equipments.projector}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    equipments: { ...formData.equipments, projector: v },
                  })
                }
              />
              <EqInput
                label="ไมโครโฟน"
                value={formData.equipments.microphone}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    equipments: { ...formData.equipments, microphone: v },
                  })
                }
              />
              <EqInput
                label="คอมพิวเตอร์"
                value={formData.equipments.computer}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    equipments: { ...formData.equipments, computer: v },
                  })
                }
              />
              <EqInput
                label="กระดาน"
                value={formData.equipments.whiteboard}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    equipments: { ...formData.equipments, whiteboard: v },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 bg-white dark:bg-gray-800 border-t border-gray-50 dark:border-gray-700 flex gap-3">
          <Button type="submit" variant="primary" className="flex-[2] py-4.5">
            <Save size={20} /> บันทึกข้อมูลห้อง
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onClose}
            className="flex-1 py-4.5"
          >
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  );
};

// Sub-component สำหรับช่องกรอกอุปกรณ์
const EqInput = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-2 p-3 bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm transition-all focus-within:border-[#B2BB1E]/30">
    <span className="text-[10px] font-black text-black dark:text-white text-center uppercase tracking-tighter truncate">
      {label}
    </span>
    <input
      type="number"
      min="0"
      className="w-full bg-transparent text-center font-black text-lg text-[#302782] dark:text-white outline-none"
      value={value ?? 0}
      // 🚩 เสริมให้ช่องอุปกรณ์ ไม่สามารถกดเครื่องหมายลบ หรือทศนิยม ได้เช่นกัน
      onKeyDown={(e) => {
        if (["-", "+", "e", "E", "."].includes(e.key)) {
          e.preventDefault();
        }
      }}
      onChange={(e) => {
        let val = e.target.value.replace(/[^0-9]/g, "");
        onChange(val === "" ? "" : parseInt(val) || 0);
      }}
    />
  </div>
);

export default RoomFormModal;