import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "./App.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.css";

function InspectionDetail() {
  const history = useNavigate();
  const home = () => {
    history("/");
  };
  const { state } = useLocation();
  const { id } = state;
  const [vehicle_data, setVehicleData] = useState([]);
  const [violation_data, setViolationData] = useState([]);
  const [inspection_data, setInspectionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [sent, setState] = useState(false);
  function get_details() {
    setState(true);
    // const response = await axios.get('YOUR_API_ENDPOINT');
    const apiUrl = "http://127.0.0.1:8080/inspection_detail";
    const params = {
      inspection_no: id,
    };
    const queryString = Object.keys(params)
      .map((key) => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    const fullUrl = `${apiUrl}?${queryString}`;

    fetch(fullUrl)
      .then((response) => response.json())
      .then((res) => {
        setViolationData(res.violations);
        setVehicleData(res.vehicle);
        setInspectionData(res);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  if (!sent) {
    get_details();
  }

  if (loading) {
    return (
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="sr-only"></span>
        </div>
      </div>
    );
  }

  if (!vehicle_data.length) {
    return <div>No data available.</div>;
  }

  function handleResolveClick() {
    // Your logic here, e.g., updating state or making an API call
    resolve();
  }

  function resolve() {
    fetch("http://127.0.0.1:8080/resolve", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inspection_no: inspection_data.inspection_no,
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

  return (
    <>
      <div class="container-fluid">
        <br></br>
        <div class="row content">
          <div class="col-sm-12">
            <div class="row">
              <div class="col-sm-4">
                <button class="btn btn-success" onClick={home} id="backButton">
                  {" "}
                  {"<"} Go Back
                </button>
              </div>
              <div class="col-sm-5">
                <div class="well">
                  <h3>
                    Inspection Overview: <b>{inspection_data.inspection_no}</b>{" "}
                  </h3>
                </div>
              </div>
              <div class="col-sm-2 pull-left">
                <div class="well pull-left">
                  <button
                    class="btn btn-success pull-left"
                    id="resolve"
                    disabled={!(inspection_data.status == "Unresolved")}
                    onClick={handleResolveClick}
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
            <div class="py-5">
              <div class="container">
                <div class="row hidden-md-up">
                  <div class="col-xl-3 col-sm-6 col-12">
                    <div class="card">
                      <div class="card-content">
                        <div class="card-body">
                          <div class="media d-flex">
                            <div class="align-self-center"></div>
                            <div class="media-body text-right">
                              <h6>Status:</h6>
                              <h3>{inspection_data.status}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-xl-3 col-sm-6 col-12">
                    <div class="card">
                      <div class="card-content">
                        <div class="card-body">
                          <div class="media d-flex">
                            <div class="align-self-center"></div>
                            <div class="media-body text-right">
                              <h6>Report Number:</h6>
                              <h3>{inspection_data.inspection_no}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-xl-3 col-sm-6 col-12">
                    <div class="card">
                      <div class="card-content">
                        <div class="card-body">
                          <div class="media d-flex">
                            <div class="align-self-center"></div>
                            <div class="media-body text-right">
                              <h6>Report State:</h6>
                              <h3>{inspection_data.report_state}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-xl-3 col-sm-6 col-12">
                    <div class="card">
                      <div class="card-content">
                        <div class="card-body">
                          <div class="media d-flex">
                            <div class="align-self-center"></div>
                            <div class="media-body text-right">
                              <h6>Date:</h6>
                              <h3>{inspection_data.date}</h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br></br>
            <div class="row">
              <div class="col-sm-12">
                <div class="well">
                  <DataTable
                    value={violation_data}
                    sortMode="multiple"
                    paginator
                    rows={3}
                    scrollable
                    scrollHeight="800px"
                    totalRecords={3}
                    Display="menu"
                    header="Violations"
                  >
                    <Column field="code" header="Code" />
                    <Column field="section" header="Section" />
                    <Column field="unit" header="Unit" />
                    <Column field="oos" header="OOS" />
                    <Column field="description" header="Description" />
                    <Column field="convicted_of_dif_charge" header="IN SMS" />
                    <Column field="BASIC" header="BASIC" />
                  </DataTable>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-sm-12">
                <div class="well">
                  <DataTable
                    value={vehicle_data}
                    paginator
                    rows={3}
                    scrollable
                    scrollHeight="800px"
                    totalRecords={3}
                    Display="menu"
                    header="Vehicles"
                  >
                    <Column field="unit" header="Unit" />
                    <Column field="type_" header="Type" />
                    <Column field="state" header="Plate State" />
                    <Column field="vehicle_plate" header="Vehicle Plate" />
                    <Column field="vin" header="VIN" />
                  </DataTable>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InspectionDetail;
