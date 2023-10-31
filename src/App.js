import React from "react";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import _DataTable from "./DataTable";
import InspectionDetail from "./InspectionDetail";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

function App() {
  return ReactDOM.render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<_DataTable />} />
        <Route path="/inspection_detail" element={<InspectionDetail />} />
      </Routes>
    </BrowserRouter>,
    document.getElementById("root")
  );
}

export default App;
