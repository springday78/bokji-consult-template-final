import React, { useState } from 'react';
import { supabase } from '../supabase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { productOptions } from '../data/productOptions';
import * as XLSX from 'xlsx';

const copayRates = ['15%', '9%', '6%', '0%'];

function ConsultStats() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [stats, setStats] = useState([]);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    const { data, error } = await supabase.from('consultations').select('*');

    if (error) {
      console.error('데이터 불러오기 오류:', error);
      alert('데이터를 불러오지 못했습니다.');
      return;
    }

    const resultMap = {};

    data.forEach((row) => {
      const docDate = new Date(row.date);
      if (docDate < startDate || docDate > endDate) return;

      const personName = row.name || '이름없음';

      (row.products || []).forEach((item) => {
        const category = getCategory(item.name);
        const product = item.name;
        const quantity = parseInt(item.quantity || '1', 10);
        const copay = item.copay || '기타';

        const key = `${category}|||${product}`;

        if (!resultMap[key]) {
          resultMap[key] = {
            category,
            product,
            total: 0,
            copayStats: {
              '15%': 0,
              '9%': 0,
              '6%': 0,
              '0%': 0,
              '기타': 0,
            },
            names: new Set(),
          };
        }

        const count = isNaN(quantity) ? 1 : quantity;
        resultMap[key].total += count;
        if (!resultMap[key].copayStats[copay]) {
          resultMap[key].copayStats[copay] = 0;
        }
        resultMap[key].copayStats[copay] += count;
        resultMap[key].names.add(personName);
      });
    });

    let resultList = Object.values(resultMap).map(item => ({
      ...item,
      names: Array.from(item.names).join(', '),
    }));

    if (filterText) {
      resultList = resultList.filter(
        item => item.category.includes(filterText) || item.product.includes(filterText)
      );
    }

    setStats(resultList);
  };

  const getCategory = (productName) => {
    for (const [category, items] of Object.entries(productOptions)) {
      if (items.includes(productName)) return category;
    }
    return '기타';
  };

  const downloadExcel = () => {
    const rows = stats.map(row => ({
      품목명: row.category,
      제품명: row.product,
      '15%': row.copayStats['15%'],
      '9%': row.copayStats['9%'],
      '6%': row.copayStats['6%'],
      '0%': row.copayStats['0%'],
      기타: row.copayStats['기타'],
      총수량: row.total,
      어르신명단: row.names,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '통계');
    XLSX.writeFile(wb, '상담통계.xlsx');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">📊 품목별 상담 통계</h2>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <div className="flex gap-2 items-center">
          <label className="font-medium">시작일:</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="시작일 선택"
            className="border p-2 rounded"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="font-medium">종료일:</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            placeholderText="종료일 선택"
            className="border p-2 rounded"
          />
        </div>
        <input
          type="text"
          placeholder="품목 또는 제품 검색"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          통계 조회
        </button>
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          📥 엑셀 다운로드
        </button>
      </div>

      {stats.length > 0 ? (
        <table className="min-w-full border border-gray-300 text-sm text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">품목명</th>
              <th className="border p-2">제품명</th>
              {copayRates.map(rate => (
                <th key={rate} className="border p-2">{rate}</th>
              ))}
              <th className="border p-2">기타</th>
              <th className="border p-2">총수량</th>
              <th className="border p-2">어르신 명단</th>
            </tr>
          </thead>
          <tbody>
            {stats.map(({ category, product, copayStats, total, names }) => (
              <tr key={category + product}>
                <td className="border p-2">{category}</td>
                <td className="border p-2">{product}</td>
                {copayRates.map(rate => (
                  <td key={rate} className="border p-2">{copayStats[rate] || 0}</td>
                ))}
                <td className="border p-2">{copayStats['기타'] || 0}</td>
                <td className="border p-2 font-semibold">{total}</td>
                <td className="border p-2 whitespace-pre-wrap text-left">{names}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 mt-6">표시할 통계가 없습니다. 조건을 입력하고 조회해주세요.</p>
      )}
    </div>
  );
}

export default ConsultStats;
