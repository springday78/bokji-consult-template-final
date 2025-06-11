import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabase';

function RentalDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    renter: '',
    approval_number: '',
    type: '',
    contract_period: '',
    rent_address_type: '',
    rent_address: '',
    org: '',
    memo: ''
  });
  const [editId, setEditId] = useState(null);
  const [customRentAddressType, setCustomRentAddressType] = useState('');

  const fetchData = async () => {
    if (!id) {
      console.warn('⛔ id 값이 없습니다');
      return;
    }

    const { data: p, error: pError } = await supabase
      .from('rental_products')
      .select('*')
      .eq('id', id)
      .single();

    const { data: h, error: hError } = await supabase
      .from('rental_history')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (pError) console.error('❌ 제품 조회 실패:', pError);
    if (hError) console.error('❌ 이력 조회 실패:', hError);

    setProduct(p || null);
    setHistory(h || []);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRentAddressTypeChange = (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, rent_address_type: value }));
    if (value !== '기타') setCustomRentAddressType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) return alert('구분을 선택해주세요');

    const rentAddressType = form.rent_address_type === '기타' ? customRentAddressType : form.rent_address_type;

    if (editId) {
      await supabase
        .from('rental_history')
        .update({ ...form, rent_address_type: rentAddressType })
        .eq('id', editId);

      await supabase
        .from('rental_products')
        .update({
          current_renter: form.renter,
          status: form.type
        })
        .eq('id', id);

      alert('수정 완료');
    } else {
      const { data, error } = await supabase
        .from('rental_history')
        .insert({ ...form, rent_address_type: rentAddressType, product_id: id })
        .select()
        .single();

      if (error) {
        alert('등록 실패');
        return;
      }

      await supabase
        .from('rental_products')
        .update({
          current_renter: form.renter,
          status: form.type
        })
        .eq('id', id);

      alert('등록 완료');
    }

    setForm({
      renter: '',
      approval_number: '',
      type: '',
      contract_period: '',
      rent_address_type: '',
      rent_address: '',
      org: '',
      memo: ''
    });
    setCustomRentAddressType('');
    setEditId(null);
    fetchData();
  };

  const handleEdit = (h) => {
    setForm(h);
    setEditId(h.id);
    if (h.rent_address_type !== '수급자집' && h.rent_address_type !== '이용센터') {
      setForm((prev) => ({ ...prev, rent_address_type: '기타' }));
      setCustomRentAddressType(h.rent_address_type);
    } else {
      setCustomRentAddressType('');
    }
  };

  const handleDelete = async (hid) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await supabase.from('rental_history').delete().eq('id', hid);
      fetchData();
    }
  };

  if (!product) return <div className="p-6">⏳ 제품 정보를 불러오는 중입니다...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        📋 대여이력 관리 - {product.product_name}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
      >
        <input name="renter" value={form.renter} onChange={handleChange} placeholder="수급자" className="border p-2" required />
        <input name="approval_number" value={form.approval_number} onChange={handleChange} placeholder="인정번호" className="border p-2" />

        <select name="type" value={form.type} onChange={handleChange} className="border p-2" required>
          <option value="">구분 선택</option>
          <option value="대여">대여</option>
          <option value="위탁">위탁</option>
          <option value="보관">보관</option>
        </select>
        <input name="contract_period" value={form.contract_period} onChange={handleChange} placeholder="계약기간" className="border p-2" />

        <div className="flex gap-2 col-span-full">
          <select name="rent_address_type" value={form.rent_address_type} onChange={handleRentAddressTypeChange} className="border p-2 w-1/3">
            <option value="">대여지구분 선택</option>
            <option value="수급자집">수급자집</option>
            <option value="이용센터">이용센터</option>
            <option value="기타">기타</option>
          </select>
          {form.rent_address_type === '기타' && (
            <input
              value={customRentAddressType}
              onChange={(e) => setCustomRentAddressType(e.target.value)}
              placeholder="직접 입력"
              className="border p-2 w-1/3"
            />
          )}
          <input name="rent_address" value={form.rent_address} onChange={handleChange} placeholder="대여지주소" className="border p-2 flex-1" />
        </div>

        <input name="org" value={form.org} onChange={handleChange} placeholder="연계기관" className="border p-2 col-span-full sm:col-span-1" />
        <input name="memo" value={form.memo} onChange={handleChange} placeholder="기타내용" className="border p-2 col-span-full" />

        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded col-span-full">
          {editId ? '수정하기' : '등록하기'}
        </button>
      </form>

      <table className="table-auto w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1 w-[70px]">수급자</th>
            <th className="border px-2 py-1">인정번호</th>
            <th className="border px-2 py-1 w-[70px]">구분</th>
            <th className="border px-2 py-1">계약기간</th>
            <th className="border px-2 py-1 min-w-[90px]">대여지구분</th>
            <th className="border px-2 py-1 ">대여지</th>
            <th className="border px-2 py-1 min-w-[90px]">연계기관</th>
            <th className="border px-2 py-1 min-w-[180px]">기타내용</th>
            <th className="border px-2 py-1 min-w-[90px]">등록일</th>
            <th className="border px-2 py-1">작업</th>
          </tr>
        </thead>
        <tbody>
          {(history || []).map((h) => (
            <tr key={h.id} className="hover:bg-gray-50">
              <td className="border px-2 py-2 min-h-[40px] leading-relaxed whitespace-normal">{h.renter}</td>
              <td className="border px-2 py-1">{h.approval_number}</td>
              <td className="border px-2 py-2 min-h-[40px] leading-relaxed whitespace-normal">{h.type}</td>
              <td className="border px-2 py-1">{h.contract_period}</td>
              <td className="border px-2 py-1">{h.rent_address_type}</td>
              <td className="border px-2 py-2 min-h-[40px] leading-relaxed whitespace-normal">{h.rent_address_type} {h.rent_address}</td>
              <td className="border px-2 py-1">{h.org}</td>
              <td className="border px-2 py-1">{h.memo}</td>
              <td className="border px-2 py-1">
                {h.created_at ? new Date(h.created_at).toLocaleDateString('ko-KR') : '-'}
              </td>
              <td className="border px-2 py-1 text-center space-x-1">
                <button onClick={() => handleEdit(h)} className="bg-yellow-400 text-white px-2 py-1 rounded">수정</button>
                <button onClick={() => handleDelete(h.id)} className="bg-red-500 text-white px-2 py-1 rounded">삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RentalDetail;
