// Get reference to the global current user variable
declare let currentUser: any;

import { Injectable } from '@angular/core';
import { User } from '../shared/user.class';
import { Tenant } from '../shared/tenant.class';

@Injectable()
export class MockUserService {
    currentUser: User = new User();

    constructor() {
        //set mock data
        currentUser = JSON.parse(`[
            {
                "bearer": "jibberish",
                "name": "SmartCommand User",
                "jobTitle": "Intergraph Employee",
                "email": "smartcommand@intergraph.com",
                "tenant": [
                    {
                        "CustomerName": "HxGN",
                        "Id": "0f2f363b-a2fb-4ced-a9a4-54510a1a67ce",
                        "Locations": [
                            {
                                "Id": "c093abb5-58be-410b-80bf-ca7a52e52ac3",
                                "Name": "305-Intergraph",
                                "City": "Madison",
                                "State": "AL"
                            },
                            {
                                "Id": "3eae2d1d-f3d8-46c0-b41d-3cd4c8113c16",
                                "Name": "HxGN Live",
                                "City": "Las Vegas",
                                "State": "NV"
                            }
                        ],
                        "ParentId": ""
                    }
                ],
                "childrenTenants": [
                    {
                        "CustomerName": "Gamma 2",
                        "Id": "f6f59624-018f-4a9c-89b2-96213966e4ec",
                        "Locations": [
                            {
                                "Id": "37e4434b-0d2c-47d0-8bef-033ea5bd28a2",
                                "Name": "Headquarters",
                                "City": "Denver",
                                "State": "CO"
                            }
                        ],
                        "ParentId": "0f2f363b-a2fb-4ced-a9a4-54510a1a67ce"
                    }
                ],
                "unique_name": "live.com#smartcommand@intergraph.com",
                "roles": [],
                "customerName": "Intergraph"
            }       
        ]`);


        // Map ActiveDirectory User to our TypeScript User
        this.currentUser.id = currentUser[0].unique_name;
        this.currentUser.name = currentUser[0].name;
        this.currentUser.email = currentUser[0].email;
        this.currentUser.title = currentUser[0].jobTitle;
        this.currentUser.roles = currentUser[0].roles;
        this.currentUser.tenant = new Tenant(currentUser[0].tenant[0]);
        this.currentUser.childTenants = [];
        if (currentUser[0].childrenTenants && currentUser[0].childrenTenants.length > 0) {
            for (let ct of currentUser[0].childrenTenants) {
                let newCT = new Tenant(ct);
                this.currentUser.childTenants.push(newCT);
            }
        }
        this.currentUser.customerName = currentUser[0].customerName;
        this.currentUser.bearer = currentUser[0].bearer;
    }
}