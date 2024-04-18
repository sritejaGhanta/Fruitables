import { Injectable } from "@angular/core";
import { CommonHttpClintService } from "../common.http.clint";

@Injectable({
    providedIn: "root"
})

export class CategoryService {
    constructor(private http:CommonHttpClintService){}

    list(params:any = {}){
        return this.http.post('api/gateway_product/product-category-list',params)
    }

}
