/* Copyright 2017 Intergraph Corporation. All Rights Reserved. */
import { RadialMenuButtonImage } from './radial-menu-button-image.class';

export class RadialMenuButton {
    Id: string;
    Name: string;
    Image: RadialMenuButtonImage;
    Action: () => void;
    Active: boolean = true;
    Visible: boolean = true;
    Selected: boolean = false;
    OffsetTop: number = 0;
    OffsetLeft: number = 0;
    Error: boolean = false;

    constructor(id: string, name: string, image: RadialMenuButtonImage, action: () => void,
                selected: boolean = false, active: boolean = true, visible: boolean = true) {
        this.Id = id;
        this.Name = name;
        this.Image = image;
        this.Action = action;
        this.Selected = selected;
        this.Active = active;
        this.Visible = visible;
    }
}