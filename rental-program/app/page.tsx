'use client';
import { useEffect, useState } from 'react';
import { db } from './lib/firebase'; // ← 정확한 상대경로 확인
import { collection, addDoc } from 'firebase/firestore';

// 예시용 드롭다운 데이터 (전체 47개 중 일부)
const productList = [
  {
    itemName: '수동휠체어',
    manufacturer: '대성공업',
    productName: 'J610',
    productCode: 'M18030021507',
  },
  {
    itemName: '전동침대',
    manufacturer: '소화',
    productName: 'SBM-210',
    productCode: 'S03090103002',
  },
  {
    itemName: '욕창예방매트리스',
    manufacturer: '영원메디칼',
    productName: 'AD-1300',
    productCode: 'H12060030012',
  },
];

export default function Page() {
  const [form, setForm] = useState({
    barcodeStart: '',
    barcodeEnd: '',
    itemName: '',
    manufacturer: '',
    productName: '',
    productCode: '',
    registerDate: new Date().toISOString().split('T')[0],
  });

  // 선택 시 자동 채우기
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const selected = productList.find(p => p.productCode === selectedCode);
    if (selected) {
      setForm(prev => ({
        ...prev,
        itemName: selected.itemName,
        manufacturer: selected.manufacturer,
        productName: selected.productName,
        productCode: selected.productCode,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const docRef = await addDoc(collection(db, 'rentalProducts'), form);
      console.log('Document written with ID:', docRef.id);
      alert('등록되었습니다!');
      setForm({
        barcodeStart: '',
        barcodeEnd: '',
        itemName: '',
        manufacturer: '',
        productName: '',
        productCode: '',
        registerDate: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('등록 실패:', error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-lg font-bold">대여제품 등록</h1>

      {/* 제품 선택 드롭다운 */}
      <div>
        <label>제품 선택: </label>
        <select onChange={handleSelect} className="border p-2 w-full">
          <option value="">제품을 선택하세요</option>
          {productList.map(product => (
            <option key={product.productCode} value={product.productCode}>
              [{product.itemName}] {product.productName} - {product.manufacturer}
            </option>
          ))}
        </select>
      </div>

      {/* 입력 필드 */}
      <div className="grid grid-cols-2 gap-4">
        <input
          name="barcodeStart"
          placeholder="시작 바코드"
          value={form.barcodeStart}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="barcodeEnd"
          placeholder="끝 바코드"
          value={form.barcodeEnd}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="itemName"
          placeholder="품목명"
          value={form.itemName}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="manufacturer"
          placeholder="제조사"
          value={form.manufacturer}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="productName"
          placeholder="제품명"
          value={form.productName}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="productCode"
          placeholder="제품코드"
          value={form.productCode}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="registerDate"
          type="date"
          value={form.registerDate}
          onChange={handleChange}
          className="border p-2 col-span-2"
        />
      </div>

      {/* 등록 버튼 */}
      <div>
        <button
          onClick={handleSubmit}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded shadow"
        >
          등록하기
        </button>
      </div>

      {/* 미리보기 테이블 */}
      <table className="table-auto border w-full mt-6 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">NO</th>
            <th className="border px-2 py-1">제품코드</th>
            <th className="border px-2 py-1">제조사</th>
            <th className="border px-2 py-1">제품명</th>
            <th className="border px-2 py-1">등록일</th>
            <th className="border px-2 py-1">품목명</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1">1</td>
            <td className="border px-2 py-1">{form.productCode}</td>
            <td className="border px-2 py-1">{form.manufacturer}</td>
            <td className="border px-2 py-1">{form.productName}</td>
            <td className="border px-2 py-1">{form.registerDate}</td>
            <td className="border px-2 py-1">{form.itemName}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
