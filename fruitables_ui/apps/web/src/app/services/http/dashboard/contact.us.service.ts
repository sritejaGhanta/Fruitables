import { Injectable } from "@angular/core";
import { CommonHttpClintService } from "../common.http.clint";

@Injectable({
    providedIn: "root"
})

export class ContactUsService {
constructor(private http:CommonHttpClintService){

}

subscribeMe(data:{email: string}){
    return this.http.post('api/gateway_user/user-contact-us', data)
}

}
