// src/ConsultForm.jsx
import React, { useState } from 'react';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import DatePicker from 'react-datepicker';          // ✅ 달력 컴포넌트 추가
import 'react-datepicker/dist/react-datepicker.css'; // ✅ 달력 스타일 가져오기

function ConsultForm() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birth: '',
    phone: '',
    refType: '',
    date: null,   // ✅ date를 '' 대신 null로 초기화
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDate) => {
    setFormData((prev) => ({ ...prev, date: selectedDate }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'consultations'), {
        ...formData,
        date: formData.date ? formData.date.toISOString().split('T')[0] : '', // 날짜는 'yyyy-MM-dd'로 저장
      });

      await updateDoc(docRef, {
        id: docRef.id,
      });

      alert('상담 등록 완료!');
      setFormData({
        name: '',
        gender: '',
        birth: '',
        phone: '',
        refType: '',
        date: null,
        content: '',
      });
    } catch (error) {
      console.error('등록 실패:', error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="이름"
        className="border p-2 w-full"
      />
      <input
        type="text"
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        placeholder="성별"
        className="border p-2 w-full"
      />
      <input
        type="text"
        name="birth"
        value={formData.birth}
        onChange={handleChange}
        placeholder="생년월일"
        className="border p-2 w-full"
      />
      <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="연락처"
        className="border p-2 w-full"
      />
      <input
        type="text"
        name="refType"
        value={formData.refType}
        onChange={handleChange}
        placeholder="연계구분"
        className="border p-2 w-full"
      />

      {/* ✅ 여기 상담날짜만 DatePicker로 바뀜! */}
      <DatePicker
        selected={formData.date}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        placeholderText="상담 날짜 선택"
        className="border p-2 w-full"
      />

      <input
        type="text"
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="상담내용"
        className="border p-2 w-full"
      />
      
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        등록하기
      </button>
    </form>
  );
}

export default ConsultForm;

