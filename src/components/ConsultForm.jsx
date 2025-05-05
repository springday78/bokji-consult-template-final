import React, { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { productOptions, quantityCategories } from '../data/productOptions';

function ConsultForm({ editMode, currentEdit, onFinishEdit }) {
  const [formData, setFormData] = useState({
    name: '', gender: '', copay: '', birth: '', phone: '', refType: '', date: null,
    content: '', products: []
  });

  const [openCategories, setOpenCategories] = useState([]);
  const [customInputs, setCustomInputs] = useState({});

  useEffect(() => {
    if (editMode && currentEdit) {
      setFormData({
        ...currentEdit,
        date: currentEdit.date ? new Date(currentEdit.date) : null,
        products: currentEdit.products || []
      });
    }
  }, [editMode, currentEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
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

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prepared = {
      ...formData,
      date: formData.date ? formData.date.toISOString().split('T')[0] : ''
    };
    try {
      if (editMode && currentEdit?.id) {
        await updateDoc(doc(db, 'consultations', currentEdit.id), prepared);
        alert('수정 완료!');
      } else {
        const ref = await addDoc(collection(db, 'consultations'), prepared);
        await updateDoc(ref, { id: ref.id });
        alert('등록 완료!');
      }
      onFinishEdit && onFinishEdit();
      setFormData({
        name: '', gender: '', copay: '', birth: '', phone: '', refType: '', date: null,
        content: '', products: []
      });
      setOpenCategories([]);
      setCustomInputs({});
    } catch (err) {
      console.error(err);
      alert('저장 실패');
    }
  };

  const isChecked = (name) => formData.products.some(p => p.name === name);
  const getQuantity = (name) => formData.products.find(p => p.name === name)?.quantity || '';

  const getImagePath = (name) => {
    const filename = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    return `/images/products/${filename}.png`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-2xl px-4 mx-auto">
      <input name="name" value={formData.name} onChange={handleChange} placeholder="이름" className="border p-2 w-full" />
      <select name="copay" value={formData.copay} onChange={handleChange} className="border p-2 w-full">
        <option value="">본인부담금 구분 선택</option>
        <option value="15%">15%</option>
        <option value="9%">9%</option>
        <option value="6%">6%</option>
        <option value="0%">0%</option>
      </select>
      <select name="gender" value={formData.gender} onChange={handleChange} className="border p-2 w-full">
        <option value="">성별 선택</option>
        <option>남자</option>
        <option>여자</option>
      </select>
      <input name="birth" value={formData.birth} onChange={handleChange} placeholder="생년월일" className="border p-2 w-full" />
      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="연락처" className="border p-2 w-full" />
      <input name="refType" value={formData.refType} onChange={handleChange} placeholder="연계구분" className="border p-2 w-full" />
      <DatePicker selected={formData.date} onChange={handleDateChange} dateFormat="yyyy-MM-dd" className="border p-2 w-full" placeholderText="상담 날짜" />
      <textarea name="content" value={formData.content} onChange={handleChange} placeholder="상담 내용" rows={4} className="border p-2 w-full" />

      <div>
        <h3 className="font-bold text-lg mt-4 mb-2">구매목록 선택</h3>
        {Object.entries(productOptions).map(([category, items]) => {
          const isOpen = openCategories.includes(category);
          return (
            <div key={category} className="mb-2 border rounded">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                className="w-full text-left font-semibold py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-t"
              >
                {category} {isOpen ? '▲' : '▼'}
              </button>
              {isOpen && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 px-3 pb-3">
                  {items.map(item => (
                    <div key={item} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked(item)}
                        onChange={() => toggleProduct(item)}
                      />
                      {getImagePath(item) && (
                        <img
                          src={getImagePath(item)}
                          alt={item}
                          className="w-20 h-20 object-contain border rounded"
                          style={{ maxWidth: '80px', maxHeight: '80px' }}
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      )}
                      <span>{item}</span>
                      {isChecked(item) && quantityCategories.includes(category) && (
                        <input
                          type="number"
                          value={getQuantity(item)}
                          min="0"
                          onChange={(e) => handleQuantityChange(item, e.target.value)}
                          className="border w-20 px-1 py-0.5 text-sm"
                          placeholder="수량"
                        />
                      )}
                    </div>
                  ))}
                  <div className="col-span-2 flex gap-2 items-center mt-2">
                    <input
                      type="text"
                      placeholder="기타 제품명 직접 입력"
                      value={customInputs[category] || ''}
                      onChange={(e) => handleCustomInput(category, e.target.value)}
                      className="border flex-1 px-2 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => addCustomProduct(category)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
                    >
                      추가
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        {editMode ? '수정하기' : '등록하기'}
      </button>
    </form>
  );
}

export default ConsultForm;
