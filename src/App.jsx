import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import ConsultForm from './ConsultForm';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function App() {
  const [consultations, setConsultations] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [view, setView] = useState('form');
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'consultations'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setConsultations(data);
    });
    return () => unsub();
  }, []);

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

  const handleEdit = (item) => {
    setCurrentEdit(item);
    setEditMode(true);
    setView('form');
  };

  const handleExportToExcel = () => {
    const exportData = consultations.map((item) => ({
      이름: item.name,
      성별: item.gender,
      생년월일: item.birth,
      연락처: item.phone,
      연계구분: item.refType,
      상담날짜: item.date,
      상담내용: item.content,
      구매목록: (item.products || []).join(', '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData, { origin: 'A1' });

    const colWidths = Object.keys(exportData[0] || {}).map((key) => {
      const maxLen = Math.max(
        key.length,
        ...exportData.map((row) => String(row[key] || '').length)
      );
      return { wch: maxLen + 2 };
    });

    worksheet['!cols'] = colWidths;

    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    rows.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        const cell = worksheet[cellRef];
        if (cell && typeof cell.v === 'string' && cell.v.includes('\n')) {
          cell.s = { alignment: { wrapText: true } };
        }
      });
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '상담기록');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });

    saveAs(blob, '복지용구_상담기록.xlsx');
  };

  const filteredConsultations = consultations.filter((item) =>
    [item.name, item.phone, item.refType].some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold text-blue-800 mb-8 text-center">복지용구 상담노트</h1>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => {
            setView('form');
            setEditMode(false);
            setCurrentEdit(null);
          }}
          className={`px-6 py-2 rounded border ${
            view === 'form' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
          }`}
        >
          상담 등록
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-6 py-2 rounded border ${
            view === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
          }`}
        >
          상담 내역 보기
        </button>
      </div>

      {view === 'form' ? (
        <ConsultForm
          editMode={editMode}
          currentEdit={currentEdit}
          onFinishEdit={() => {
            setEditMode(false);
            setCurrentEdit(null);
          }}
        />
      ) : (
        <div>
          <div className="flex justify-between mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 연락처, 연계구분 검색"
              className="border px-3 py-2 rounded w-80"
            />
            <button
              onClick={handleExportToExcel}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              엑셀 다운로드
            </button>
          </div>

          <div className="mb-4">
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              선택 삭제
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-300 table-auto">
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
                  <th className="border p-2">구매목록</th>
                  <th className="border p-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 align-top">
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
                    <td className="border p-2 whitespace-pre-line break-words max-w-[250px]">
                      {item.content}
                    </td>
                    <td className="border p-2 whitespace-pre-line break-words max-w-[250px]">
                      {(item.products || []).join(', ')}
                    </td>
                    <td className="border p-2 text-center space-x-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        수정
                      </button>
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
