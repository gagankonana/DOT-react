import "./App.css";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import { Dropdown } from "primereact/dropdown";
import { FilterMatchMode } from "primereact/api";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

const cache = {};

const _DataTable = () => {
  let navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspections, setinspections] = useState([]);
  const [selectedinspections, setSelectedinspections] = useState(null);
  const [resolveinspectionsDialog, setresolveinspectionsDialog] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (cache["data"]) {
      setData(cache["data"]);
      setLoading(false);
    }
    const fetchData = async () => {
      const apiUrl = "http://127.0.0.1:8080/inspections_all";
      const params = {
        page_no: 1,
        sort_term: "none",
        basic_key: "none",
        status_key: "none",
        is_ascending: true,
      };

      let data = [];
      const queryString = Object.keys(params)
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
      const fullUrl = `${apiUrl}?${queryString}`;
      await fetch(fullUrl)
        .then((response) => response.json())
        .then((res) => {
          cache["data"] = res;
          data = res;
          setData(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="sr-only"></span>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return <div>No data available.</div>;
  }

  function rowevents(row) {
    let path = `/inspection_detail`;

    navigate(path, { state: { id: row.data.inspection_no } });
  }

  const onStatusChange = (e, options) => {
    options.filterCallback(e.value);
  };
  const filters = {
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
    inspection_no: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    BASIC: { value: null, matchMode: FilterMatchMode.CONTAINS },
    vehicle_plate: { value: null, matchMode: FilterMatchMode.CONTAINS },
  };
  let statuses = [
    { label: "All Status", value: null },
    { label: "Resolved", value: "Resolved" },
    { label: "Unresolved", value: "Unresolved" },
    { label: "No violation", value: "No violation" },
  ];

  let statusFilter = (options) => (
    <Dropdown
      style={{ width: "100%" }}
      className="ui-column-filter"
      value={options.value}
      options={statuses}
      onChange={(e) => onStatusChange(e, options)}
    />
  );

  function resolve(inspection_nos) {
    fetch("http://127.0.0.1:8080/resolve_many", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspection_nos: inspection_nos,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        window.location.reload(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const resolveSelectedinspections = () => {
    let _inspections = inspections.filter(
      (val) => !selectedinspections.includes(val)
    );
    var inspectionNumbers = [];
    for (var i = 0; i < selectedinspections.length; i++) {
      var selectedinspection = selectedinspections[i];
      inspectionNumbers.push(selectedinspection.inspection_no);
    }
    console.log("Hi", inspectionNumbers);
    resolve(inspectionNumbers);
    setresolveinspectionsDialog(false);
    setSelectedinspections(null);
  };
  const confirmresolveSelected = () => {
    setresolveinspectionsDialog(true);
  };
  const hideresolveinspectionsDialog = () => {
    setresolveinspectionsDialog(false);
  };
  const resolveinspectionsDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        outlined
        onClick={hideresolveinspectionsDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="success"
        onClick={resolveSelectedinspections}
      />
    </React.Fragment>
  );

  return (
    <div className="App">
      <br></br>
      <Button
        label="Mark as Resolved"
        severity="success"
        onClick={confirmresolveSelected}
        disabled={!selectedinspections || !selectedinspections.length}
      />
      <h1>DOT Inspections</h1>

      <DataTable
        value={data}
        sortMode="multiple"
        filters={filters}
        paginator
        rows={10}
        onRowClick={(e) => {
          rowevents(e);
        }}
        selection={selectedinspections}
        onSelectionChange={(e) => setSelectedinspections(e.value)}
        dataKey="id"
        rowsPerPageOptions={[10, 20]}
        scrollable
        scrollHeight="800px"
        totalRecords={3}
        filterDisplay="menu"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3rem" }}
        ></Column>
        <Column field="date" header="date" sortable />
        <Column
          field="status"
          header="status"
          sortable
          filter
          filterElement={statusFilter}
          filterMatchMode={FilterMatchMode.EQUALS}
          showFilterMatchModes={false}
          filterPlaceholder="Select"
        />
        <Column
          field="inspection_no"
          header="inspection_no"
          sortable
          filter
          filterMatchMode={FilterMatchMode.STARTS_WITH}
          showFilterMatchModes={false}
          filterPlaceholder="Begins with.."
        />
        <Column
          field="vehicle_plate"
          header="vehicle_plate"
          sortable
          filter
          filterPlaceholder="Contains.."
          showFilterMatchModes={false}
          filterMatchMode={FilterMatchMode.CONTAINS}
        />
        <Column
          field="BASIC"
          header="BASIC"
          sortable
          filter
          filterPlaceholder="Contains.."
          showFilterMatchModes={false}
          filterMatchMode={FilterMatchMode.CONTAINS}
        />
        <Column field="weight" header="weight" sortable />
        <Column field="report_state" header="report_state" sortable />
        <Column field="state" header="State" sortable />
        <Column field="type_" header="Type" sortable />
      </DataTable>
      <Dialog
        visible={resolveinspectionsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={resolveinspectionsDialogFooter}
        onHide={hideresolveinspectionsDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {data && (
            <span>
              Are you sure you want to resolve the selected inspections?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default _DataTable;
