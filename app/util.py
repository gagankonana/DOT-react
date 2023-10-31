import copy
import math
from collections import defaultdict
from dataclasses import dataclass
from itertools import chain

import pandas as pd
import xmltodict
import numpy as np

@dataclass
class Inspection:
    date: str
    inspection_no: str
    report_state: str
    vehicle_plate: str
    state: str
    type_: str
    weight: str
    status: str
    BASIC: str


@dataclass
class Violation:
    code: str
    description: str
    oos: str
    time_severity_weight: str
    BASIC: str
    unit: str
    convicted_of_dif_charge: str


@dataclass
class Vehicle:
    unit: str
    vehicle_plate: str
    state: str
    type_: str
    vin: str


@dataclass
class InspectionGroup:
    date: str
    inspection_no: str
    report_state: str
    violations: list[dict]
    vehicle: list[dict]
    status: str


class DataProcessingApp:
    def __init__(self):
        self.inspection_data_df = None
        self.violation_by_inspection = {}
        self.basic_dict = defaultdict(list)
        self.sorted_data = {}
        self.len_dict = {}
        self.status_dict = defaultdict(list)
        self.inspection_detail_dict = defaultdict(InspectionGroup)
        self.inspection_data_dict = defaultdict(list)

    def load_data(self):
        with open("data.xml") as xml_file:
            data_dict = xmltodict.parse(xml_file.read())
            inspections = data_dict['carrierData']['inspections']['inspection']
            for inspection in inspections:
                self.load_inspection_data(inspection)

    def load_inspection_data(self, inspection):
        date = inspection.get('@inspection_date', '')
        weight = inspection.get('@time_weight', '')
        inspection_no = inspection.get('@report_number', '')
        report_state = inspection.get('@report_state', '')
        self.inspection_detail_dict[inspection_no] = InspectionGroup(date, inspection_no, report_state, [], [],
                                                                     'No violation')
        cur_inspection = Inspection(date,
                                    inspection_no,
                                    report_state,
                                    "vehicle_plate",
                                    "state",
                                    "type_",
                                    weight,
                                    "status",
                                    "BASIC")

        for vehicle in inspection['vehicles']['vehicle']:
            violations = inspection['violations']['violation']
            self.load_vehicle_data(vehicle, cur_inspection, violations)

    def load_vehicle_data(self, vehicle, cur_inspection, violations):
        vehicle_plate = vehicle.get('@license_number', '')
        state = vehicle.get('@license_state', '')
        type_ = vehicle.get('@unit_type', '')
        unit = vehicle.get('@unit', '')
        vin = vehicle.get('@vehicle_id_number', '')
        local_vehicle = Vehicle(unit=unit, vehicle_plate=vehicle_plate, state=state, type_=type_, vin=vin)
        self.inspection_detail_dict[cur_inspection.inspection_no].vehicle.append(local_vehicle.__dict__)
        cur_inspection.vehicle_plate = vehicle_plate
        cur_inspection.state = state
        cur_inspection.type_ = type_

        self.violation_by_inspection[cur_inspection.inspection_no] = defaultdict(list)

        if isinstance(violations, list):
            for violation in violations:
                self.load_violation_data(violation, cur_inspection)
        elif isinstance(violations, dict):
            if '@BASIC' and '@code' in violations:
                self.load_violation_data(violation=violations, cur_inspection=cur_inspection)
                return

            cur_inspection.BASIC = ''
            cur_inspection.status = 'No violation'
            cur_inspection_local = copy.deepcopy(cur_inspection)
            self.inspection_data_dict[cur_inspection.inspection_no].append(cur_inspection_local.__dict__)

            self.status_dict[cur_inspection.status].append(cur_inspection_local.__dict__)

    def load_violation_data(self, violation, cur_inspection):
        code = violation.get('@code', '')
        description = violation.get('@description', '')
        oos = violation.get('@oos', '')
        time_severity_weight = violation.get('@time_severity_weight', '')
        BASIC = violation.get('@BASIC', '')
        unit = violation.get('@unit', '')
        convicted_of_dif_charge = violation.get('@convicted_of_dif_charge', '')
        local_violation = Violation(code, description, oos,
                                    time_severity_weight,
                                    BASIC, unit, convicted_of_dif_charge)
        self.inspection_detail_dict[cur_inspection.inspection_no].violations.append(local_violation.__dict__)
        cur_inspection.BASIC = BASIC
        cur_inspection.status = 'Unresolved'
        self.inspection_detail_dict[cur_inspection.inspection_no].status = cur_inspection.status
        number_plate_key = cur_inspection.state + cur_inspection.vehicle_plate
        self.violation_by_inspection[cur_inspection.inspection_no][number_plate_key].append(local_violation.__dict__)
        cur_inspection_local = copy.deepcopy(cur_inspection)
        self.status_dict[cur_inspection.status].append(cur_inspection_local.__dict__)
        self.basic_dict[BASIC].append(cur_inspection_local.__dict__)
        self.inspection_data_dict[cur_inspection.inspection_no].append(cur_inspection_local.__dict__)

    def update_df(self):
        data_rows = list(chain.from_iterable(self.inspection_data_dict.values()))
        self.inspection_data_df = pd.DataFrame(data_rows)
        self.inspection_data_df['id'] = np.arange(len(self.inspection_data_df))
        self.inspection_data_df['id'] = range(len(self.inspection_data_df))

    def get_response_for_inspection_data(self, page_no: int, sort_term: str, basic_key: str, status_key: str,
                                         is_ascending: bool):
        if basic_key == 'none' and status_key == 'none':
            if sort_term == 'none':
                data = self.inspection_data_df
                size = len(self.inspection_data_df)
            else:
                data = self.inspection_data_df.sort_values(by=sort_term, ascending=is_ascending)
                size = len(data)
        elif status_key == 'none':
            filtered_df = self.inspection_data_df.loc[self.inspection_data_df['BASIC'] == basic_key]
            size = len(filtered_df)
            if sort_term == 'none':
                data = filtered_df
            else:
                data = filtered_df.sort_values(by=sort_term, ascending=is_ascending)
        elif basic_key == 'none':
            filtered_df = self.inspection_data_df.loc[self.inspection_data_df['status'] == status_key]
            size = len(filtered_df)
            if sort_term == 'none':
                data = filtered_df
            else:
                data = filtered_df.sort_values(by=sort_term, ascending=is_ascending)
        else:
            filtered_df = self.inspection_data_df.loc[
                (self.inspection_data_df['BASIC'] == basic_key) & (self.inspection_data_df['status'] == status_key)]
            size = len(filtered_df)
            if sort_term == 'none':
                data = filtered_df
            else:
                data = filtered_df.sort_values(by=sort_term, ascending=is_ascending)
        data = data.to_dict('records')[(page_no - 1) * 20: page_no * 20]

        response = {
            'data': data, 
            'size': math.ceil(size / 20)
            }
        return response

    def set_status_for_inspection(self, inspection_no: str, index: int, status: str):
        self.inspection_data_dict[inspection_no][index]['status'] = status
