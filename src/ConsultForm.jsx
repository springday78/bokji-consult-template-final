import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// 수량 입력이 필요한 카테고리
const quantityCategories = [
  "미끄럼방지매트",
  "미끄럼방지양말",
  "요실금팬티",
  "안전손잡이"
];

const productOptions = {
  "미끄럼방지매트": ["BLS-700", "SW-M1(신규)", "나이팅게일 A", "나이팅게일 B"],
  "이동변기": ["APT-101 원목", "APT-210 플라스틱"],
  "간이변기": ["ABP-101", "ABP-105(남성용)"],
  "욕창예방매트리스": ["YB-1104A", "YH-0301"],
  "목욕의자": ["KT-130", "PT-300"],
  "지팡이": ["나래-4000", "지팡이 SF"],
  "성인용보행기": ["ECHA(이차)", "HM-606"],
  "경사로": ["TRA-H10", "TRA-H20"],
  "자세변환용구": ["YH-LA31", "LA32"],
  "미끄럼방지양말": ["로제이02", "위풋논슬립돌돌이양말"],
  "요실금팬티": ["HW300자가드30cc", "FW300유린디펜스"],
  "안전손잡이": ["ASH-102", "ASH-103"]
};

function ConsultForm({ editMode, currentEdit, onFinishEdit }) {
  const [formData, setFormData] = useState({
    name: '', gender: '', birth: '', phone: '', refType: '', date: null,
    content: '', products: [] // { name: '', quantity: '' }
  });

  useEffect(() => {
    if (editMode && currentEdit) {
      setFormData({
        ...currentEdit,
        date: currentEdit.date ? new Date(currentEdit.date) : null,
        products: currentEdit.products || []
      });
    }
  }, [editMode, currentEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const toggleProduct = (name) => {
    setFormData(prev => {
      const exists = prev.products.find(p => p.name === name);
      return {
        ...prev,
        products: exists
          ? prev.products.filter(p => p.name !== name)
          : [...prev.products, { name, quantity: '' }]
      };
    });
  };

  const handleQuantityChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => p.name === name ? { ...p, quantity: value } : p)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prepared = {
      ...formData,
      date: formData.date ? formData.date.toISOString().split('T')[0] : ''
    };
    try {
      if (editMode && currentEdit?.id) {
        await updateDoc(doc(db, 'consultations', currentEdit.id), prepared);
        alert('수정 완료!');
      } else {
        const ref = await addDoc(collection(db, 'consultations'), prepared);
        await updateDoc(ref, { id: ref.id });
        alert('등록 완료!');
      }
      onFinishEdit && onFinishEdit();
      setFormData({ name: '', gender: '', birth: '', phone: '', refType: '', date: null, content: '', products: [] });
    } catch (err) {
      console.error(err);
      alert('저장 실패');
    }
  };

  const isChecked = (name) => formData.products.some(p => p.name === name);
  const getQuantity = (name) => formData.products.find(p => p.name === name)?.quantity || '';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="이름" className="border p-2 w-full" />
      <select name="gender" value={formData.gender} onChange={handleChange} className="border p-2 w-full">
        <option value="">성별 선택</option><option>남자</option><option>여자</option>
      </select>
      <input name="birth" value={formData.birth} onChange={handleChange} placeholder="생년월일" className="border p-2 w-full" />
      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="연락처" className="border p-2 w-full" />
      <input name="refType" value={formData.refType} onChange={handleChange} placeholder="연계구분" className="border p-2 w-full" />
      <DatePicker selected={formData.date} onChange={handleDateChange} dateFormat="yyyy-MM-dd" className="border p-2 w-full" placeholderText="상담 날짜" />
      <textarea name="content" value={formData.content} onChange={handleChange} placeholder="상담 내용" rows={4} className="border p-2 w-full" />

      <div>
        <h3 className="font-bold">구매목록 선택</h3>
        {Object.entries(productOptions).map(([category, items]) => (
          <div key={category} className="mb-4">
            <p className="font-semibold text-sm mb-1">{category}</p>
            <div className="grid grid-cols-2 gap-2">
              {items.map(item => (
                <div key={item} className="flex gap-2 items-center">
                  <input type="checkbox" checked={isChecked(item)} onChange={() => toggleProduct(item)} />
                  <span>{item}</span>
                  {isChecked(item) && quantityCategories.includes(category) && (
                    <input
                      type="number"
                      value={getQuantity(item)}
                      min="0"
                      onChange={(e) => handleQuantityChange(item, e.target.value)}
                      className="border w-16 px-1 py-0.5 text-sm"
                      placeholder="수량"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        {editMode ? '수정하기' : '등록하기'}
      </button>
    </form>
  );
}

export default ConsultForm;
