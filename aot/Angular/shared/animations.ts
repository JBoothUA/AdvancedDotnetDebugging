import { trigger, state, style, transition, animate } from '@angular/animations';

export const slideDown = trigger('slideDown', [
	state('void', style({
		display: 'none',
		height: '0px',
		overflow: 'hidden'
	})),
	state('in', style({
		display: 'none',
		height: '0px',
		overflow: 'hidden'
	})),
	state('out', style({
		height: '*'
	})),
	transition('* <=> *', animate('400ms ease-in-out'))
]);

export const slideRight = trigger('slideRight', [
	state('void', style({
		display: 'none',
		width: '0px',
		overflow: 'hidden'
	})),
    state('in', style({
        display: 'none',
        width: '0px',
        overflow: 'hidden'
    })),
    state('out', style({
        width: '*'
    })),
	transition('* <=> *', animate('400ms ease-in-out'))
]);

export const fade = trigger('fade', [
	state('void', style({
		opacity: '1'
	})),
    state('in', style({
        opacity: '1'
    })),
    state('out', style({
        opacity: '0'
    })),
	transition('* <=> *', animate('400ms ease-in-out'))
]);