import { useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUser = async (unusedId, userData) => { // unusedId เพราะ backend ใช้ user_id ใน body
    try {
      await api.post("/users/create", userData); // ยิงไปที่ /users/create ตาม backend
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "เพิ่มไม่สำเร็จ" };
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      // Backend รับ user_id ทาง params: /users/edit/:user_id
      await api.put(`/users/edit/${userId}`, userData); 
      await fetchUsers();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "แก้ไขไม่สำเร็จ" };
    }
  };

  const deleteUser = async (userId) => {
  try {
    // ตรวจสอบว่า URL ตรงกับที่ตั้งไว้ใน Backend
    const res = await api.patch(`/users/delete/${userId}`);
    await fetchUsers(); 
    return { success: true };
  } catch (err) {
    console.error(err);
    return { 
      success: false, 
      message: err.response?.data?.message || "ไม่สามารถลบข้อมูลได้" 
    };
  }
};

  const toggleUserActive = async (userId) => {
    try {
      const res = await api.patch(`/users/toggle-active/${userId}`);
      await fetchUsers();
      return { success: true, message: res.data?.message };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะผู้ใช้งานได้" 
      };
    }
  };

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, isLoading, addUser, updateUser, deleteUser, toggleUserActive };
};