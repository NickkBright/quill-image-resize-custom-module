import IconAlignLeft from "quill/assets/icons/align-left.svg";
import IconAlignCenter from "quill/assets/icons/align-center.svg";
import IconAlignRight from "quill/assets/icons/align-right.svg";
import AltIcon from "../assets/AltIcon.svg";
import DescIcon from "../assets/DescIcon.svg";
import MinWidthIcon from "../assets/MinWidthIcon.svg";

import { BaseModule } from "./BaseModule";

let Parchment = {};
let FloatStyle = {};
let MarginStyle = {};
let DisplayStyle = {};
let MinWidthStyle = {};

export class Toolbar extends BaseModule {
	onCreate = (parchment) => {
		// Initilize styles
		Parchment = parchment;
		FloatStyle = new Parchment.Attributor.Style("float", "float");
		MarginStyle = new Parchment.Attributor.Style("margin", "margin");
		DisplayStyle = new Parchment.Attributor.Style("display", "display");
		MinWidthStyle = new Parchment.Attributor.Style(
			"min-width",
			"min-width"
		);
		// Setup Toolbar
		this.toolbar = document.createElement("div");
		this.alignmentsContainer = document.createElement("div");
		this.actionsContainer = document.createElement("div");

		Object.assign(this.toolbar.style, this.options.toolbarStyles);
		Object.assign(
			this.alignmentsContainer.style,
			this.options.toolbarContainersStyles
		);
		Object.assign(
			this.actionsContainer.style,
			this.options.toolbarContainersStyles
		);
		this.toolbar.appendChild(this.alignmentsContainer);
		this.toolbar.appendChild(this.actionsContainer);
		this.overlay.appendChild(this.toolbar);

		// Setup Buttons
		this._defineAlignments();
		this._defineActions();
		this._addToolbarAlignmentsButtons();
		this._addToolbarButtonsToActions();
	};

	// The toolbar and its children will be destroyed when the overlay is removed
	onDestroy = () => {};

	// Nothing to update on drag because we are are positioned relative to the overlay
	onUpdate = () => {};

	_defineActions = () => {
		this.actions = [
			// {
			// 	icon: IconLink,
			// 	apply: () => {
			// 		const findImg = Parchment.find(this.img);
			// 		const offset = findImg.offset(this.quill.scroll);
			// 		this.quill.setSelection(offset, 1, window.Quill.sources.USER);
			// 		const toolbar = this.quill.getModule('toolbar');
			// 		toolbar.container.querySelector('.ql-link').click();
			// 	},
			// 	isApplied: () => {
			// 		const findImg = Parchment.find(this.img);
			// 		return findImg.parent.domNode.tagName === 'A'
			// 	},
			// },
			{
				icon: AltIcon,
				apply: () => {
					const findImg = Parchment.find(this.img);
					const imgTitle = findImg.domNode.alt;
					let title = prompt(
						"Please enter a title (alternative text)",
						imgTitle
					);
					if (title !== null) {
						findImg.domNode.alt = title;
					}
				},
				isApplied: () => {
					const findImg = Parchment.find(this.img);
					return findImg.domNode.alt && findImg.domNode.alt !== "";
				},
			},
			{
				icon: DescIcon,
				apply: () => {
					const findImg = Parchment.find(this.img);
					const imgDesc = findImg.domNode.dataset.description;
					let title = prompt("Please enter a description", imgDesc);
					if (title !== null) {
						findImg.domNode.dataset.description = title;
					}
				},
				isApplied: () => {
					const findImg = Parchment.find(this.img);
					return (
						findImg.domNode.dataset.description &&
						findImg.domNode.dataset.description !== ""
					);
				},
			},
			{
				icon: MinWidthIcon,
				apply: () => {
					const initialValue =
						MinWidthStyle.value(this.img).replace("px", "") ||
						"300";
					const promptText =
						"Please enter a min width (20px minimum)";
					let minWidth = prompt(promptText, initialValue);

					if (minWidth === "") {
						MinWidthStyle.add(this.img, initialValue);

						return;
					}

					while (
						minWidth !== "" &&
						(!Number(minWidth) || Number(minWidth) < 20)
					) {
						minWidth = prompt(promptText, initialValue);
					}

					MinWidthStyle.add(this.img, minWidth.concat("px"));
				},
				isApplied: () => MinWidthStyle.value(this.img) !== "300px",
			},
		];
	};

