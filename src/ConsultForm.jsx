import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// ✅ 구매목록 전체 항목
const productOptions = {
  "미끄럼방지매트": [
    "BLS-700", "SW-M1(신규)", "나이팅게일 A", "나이팅게일 B", "나이팅게일 소", "나이팅게일 중", "나이팅게일 대",
    "SW-M260", "SW-지압PLUS", "바이오스타 논슬립매트Ⅲ"
  ],
  "이동변기": [
    "APT-101 원목", "APT-210 플라스틱", "CS-3", "PT-100", "SAMB",
    "BFMB4", "BFMB5", "BFMB8", "BFMB20", "NT-CT100(신규)",
    "SKC-660", "APT-103(신규)"
  ],
  "간이변기": [
    "ABP-101", "ABP-105(남성용)", "ABP-106(여성용)", "BFTL4(공용)", "BFTL5(남성용)", "BFTL6(여성용)"
  ],
  "욕창예방매트리스": [
    "YB-1104A", "YH-0301", "YH-0302", "YH-0302 TPU", "YH-0201D2", "AD-1300 MUTE Bio Double",
    "HG-100 MC2", "HG-100 M1 TPU", "GLORY-MC1", "AD-III TPU L/V", "AD-III TPU BEAM", "GR-1004H"
  ],
  "목욕의자": [
    "KT-130", "PT-300", "ASC-102", "ASC-103", "ASC-502",
    "PN-L4152101D", "Bofeel-9", "Bofeel-10", "Bofeel-8(신규)", "Bofeel-11(신규)", "IU", "MTCA"
  ],
  "지팡이": [
    "나래-4000", "나래-1000", "지팡이 SF", "아이윌소발지팡이", "백견지팡이 어1", "백견지팡이 어2", "백견지팡이 남1",
    "LS-20F(LED)", "ISA", "SKL-020(줄무늬)", "SKL-020(꽃무늬)", "SS", "EL-40S"
  ],
  "성인용보행기": [
    "ECHA(이차)", "HM-606", "산아-02", "KS-300", "E.ZO (이조)", "코지워커 P02", "네비게이터",
    "트라이버", "JW-100", "BM-70", "PHW-07", "sk-120(장수)", "sk-130(동행)", "실버카 담비", "서버", "SKB-101W", "에슐론", "AWT-501"
  ],
  "경사로": [
    "TRA-H10", "TRA-H20", "TRA-H30", "ASW-101(신규)", "ASW-102(신규)", "ASW-103(신규)"
  ]
};

function ConsultForm({ editMode, currentEdit, onFinishEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birth: '',
    phone: '',
    refType: '',
    date: null,
    content: '',
    products: [], // ✅ 구매목록
  });

  useEffect(() => {
    if (editMode && currentEdit) {
      setFormData({
        ...currentEdit,
        date: currentEdit.date ? new Date(currentEdit.date) : null,
        products: currentEdit.products || [],
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

  const handleProductCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      products: checked
        ? [...prev.products, value]
        : prev.products.filter((item) => item !== value),
    }));
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
      products: [],
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

      {/* ✅ 구매목록 영역 */}
      <div>
        <h3 className="font-bold mt-6 mb-2">구매목록 선택</h3>
        {Object.entries(productOptions).map(([category, items]) => (
          <div key={category} className="mb-4">
            <p className="font-semibold text-sm mb-1">{category}</p>
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    value={item}
                    checked={formData.products.includes(item)}
                    onChange={handleProductCheckboxChange}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

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
