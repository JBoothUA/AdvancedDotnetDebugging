// Get reference to the global current user variable
declare let currentUser: any;

import { Injectable } from '@angular/core';
import { User } from '../shared/user.class';
import { Tenant } from '../shared/tenant.class';

@Injectable()
export class UserService {
	currentUser: User = new User();

	constructor() {
		// Map ActiveDirectory User to our TypeScript User
		this.currentUser.id = currentUser.UserId;
		this.currentUser.name = currentUser.name;
		this.currentUser.email = currentUser.email;
		this.currentUser.title = currentUser.jobTitle;
		this.currentUser.roles = currentUser.roles;
		this.currentUser.tenant = new Tenant(currentUser.tenant);
		this.currentUser.childTenants = [];
		if (currentUser.childrenTenants && currentUser.childrenTenants.length > 0) {
            for (let ct of currentUser.childrenTenants) {
                let newCT = new Tenant(ct);
                this.currentUser.childTenants.push(newCT);
            }
        }
		this.currentUser.customerName = currentUser.customerName;
		this.currentUser.bearer = currentUser.bearer;
    }
}