	_defineAlignments = () => {
		this.alignments = [
			{
				icon: IconAlignLeft,
				apply: () => {
					DisplayStyle.add(this.img, "inline");
					FloatStyle.add(this.img, "left");
					MarginStyle.add(this.img, "0 1em 1em 0");
				},
				isApplied: () => FloatStyle.value(this.img) == "left",
			},
			{
				icon: IconAlignCenter,
				apply: () => {
					DisplayStyle.add(this.img, "block");
					FloatStyle.remove(this.img);
					MarginStyle.add(this.img, "auto");
				},
				isApplied: () => MarginStyle.value(this.img) == "auto",
			},
			{
				icon: IconAlignRight,
				apply: () => {
					DisplayStyle.add(this.img, "inline");
					FloatStyle.add(this.img, "right");
					MarginStyle.add(this.img, "0 0 1em 1em");
				},
				isApplied: () => FloatStyle.value(this.img) == "right",
			},
		];
	};

	_addToolbarAlignmentsButtons = () => {
		const buttons = [];
		this.alignments.forEach((alignment, idx) => {
			const button = document.createElement("span");
			buttons.push(button);
			button.innerHTML = alignment.icon;
			button.addEventListener("click", () => {
				// deselect all buttons
				buttons.forEach((button) => (button.style.filter = ""));
				if (alignment.isApplied()) {
					// If applied, unapply
					FloatStyle.remove(this.img);
					MarginStyle.remove(this.img);
					DisplayStyle.remove(this.img);
				} else {
					// otherwise, select button and apply
					this._selectButton(button);
					alignment.apply();
				}
				// image may change position; redraw drag handles
				this.requestUpdate();
			});
			Object.assign(
				button.style,
				this.options.toolbarAlignmentsButtonStyles
			);

			if (idx === this.actions.length - 1) {
				button.style.borderRadius = "0 3px 3px 0";
				button.style.borderRight = "unset";
			} else if (idx === 0) {
				button.style.borderRadius = "3px 0 0 3px";
			}

			Object.assign(
				button.children[0].style,
				this.options.toolbarAlignmentsButtonSvgStyles
			);
			if (alignment.isApplied()) {
				// select button if previously applied
				this._selectButton(button);
			}
			this.alignmentsContainer.appendChild(button);
		});
	};

	_addToolbarButtonsToActions = () => {
		const buttons = [];
		this.actions.forEach((action, idx) => {
			const button = document.createElement("span");
			button.role = "button";
			buttons.push(button);
			button.innerHTML = action.icon;
			button.addEventListener("click", () => {
				buttons.forEach((button) => (button.style.filter = ""));
				action.apply();
				this.requestUpdate();
			});

			Object.assign(button.style, this.options.toolbarButtonStyles);
			Object.assign(button.children[0].style, this.options.svgStyles);

			if (idx === this.actions.length - 1) {
				button.style.borderRadius = "0 3px 3px 0";
				button.style.borderRight = "unset";
			} else if (idx === 0) {
				button.style.borderRadius = "3px 0 0 3px";
			}

			if (action.isApplied()) {
				// select button if previously applied
				this._selectButton(button);
				button.title = this.img.getAttribute("data-href");
			}
			this.actionsContainer.appendChild(button);
		});
	};

	_selectButton = (button) => {
		button.style.filter = "invert(20%)";
	};
}
