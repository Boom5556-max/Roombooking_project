import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios.js'; 

export const useSchedule = () => {
  // เก็บรายการ room_id ที่ไม่ซ้ำกัน เช่น [{ room_id: '26504' }, { room_id: '26512' }]
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      
      let scheduleData = [];
      if (Array.isArray(res.data)) {
        scheduleData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        scheduleData = res.data.data;
      } else if (res.data && Array.isArray(res.data.schedules)) {
        scheduleData = res.data.schedules;
      }

      setSchedules(scheduleData);
    } catch (error) {
      console.error('Fetch Schedules Error:', error);
      setSchedules([]); 
      throw error; 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules().catch(() => {});
  }, [fetchSchedules]);

  // 2. DELETE: ลบข้อมูลตารางเรียนทั้งหมดของ room_id นั้น
  const handleDelete = async (roomId) => {
    try {
      const res = await api.delete(`/schedules/${roomId}`);
      if (res.data.success) {
        await fetchSchedules();
        return { success: true, message: res.data.message }; 
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      console.error('Delete Error:', error);
      throw error; 
    }
  };

  // 3. PUT: ย้ายตารางเรียนทั้งหมดจากห้องเดิมไปห้องใหม่
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveRoomData, setMoveRoomData] = useState({ oldRoomId: '', newRoomId: '' });

  const openMoveModal = (oldRoomId) => {
    setMoveRoomData({ oldRoomId, newRoomId: '' });
    setIsMoveModalOpen(true);
  };

  const handleMoveRoom = async () => {
    try {
      const res = await api.put(`/schedules/${moveRoomData.oldRoomId}`, {
        new_room_id: moveRoomData.newRoomId
      });
      if (res.data.success) {
        await fetchSchedules();
        return { success: true, message: res.data.message, updatedRows: res.data.updatedRows };
      }
      return { success: false, message: res.data.message };
    } catch (error) {
      console.error('Move Room Error:', error);
      throw error;
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
      const res = await api.post(`/schedules/reupload/${currentReuploadId}`, formData);

      setPreviewData(res.data.previewData || []);
      setPreviewErrors(res.data.errors || []);
      setIsPreviewModalOpen(true);

    } catch (error) {
      console.error('Reupload Preview Error:', error);
      // 🚩 โยน Error ออกไปให้ Component แสดง Pop-up แทน alert()
      throw error; 
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  // 5. PUT: ยืนยันการอัปโหลดทับข้อมูลเดิม
  const handleConfirmReupload = async () => {
    try {
      setIsUploading(true);
      const res = await api.put(`/schedules/reconfirm/${currentReuploadId}`, {
        schedules: previewData
      });

      if (res.data.success) {
        await fetchSchedules(); 
        return { success: true, totalSaved: res.data.totalSaved };
      }
      return { success: false };
    } catch (error) {
      console.error('Confirm Reupload Error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // 6. GET: ดึงรายวิชาที่ไม่ซ้ำกันในห้องนั้น (โดยใช้ room_id)
  const fetchSubjects = async (roomId) => {
    try {
      const res = await api.get(`/schedules/subjects/${roomId}`);
      return res.data.subjects || [];
    } catch (error) {
      console.error('Fetch Subjects Error:', error);
      throw error;
    }
  };

  // 7. PATCH: แก้ไขข้อมูลรายวิชา (ส่ง room_id เดิมเป็น URL param)
  const editSubjectSchedule = async (oldRoomId, payload) => {
    try {
      const res = await api.patch(`/schedules/editSubjects/${oldRoomId}`, payload);
      return { success: true, message: res.data.message, canceled_conflicts: res.data.canceled_conflicts };
    } catch (error) {
      console.error('Edit Subject Schedule Error:', error);
      throw error;
    }
  };

  // 8. DELETE: ลบรายวิชาออกจากห้อง (ต้องส่ง course_code, subject_name, sec)
  const deleteSubjectSchedule = async (roomId, course_code, subject_name, sec) => {
    try {
      const res = await api.delete(`/schedules/deleteSubjects/${roomId}`, {
        data: { course_code, subject_name, sec }
      });
      return { success: true, message: res.data.message, deleted_count: res.data.deleted_count };
    } catch (error) {
      console.error('Delete Subject Schedule Error:', error);
      throw error;
    }
  };

  return {
    schedules, isLoading,
    isMoveModalOpen, setIsMoveModalOpen, moveRoomData, setMoveRoomData, openMoveModal, handleMoveRoom,
    isPreviewModalOpen, setIsPreviewModalOpen, isUploading, previewData, previewErrors, fileInputRef,
    handleDelete, triggerFileInput, handleFileChange, handleConfirmReupload,
    fetchSubjects, editSubjectSchedule, deleteSubjectSchedule
  };
};