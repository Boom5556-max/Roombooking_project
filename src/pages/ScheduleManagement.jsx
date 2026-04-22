import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useSchedule } from "../hooks/useSchedule";
import { useRooms } from "../hooks/useRooms";
import {
  Edit2,
  Trash2,
  UploadCloud,
  AlertCircle,
  CheckCircle,
  X,
  ChevronDown,
  BookOpen,
  Loader2,
  ChevronLeft,
  Clock,
  User,
  MapPin,
  Calendar,
  CalendarRange,
  Hash,
  ArrowRight,
  ArrowRightLeft,
} from "lucide-react";
import api from "../api/axios.js";
import ActionModal from "../components/common/ActionModal";
import PageReveal from "../components/common/PageReveal";

const ScheduleManagement = () => {
  const navigate = useNavigate();
  const {
    schedules,
    isLoading,
    isMoveModalOpen,
    setIsMoveModalOpen,
    moveRoomData,
    setMoveRoomData,
    openMoveModal,
    handleMoveRoom,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isUploading,
    previewData,
    previewErrors,
    previewWarnings,
    fileInputRef,
    handleDelete,
    triggerFileInput,
    handleFileChange,
    handleConfirmReupload,
    fetchSubjects,
    editSubjectSchedule,
    deleteSubjectSchedule,
  } = useSchedule();
  const { rooms: allRooms } = useRooms();

  // State สำหรับ Dropdown รายวิชา
  const [expandedRow, setExpandedRow] = useState(null); // room_id ของแถวที่ขยายอยู่
  const [subjectsMap, setSubjectsMap] = useState({}); // cache: { [room_id]: subjects[] }
  const [loadingSubjects, setLoadingSubjects] = useState(null); // room_id ที่กำลังโหลดอยู่

  const toggleSubjects = async (id) => {
    // ถ้ากดซ้ำ -> ปิด
    if (expandedRow === id) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(id);
    // ถ้าเคยโหลดแล้ว ไม่ต้องโหลดซ้ำ (cache)
    if (subjectsMap[id]) return;

    setLoadingSubjects(id);
    try {
      const subjects = await fetchSubjects(id);
      setSubjectsMap((prev) => ({ ...prev, [id]: subjects }));
    } catch {
      setSubjectsMap((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setLoadingSubjects(null);
    }
  };

  // --- State สำหรับ Edit Modal ของรายวิชา ---
  const [isSubjectEditModalOpen, setIsSubjectEditModalOpen] = useState(false);
  const [subjectEditScheduleId, setSubjectEditScheduleId] = useState(null);
  const [editingSubjectData, setEditingSubjectData] = useState({});
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  // --- State สำหรับข้อมูลเทอม (ใช้เติมวันที่อัตโนมัติ) ---
  const [termData, setTermData] = useState(null);
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);

  useEffect(() => {
    const fetchTermData = async () => {
      try {
        const res = await api.get("/terms/showTerm");
        const data = res.data?.data;
        if (data && Array.isArray(data) && data.length > 0) {
          setTermData(data);
        }
      } catch (err) {
        console.error("Fetch term data error:", err);
      }
    };
    fetchTermData();
  }, []);

  // ฟังก์ชันเติมวันที่ตั้งแต่เทอมต้น ถึง สิ้นสุดเทอมฤดูร้อน
  const fillFullYearDates = () => {
    if (!termData || termData.length === 0) {
      showResultAlert(false, "", "ไม่พบข้อมูลเทอมในระบบ กรุณาตั้งค่าวันที่เทอมก่อน");
      return;
    }

    // หาเทอมต้น (first) และเทอมฤดูร้อน (summer)
    const firstTerm = termData.find((t) => t.term === "first");
    const summerTerm = termData.find((t) => t.term === "summer");

    if (!firstTerm || !firstTerm.start_date) {
      showResultAlert(false, "", "ไม่พบข้อมูลวันเริ่มต้นของเทอมต้น กรุณาตั้งค่าวันที่เทอมก่อน");
      return;
    }
    if (!summerTerm || !summerTerm.end_date) {
      showResultAlert(false, "", "ไม่พบข้อมูลวันสิ้นสุดของเทอมฤดูร้อน กรุณาตั้งค่าวันที่เทอมก่อน");
      return;
    }

    const startDate = new Date(firstTerm.start_date);
    const endDate = new Date(summerTerm.end_date);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      showResultAlert(false, "", "วันที่ในระบบไม่ถูกต้อง กรุณาตรวจสอบการตั้งค่าเทอม");
      return;
    }

    // คำนวณจำนวนสัปดาห์
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);
    const clampedWeeks = Math.max(1, Math.min(weeks, 20)); // จำกัดไม่เกิน 20

    // Format start_date เป็น YYYY-MM-DD
    const formattedDate = formatDateForInput(firstTerm.start_date);

    setEditingSubjectData((prev) => ({
      ...prev,
      date: formattedDate,
      repeat: clampedWeeks,
    }));
  };

  const TimePickerField = ({
    label,
    value,
    onChange,
    type,
    startTime,
    endTime,
  }) => {
    // สร้างรายการเวลา 08:00 - 20:00
    const baseTimes = [];
    for (let i = 8; i <= 20; i++) {
      const h = i.toString().padStart(2, "0");
      baseTimes.push(`${h}:00`);
      if (i !== 20) baseTimes.push(`${h}:30`);
    }

    // กรองเวลาตามเงื่อนไข (Logic เดิมที่คุณมี)
    const availableTimes = baseTimes.filter((t) => {
      if (type === "end_time" && t === "08:00") return false;
      if (type === "start_time" && t === "20:00") return false;
      if (type === "end_time" && startTime) return t > startTime;
      if (type === "start_time" && endTime) return t < endTime;
      return true;
    });

    const dropdownId = `time-dropdown-${type}-${label}`;

    return (
      <div className="relative flex-1 min-w-0">
        <details className="group" id={dropdownId}>
          <summary className="w-full bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 hover:border-[#B2BB1E] rounded-2xl h-[56px] pl-12 pr-5 flex items-center justify-between text-black dark:text-white outline-none text-sm font-bold cursor-pointer list-none transition-all">
            <Clock className="absolute left-4 text-gray-400" size={18} />
            <span className="truncate">{value || label}</span>
            <ArrowRight
              size={16}
              className="rotate-90 text-gray-400 group-open:-rotate-90 transition-transform"
            />
          </summary>
          <ul className="absolute left-0 top-[calc(100%+8px)] w-full max-h-[200px] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-[100] py-2 border border-gray-100 dark:border-gray-700">
            {availableTimes.map((t) => (
              <li
                key={t}
                className="px-5 py-3 text-sm font-bold hover:bg-[#B2BB1E] hover:text-white cursor-pointer transition-colors dark:text-white"
                onClick={() => {
                  onChange(t);
                  document.getElementById(dropdownId).removeAttribute("open");
                }}
              >
                {t} น.
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    // Format to YYYY-MM-DD for <input type="date" />
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const openSubjectEditModal = (scheduleId, subj) => {
    setSubjectEditScheduleId(scheduleId);
    setEditingSubjectData({
      old_course_code: subj.course_code || "",
      old_subject_name: subj.subject_name,
      old_sec: String(subj.sec),
      course_code: subj.course_code || "",
      subject_name: subj.subject_name,
      sec: String(subj.sec),
      room_id: subj.room_id || scheduleId,
      date: formatDateForInput(subj.date),
      start_time: subj.start_time || "",
      end_time: subj.end_time || "",
      teacher_name: subj.teacher_name || "",
      teacher_surname: subj.teacher_surname || "",
      repeat: 15,
    });
    setIsSubjectEditModalOpen(true);
  };

  const onSaveSubjectEdit = async (e, force_cancel = false) => {
    if (e) e.preventDefault();
    setIsSavingSubject(true);
    try {
      await editSubjectSchedule(subjectEditScheduleId, {
        ...editingSubjectData,
        repeat: Number(editingSubjectData.repeat),
        force_cancel: force_cancel,
      });
      setIsSubjectEditModalOpen(false);

      // หลังแก้ไข ห้องอาจเปลี่ยนไป -> reload ทั้งห้องเดิมและห้องใหม่
      const oldRoomId = subjectEditScheduleId;
      const newRoomId = editingSubjectData.room_id;

      // reload ห้องเดิม
      setLoadingSubjects(oldRoomId);
      try {
        const updatedOld = await fetchSubjects(oldRoomId);
        setSubjectsMap((prev) => ({
          ...prev,
          [oldRoomId]: updatedOld,
        }));
      } finally {
        setLoadingSubjects(null);
      }

      // ถ้าย้ายไปห้องอื่น -> reload ห้องใหม่ด้วย
      if (newRoomId && newRoomId !== oldRoomId) {
        try {
          const updatedNew = await fetchSubjects(newRoomId);
          setSubjectsMap((prev) => ({
            ...prev,
            [newRoomId]: updatedNew,
          }));
        } catch { /* ห้องใหม่อาจยังไม่เคยถูกขยาย ไม่ต้อง error */ }
      }

      showResultAlert(true, "แก้ไขรายวิชาสำเร็จ", "");
    } catch (error) {
      const isConflict =
        error.response?.status === 409 ||
        error.response?.data?.code === "BOOKING_CONFLICT";

      if (isConflict) {
        setAlertConfig({
          isOpen: true,
          title:
            error.response?.data?.message ||
            "พบตารางจองที่ทับซ้อน คุณต้องการดำเนินการต่อหรือไม่?",
          icon: <AlertCircle size={50} className="text-yellow-500" />,
          variant: "warning",
          showConfirm: true,
          showButtons: true,
          autoClose: false,
          onConfirm: async () => {
            closeAlert();
            await onSaveSubjectEdit(null, true);
          },
        });
      } else {
        showResultAlert(
          false,
          "",
          error.response?.data?.message || "เกิดข้อผิดพลาดในการแก้ไขรายวิชา",
        );
      }
    } finally {
      setIsSavingSubject(false);
    }
  };

  const updateSubjectField = (field, value) => {
    let finalValue = value;

    // ดักจับฟิลด์ repeat ให้ไม่เกิน 20
    if (field === "repeat" && value !== "") {
      const num = parseInt(value);
      if (num > 20) {
        finalValue = 20;
      } else if (num < 1 && value !== "0") {
        // อนุญาตให้เป็นค่าว่างได้ตอนกำลังลบเพื่อพิมพ์ใหม่ แต่ตอนบันทึกจะถูกแปลงเป็น Number
        finalValue = value;
      }
    }

    setEditingSubjectData((prev) => ({ ...prev, [field]: finalValue }));
  };

  // ยืนยันลบรายวิชา
  const confirmDeleteSubject = (scheduleId, subj) => {
    setAlertConfig({
      isOpen: true,
      title: `ลบ "${subj.subject_name}" Sec ${subj.sec} ออกจากตารางเรียน?`,
      icon: <Trash2 size={50} className="text-red-500" />,
      variant: "danger",
      showConfirm: true,
      showButtons: true,
      autoClose: false,
      onConfirm: async () => {
        closeAlert();
        try {
          const res = await deleteSubjectSchedule(scheduleId, subj.course_code, subj.subject_name, subj.sec);
          // รีโหลดรายวิชาหลังลบ
          setLoadingSubjects(scheduleId);
          try {
            const updated = await fetchSubjects(scheduleId);
            setSubjectsMap((prev) => ({ ...prev, [scheduleId]: updated }));
          } finally {
            setLoadingSubjects(null);
          }
          showResultAlert(true, res?.message || "ลบรายวิชาสำเร็จ", "");
        } catch (error) {
          showResultAlert(
            false,
            "",
            error.response?.data?.message || "เกิดข้อผิดพลาดในการลบรายวิชา",
          );
        }
      },
    });
  };

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    icon: null,
    variant: "primary",
    showConfirm: true,
    showButtons: null,
    autoClose: false,
    onConfirm: null,
  });

  const closeAlert = () =>
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));

  // โชว์ผลลัพธ์ (สำเร็จ/ล้มเหลว) แบบ Auto Close
  const showResultAlert = (success, successMsg, errorMsg) => {
    setAlertConfig({
      isOpen: true,
      title: success ? successMsg : errorMsg,
      icon: success ? <CheckCircle size={50} /> : <X size={50} />,
      variant: success ? "primary" : "danger",
      showConfirm: false,
      showButtons: false,
      autoClose: true,
      onConfirm: null,
    });
  };

  // จัดการเวลากดลบ (ลบตารางเรียนทั้งหมดของ room_id นั้น)
  const confirmDelete = (roomId) => {
    setAlertConfig({
      isOpen: true,
      title: `ยืนยันการลบตารางเรียนของห้อง ${roomId}?`,
      icon: <Trash2 size={50} />,
      variant: "danger",
      showConfirm: true,
      showButtons: true,
      autoClose: false,
      onConfirm: async () => {
        closeAlert();
        try {
          const res = await handleDelete(roomId);
          const isSuccess = res?.success !== false;
          showResultAlert(
            isSuccess,
            res?.message || "ลบข้อมูลสำเร็จ",
            res?.message || "เกิดข้อผิดพลาดในการลบข้อมูล",
          );
        } catch (error) {
          const errMsg = error.response?.data?.message || "เกิดข้อผิดพลาด ไม่สามารถลบข้อมูลได้";
          showResultAlert(false, "", errMsg);
        }
      },
    });
  };

  // ย้ายห้อง: ส่ง API ย้ายตารางเรียนไปห้องใหม่
  const [isMoving, setIsMoving] = useState(false);
  const onMoveRoom = async () => {
    if (!moveRoomData.newRoomId) {
      showResultAlert(false, "", "กรุณาเลือกห้องที่ต้องการย้ายไป");
      return;
    }
    setIsMoving(true);
    try {
      const res = await handleMoveRoom();
      setIsMoveModalOpen(false);
      showResultAlert(
        true,
        res?.message || `ย้ายห้องสำเร็จ (${res?.updatedRows || 0} รายการ)`,
        "",
      );
    } catch (error) {
      const errMsg = error.response?.data?.message || "เกิดข้อผิดพลาดในการย้ายห้อง";
      showResultAlert(false, "", errMsg);
    } finally {
      setIsMoving(false);
    }
  };

  // ครอบการเลือกไฟล์ เพื่อดัก Error ตอน Preview
  const onFileChangeWrapper = async (e) => {
    try {
      await handleFileChange(e);
    } catch (error) {
      showResultAlert(
        false,
        "",
        error.response?.data?.message || "เกิดข้อผิดพลาดในการตรวจสอบไฟล์",
      );
    }
  };

  // จัดการเวลายืนยันอัปโหลดทับ
  const onConfirmReuploadClick = async () => {
    if (previewErrors.length > 0) {
      setAlertConfig({
        isOpen: true,
        title: "ไฟล์นี้มีข้อผิดพลาด ต้องการอัปโหลดไฟล์ทับใช่หรือไม่",
        icon: <AlertCircle size={50} className="text-yellow-500" />,
        variant: "warning",
        showConfirm: true,
        showButtons: true,
        autoClose: false,
        onConfirm: async () => {
          closeAlert();
          await executeReupload();
        },
      });
    } else {
      await executeReupload();
    }
  };

  // ฟังก์ชันตัวจริงที่เรียก API ตอนอัปโหลด
  const executeReupload = async () => {
    try {
      const res = await handleConfirmReupload();
      setIsPreviewModalOpen(false);
      const isSuccess = res?.success !== false;
      showResultAlert(
        isSuccess,
        `อัปเดตข้อมูลทับไฟล์เดิมสำเร็จ! (${res?.totalSaved || 0} รายการ)`,
        "เกิดข้อผิดพลาดในการอัปเดต",
      );
    } catch (error) {
      showResultAlert(false, "", "เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Navbar />

      <PageReveal
        isLoading={isLoading}
        loadingText="กำลังดึงเนื้อหาตารางเรียนทั้งหมด..."
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-40 md:pb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-[#302782] dark:text-[#B2BB1E] transition-all active:scale-90 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center group"
                title="ย้อนกลับ"
              >
                <ChevronLeft
                  size={24}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#302782] dark:text-[#B2BB1E]">
                จัดการประวัติตารางเรียน
              </h1>
            </div>
          </div>

          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            className="hidden"
            onChange={onFileChangeWrapper}
          />

          {/* Main List Table/Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-indigo-500/5 sm:rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden w-full">
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="min-w-full text-left text-sm text-black dark:text-white">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-[#302782] dark:text-[#B2BB1E] uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      หมายเลขห้อง
                    </th>
                    <th className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-center">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {schedules.length === 0 ? (
                    <tr>
                      <td
                        colSpan="2"
                        className="text-center py-8 text-black dark:text-white"
                      >
                        ไม่มีประวัติตารางเรียนในระบบ
                      </td>
                    </tr>
                  ) : (
                    schedules.map((schedule) => {
                      const roomId = schedule.room_id;
                      const isExpanded = expandedRow === roomId;
                      const subjects = subjectsMap[roomId] || [];
                      const isLoadingThis = loadingSubjects === roomId;

                      return (
                        <React.Fragment key={roomId}>
                          {/* แถวหลัก */}
                          <tr
                            onClick={() => toggleSubjects(roomId)}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer select-none"
                          >
                            <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`transition-transform duration-200 text-black dark:text-white ${isExpanded ? "rotate-0" : "-rotate-90"}`}
                                >
                                  <ChevronDown size={16} />
                                </span>
                                <MapPin size={16} className="text-[#302782] dark:text-[#B2BB1E]" />
                                <span className="font-semibold">ห้อง {roomId}</span>
                              </div>
                            </td>
                            <td
                              className="px-4 py-3 sm:px-6 sm:py-4 align-middle"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => triggerFileInput(roomId)}
                                  disabled={isUploading}
                                  className="flex items-center justify-center gap-1.5 bg-[#302782] hover:bg-[#4338ca] text-white px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 shadow-sm hover:-translate-y-px active:scale-[0.98] w-full sm:w-auto"
                                  title="อัปโหลดไฟล์ Excel ทับข้อมูลเดิม"
                                >
                                  <UploadCloud size={16} />{" "}
                                  <span className="hidden sm:inline">
                                    อัปโหลดทับ
                                  </span>
                                </button>
                                <button
                                  onClick={() => openMoveModal(roomId)}
                                  className="flex items-center justify-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0"
                                  title="ย้ายไปห้องอื่น"
                                >
                                  <ArrowRightLeft size={16} />
                                </button>
                                <button
                                  onClick={() => confirmDelete(roomId)}
                                  className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all shadow-sm shrink-0"
                                  title="ลบข้อมูลชุดนี้"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* แถว Dropdown รายวิชา (Desktop) */}
                          {isExpanded && (
                            <tr>
                              <td
                                colSpan="2"
                                className="px-0 py-0 bg-indigo-50/60 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900"
                              >
                                <div className="px-6 py-4">
                                  <div className="flex items-center gap-2 mb-3 text-[#302782] dark:text-[#B2BB1E] font-semibold text-sm">
                                    <BookOpen size={16} />
                                    รายวิชาในห้อง {roomId}
                                  </div>

                                  {isLoadingThis ? (
                                    <div className="flex items-center justify-center gap-2 py-6 text-black dark:text-white">
                                      <Loader2
                                        size={20}
                                        className="animate-spin"
                                      />
                                      <span className="text-sm">
                                        กำลังโหลดรายวิชา...
                                      </span>
                                    </div>
                                  ) : subjects.length === 0 ? (
                                    <p className="text-center text-sm text-black dark:text-white py-4">
                                      ไม่พบรายวิชาในห้องนี้
                                    </p>
                                  ) : (
                                    <div className="overflow-x-auto rounded-xl border border-indigo-200 dark:border-indigo-800 text-sm">
                                      <table className="min-w-full text-sm text-left">
                                        <thead className="bg-[#302782] text-white">
                                          <tr>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">
                                              รหัสวิชา
                                            </th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">
                                              วิชา
                                            </th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">
                                              Sec
                                            </th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">
                                              บุคลากร
                                            </th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap">
                                              ช่วงเวลา
                                            </th>
                                            <th className="px-4 py-3 font-semibold whitespace-nowrap text-center"></th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-indigo-100 dark:divide-indigo-900">
                                          {subjects.map((subj, idx) => (
                                            <tr
                                              key={idx}
                                              className="bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                                            >
                                              <td
                                                className="px-4 py-3 font-mono text-xs text-[#302782] dark:text-[#B2BB1E] whitespace-nowrap"
                                              >
                                                {subj.course_code || "-"}
                                              </td>
                                              <td
                                                className="px-4 py-3 font-medium text-black dark:text-white whitespace-nowrap max-w-[240px] truncate"
                                                title={subj.subject_name}
                                              >
                                                {subj.subject_name}
                                              </td>
                                              <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">
                                                {subj.sec}
                                              </td>
                                              <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">
                                                {subj.teacher_name
                                                  ? `${subj.teacher_name} ${subj.teacher_surname}`
                                                  : "ไม่ระบุผู้รับผิดชอบ"}
                                              </td>
                                              <td className="px-4 py-3 text-black dark:text-white whitespace-nowrap">
                                                {subj.start_time} –{" "}
                                                {subj.end_time}
                                              </td>
                                              <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      openSubjectEditModal(
                                                        roomId,
                                                        subj,
                                                      );
                                                    }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition-all shadow-sm hover:-translate-y-px active:scale-95"
                                                    title="แก้ไขรายวิชานี้"
                                                  >
                                                    <Edit2 size={14} />
                                                  </button>
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      confirmDeleteSubject(
                                                        roomId,
                                                        subj,
                                                      );
                                                    }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all shadow-sm hover:-translate-y-px active:scale-95"
                                                    title="ลบรายวิชานี้"
                                                  >
                                                    <Trash2 size={14} />
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards Layout */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
              {schedules.length === 0 ? (
                <div className="text-center py-12 text-gray-400 font-medium">
                  ไม่มีประวัติตารางเรียนในระบบ
                </div>
              ) : (
                schedules.map((schedule) => {
                  const roomId = schedule.room_id;
                  const isExpanded = expandedRow === roomId;
                  const subjects = subjectsMap[roomId] || [];
                  const isLoadingThis = loadingSubjects === roomId;

                  return (
                    <div
                      key={roomId}
                      className="flex flex-col bg-white dark:bg-gray-800"
                    >
                      {/* Card Header */}
                      <div
                        onClick={() => toggleSubjects(roomId)}
                        className="p-5 flex flex-col gap-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <MapPin size={18} className="text-[#302782] dark:text-[#B2BB1E]" />
                            <span className="text-base font-bold text-gray-900 dark:text-white">
                              ห้อง {roomId}
                            </span>
                          </div>
                          <span
                            className={`p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-[#302782] dark:text-[#B2BB1E] transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
                          >
                            <ChevronDown size={20} />
                          </span>
                        </div>

                        {/* Action Buttons in Card */}
                        <div
                          className="flex gap-2 pt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => triggerFileInput(roomId)}
                            disabled={isUploading}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#302782] hover:bg-[#4338ca] text-white px-4 py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                          >
                            <UploadCloud size={16} /> อัปโหลดทับ
                          </button>
                          <button
                            onClick={() => openMoveModal(roomId)}
                            className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow-sm active:scale-95"
                          >
                            <ArrowRightLeft size={18} />
                          </button>
                          <button
                            onClick={() => confirmDelete(roomId)}
                            className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-sm active:scale-95"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Card Dropdown Expanded Subjects */}
                      {isExpanded && (
                        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900 overflow-hidden">
                          <div className="p-4 sm:p-5">
                            <div className="flex items-center gap-2 mb-4 text-[#302782] dark:text-[#B2BB1E] font-bold text-sm">
                              <BookOpen size={16} />
                              รายวิชาในห้อง {roomId} ({subjects.length})
                            </div>

                            {isLoadingThis ? (
                              <div className="flex items-center justify-center gap-3 py-10 text-gray-500">
                                <Loader2
                                  size={24}
                                  className="animate-spin text-[#302782] dark:text-[#B2BB1E]"
                                />
                                <span className="text-sm font-medium">
                                  กำลังโหลดรายวิชา...
                                </span>
                              </div>
                            ) : subjects.length === 0 ? (
                              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center text-sm text-gray-400 border border-dashed border-gray-200 dark:border-gray-700">
                                ไม่พบรายวิชาในห้องนี้
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {subjects.map((subj, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden group"
                                  >
                                    <div className="flex flex-col gap-3">
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="flex-grow">
                                          <h5 className="text-sm font-black text-[#302782] dark:text-white leading-tight mb-1">
                                            {subj.subject_name}
                                          </h5>
                                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            {subj.course_code && (
                                              <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[11px] font-mono font-bold text-gray-600 dark:text-gray-300">
                                                {subj.course_code}
                                              </span>
                                            )}
                                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 rounded text-[11px] font-bold text-[#302782] dark:text-[#B2BB1E]">
                                              Sec: {subj.sec}
                                            </span>
                                            <span className="text-[11px] font-medium text-gray-500 flex items-center gap-1">
                                              <Clock size={12} />{" "}
                                              {subj.start_time} -{" "}
                                              {subj.end_time}
                                            </span>
                                          </div>
                                        </div>
                                        <div
                                          className="flex gap-1.5"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <button
                                            onClick={() =>
                                              openSubjectEditModal(roomId, subj)
                                            }
                                            className="w-8 h-8 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 flex items-center justify-center hover:bg-yellow-500 hover:text-white transition-all"
                                          >
                                            <Edit2 size={14} />
                                          </button>
                                          <button
                                            onClick={() =>
                                              confirmDeleteSubject(roomId, subj)
                                            }
                                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-2 text-[12px] pt-1 border-t border-gray-50 dark:border-gray-700">
                                        <div className="flex flex-col">
                                          <span className="text-gray-400 font-bold uppercase text-[10px]">
                                            ผู้สอน
                                          </span>
                                          <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                            {subj.teacher_name
                                              ? `${subj.teacher_name} ${subj.teacher_surname}`
                                              : "-"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </PageReveal>

      {/* Modals remain outside for higher z-index if needed, or inside PageReveal depending on preference */}
      {/* Preview Modal & Subject Edit Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 font-sans">
          <div className="bg-white dark:bg-gray-800 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#302782] dark:text-[#B2BB1E]">
              ตรวจสอบข้อมูลก่อนอัปเดต
            </h2>
            <div className={`grid grid-cols-1 gap-4 mb-4 sm:mb-6 ${previewWarnings?.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-5 rounded-xl border border-green-200 dark:border-green-800 flex items-center gap-4">
                <CheckCircle className="text-green-500 w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-400">
                    ข้อมูลที่พร้อมบันทึก
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-500">
                    {previewData.length}
                  </p>
                </div>
              </div>

              {previewWarnings?.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 sm:p-5 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-center gap-4">
                  <AlertCircle className="text-yellow-500 w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                      พบข้อสังเกต
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-700 dark:text-yellow-500">
                      {previewWarnings.length}
                    </p>
                  </div>
                </div>
              )}

              <div
                className={`p-4 sm:p-5 rounded-xl border flex items-center gap-4 ${previewErrors.length > 0 ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"}`}
              >
                <AlertCircle
                  className={`${previewErrors.length > 0 ? "text-red-500" : "text-black"} w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0`}
                />
                <div>
                  <p
                    className={`text-sm font-medium ${previewErrors.length > 0 ? "text-red-800 dark:text-red-400" : "text-black dark:text-white"}`}
                  >
                    พบข้อผิดพลาด
                  </p>
                  <p
                    className={`text-2xl sm:text-3xl font-bold ${previewErrors.length > 0 ? "text-red-700 dark:text-red-500" : "text-black dark:text-white"}`}
                  >
                    {previewErrors.length}
                  </p>
                </div>
              </div>
            </div>

            {/* ส่วนแสดงรายการข้อสังเกต (Warnings) */}
            {previewWarnings?.length > 0 && (
              <div className="mb-4 sm:mb-6 border border-yellow-200 dark:border-yellow-800 rounded-xl overflow-hidden bg-yellow-50/50 dark:bg-yellow-900/10">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 px-4 py-3 border-b border-yellow-200 dark:border-yellow-800 font-bold text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                  <AlertCircle size={16} /> รายละเอียดข้อสังเกต (ระบบจัดการให้แล้ว)
                </div>
                <div className="max-h-48 overflow-y-auto p-3">
                  <ul className="space-y-2">
                    {previewWarnings.map((warn, idx) => (
                      <li key={idx} className="text-sm text-yellow-700 dark:text-yellow-400 bg-white dark:bg-gray-800 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800/50 shadow-sm flex items-start gap-2.5">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-yellow-500" />
                        <div>
                          <span className="font-bold">วิชาที่ {warn.row || '-'}:</span> {warn.message || 'พบข้อสังเกตบางอย่าง'}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* ส่วนแสดงรายการข้อผิดพลาด */}
            {previewErrors.length > 0 && (
              <div className="mb-4 sm:mb-6 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden bg-red-50/50 dark:bg-red-900/10">
                <div className="bg-red-100 dark:bg-red-900/30 px-4 py-3 border-b border-red-200 dark:border-red-800 font-bold text-sm text-red-800 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={16} /> รายละเอียดข้อผิดพลาด
                </div>
                <div className="max-h-48 overflow-y-auto p-3">
                  <ul className="space-y-2">
                    {previewErrors.map((err, idx) => (
                      <li key={idx} className="text-sm text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 p-3 rounded-lg border border-red-100 dark:border-red-800/50 shadow-sm flex items-start gap-2.5">
                        <X size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                        <div>
                          <span className="font-bold">วิชาที่ {err.row || '-'}:</span> {err.message || 'ข้อผิดพลาดไม่ทราบสาเหตุ'}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full border-t border-gray-100 dark:border-gray-700 pt-4">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                onClick={onConfirmReuploadClick}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#B2BB1E] text-white rounded-xl hover:bg-[#9fa719] transition-colors font-medium shadow-md"
              >
                ยืนยันอัปเดต
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ย้ายห้อง */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 font-sans">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all overflow-y-auto max-h-[90vh] border border-white/20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500">
                <ArrowRightLeft size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#302782] dark:text-[#B2BB1E]">
                  ย้ายตารางเรียน
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  ย้ายรายวิชาทั้งหมดไปยังห้องใหม่
                </p>
              </div>
            </div>

            {/* Visual: From → To */}
            <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
              <div className="flex-1 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ห้องเดิม</p>
                <p className="text-lg font-black text-[#302782] dark:text-white">{moveRoomData.oldRoomId}</p>
              </div>
              <ArrowRight size={20} className="text-[#B2BB1E] shrink-0" />
              <div className="flex-1 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ห้องใหม่</p>
                <p className="text-lg font-black text-[#302782] dark:text-white">
                  {moveRoomData.newRoomId || "—"}
                </p>
              </div>
            </div>

            {/* Select new room */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 ml-1 flex items-center gap-1.5">
                <MapPin size={14} /> เลือกห้องที่ต้องการย้ายไป
              </label>
              <select
                value={moveRoomData.newRoomId}
                onChange={(e) => setMoveRoomData((prev) => ({ ...prev, newRoomId: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- เลือกห้องเรียน --</option>
                {allRooms
                  .filter((room) => room.room_id !== moveRoomData.oldRoomId)
                  .map((room) => (
                    <option key={room.room_id} value={room.room_id}>
                      {room.room_id}{" "}
                      {room.location ? `(${room.location})` : ""}
                    </option>
                  ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsMoveModalOpen(false)}
                className="w-full sm:w-auto px-5 py-3 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold text-sm"
              >
                ยกเลิก
              </button>
              <button
                onClick={onMoveRoom}
                disabled={isMoving || !moveRoomData.newRoomId}
                className="w-full sm:w-auto px-8 py-3 bg-[#B2BB1E] hover:bg-[#9fa719] disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-2xl transition-all font-bold text-sm shadow-lg shadow-lime-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isMoving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    กำลังย้าย...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={18} />
                    ยืนยันย้ายห้อง
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isSubjectEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[2000] p-4 font-sans animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100 border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-[#302782] dark:text-[#B2BB1E]">
                  <Edit2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#302782] dark:text-[#B2BB1E]">
                    แก้ไขรายละเอียดรายวิชา
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ปรับเปลี่ยนข้อมูล และจัดตารางเรียนใหม่
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubjectEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={onSaveSubjectEdit}
              className="overflow-y-auto flex-grow p-8 space-y-8"
            >
              {/* ส่วนที่ 1: ข้อมูลผู้สอน */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <User
                    size={14}
                    className="text-[#302782] dark:text-[#B2BB1E]"
                  />
                  ข้อมูลบุคลากรผู้รับผิดชอบ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="relative group">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                      ชื่อบุคลากร
                    </label>
                    <input
                      required
                      value={editingSubjectData.teacher_name || ""}
                      onChange={(e) =>
                        updateSubjectField("teacher_name", e.target.value)
                      }
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all hover:border-gray-300 dark:hover:border-gray-600"
                      placeholder="เช่น สมชาย"
                    />
                  </div>
                  <div className="relative group">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                      นามสกุล
                    </label>
                    <input
                      required
                      value={editingSubjectData.teacher_surname || ""}
                      onChange={(e) =>
                        updateSubjectField("teacher_surname", e.target.value)
                      }
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all hover:border-gray-300 dark:hover:border-gray-600"
                      placeholder="เช่น แสนดี"
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 2: รายละเอียดวิชา */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <BookOpen
                    size={14}
                    className="text-[#302782] dark:text-[#B2BB1E]"
                  />
                  ข้อมูลรายวิชา
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 flex items-center gap-1">
                      <Hash size={12} /> รหัสวิชา
                    </label>
                    <input
                      required
                      value={editingSubjectData.course_code || ""}
                      onChange={(e) =>
                        updateSubjectField("course_code", e.target.value)
                      }
                      placeholder="เช่น CS101"
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                      ชื่อวิชา
                    </label>
                    <input
                      required
                      value={editingSubjectData.subject_name || ""}
                      onChange={(e) =>
                        updateSubjectField("subject_name", e.target.value)
                      }
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1">
                      Section
                    </label>
                    <input
                      required
                      value={editingSubjectData.sec || ""}
                      onChange={(e) =>
                        updateSubjectField("sec", e.target.value)
                      }
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนที่ 3: สถานที่และเวลา */}
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar
                    size={14}
                    className="text-[#302782] dark:text-[#B2BB1E]"
                  />
                  กำหนดการและสถานที่
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className=" text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 flex items-center gap-1">
                      <MapPin size={12} /> เลือกห้องเรียน
                    </label>
                    <select
                      required
                      value={editingSubjectData.room_id || ""}
                      onChange={(e) =>
                        updateSubjectField("room_id", e.target.value)
                      }
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">-- เลือกห้องเรียน --</option>
                      {allRooms.map((room) => (
                        <option key={room.room_id} value={room.room_id}>
                          {room.room_id}{" "}
                          {room.location ? `(${room.location})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className=" text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 flex items-center gap-1">
                      <Calendar size={12} /> วันที่เริ่ม (สัปดาห์แรก)
                    </label>
                    <input
                      required
                      type="date"
                      value={editingSubjectData.date || ""}
                      onChange={(e) =>
                        updateSubjectField("date", e.target.value)
                      }
                      className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1">
                        เวลาเริ่ม
                      </label>
                      <TimePickerField
                        label="เลือกเวลาเริ่ม"
                        type="start_time"
                        value={editingSubjectData.start_time}
                        endTime={editingSubjectData.end_time} // ส่งเวลาสิ้นสุดไปกันเลือกเวลาที่ขัดแย้งกัน
                        onChange={(val) =>
                          updateSubjectField("start_time", val)
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1">
                        เวลาสิ้นสุด
                      </label>
                      <TimePickerField
                        label="เลือกเวลาสิ้นสุด"
                        type="end_time"
                        value={editingSubjectData.end_time}
                        startTime={editingSubjectData.start_time} // ส่งเวลาเริ่มไปกันเลือกเวลาที่น้อยกว่า
                        onChange={(val) => updateSubjectField("end_time", val)}
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className=" text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 ml-1 flex items-center gap-1">
                      <Hash size={12} /> จำนวนสัปดาห์ที่สอน (Repeat)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        required
                        type="number"
                        min="1"
                        max="20"
                        value={editingSubjectData.repeat || 1}
                        onChange={(e) =>
                          updateSubjectField("repeat", e.target.value)
                        }
                        className="w-32 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 text-black dark:text-white p-3.5 rounded-2xl focus:ring-2 focus:ring-[#B2BB1E] outline-none transition-all"
                      />
                      <p className="text-xs text-gray-400 italic">
                        * ระบบจะสร้างตารางเรียนรายสัปดาห์ตามจำนวนที่ระบุ
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </form>

            {/* Footer Actions */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSubjectEditModalOpen(false)}
                className="px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all font-bold text-sm border border-gray-200 dark:border-gray-600 shadow-sm active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={onSaveSubjectEdit}
                disabled={isSavingSubject}
                className="px-10 py-3 bg-[#B2BB1E] hover:bg-[#9fa719] text-white rounded-2xl transition-all font-bold text-sm shadow-lg shadow-lime-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingSubject ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "บันทึกการเปลี่ยนแปลง"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {alertConfig.isOpen && (
        <ActionModal {...alertConfig} onClose={closeAlert} />
      )}
    </div>
  );
};

export default ScheduleManagement;
