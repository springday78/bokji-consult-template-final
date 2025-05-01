import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ConsultForm({ editMode, currentEdit, onFinishEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birth: '',
    phone: '',
    refType: '',
    date: null,
    content: '',
  });

  // 🧩 수정 모드일 경우 기존 값으로 폼 채우기
  useEffect(() => {
    if (editMode && currentEdit) {
      setFormData({
        ...currentEdit,
        date: currentEdit.date ? new Date(currentEdit.date) : null,
      });
    }
  }, [editMode, currentEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDate) => {
    setFormData((prev) => ({ ...prev, date: selectedDate }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: '',
      birth: '',
      phone: '',
      refType: '',
      date: null,
      content: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const preparedData = {
        ...formData,
        date: formData.date ? formData.date.toISOString().split('T')[0] : '',
      };

      if (editMode && currentEdit?.id) {
        const docRef = doc(db, 'consultations', currentEdit.id);
        await updateDoc(docRef, preparedData);
        alert('상담 수정 완료!');
      } else {
        const docRef = await addDoc(collection(db, 'consultations'), preparedData);
        await updateDoc(docRef, { id: docRef.id });
        alert('상담 등록 완료!');
      }

      resetForm();
      if (onFinishEdit) onFinishEdit();
    } catch (error) {
      console.error('저장 실패:', error);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="이름"
        className="border p-2 w-full rounded focus:outline-none focus:ring"
      />

      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="border p-2 w-full rounded focus:outline-none focus:ring"
      >
        <option value="">성별 선택</option>
        <option value="남자">남자</option>
        <option value="여자">여자</option>
      </select>

      <input
        type="text"
        name="birth"
        value={formData.birth}
        onChange={handleChange}
        placeholder="생년월일"
        className="border p-2 w-full rounded focus:outline-none focus:ring"
      />
      <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="연락처"
        className="border p-2 w-full rounded focus:outline-none focus:ring"
      />
      <input
        type="text"
        name="refType"
        value={formData.refType}
        onChange={handleChange}
        placeholder="연계구분"
        className="border p-2 w-full rounded focus:outline-none focus:ring"
      />

      <DatePicker
        selected={formData.date}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        placeholderText="상담 날짜 선택"
        className="border p-2 w-full rounded focus:outline-none focus:ring"
      />

      <textarea
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="상담내용"
        rows={4}
        className="border p-2 w-full rounded focus:outline-none focus:ring resize-none"
      ></textarea>

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 w-full"
      >
        {editMode ? '수정하기' : '등록하기'}
      </button>
    </form>
  );
}

export default ConsultForm;
