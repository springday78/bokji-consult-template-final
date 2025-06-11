import React, { useState } from 'react';
import { supabase } from '../supabase';

function SimpleInfo() {
  const [searchName, setSearchName] = useState('');
  const [result, setResult] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const handleSearch = async () => {
    if (!searchName.trim()) return;

    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .eq('name', searchName.trim());

    if (error) {
      console.error('조회 실패:', error);
      alert('오류가 발생했습니다.');
      return;
    }

    if (data.length > 0) {
      const latest = data.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      setResult(latest);
      setEditMode(false);
    } else {
      setResult(null);
      alert('해당 이름의 상담 기록이 없습니다.');
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('consultations')
      .update({
        birth: result.birth,
        copay: result.copay,
        validPeriod: result.validPeriod,
        approvalNumber: result.approvalNumber,
        address: result.address,
      })
      .eq('id', result.id);

    if (error) {
      alert('수정 실패');
      console.error(error);
    } else {
      alert('수정 완료');
      setEditMode(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">간단정보확인</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="이름을 입력하세요"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          조회
        </button>
      </div>

      {result && (
        <>
          <table className="w-full border text-sm">
            <tbody>
              <tr>
                <td className="border p-2 font-semibold">수급자 성명</td>
                <td className="border p-2">{result.name}</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">장기요양등급</td>
                <td className="border p-2">{result.careGrade || '-'}</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">생년월일</td>
                <td className="border p-2">
                  {editMode ? (
                    <input
                      type="text"
                      className="border p-1 w-full"
                      value={result.birth || ''}
                      onChange={(e) => setResult((prev) => ({ ...prev, birth: e.target.value }))}
                    />
                  ) : (
                    result.birth || '-'
                  )}
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">본인부담률</td>
                <td className="border p-2">
                  {editMode ? (
                    <input
                      type="text"
                      className="border p-1 w-full"
                      value={result.copay || ''}
                      onChange={(e) => setResult((prev) => ({ ...prev, copay: e.target.value }))}
                    />
                  ) : (
                    result.copay || '-'
                  )}
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">유효기간</td>
                <td className="border p-2">
                  {editMode ? (
                    <input
                      type="text"
                      className="border p-1 w-full"
                      value={result.validPeriod || ''}
                      onChange={(e) => setResult((prev) => ({ ...prev, validPeriod: e.target.value }))}
                    />
                  ) : (
                    result.validPeriod || '-'
                  )}
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">상담일자</td>
                <td className="border p-2">{result.date || '-'}</td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">인정번호</td>
                <td className="border p-2">
                  {editMode ? (
                    <input
                      type="text"
                      className="border p-1 w-full"
                      value={result.approvalNumber || ''}
                      onChange={(e) => setResult((prev) => ({ ...prev, approvalNumber: e.target.value }))}
                    />
                  ) : (
                    result.approvalNumber || '-'
                  )}
                </td>
              </tr>
              <tr>
                <td className="border p-2 font-semibold">대상자 주소</td>
                <td className="border p-2">
                  {editMode ? (
                    <input
                      type="text"
                      className="border p-1 w-full"
                      value={result.address || ''}
                      onChange={(e) => setResult((prev) => ({ ...prev, address: e.target.value }))}
                    />
                  ) : (
                    result.address || '-'
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-4 flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  취소
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                수정하기
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SimpleInfo;