from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import uvicorn
from util import DataProcessingApp

app = FastAPI()


class Endpoints:
    def __init__(self):
        self.preprocessor = DataProcessingApp()

    def run(self):
        self.preprocessor.load_data()
        self.preprocessor.update_df()

        @app.get("/inspections")
        def get_inspections(page_no: int, sort_term: str, basic_key: str, status_key: str, is_ascending: bool):
            return self.preprocessor.get_response_for_inspection_data(page_no, sort_term, basic_key, status_key,
                                                                      is_ascending)

        @app.get("/basic_keys")
        def get_basic_keys():
            return list(self.preprocessor.basic_dict.keys())

        @app.get("/inspections_all")
        def get_inspections_all(page_no: int, sort_term: str, basic_key: str, status_key: str, is_ascending: bool):

            data = self.preprocessor.inspection_data_df
            data = data.to_dict('records')
            return data

        @app.get("/inspection_detail")
        def get_inspection_details(inspection_no: str):
            return self.preprocessor.inspection_detail_dict[inspection_no]

        @app.put("/resolve")
        def resolve_inspection(payload: Dict[str, str]):
            inspection_no = payload['inspection_no']
            for i in range(len(self.preprocessor.inspection_data_dict[inspection_no])):
                self.preprocessor.set_status_for_inspection(inspection_no, i, 'Resolved')
            self.preprocessor.inspection_detail_dict[inspection_no].status = 'Resolved'
            self.preprocessor.update_df()
            return {"message": "Data updated successfully"}

        @app.put("/resolve_many")
        def resolve_many_inspection(payload: dict[str, list]):
            inspection_nos = payload['inspection_nos']
            for inspection_no in inspection_nos:
                for i in range(len(self.preprocessor.inspection_data_dict[inspection_no])):
                    self.preprocessor.set_status_for_inspection(inspection_no, i, 'Resolved')
                self.preprocessor.inspection_detail_dict[inspection_no].status = 'Resolved'
            self.preprocessor.update_df()
            return {"message": "Data updated successfully"}

        uvicorn.run(app, port=8080)


def define_middleware():
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


if __name__ == "__main__":
    define_middleware()
    app_ = Endpoints()
    app_.run()
