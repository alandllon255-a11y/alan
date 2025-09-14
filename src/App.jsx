import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StackOverflowClone from './StackOverflowClone.jsx';
import ProfileEditPage from './pages/ProfileEditPage.jsx';
import ProfileViewPage from './pages/ProfileViewPage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StackOverflowClone />} />
        <Route path="/profile" element={<ProfileViewPage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;


