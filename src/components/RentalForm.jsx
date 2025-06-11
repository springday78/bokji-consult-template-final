import React, { useState } from 'react';
import { supabase } from '../supabase';
import { rentalProductOptions } from '../data/rentalProductOptions';

function RentalForm() {
  const [formData, setFormData] = useState({
    productName: '',
    modelName: '',
    barcode: '',
    registerDate: ''
  });

  const checkDuplicateBarcode = async (barcode) => {
    const { data, error } = await supabase
      .from('rental_products')
      .select('id')
      .eq('barcode', barcode);
    return data && data.length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isDuplicate = await checkDuplicateBarcode(formData.barcode);
      if (isDuplicate) {
        alert('⚠️ 이미 등록된 바코드입니다.');
        return;
      }

      if (!formData.productName || !formData.modelName || !formData.barcode) {
        alert('⚠️ 품목명, 제품명, 바코드는 필수입니다.');
        return;
      }

      const payload = {
        category: formData.productName || '-',
        product_name: formData.productName || '-',
        model_name: formData.modelName || '-',
        barcode: formData.barcode || '-',
        register_date: formData.registerDate || null,
        status: '대여중',
      };

      console.log('📤 Supabase insert payload:', payload);

      const { error } = await supabase.from('rental_products').insert([payload]);

      if (error) throw error;

      alert('✅ 대여제품이 등록되었습니다.');
      setFormData({
        productName: '',
        modelName: '',
        barcode: '',
        registerDate: ''
      });
    } catch (error) {
      console.error('❌ 등록 실패:', error.message);  // 메시지만 출력
      console.error('❌ 전체 에러 객체:', error);     // 전체 객체 출력
      alert('❌ 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📋 대여제품 등록</h2>
      <form onSubmit={handleSubmit} className="grid gap-3">
        <label>품목명</label>
        <select
          value={formData.productName}
          onChange={(e) =>
            setFormData({
              ...formData,
              productName: e.target.value,
              modelName: ''
            })
          }
        >
          <option value="">-- 선택 --</option>
          {Object.keys(rentalProductOptions).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label>제품명</label>
        <select
          value={formData.modelName}
          onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
          disabled={!formData.productName}
        >
          <option value="">-- 선택 --</option>
          {formData.productName &&
            rentalProductOptions[formData.productName].map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
        </select>

        <label>바코드</label>
        <input
          type="text"
          value={formData.barcode}
          onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
        />

        <label>최초 등록일자</label>
        <input
          type="date"
          value={formData.registerDate}
          onChange={(e) => setFormData({ ...formData, registerDate: e.target.value })}
        />

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          등록
        </button>
      </form>
    </div>
  );
}

export default RentalForm;
