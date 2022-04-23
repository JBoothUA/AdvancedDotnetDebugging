var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { User } from '../shared/user.class';
import { Tenant } from '../shared/tenant.class';
var MockUserService = /** @class */ (function () {
    function MockUserService() {
        this.currentUser = new User();
        //set mock data
        currentUser = JSON.parse("[\n            {\n                \"bearer\": \"jibberish\",\n                \"name\": \"SmartCommand User\",\n                \"jobTitle\": \"Intergraph Employee\",\n                \"email\": \"smartcommand@intergraph.com\",\n                \"tenant\": [\n                    {\n                        \"CustomerName\": \"HxGN\",\n                        \"Id\": \"0f2f363b-a2fb-4ced-a9a4-54510a1a67ce\",\n                        \"Locations\": [\n                            {\n                                \"Id\": \"c093abb5-58be-410b-80bf-ca7a52e52ac3\",\n                                \"Name\": \"305-Intergraph\",\n                                \"City\": \"Madison\",\n                                \"State\": \"AL\"\n                            },\n                            {\n                                \"Id\": \"3eae2d1d-f3d8-46c0-b41d-3cd4c8113c16\",\n                                \"Name\": \"HxGN Live\",\n                                \"City\": \"Las Vegas\",\n                                \"State\": \"NV\"\n                            }\n                        ],\n                        \"ParentId\": \"\"\n                    }\n                ],\n                \"childrenTenants\": [\n                    {\n                        \"CustomerName\": \"Gamma 2\",\n                        \"Id\": \"f6f59624-018f-4a9c-89b2-96213966e4ec\",\n                        \"Locations\": [\n                            {\n                                \"Id\": \"37e4434b-0d2c-47d0-8bef-033ea5bd28a2\",\n                                \"Name\": \"Headquarters\",\n                                \"City\": \"Denver\",\n                                \"State\": \"CO\"\n                            }\n                        ],\n                        \"ParentId\": \"0f2f363b-a2fb-4ced-a9a4-54510a1a67ce\"\n                    }\n                ],\n                \"unique_name\": \"live.com#smartcommand@intergraph.com\",\n                \"roles\": [],\n                \"customerName\": \"Intergraph\"\n            }       \n        ]");
        // Map ActiveDirectory User to our TypeScript User
        this.currentUser.id = currentUser[0].unique_name;
        this.currentUser.name = currentUser[0].name;
        this.currentUser.email = currentUser[0].email;
        this.currentUser.title = currentUser[0].jobTitle;
        this.currentUser.roles = currentUser[0].roles;
        this.currentUser.tenant = new Tenant(currentUser[0].tenant[0]);
        this.currentUser.childTenants = [];
        if (currentUser[0].childrenTenants && currentUser[0].childrenTenants.length > 0) {
            for (var _i = 0, _a = currentUser[0].childrenTenants; _i < _a.length; _i++) {
                var ct = _a[_i];
                var newCT = new Tenant(ct);
                this.currentUser.childTenants.push(newCT);
            }
        }
        this.currentUser.customerName = currentUser[0].customerName;
        this.currentUser.bearer = currentUser[0].bearer;
    }
    MockUserService = __decorate([
        Injectable(),
        __metadata("design:paramtypes", [])
    ], MockUserService);
    return MockUserService;
}());
export { MockUserService };
//# sourceMappingURL=mockUser.service.js.map