import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios.js'; 

export const useSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับ Modal แก้ไข Header
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState({ id: '', department: '', study_year: '', program_type: '' });

  // State สำหรับระบบ Re-upload
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [previewErrors, setPreviewErrors] = useState([]);
  const [currentReuploadId, setCurrentReuploadId] = useState(null);
  
  const fileInputRef = useRef(null);

  // 1. GET: ดึงข้อมูลประวัติตารางเรียน
  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/schedules/allScheduleLog');
      
      // 🚩 เพิ่ม Log ดูว่า Backend ส่งอะไรมา (เปิด F12 ดูใน Console)
      console.log('ข้อมูลจาก API:', res.data);
      
      // 🚩 ดักจับและคัดกรองข้อมูลให้ชัวร์ว่าเป็น Array เสมอ
      let scheduleData = [];
      
      if (Array.isArray(res.data)) {
        // กรณี Backend ส่งมาเป็น Array ตรงๆ เลย: [ {...}, {...} ]
        scheduleData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        // กรณี Backend ส่งมาเป็น Object: { success: true, data: [ {...}, {...} ] }
        scheduleData = res.data.data;
      } else if (res.data && Array.isArray(res.data.schedules)) {
        // เผื่อ Backend ส่งมาเป็นชื่อตัวแปรอื่น: { schedules: [ {...}, {...} ] }
        scheduleData = res.data.schedules;
      }

      setSchedules(scheduleData);

    } catch (error) {
      console.error('Fetch Schedules Error:', error);
      setSchedules([]); // 🚩 ถ้าพังให้เซ็ตเป็น Array ว่าง ป้องกัน error .map()
      alert('ไม่สามารถดึงข้อมูลตารางเรียนได้');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // 2. DELETE: ลบข้อมูลตารางเรียน
  const handleDelete = async (id) => {
    if (!window.confirm('⚠️ ยืนยันการลบ?\nข้อมูลรายวิชาทั้งหมดในตารางชุดนี้จะหายไปแบบกู้คืนไม่ได้!')) return;

    try {
      const res = await api.delete(`/schedules/${id}`);
      if (res.data.success) {
        alert('ลบข้อมูลสำเร็จ');
        fetchSchedules();
      }
    } catch (error) {
      console.error('Delete Error:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  // 3. PUT: แก้ไขข้อมูล Header
  const openEditModal = (schedule) => {
    setEditingSchedule({
      id: schedule.unique_schedules,
      department: schedule.department,
      study_year: schedule.study_year,
      program_type: schedule.program_type,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        department: editingSchedule.department,
        study_year: editingSchedule.study_year,
        program_type: editingSchedule.program_type,
      };
      const res = await api.put(`/schedules/${editingSchedule.id}`, payload);
      
      if (res.data.success) {
        alert('แก้ไขข้อมูลสำเร็จ!');
        setIsEditModalOpen(false);
        fetchSchedules();
      }
    } catch (error) {
      console.error('Edit Error:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    }
  };

  // 4. POST: เลือกไฟล์ใหม่และส่งไป Preview
  const triggerFileInput = (id) => {
    setCurrentReuploadId(id);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentReuploadId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/schedules/reupload/${currentReuploadId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setPreviewData(res.data.previewData || []);
      setPreviewErrors(res.data.errors || []);
      setIsPreviewModalOpen(true);

    } catch (error) {
      console.error('Reupload Preview Error:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการตรวจสอบไฟล์');
    } finally {
      setIsUploading(false);
      e.target.value = null; // รีเซ็ต input file
    }
  };

  // 5. PUT: ยืนยันการอัปโหลดทับข้อมูลเดิม
  const handleConfirmReupload = async () => {
    if (previewErrors.length > 0) {
      const confirmWarning = window.confirm('⚠️ ไฟล์นี้มี Error บางส่วน คุณต้องการบันทึกข้ามส่วนที่ Error ไปหรือไม่?');
      if (!confirmWarning) return;
    }

    try {
      setIsUploading(true);
      const res = await api.put(`/schedules/reconfirm/${currentReuploadId}`, {
        schedules: previewData
      });

      if (res.data.success) {
        alert(`บันทึกข้อมูลสำเร็จ! อัปเดตตารางเรียน ${res.data.totalSaved} รายการ`);
        setIsPreviewModalOpen(false);
        fetchSchedules(); 
      }
    } catch (error) {
      console.error('Confirm Reupload Error:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsUploading(false);
    }
  };

  return {
    schedules,
    isLoading,
    isEditModalOpen,
    setIsEditModalOpen,
    editingSchedule,
    setEditingSchedule,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isUploading,
    previewData,
    previewErrors,
    fileInputRef,
    handleDelete,
    openEditModal,
    handleSaveEdit,
    triggerFileInput,
    handleFileChange,
    handleConfirmReupload
  };
};