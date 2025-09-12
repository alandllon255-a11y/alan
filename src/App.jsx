import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StackOverflowClone from './StackOverflowClone.jsx';
import ProfileEditPage from './pages/ProfileEditPage.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StackOverflowClone />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;


