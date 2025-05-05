import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { productOptions } from '../data/productOptions';

const copayRates = ['15%', '9%', '6%', '0%'];

function ConsultStats() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [stats, setStats] = useState([]);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      alert('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    const q = query(collection(db, 'consultations'));
    const snapshot = await getDocs(q);
    const resultMap = {};

    snapshot.forEach((doc) => {
      const data = doc.data();
      const docDate = new Date(data.date);
      if (docDate < startDate || docDate > endDate) return;

      const personName = data.name || '이름없음';

      (data.products || []).forEach((item) => {
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

    const resultList = Object.values(resultMap).map(item => ({
      ...item,
      names: Array.from(item.names).join(', '),
    }));

    setStats(resultList);
  };

  const getCategory = (productName) => {
    for (const [category, items] of Object.entries(productOptions)) {
      if (items.includes(productName)) return category;
    }
    return '기타';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-4">품목별 상담 통계</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
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
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          통계 조회
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
        <p className="text-gray-500 mt-6">표시할 통계가 없습니다. 날짜를 선택하고 조회를 눌러주세요.</p>
      )}
    </div>
  );
}

export default ConsultStats;