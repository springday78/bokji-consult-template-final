// src/App.jsx
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import ConsultForm from './ConsultForm';

function App() {
  const [consultations, setConsultations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [view, setView] = useState('form'); // 🌟 화면 상태: 'form' 또는 'list'
  const [search, setSearch] = useState(''); // 검색어 상태

  // 상담 내역 가져오기
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'consultations'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConsultations(data);
    });
    return () => unsub();
  }, []);

  // 삭제 핸들러
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    await deleteDoc(doc(db, 'consultations', id));
    alert('삭제되었습니다!');
  };

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

  const toggleCheckbox = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 🔍 검색 필터링
  const filteredConsultations = consultations.filter((item) =>
    [item.name, item.phone, item.refType].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">복지용구 상담노트</h1>

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setView('form')}
          className={`px-6 py-2 rounded border ${view === 'form' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
        >
          상담 등록
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-6 py-2 rounded border ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
        >
          상담 내역 보기
        </button>
      </div>

      {/* 화면 전환 */}
      {view === 'form' ? (
        <ConsultForm />
      ) : (
        <div>
          {/* 검색창 */}
          <div className="flex justify-end mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 연락처, 연계구분 검색"
              className="border px-3 py-2 rounded w-80"
            />
          </div>

          {/* 선택 삭제 버튼 */}
          <div className="mb-4">
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              선택 삭제
            </button>
          </div>

          {/* 상담 내역 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
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
                {filteredConsultations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleCheckbox(item.id)}
                      />
                    </td>
                    <td className="border p-2">{item.name}</td>
                    <td className="border p-2">{item.gender}</td>
                    <td className="border p-2">{item.birth}</td>
                    <td className="border p-2">{item.phone}</td>
                    <td className="border p-2">{item.refType}</td>
                    <td className="border p-2">{item.date}</td>
                    <td className="border p-2">{item.content}</td>
                    <td className="border p-2 text-center">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

