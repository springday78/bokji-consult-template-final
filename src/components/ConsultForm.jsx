import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { productOptions, quantityCategories } from '../data/productOptions';

function ConsultForm({ editMode, currentEdit, onFinishEdit }) {
  const [formData, setFormData] = useState({
    name: '', gender: '', copay: '', birth: '', phone: '', refType: '',
    careGrade: '', validPeriod: '', careId: '', date: null, content: '', address: '', products: []
  });
  const [openCategories, setOpenCategories] = useState([]);
  const [customInputs, setCustomInputs] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editMode && currentEdit) {
      setFormData({
        ...currentEdit,
        date: currentEdit.date ? new Date(currentEdit.date) : null,
        products: currentEdit.products || [],
        careGrade: currentEdit.careGrade || '',
        validPeriod: currentEdit.validPeriod || '',
        careId: currentEdit.approvalNumber || currentEdit.careId || '',
        address: currentEdit.address || ''
      });
    }
  }, [editMode, currentEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'copay') {
      setFormData(prev => ({
        ...prev,
        copay: value,
        products: prev.products.map(p => ({ ...p, copay: value }))
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = '이름은 필수입니다';
    if (!formData.gender) newErrors.gender = '성별을 선택해주세요';
    if (!formData.birth) newErrors.birth = '생년월일을 입력해주세요';
    if (!formData.phone) newErrors.phone = '연락처를 입력해주세요';
    if (!formData.date) newErrors.date = '상담 날짜를 선택해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleProduct = (name) => {
    setFormData(prev => {
      const exists = prev.products.find(p => p.name === name);
      return {
        ...prev,
        products: exists
          ? prev.products.filter(p => p.name !== name)
          : [...prev.products, { name, quantity: '', copay: prev.copay }]
      };
    });
  };

  const handleQuantityChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p =>
        p.name === name ? { ...p, quantity: value } : p
      )
    }));
  };

  const toggleCategory = (category) => {
    setOpenCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handleCustomInput = (category, value) => {
    setCustomInputs(prev => ({ ...prev, [category]: value }));
  };

  const addCustomProduct = (category) => {
    const name = customInputs[category]?.trim();
    if (!name || formData.products.some(p => p.name === name)) return;
    setFormData(prev => ({
      ...prev,
      products: [...prev.products, { name, quantity: '', copay: prev.copay }]
    }));
    setCustomInputs(prev => ({ ...prev, [category]: '' }));
  };

  const getImagePath = (name) => {
    const filename = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    return `/images/products/${filename}.png`;
  };

  const isChecked = (name) => formData.products.some(p => p.name === name);
  const getQuantity = (name) => formData.products.find(p => p.name === name)?.quantity || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const prepared = {
      name: formData.name,
      gender: formData.gender,
      copay: formData.copay,
      birth: formData.birth,
      phone: formData.phone,
      refType: formData.refType,
      careGrade: formData.careGrade,
      validPeriod: formData.validPeriod,
      approvalNumber: formData.careId,
      address: formData.address,
      date: formData.date ? formData.date.toISOString().split('T')[0] : '',
      content: formData.content,
      products: formData.products
    };

    try {
      if (editMode && currentEdit?.id) {
        const { error } = await supabase
          .from('consultations')
          .update(prepared)
          .eq('id', currentEdit.id);

        if (error) throw error;
        alert('수정 완료!');
      } else {
        const { error } = await supabase
          .from('consultations')
          .insert([prepared]);

        if (error) throw error;
        alert('등록 완료!');
      }

      onFinishEdit && onFinishEdit();
      setFormData({
        name: '', gender: '', copay: '', birth: '', phone: '', refType: '',
        careGrade: '', validPeriod: '', careId: '', date: null, content: '', address: '', products: []
      });
      setOpenCategories([]);
      setCustomInputs({});
      setErrors({});
    } catch (err) {
      console.error(err);
      alert('저장 실패');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl px-4 pb-32 mx-auto relative">
      <h4 className="text-lg font-semibold text-gray-700">📇 기본 정보</h4>
      <input name="name" value={formData.name} onChange={handleChange} placeholder="이름 *" className={`border p-2 w-full ${errors.name && 'border-red-500'}`} />
      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

      <select name="gender" value={formData.gender} onChange={handleChange} className={`border p-2 w-full ${errors.gender && 'border-red-500'}`}>
        <option value="">성별 선택 *</option>
        <option>남자</option>
        <option>여자</option>
      </select>
      {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}

      <input name="birth" value={formData.birth} onChange={handleChange} placeholder="생년월일 *" className={`border p-2 w-full ${errors.birth && 'border-red-500'}`} />
      {errors.birth && <p className="text-red-500 text-sm">{errors.birth}</p>}

      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="연락처 *" className={`border p-2 w-full ${errors.phone && 'border-red-500'}`} />
      {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

      <input name="address" value={formData.address} onChange={handleChange} placeholder="대상자 주소" className="border p-2 w-full" />

      <h4 className="text-lg font-semibold text-gray-700">💳 청구 및 등급</h4>
      <select name="copay" value={formData.copay} onChange={handleChange} className="border p-2 w-full">
        <option value="">본인부담금 구분 선택</option>
        <option value="15%">15%</option>
        <option value="9%">9%</option>
        <option value="6%">6%</option>
        <option value="0%">0%</option>
      </select>

      <input name="refType" value={formData.refType} onChange={handleChange} placeholder="연계구분" className="border p-2 w-full" />
      <select name="careGrade" value={formData.careGrade} onChange={handleChange} className="border p-2 w-full">
        <option value="">장기요양등급 선택</option>
        <option value="1등급">1등급</option>
        <option value="2등급">2등급</option>
        <option value="3등급">3등급</option>
        <option value="4등급">4등급</option>
        <option value="5등급">5등급</option>
        <option value="인지등급">인지등급</option>
      </select>

      <input name="careId" value={formData.careId} onChange={handleChange} placeholder="장기요양인정번호" className="border p-2 w-full" />
      <input name="validPeriod" value={formData.validPeriod} onChange={handleChange} placeholder="등급 유효기간" className="border p-2 w-full" />

      <h4 className="text-lg font-semibold text-gray-700">📆 상담 정보</h4>
      <DatePicker selected={formData.date} onChange={(date) => handleChange({ target: { name: 'date', value: date } })} dateFormat="yyyy-MM-dd" className={`border p-2 w-full ${errors.date && 'border-red-500'}`} placeholderText="상담 날짜 *" />
      {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}

      <textarea name="content" value={formData.content} onChange={handleChange} placeholder="상담 내용" rows={4} className="border p-2 w-full" />

      <h4 className="text-lg font-semibold text-gray-700 mt-8">🧾 제품 선택</h4>
      {Object.entries(productOptions).map(([category, items]) => {
        const isOpen = openCategories.includes(category);
        return (
          <div key={category} className="mb-2 border rounded">
            <button type="button" onClick={() => toggleCategory(category)} className="w-full text-left font-semibold py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-t">
              {category} {isOpen ? '▲' : '▼'}
            </button>
            {isOpen && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 px-3 pb-3">
                {items.map(item => (
                  <div key={item} className="flex items-center gap-2">
                    <input type="checkbox" checked={isChecked(item)} onChange={() => toggleProduct(item)} />
                    {getImagePath(item) && (
                      <img src={getImagePath(item)} alt={item} className="w-20 h-20 object-contain border rounded" style={{ maxWidth: '80px', maxHeight: '80px' }} onError={(e) => (e.target.style.display = 'none')} />
                    )}
                    <span>{item}</span>
                    {isChecked(item) && quantityCategories.includes(category) && (
                      <input type="number" value={getQuantity(item)} min="0" onChange={(e) => handleQuantityChange(item, e.target.value)} className="border w-20 px-1 py-0.5 text-sm" placeholder="수량" />
                    )}
                  </div>
                ))}
                <div className="col-span-2 flex gap-2 items-center mt-2">
                  <input type="text" placeholder="기타 제품명 직접 입력" value={customInputs[category] || ''} onChange={(e) => handleCustomInput(category, e.target.value)} className="border flex-1 px-2 py-1" />
                  <button type="button" onClick={() => addCustomProduct(category)} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                    추가
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-md z-10">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full max-w-2xl mx-auto block">
          {editMode ? '수정하기' : '등록하기'}
        </button>
      </div>
    </form>
  );
}

export default ConsultForm;