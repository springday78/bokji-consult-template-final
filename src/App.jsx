import React, { useEffect, useState } from 'react';
import { db } from './firebase.js';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import ConsultForm from './ConsultForm';

function App() {
  const [consultations, setConsultations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // 실시간 상담내역 가져오기
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'consultations'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('📋 현재 consultations 목록:', data);  // ✅ 여기 추가
      setConsultations(data);
    });
    return () => unsub();
  }, []);

  // 개별 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'consultations', id));
    alert('삭제되었습니다!');
  };

  // 선택삭제
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }
    if (!window.confirm(`${selectedIds.length}건을 삭제하시겠습니까?`)) return;
    for (const id of selectedIds) {
      await deleteDoc(doc(db, 'consultations', id));
    }
    alert('선택된 항목이 삭제되었습니다!');
    setSelectedIds([]);
  };

  // 체크박스 토글
  const toggleCheckbox = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">복지용구 상담노트</h1>

      <div className="mb-10">
        <ConsultForm />
      </div>

      {/* 선택 삭제 버튼 */}
      <div className="mb-4">
        <button
          onClick={handleBulkDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          선택 삭제
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1000px] border border-gray-300 text-sm w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">선택</th>
              <th className="border p-2">이름</th>
              <th className="border p-2">성별</th>
              <th className="border p-2">생년월일</th>
              <th className="border p-2">연락처</th>
              <th className="border p-2">연계구분</th>
              <th className="border p-2">상담날짜</th>
              <th className="border p-2">상담내용</th>
              <th className="border p-2">삭제</th>
            </tr>
          </thead>
          <tbody>
            {consultations.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleCheckbox(item.id)}
                  />
                </td>
                <td className="border p-2 whitespace-nowrap">{item.name}</td>
                <td className="border p-2 whitespace-nowrap">{item.gender}</td>
                <td className="border p-2 whitespace-nowrap">{item.birth}</td>
                <td className="border p-2 whitespace-nowrap">{item.phone}</td>
                <td className="border p-2 whitespace-nowrap">{item.refType}</td>
                <td className="border p-2 whitespace-nowrap">{item.date}</td>
                <td className="border p-2 whitespace-nowrap">{item.content}</td>
                <td className="border p-2 text
