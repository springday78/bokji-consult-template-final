import React from 'react';

function RentalHistoryTable({ history = [] }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">📜 대여 이력</h3>
      {history.length === 0 ? (
        <p className="text-gray-500">이력이 없습니다.</p>
      ) : (
        <table className="min-w-full text-sm border table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">수급자</th>
              <th className="border px-2 py-1">인정번호</th>
              <th className="border px-2 py-1">입력일자</th>
              <th className="border px-2 py-1">계약기간</th>
              <th className="border px-2 py-1">기타내용</th> {/* ✅ 추가 */}
            </tr>
          </thead>
          <tbody>
            {history.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="border px-2 py-1">{item.renter}</td>
                <td className="border px-2 py-1">{item.approval_number}</td>
                <td className="border px-2 py-1">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString('ko-KR')
                    : '-'}
                </td>
                <td className="border px-2 py-1">{item.contract_period}</td>
                <td className="border px-2 py-1">{item.memo || '-'}</td> {/* ✅ 추가 */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RentalHistoryTable;
