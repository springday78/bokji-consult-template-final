import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import ConsultForm from './ConsultForm';
import * as XLSX from 'xlsx';

function ConsultList() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [editing, setEditing] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');

  // ✅ 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchConsultations = async () => {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('불러오기 오류:', error);
    } else {
      setData(data);
      setFiltered(data);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  useEffect(() => {
    const filteredData = data.filter(item => {
      const nameMatch = item.name?.includes(searchName);
      const dateMatch = item.date?.includes(searchDate);
      return nameMatch && dateMatch;
    });
    setFiltered(filteredData);
    setCurrentPage(1); // 검색 시 첫 페이지로 초기화
  }, [searchName, searchDate, data]);

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('consultations').delete().eq('id', id);
    if (!error) {
      alert('삭제 완료');
      fetchConsultations();
    } else {
      alert('삭제 실패');
    }
  };

  const formatProducts = (products) => {
    if (!Array.isArray(products) || products.length === 0) return '-';
    return products
      .map((p) => p.quantity ? `${p.name} (${p.quantity})` : p.name)
      .join(', ');
  };

  const downloadExcel = () => {
    const rows = filtered.map(item => ({
      이름: item.name,
      연락처: item.phone,
      등급: item.careGrade,
      상담일: item.date,
      상담내용: item.content,
      제품목록: formatProducts(item.products),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '상담내역');
    XLSX.writeFile(workbook, '상담내역.xlsx');
  };

  // ✅ 페이지네이션 계산
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-4">📝 상담 내역</h2>

      {/* 🔍 필터 입력창 */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="이름 검색"
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="상담일 검색 (예: 2025-06)"
          value={searchDate}
          onChange={e => setSearchDate(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={downloadExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          📥 엑셀 다운로드
        </button>
      </div>

      {editing && (
        <div className="mb-10">
          <ConsultForm
            editMode={true}
            currentEdit={editing}
            onFinishEdit={() => {
              setEditing(null);
              fetchConsultations();
            }}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-500">상담 내역이 없습니다.</p>
      ) : (
        <>
          <table className="w-full text-sm border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 w-[60px]">이름</th>
                <th className="border p-2 w-[120px]">연락처</th>
                <th className="border p-2 w-[60px]">등급</th>
                <th className="border p-2">상담일</th>
                <th className="border p-2">내용</th>
                <th className="border p-2">제품 목록</th>
                <th className="border p-2">작업</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item) => (
                <tr key={item.id}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.phone}</td>
                  <td className="border p-2">{item.careGrade}</td>
                  <td className="border p-2">{item.date}</td>
                  <td className="border p-2 whitespace-pre-wrap">{item.content}</td>
                  <td className="border p-2 whitespace-pre-wrap">{formatProducts(item.products)}</td>
                  <td className="border p-2">
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => setEditing(item)}>수정</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDelete(item.id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ✅ 페이지네이션 컨트롤 */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center gap-2 text-sm">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border rounded disabled:text-gray-400"
              >
                이전
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-2 py-1 border rounded ${
                    currentPage === idx + 1 ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 py-1 border rounded disabled:text-gray-400"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ConsultList;
