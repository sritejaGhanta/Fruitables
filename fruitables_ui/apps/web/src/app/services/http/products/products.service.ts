import { Injectable } from "@angular/core";
import { CommonHttpClintService } from "../common.http.clint";

@Injectable({
    providedIn: "root"
})

export class ProductsService {
    constructor(private http:CommonHttpClintService){}

    list(params:any = {}){
        return this.http.post('api/gateway_product/products-list',params)
    }

    dashBoardProducts(){
        return this.http.post('api/gateway_product/dashboard-products',{})
    }

}
