// src/ConsultForm.jsx
import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

function ConsultForm() {
  const [form, setForm] = useState({
    name: '',
    gender: '',
    birth: '',
    phone: '',
    refType: '',
    date: '',
    content: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'consultations'), form);
      alert('등록 완료!');
      setForm({
        name: '',
        gender: '',
        birth: '',
        phone: '',
        refType: '',
        date: '',
        content: '',
      });
    } catch (error) {
      alert('등록에 실패했어요 😢');
      console.error('등록 오류:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="name" placeholder="이름" value={form.name} onChange={handleChange} className="border p-2 w-full" />
      <input name="birth" placeholder="생년월일" value={form.birth} onChange={handleChange} className="border p-2 w-full" />
      <input name="phone" placeholder="연락처" value={form.phone} onChange={handleChange} className="border p-2 w-full" />
      <input name="refType" placeholder="연계구분" value={form.refType} onChange={handleChange} className="border p-2 w-full" />
      <input name="date" type="date" value={form.date} onChange={handleChange} className="border p-2 w-full" />
      
      <div className="flex gap-4 items-center">
        <label>성별:</label>
        <label><input type="radio" name="gender" value="남" checked={form.gender === '남'} onChange={handleChange} /> 남</label>
        <label><input type="radio" name="gender" value="여" checked={form.gender === '여'} onChange={handleChange} /> 여</label>
      </div>

      <textarea name="content" placeholder="상담내용" value={form.content} onChange={handleChange} className="border p-2 w-full h-24" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        상담 등록
      </button>
    </form>
  );
}

export default ConsultForm;
