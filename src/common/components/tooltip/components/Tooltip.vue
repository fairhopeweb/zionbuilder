<template>
	<component :is="tag" v-bind="$attrs" ref="root">
		<transition
			v-if="visible"
			appear
			:name="transition"
			v-bind="popperProps"
			@enter="onTransitionEnter"
			@after-leave="onTransitionLeave"
		>
			<div ref="popper" class="hg-popper" :class="tooltipClass" :style="getStyle">
				{{ content }}

				<slot name="content" />

				<span v-if="showArrows" data-popper-arrow="true" class="hg-popper--with-arrows" />
			</div>
		</transition>

		<slot />
	</component>
</template>

<script lang="ts">
import { ref } from 'vue';
import { getDefaultOptions } from '../options';
import { merge, debounce } from 'lodash-es';
import { createPopper } from '@popperjs/core';
import { getZindex, removeZindex } from '../../../modules/z-index-manager';

let preventOutsideClickPropagation = false;

export default {
	name: 'Tooltip',
	inheritAttrs: false,
	props: {
		modifiers: {
			type: Array,
			required: false,
		},
		tag: {
			default: 'div',
		},
		/**
		 * The content that will be placed inside tooltip
		 */
		content: {
			type: String,
			required: false,
			default: null,
		},
		/**
		 * If the tooltip will be visible by default
		 */
		show: {
			type: Boolean,
			required: false,
			default: false,
		},
		/**
		 * If the tooltip will be visible when you hover the element
		 */
		showOnMouseEnter: {
			type: Boolean,
			required: false,
			default: true,
		},
		/**
		 * Time in miliseconds until the tooltip is visible
		 */
		openDelay: {
			type: Number,
			required: false,
			default: 10,
		},
		/**
		 * Time in miliseconds until the tooltip is closed after the mouse leaves the tooltip trigger
		 */
		closeDelay: {
			type: Number,
			required: false,
			default: 10,
		},
		/**
		 * If the tooltip should remain active if the user enters it's container
		 */
		enterable: {
			type: Boolean,
			required: false,
			default: true,
		},
		/**
		 * Time in miliseconds until the tooltip is auto hidden
		 */
		hideAfter: {
			type: Number,
			required: false,
			default: null,
		},
		/**
		 * Show tooltip arrows or not
		 */
		showArrows: {
			type: Boolean,
			required: false,
			default: true,
		},
		/**
		 * Append to specific element. This uses document.querySelector. By default, the tooltip will be appended to the first child
		 */
		appendTo: {
			required: false,
		},
		/**
		 * Popper trigger. Can be click, hover or even null if you want to manually controll the popper visibility
		 */
		trigger: {
			type: String,
			required: false,
			default: 'hover',
		},
		/**
		 * When clicked outside tooltip, it closes
		 */
		closeOnOutsideClick: {
			type: Boolean,
			required: false,
			default: false,
		},
		/**
		 * tooltip closes on Esc key
		 */
		closeOnEscape: {
			type: Boolean,
			required: false,
			default: false,
		},
		/**
		 * Popper reference
		 */
		popperRef: {
			type: Object,
			required: false,
			default() {
				return null;
			},
		},
		/**
		 * Transition name
		 */
		transition: {
			type: String,
			required: false,
		},
		/**
		 * Class for animation on enter
		 */
		enterActiveClass: {
			type: String,
			required: false,
			default: '',
		},
		/**
		 * Class for animation on leave
		 */
		leaveActiveClass: {
			type: String,
			required: false,
			default: '',
		},
		/**
		 * Custom Class
		 */
		tooltipClass: {
			type: String,
			required: false,
		},
		/**
		 * Custom style
		 */
		tooltipStyle: {
			type: [Object, String],
			required: false,
			default: {},
		},
	},
	setup(props) {
		const root = ref(null);
		const popperSelector = ref(null);
		const ownerDocument = ref(null);

		return {
			popperSelector,
			root,
			ownerDocument,
		};
	},
	data() {
		return {
			visible: !!this.show,
			showTimeout: null,
			hideTimeout: null,
			hideAfterTimeout: null,
			zIndex: null,
		};
	},
	computed: {
		getStyle() {
			return {
				...this.tooltipStyle,
				'z-index': this.zIndex,
			};
		},
		popperProps() {
			const props: {
				enterActiveClass?: string;
				leaveActiveClass?: string;
			} = {};

			if (this.enterActiveClass) {
				props.enterActiveClass = this.enterActiveClass;
			}

			if (this.leaveActiveClass) {
				props.leaveActiveClass = this.leaveActiveClass;
			}

			return props;
		},
		popperOptions() {
			const options = JSON.parse(JSON.stringify(getDefaultOptions()));
			const instanceOptions = JSON.parse(JSON.stringify(this.$attrs));
			instanceOptions.modifiers = this.modifiers || [];
			// Apply offset for arrow
			if (this.showArrows) {
				const hasOffsetModifier = instanceOptions.modifiers.find(modifier => modifier.name === 'offset');

				if (!hasOffsetModifier) {
					instanceOptions.modifiers.push({
						name: 'offset',
						options: {
							offset: [0, 10],
						},
					});
				}
			}

			return merge(options, instanceOptions);
		},
		appendToOption() {
			const options = JSON.parse(JSON.stringify(getDefaultOptions()));
			return this.appendTo || options.appendTo;
		},
	},
	watch: {
		closeOnOutsideClick(newValue) {
			if (newValue) {
				this.ownerDocument.addEventListener('click', this.onOutsideClick, true);
			} else {
				this.ownerDocument.removeEventListener('click', this.onOutsideClick, true);
			}
		},
		hideAfter(newValue) {
			if (newValue) {
				this.onHideAfter();
			}
		},
		show(newValue, oldValue) {
			this.visible = !!newValue;
		},
		visible(newValue, oldvalue) {
			if (!!newValue !== !!oldvalue) {
				if (newValue) {
					this.zIndex = getZindex();
				} else if (this.zIndex) {
					removeZindex();
					this.zIndex = null;
				}
			}
		},
	},
	methods: {
		preventOutsideClickPropagation() {
			preventOutsideClickPropagation = true;
		},
		onTransitionEnter() {
			this.instantiatePopper();
			this.$emit('show');
			this.$emit('update:show', true);
		},
		onTransitionLeave() {
			this.destroyPopper();
			this.$emit('hide');
			this.$emit('update:show', false);
		},
		getAppendToElement() {
			if (this.appendToOption === 'element') {
				return this.$el;
			} else {
				// Get content document
				return this.ownerDocument.querySelector(this.appendToOption);
			}
		},
		showPopper() {
			this.visible = true;
		},
		hidePopper() {
			this.visible = false;
		},
		addPopperToDom() {
			if (this.popperElement && this.appendToOption !== 'element') {
				// Append to
				const appendElement = this.getAppendToElement();

				if (!appendElement) {
					// eslint-disable-next-line
					console.warn(
						`No HTMLElement was found matching ${appendElement}`
					);
					return;
				}

				appendElement.appendChild(this.popperElement);
			}
		},
		destroyPopper(completeRemove) {
			if (this.visible && !completeRemove) {
				return;
			}

			this.visible = false;
			if (this.popperInstance) {
				this.popperInstance.destroy();
				this.popperInstance = null;
			}

			this.removePopperEvents();

			if (this.popperElement && this.popperElement.parentNode && this.appendToOption !== 'element') {
				// Append to
				this.popperElement.parentNode.removeChild(this.popperElement);
			}

			this.popperElement = null;
			preventOutsideClickPropagation = false;
		},
		instantiatePopper() {
			this.popperElement = this.$refs.popper;
			this.popperSelector = this.popperRef || this.root;

			this.ownerDocument = this.popperSelector.ownerDocument || this.root.ownerDocument;

			// We cannot use teleport as we need to get the document from ref
			this.addPopperToDom();

			if (this.popperInstance && this.popperInstance.destroy) {
				this.popperInstance.destroy();
				this.popperInstance = null;
			}

			if (this.popperSelector) {
				this.popperInstance = createPopper(this.popperSelector, this.popperElement, this.popperOptions);
			}

			this.onHideAfter();
			this.addPopperEvents();
		},
		onMouseEnter(event) {
			if (!this.showOnMouseEnter) {
				return;
			}

			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				this.showPopper();
			}, this.openDelay);
		},
		onMouseLeave(event) {
			clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				this.hidePopper();
			}, this.closeDelay);
		},
		onHideAfter() {
			if (this.hideAfter) {
				clearTimeout(this.timeout);
				this.timeout = setTimeout(() => {
					this.hidePopper();
				}, this.hideAfter);
			}
		},
		/**
		 * Will show the tooltip on click
		 *
		 * We use a debouncer so that multiple repetitive clicks are ignored
		 * It mainly fixes the problems that appear when the tooltip is wrapped
		 * inside a label
		 */
		onClick: debounce(function (event) {
			if (this.popperElement && this.popperElement.contains(event.target)) {
				return;
			}

			this.visible = !this.visible;
		}, 10),
		onOutsideClick(event) {
			// Only hide if visible
			if (!this.visible || preventOutsideClickPropagation) {
				return;
			}

			// Prevent clicks on popper selector
			if (
				this.popperSelector &&
				typeof this.popperSelector.contains === 'function' &&
				this.popperSelector.contains(event.target)
			) {
				return;
			}

			if (this.popperElement && this.popperElement.contains(event.target)) {
				return;
			}

			// Hide popper if clicked outside
			this.hidePopper();
			this.$emit('hide');
			this.$emit('update:show', false);
			preventOutsideClickPropagation = false;
		},
		onKeyUp(event) {
			if (event.which === 27) {
				this.hidePopper();
				event.stopPropagation();
			}
		},
		scheduleUpdate() {
			if (this.popperInstance) {
				this.popperInstance.update();
			}
		},
		addPopperEvents() {
			if (this.closeOnOutsideClick) {
				this.ownerDocument.addEventListener('click', this.onOutsideClick, true);
			}

			if (this.trigger === 'hover' && this.enterable && this.popperElement) {
				this.popperElement.addEventListener('mouseenter', this.onMouseEnter);
				this.popperElement.addEventListener('mouseleave', this.onMouseLeave);
			}

			// Attache close on escape
			if (this.closeOnEscape) {
				this.ownerDocument.addEventListener('keyup', this.onKeyUp);
			}
		},
		removePopperEvents() {
			if (this.ownerDocument) {
				this.ownerDocument.removeEventListener('click', this.onOutsideClick, true);
			}

			if (this.trigger === 'hover' && this.enterable && this.popperElement) {
				this.popperElement.removeEventListener('mouseenter', this.onMouseEnter);
				this.popperElement.removeEventListener('mouseleave', this.onMouseLeave);
			}

			// Attache close on escape
			if (this.closeOnEscape && this.ownerDocument) {
				this.ownerDocument.removeEventListener('keyup', this.onKeyUp);
			}
		},
	},
	unmounted() {
		// Remove event listeners
		this.$el.removeEventListener('mouseenter', this.onMouseEnter);
		this.$el.removeEventListener('mouseleave', this.onMouseLeave);
		this.$el.removeEventListener('click', this.onClick);

		if (this.ownerDocument) {
			this.ownerDocument.removeEventListener('click', this.onOutsideClick, true);
			this.ownerDocument.removeEventListener('keyup', this.onKeyUp);
		}

		// Destroy popper instance
		this.destroyPopper(true);

		if (this.zIndex) {
			removeZindex();
			this.zIndex = null;
		}
	},
	mounted() {
		if (this.trigger === 'hover') {
			this.$el.addEventListener('mouseenter', this.onMouseEnter);
			this.$el.addEventListener('mouseleave', this.onMouseLeave);
		} else if (this.trigger === 'click') {
			this.$el.addEventListener('click', this.onClick);
		}

		if (this.show) {
			this.zIndex = getZindex();
		}
	},
};
</script>

