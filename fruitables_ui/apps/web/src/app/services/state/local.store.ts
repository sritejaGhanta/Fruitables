import { createAction, createReducer, on, props } from "@ngrx/store";

export const addLocalData =  createAction('[localData] addData', props<any>());
export const clearLocalData =  createAction('[localData] clearData');;

export const  locaReducer = createReducer(
    {},
    on(addLocalData, (data:any, prop:any) => {
        return {...data,...prop};
    }),
    on(clearLocalData, (data:any, prop:any) => { return {} })
)

