import { Tenant } from './tenant.class';

export class User {
	id: string;
	name: string;
	title: string;
	email: string;
	roles: string[];
    tenant: Tenant;
    childTenants: Tenant[];
	customerName: string;
	bearer: string;
}