<style lang="scss">
.hg-popper {
	z-index: 9999;
	box-sizing: border-box;
	padding: 10px;
	color: var(--zb-dropdown-text-color);
	font-family: var(--zb-font-stack);
	font-size: 13px;
	font-weight: normal;
	background-color: var(--zb-dropdown-bg-color);
	box-shadow: var(--zb-dropdown-shadow);
	border: 1px solid var(--zb-dropdown-border-color);
	border-radius: 4px;

	& * {
		box-sizing: border-box;
	}

	&-list {
		padding: 6px 0;
		margin: 0;
		list-style-type: none;
		background: var(--zb-dropdown-bg-color);

		&__item {
			padding: 8px 16px;
			color: var(--zb-dropdown-text-color);
			font-weight: 500;
			text-align: left;
			cursor: pointer;

			&:hover {
				color: var(--zb-dropdown-text-active-color);
				background-color: var(--zb-dropdown-bg-active-color);
			}
		}
	}

	&--with-arrows {
		z-index: -1;

		&:before {
			content: '';
			top: 0;
			left: 0;
			z-index: -1;
			display: block;
			width: 8px;
			height: 8px;
			background: var(--zb-dropdown-bg-color);
			transform: rotate(45deg);
		}
	}

	&[data-popper-placement^='top'] {
		margin-bottom: 5px;
	}

	&[data-popper-placement^='top'] &--with-arrows {
		bottom: -4px;
	}

	&[data-popper-placement^='bottom'] {
		margin-top: 5px;
	}

	&[data-popper-placement^='bottom'] &--with-arrows {
		top: -4px;
		left: 50%;
	}

	&[data-popper-placement^='left'] {
		margin-right: 5px;
	}

	&[data-popper-placement^='left'] &--with-arrows {
		top: 50%;
		right: -4px;
		margin-top: -5px;
	}

	&[data-popper-placement^='right'] {
		margin-left: 5px;
	}
	&[data-popper-placement^='right'] &--with-arrows {
		top: 50%;
		left: -4px;
		margin-top: -5px;
	}

	&.hg-popper--big-arrows .hg-popper--with-arrows {
		border-width: 12px;
	}

	&.hg-popper--no-padding {
		padding: 0;
		// border: 0;
	}
	&.hg-popper--no-bg {
		background: transparent;
		box-shadow: none;
	}
	&.znpb-class-selector__popper {
		padding: 15px;
	}

	ul {
		list-style-type: none;
	}
}

body .hg-popper-tooltip {
	z-index: 99999;
	max-width: 200px;
	padding: 5px 10px;
	font-size: 12px;
	font-weight: normal;
	line-height: 1.6;
	text-align: center;
}
</style>
