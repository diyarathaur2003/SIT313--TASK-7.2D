

import './App.css';
import PostPage from './Header';
import Home from './Home';
import {BrowserRouter, Routes, Route} from "react-router-dom";

import 'semantic-ui-css/semantic.min.css'
function App() {
  return (
    <BrowserRouter>
    <div className='App'>
      <Routes>
      <Route path="/" element={<Home/>}/>
        <Route path="/add" element={<PostPage/>}/>
        <Route path="/update/:id" element={<PostPage/>}/>
        <Route path="/" element={<Home/>}/>
       
      </Routes>
     
    </div>
    </BrowserRouter>
  );
}

export default App;
