// src/components/rentalProduct/RentalList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

function RentalList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('rental_products')
      .select('*')
      .order('id', { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await supabase.from('rental_products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const filtered = products.filter((p) => {
    const matchStatus = statusFilter === '전체' || p.status === statusFilter;
    const matchSearch =
      p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(search.toLowerCase()) ||
      p.model_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const rentalStats = products
    .filter((p) => p.status === '대여')
    .reduce((acc, cur) => {
      const category = cur.category || '기타';
      const model = cur.model_name || '모델 없음';
      if (!acc[category]) acc[category] = {};
      acc[category][model] = (acc[category][model] || 0) + 1;
      return acc;
    }, {});

  const totalStats = products.reduce((acc, cur) => {
    const category = cur.category || '기타';
    const model = cur.model_name || '모델 없음';
    if (!acc[category]) acc[category] = {};
    acc[category][model] = (acc[category][model] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📦 대여제품 목록</h2>
        <button
          onClick={() => navigate('/rental')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          + 제품 등록
        </button>
      </div>

      {/* 상태 필터 및 검색 */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {['전체', '대여', '위탁', '보관'].map((type) => (
          <button
            key={type}
            onClick={() => setStatusFilter(type)}
            className={`px-3 py-1 rounded-full text-sm border ${
              statusFilter === type ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {type}
          </button>
        ))}
        <input
          type="text"
          placeholder="제품명, 모델명, 코드 검색"
          className="border px-3 py-2 rounded w-full sm:w-auto flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 제품 등록/대여 현황 통계 */}
      <div className="bg-yellow-50 border border-yellow-300 p-4 mb-6 rounded text-sm">
        <h3 className="font-semibold text-lg mb-2">📊 제품 현황</h3>
        {Object.keys(totalStats).length === 0 ? (
          <p>등록된 제품이 없습니다.</p>
        ) : (
          Object.entries(totalStats).map(([category, models]) => (
            <div key={category} className="mb-2">
              <strong>▶ {category}</strong>
              <ul className="ml-4 list-disc">
                {Object.entries(models).map(([model, total]) => {
                  const rented = rentalStats?.[category]?.[model] || 0;
                  return (
                    <li key={model}>
                      {model} : 전체 {total}대 (대여 {rented}대)
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      {/* 제품 목록 테이블 */}
      <table className="table-auto w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">종목</th>
            <th className="border px-2 py-1">제품명</th>
            <th className="border px-2 py-1">모델명</th>
            <th className="border px-2 py-1">바코드</th>
            <th className="border px-2 py-1">상태</th>
            <th className="border px-2 py-1">대여자</th>
            <th className="border px-2 py-1">관리</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{p.category || '-'}</td>
              <td className="border px-2 py-1">{p.product_name}</td>
              <td className="border px-2 py-1">{p.model_name}</td>
              <td className="border px-2 py-1">{p.barcode || '-'}</td>
              <td className="border px-2 py-1">{p.status || '-'}</td>
              <td className="border px-2 py-1">{p.current_renter || '-'}</td>
              <td className="border px-2 py-1 text-center space-x-1">
                <button
                  onClick={() => navigate(`/rental-detail/${p.id}`)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  상세
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RentalList;
