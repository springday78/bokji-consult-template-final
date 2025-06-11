// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import ConsultForm from './components/ConsultForm';
import ConsultStats from './components/ConsultStats';
import SimpleInfo from './components/SimpleInfo';
import RentalForm from './components/RentalForm';
import RentalList from './components/RentalList';
import RentalDetail from './components/rentalProduct/RentalDetail';
import ConsultList from './components/ConsultList';

function Main() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white border-b shadow-sm mb-6">
        <div className="flex justify-between items-center px-6 py-6">
          <h1 className="text-2xl font-bold text-blue-800">복지용구 상담노트</h1>
          <nav className="flex gap-4 text-base text-blue-700 font-medium">
            <Link to="/rental" className={`px-3 py-1 rounded ${location.pathname === '/rental' ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}>대여제품 등록</Link>
            <Link to="/rental-list" className={`px-3 py-1 rounded ${location.pathname === '/rental-list' ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}>대여제품 목록</Link>
            <Link to="/" className={`px-3 py-1 rounded ${location.pathname === '/' ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}>상담 등록</Link>
            <Link to="/list" className={`px-3 py-1 rounded ${location.pathname === '/list' ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}>상담 내역</Link>
            <Link to="/stats" className={`px-3 py-1 rounded ${location.pathname === '/stats' ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}>통계</Link>
            <Link to="/info" className={`px-3 py-1 rounded ${location.pathname === '/info' ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'}`}>간단정보</Link>
          </nav>
        </div>
      </div>
      <Routes>
        <Route path="/rental" element={<RentalForm />} />
        <Route path="/list" element={<ConsultList />} />
        <Route path="/rental-list" element={<RentalList />} />
        <Route path="/rental-detail/:id" element={<RentalDetail />} />
        <Route path="/" element={<ConsultForm />} />
        <Route path="/list" element={<div>상담 내역 준비중</div>} />
        <Route path="/stats" element={<ConsultStats />} />
        <Route path="/info" element={<SimpleInfo />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Main />
    </Router>
  );
}
