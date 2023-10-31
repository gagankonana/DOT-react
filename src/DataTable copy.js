import "./App.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";

import { FilterMatchMode } from "primereact/api"; 
import { InputText } from "primereact/inputtext";
import React, { useState, useEffect } from 'react';

const DataTableLocal = () => {
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
        const apiUrl = 'http://127.0.0.1:8080/inspections_all';
    const params = {
    page_no: 1,
    sort_term: 'none',
    basic_key: 'none',
    status_key: 'none',
    is_ascending: true
    };
    let data = []
    const queryString = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
    const fullUrl = `${apiUrl}?${queryString}`;
    await fetch(fullUrl)
        .then(response => response.json())
        .then(res => {
            data = res.data
            setData(data);
        setLoading(false);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data.length) {
    return <div>No data available.</div>;
  }

  return (
        <div className="App">
            <InputText 
    onInput={(e) =>
        setFilters({
        global: { value: e. target. value, jhatchMode: FilterMatchMode.CONTAINS },
        })
    } />
            <DataTable value= {data} sortMode="multiple" filters={filters}
            paginator rows={10} 
            rowsPerPageOptions={[1,2,31]}
                totalRecords={3}>
            <Column field="date" header="date" sortable/>
    <Column field="status" header="status" sortable/>
    <Column field="inspection_no" header="inspection_no" sortable/>
    <Column field="vehicle_plate" header="vehicle_plate" sortable/>
    <Column field="BASIC" header="BASIC" sortable/>
    <Column field="weight" header="weight" sortable/>
    <Column field="report_state" header="report_state" sortable/>
    <Column field="state" header="state" sortable/>
    <Column field="type_" header="type_" sortable/>
    </DataTable>
                </div>
  );
};

export default DataTableLocal;
