var RadialMenuButton = /** @class */ (function () {
    function RadialMenuButton(id, name, image, action, selected, active, visible) {
        if (selected === void 0) { selected = false; }
        if (active === void 0) { active = true; }
        if (visible === void 0) { visible = true; }
        this.Active = true;
        this.Visible = true;
        this.Selected = false;
        this.OffsetTop = 0;
        this.OffsetLeft = 0;
        this.Error = false;
        this.Id = id;
        this.Name = name;
        this.Image = image;
        this.Action = action;
        this.Selected = selected;
        this.Active = active;
        this.Visible = visible;
    }
    return RadialMenuButton;
}());
export { RadialMenuButton };
//# sourceMappingURL=radial-menu-button.class.js.map