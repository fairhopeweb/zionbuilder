<template>
	<div
		ref="rectangle"
		class="znpb-element-toolbox"
		:class="{
			'znpb-element-toolbox--dragging': isAnyDragging,
			'znpb-element-toolbox--loopProvider': element.isRepeaterProvider,
			'znpb-element-toolbox--loopConsumer': element.isRepeaterConsumer,
			[`znpb-element-toolbox__resize-${activeDragType}-${activeDragPosition}--dragging`]: isToolboxDragging,
		}"
	>
		<ToolboxTitle :element="element" />

		<template v-if="computedStyle && isActiveElementEdit">
			<!-- Width/height -->
			<Tooltip
				v-for="(position, positionIndex) in positions"
				:ref="`sizeDrag--${position}`"
				:key="`size-${position}`"
				tooltip-class="hg-popper--big-arrows znpb-sizing-label"
				:placement="getPopperPlacement"
				append-to="body"
				trigger="null"
				:show-arrows="false"
				:show="activeDragType === 'size' && activeDragPosition === position && newValues != undefined"
				:popper-ref="popperRef"
				@mousedown.left.stop="startSizeDrag($event, position)"
			>
				<template #content>
					<span>
						{{ newValues !== undefined ? newValues + 'px' : '' }}
					</span>
				</template>

				<div
					class="znpb-element-toolbox__resize-width znpb-element-toolbox__resize-dimensions"
					:class="{
						[`znpb-element-toolbox__resize-width--${positionIndex}`]: true,
						[`znpb-element-toolbox__resize-dimensions--${
							positionIndex === 'top' || positionIndex === 'bottom' ? 'height' : 'width'
						}`]: true,
					}"
					@mousedown.left.stop="startSizeDrag($event, position)"
				>
					<span class="znpb-element-toolbox__resize-width-bg"></span>
				</div>
			</Tooltip>

			<!-- Paddings -->
			<template v-for="(positions, type) in positions2">
				<div
					v-for="position in positions"
					:key="`${type}-${position}`"
					:class="{
						[`znpb-element-toolbox__resize`]: true,
						[`znpb-element-toolbox__resize-${type}`]: true,
						[`znpb-element-toolbox__resize--${position}`]: true,
						['znpb-element-toolbox__resize--dragging']:
							activeDragType === type && (activeDragPosition === position || reversedPosition === position),
					}"
					@mousedown.left.stop="startSpacingDrag({ event: $event, type, position })"
				>
					<div class="znpb-element-toolbox__resize-value" :style="computedHelpersStyle[position]">
						<span>{{ computedSavedValues[position] }}</span>
					</div>
				</div>
			</template>
		</template>

		<!-- Add new Button -->
		<AddElementIcon :element="element" placement="next" position="middle" />
	</div>
</template>

<script>
// Utils
import { ref, computed } from 'vue';
import rafSchd from 'raf-schd';
import { get } from 'lodash-es';
import { useResponsiveDevices } from '/@/common/composables';
import { Environment } from '/@/common/utils';
import { useUIStore } from '/@/editor/store';

// Components
import ToolboxTitle from './ToolboxTitle.vue';

export default {
	name: 'ElementToolbox',
	components: {
		ToolboxTitle,
	},
	props: {
		element: Object,
		canHideToolbox: {
			type: Boolean,
			required: false,
			default: true,
		},
	},
	setup(props) {
		const UIStore = useUIStore();
		const showColumnTemplates = ref(false);
		const { activeResponsiveDeviceInfo } = useResponsiveDevices();
		const { addEventListener, removeEventListener } = window.zb.editor.useWindows();
		const isToolboxDragging = ref(false);

		const isActiveElementEdit = computed(() => {
			return props.element === UIStore.editedElement;
		});

		return {
			showColumnTemplates,
			activeResponsiveDeviceInfo,
			UIStore,
			addEventListener,
			removeEventListener,
			isActiveElementEdit,
			isToolboxDragging,
		};
	},
	data() {
		return {
			// Active element positions
			computedStyle: null,
			// Dragging
			startClientX: null,
			startClientY: null,
			activeDragPosition: null,
			activeDragType: null,
			reversedPosition: null,

			// Size
			initialSizeValue: null,
			positions2: {
				padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
				margin: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
			},
			styleMap: {
				paddingTop: 'padding-top',
				paddingRight: 'padding-right',
				paddingBottom: 'padding-bottom',
				paddingLeft: 'padding-left',
				marginTop: 'margin-top',
				marginRight: 'margin-right',
				marginBottom: 'margin-bottom',
				marginLeft: 'margin-left',
				width: 'width',
				height: 'height',
			},
			positions: {
				top: 'Top',
				bottom: 'Bottom',
				right: 'Right',
				left: 'Left',
			},
			popperRefValues: {
				clientX: 0,
				clientY: 0,
			},
			popperRef: {
				getBoundingClientRect: () => ({
					top: this.popperRefValues.clientY,
					right: this.popperRefValues.clientX,
					bottom: this.popperRefValues.clientY,
					left: this.popperRefValues.clientX,
					width: 0,
					height: 0,
				}),
			},

			// Columns add
			newValues: null,
			settingEvenPaddingDimensions: null,
			settingEvenMarginsDimensions: null,
			isTopBarOpen: null,
		};
	},
	computed: {
		/**
		 * Returns the saved value for each property defaulting to actual size
		 */
		computedSavedValues() {
			const savedValues = get(
				this.element.options,
				`_styles.wrapper.styles.${this.activeResponsiveDeviceInfo.id}.default`,
				{},
			);

			return {
				paddingTop: savedValues[this.styleMap.paddingTop] || this.computedStyle.paddingTop,
				paddingRight: savedValues[this.styleMap.paddingRight] || this.computedStyle.paddingRight,
				paddingBottom: savedValues[this.styleMap.paddingBottom] || this.computedStyle.paddingBottom,
				paddingLeft: savedValues[this.styleMap.paddingLeft] || this.computedStyle.paddingLeft,
				marginTop: savedValues[this.styleMap.marginTop] || this.computedStyle.marginTop,
				marginRight: savedValues[this.styleMap.marginRight] || this.computedStyle.marginRight,
				marginBottom: savedValues[this.styleMap.marginBottom] || this.computedStyle.marginBottom,
				marginLeft: savedValues[this.styleMap.marginLeft] || this.computedStyle.marginLeft,
				height: savedValues[this.styleMap.height] || this.computedStyle.height,
				width: savedValues[this.styleMap.width] || this.computedStyle.width,
			};
		},
		computedHelpersStyle() {
			const { height, width, ...remainingProperties } = this.styleMap;
			const styles = {};

			Object.keys(remainingProperties).forEach(propertyId => {
				const direction =
					propertyId.indexOf('Top') !== -1 || propertyId.indexOf('Bottom') !== -1 ? 'vertical' : 'horizontal';
				const sizeProperty = direction === 'vertical' ? 'height' : 'width';
				const sizeValue = Math.abs(parseInt(this.computedSavedValues[propertyId]));
				styles[propertyId] = {
					[sizeProperty]: `${sizeValue}px`,
				};
			});

			return styles;
		},
		getPopperPlacement() {
			if (this.activeDragPosition === 'Right') {
				return 'left';
			} else if (this.activeDragPosition === 'Top') {
				return 'bottom';
			} else if (this.activeDragPosition === 'Bottom') {
				return 'top';
			} else return 'right';
		},
		isAnyDragging() {
			return this.UIStore.isElementDragging || this.isToolboxDragging;
		},
		dragDimension() {
			if (this.activeDragPosition === 'Top' || this.activeDragPosition === 'Bottom') {
				return 'vertical';
			}

			return 'horizontal';
		},
	},
	beforeUnmount() {
		this.removeEvents();
	},
	created() {
		this.setComputedStyle();
	},
	methods: {
		startSpacingDrag({ event, type, position }) {
			const { clientX, clientY } = event;
			const controlKey = Environment.isMac ? 'metaKey' : 'ctrlKey';

			// Prevent user selection
			document.body.style.userSelect = 'none';

			// Prevent tooltip from closing
			this.$emit('update:canHideToolbox', false);
			this.$emit('update:isToolboxDragging', true);

			// Set info for dragging
			const startClientX = clientX;
			const startClientY = clientY;
			this.activeDragType = type;
			this.activeDragPosition = position;
			this.isToolboxDragging = true;

			const activeDragValue = this.computedSavedValues[position];
			const match =
				typeof activeDragValue === 'string' && activeDragValue
					? activeDragValue.match(/^([+-]?[0-9]+([.][0-9]*)?|[.][0-9]+)(\D+)$/)
					: null;
			const initialValue = match && match[1] ? parseInt(match[1]) : 0;
			const initialUnit = match ? match[3] : '';

			this.onMouseMoveDebounced = rafSchd(event => {
				let { direction, distance } = this.getDragInfo({
					event,
					type,
					position,
					startClientX,
					startClientY,
				});
				let even = false;

				// Invert the distance
				if (['padding', 'margin'].includes(type) && position.indexOf('Right') !== -1) {
					distance = distance * -1;
				}

				// For percentage values, increment by 0.1
				let updatedValue = initialUnit === '%' ? initialValue + distance * 0.1 : initialValue + distance;

				// Check if the
				if (event.shiftKey) {
					updatedValue = Math.round(updatedValue / 5) * 5;
				}

				// Prevent negative size for paddings
				if (type === 'padding') {
					updatedValue = Math.max(updatedValue, 0);
				}

				// Finally, round the value
				updatedValue = Math.round(updatedValue * 10) / 10;

				// Don't proceed if the values are the same
				if (initialValue === updatedValue) {
					return;
				}

				this.updateElementStyle({
					newValue: `${updatedValue}${initialUnit}`,
					type,
					position,
					even: event[controlKey],
					reversedPosition: event[controlKey] ? this.getReversedPosition(position) : null,
				});

				// Refresh sizes
				this.setComputedStyle();
			});

			this.addEventListener('mousemove', this.onMouseMoveDebounced);
			this.addEventListener('mouseup', this.onMouseUp);
		},
		getReversedPosition(position) {
			const typeAndPosition = position.split(/(?=[A-Z])/);
			const positionLocation = typeAndPosition[1];
			let reversePositionLocation;

			switch (positionLocation) {
				case 'Top':
					reversePositionLocation = 'Bottom';
					break;
				case 'Bottom':
					reversePositionLocation = 'Top';
					break;
				case 'Left':
					reversePositionLocation = 'Right';
					break;
				case 'Right':
					reversePositionLocation = 'Left';
					break;
			}

			return `${typeAndPosition[0]}${reversePositionLocation}`;
		},
		updateElementStyle({ newValue, type, position, even, reversedPosition }) {
			const activeDragCssProperty = this.styleMap[position];

			window.zb.run('editor/elements/update-element-options', {
				elementUID: this.element.uid,
				newValues: newValue,
				path: `_styles.wrapper.styles.${this.activeResponsiveDeviceInfo.id}.default.${activeDragCssProperty}`,
			});

			// If we need to update the opposite position
			if (even) {
				const activeDragReversedCssProperty = this.styleMap[reversedPosition];

				window.zb.run('editor/elements/update-element-options', {
					elementUID: this.element.uid,
					newValues: newValue,
					path: `_styles.wrapper.styles.${this.activeResponsiveDeviceInfo.id}.default.${activeDragReversedCssProperty}`,
				});
			}
		},
		getDragInfo({ event, type, position, startClientX, startClientY }) {
			const direction = position.indexOf('Top') !== -1 || position.indexOf('Bottom') !== -1 ? 'vertical' : 'horizontal';
			let distance = direction === 'vertical' ? event.clientY - startClientY : event.clientX - startClientX;

			return {
				direction,
				distance,
			};
		},
		onMouseUp() {
			// Cancel the scheduler
			this.onMouseMoveDebounced.cancel();

			this.removeEventListener('mousemove', this.onMouseMoveDebounced);
			this.removeEventListener('mouseup', this.onMouseUp);

			// Reset properties
			this.onMouseMoveDebounced = null;
			this.activeDragType = null;
			this.activeDragPosition = null;
			this.isToolboxDragging = false;

			document.body.style.userSelect = null;

			this.$emit('update:canHideToolbox', true);
			this.$emit('update:isToolboxDragging', false);
		},
		setTopBarDisplay(event) {
			this.isTopBarOpen = event;
		},
		getNumberFromString(string) {
			return parseInt(string.match(/\d+/)[0]);
		},
		setComputedStyle() {
			if (this.$parent.$el) {
				this.computedStyle = window.getComputedStyle(this.$parent.$el);
			}
		},
		removeEvents() {
			this.removeEventListener('mousemove', this.changeSizeDebounced);
			this.removeEventListener('mousemove', this.changePaddingWidth);
			this.removeEventListener('mousemove', this.changeMarginWidth);
			this.removeEventListener('mouseup', this.endDragging);
		},
		getSizeChangePropertyFromPosition(position) {
			let propertyToChange = null;

			if (position === 'Top' || position === 'Bottom') {
				propertyToChange = 'min-height';
			} else {
				propertyToChange = 'width';
			}

			return propertyToChange;
		},
		startSizeDrag(event, position, positionIndex) {
			const { clientX, clientY } = event;

			// Prevent toolbox from closing
			this.$emit('update:canHideToolbox', false);
			this.$emit('update:isToolboxDragging', true);

			this.startClientX = clientX;
			this.startClientY = clientY;
			this.popperRefValues = { clientX, clientY };

			this.activeDragPosition = position;
			this.activeDragType = 'size';
			const property = this.getSizeChangePropertyFromPosition(position);
			document.body.style.userSelect = 'none';
			this.initialSizeValue = parseInt(this.getSizeValue(property));

			this.changeSizeDebounced = rafSchd(this.changeSize);

			this.addEventListener('mousemove', this.changeSizeDebounced);
			this.addEventListener('mouseup', this.endDragging);
		},
		getSizeValue(type) {
			// Return min-height
			let value = this.element.getOptionValue(
				`_styles.wrapper.styles.${this.activeResponsiveDeviceInfo.id}.default.${type}`,
			);
			if (value !== null) {
				return value;
			}

			const alternativeType = type === 'min-height' ? 'height' : 'width';

			const sizeValue = this.computedStyle.getPropertyValue(alternativeType);

			return this.getNumberFromString(sizeValue) || 0;
		},
		changeSize(event) {
			const { clientX, clientY } = event;

			// Don't proceed if the mouse is already up
			if (!this.activeDragPosition) {
				return;
			}

			let newValue = null;
			const property = this.getSizeChangePropertyFromPosition(this.activeDragPosition);
			const direction = this.dragDimension === 'vertical' ? 'vertical' : 'horizontal';

			if (direction === 'vertical') {
				const distance = clientY - this.startClientY;
				newValue =
					this.activeDragPosition === 'Top' ? this.initialSizeValue - distance : this.initialSizeValue + distance;
			} else {
				if (this.activeDragPosition === 'Right') {
					const distance = clientX - this.startClientX;
					newValue = distance + this.initialSizeValue;
				} else {
					const distance = this.startClientX - clientX;
					newValue = distance + this.initialSizeValue;
				}
			}

			// Prevent negative values
			if (newValue < 0) {
				newValue = 0;
			}

			this.newValues = newValue;

			window.zb.run('editor/elements/update-element-options', {
				elementUID: this.element.uid,
				newValues: `${newValue}px`,
				path: `_styles.wrapper.styles.${this.activeResponsiveDeviceInfo.id}.default.${property}`,
			});

			// reposition tooltip
			if (this.$refs[`sizeDrag--${this.activeDragPosition}`]) {
				const { bottom, left, top, right } = this.$refs.rectangle.getBoundingClientRect();

				if (this.activeDragPosition === 'Top') {
					this.popperRefValues.clientY = top;
				} else if (this.activeDragPosition === 'Right') {
					this.popperRefValues.clientX = right;
				} else if (this.activeDragPosition === 'Bottom') {
					this.popperRefValues.clientY = bottom;
				} else this.popperRefValues.clientX = left;

				this.$refs[`sizeDrag--${this.activeDragPosition}`][0].scheduleUpdate();
			}
		},
		endDragging() {
			document.body.style.userSelect = null;
			this.startClientX = null;
			this.startClientY = null;
			this.activeDragPosition = null;
			this.popperRef = null;

			// Prevent tooltip from closing
			this.$emit('update:canHideToolbox', true);
			this.$emit('update:isToolboxDragging', false);

			this.settingEvenPaddingDimensions = false;
			this.removeEvents();
		},
	},
};
</script>

<style lang="scss">
.znpb-element-toolbox {
	.znpb-element-toolbox__resize-dimensions {
		z-index: 1001;
		&--width {
			width: 6px;
			height: 100%;
		}
		&--height {
			width: 100%;
			height: 6px;
		}
	}
	.znpb-even-dimensions-horizontal,
	.znpb-even-dimensions-vertical {
		opacity: 1;
	}
}

.znpb-element-toolbox {
	position: absolute;
	top: 0;
	left: 0;
	z-index: 1;
	width: 100%;
	height: 100%;
	font-family: var(--zb-font-stack);
	font-size: 13px;
	font-style: normal;
	line-height: 18px;
	letter-spacing: normal;
	text-decoration: none;
	text-shadow: none;
	text-transform: none;
	outline: 2px solid #006dd2;
	outline-offset: -2px;
	transition: opacity 0.3s;
	pointer-events: none;
	user-select: none;

	&__resize {
		position: absolute;
		z-index: 1000;
		transition: opacity 0.3s;
		opacity: 0;
		pointer-events: all;

		&--dragging {
			z-index: 1000;
			opacity: 1;
			visibility: visible;
		}

		&-value {
			display: flex;
			justify-content: center;
			align-items: center;
			font-family: Roboto, sans-serif;
			font-size: 10px;
			font-style: normal;
			font-weight: 700;
			text-decoration: none;
			text-decoration: none;
			text-shadow: none;
			text-transform: none;

			span {
				padding: 4px;
				line-height: 1;
				background-color: var(--zb-surface-color);
				border-radius: 3px;
			}
		}
		&-width {
			position: absolute;
			z-index: 1000;
			pointer-events: all;

			&-bg {
				position: absolute;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				margin: 0 auto;
			}

			&--top {
				top: 2px;
				left: -1px;
				width: calc(100% + 2px);
				height: 6px;
				transform: translateY(-50%);
				cursor: row-resize;

				&:hover {
					width: 100%;
					padding: 3px;
					.znpb-element-toolbox__resize-width-bg {
						height: 6px;
					}
				}
				.znpb-element-toolbox__resize-width-bg {
					width: 100%;
					height: 2px;
					transition: height 0.3s;
				}
			}
			&--right {
				top: 0;
				right: 0;
				width: 6px;
				height: 100%;
				transform: translateX(50%);
				cursor: col-resize;

				&:hover {
					padding: 3px;
					.znpb-element-toolbox__resize-width-bg {
						width: 6px;
					}
				}
				.znpb-element-toolbox__resize-width-bg {
					width: 2px;
					height: 100%;
					transition: width 0.3s;
				}
			}
			&--bottom {
				bottom: -2px;
				left: -1px;
				width: calc(100% + 2px);
				min-height: 6px;
				transform: translateY(50%);
				cursor: row-resize;

				&:hover {
					padding: 3px;
					.znpb-element-toolbox__resize-width-bg {
						height: 6px;
					}
				}
				.znpb-element-toolbox__resize-width-bg {
					width: 100%;
					height: 2px;
					transition: height 0.3s;
				}
			}
			&--left {
				top: 0;
				left: 0;
				min-width: 6px;
				height: 100%;
				transform: translateX(-50%);
				cursor: col-resize;

				&:hover {
					padding: 3px;
					.znpb-element-toolbox__resize-width-bg {
						width: 6px;
					}
				}
				.znpb-element-toolbox__resize-width-bg {
					width: 2px;
					height: 100%;
					transition: width 0.3s;
				}
			}
		}

		&--paddingTop {
			top: 0;
			left: 0;
			width: 100%;
			cursor: n-resize;

			& .znpb-element-toolbox__resize-value {
				top: 0;
				left: 0;
				width: 100%;
			}

			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) & .znpb-element-toolbox__resize-value {
				min-height: 10px;
			}
		}

		&--paddingBottom {
			bottom: 0;
			left: 0;
			width: 100%;
			cursor: n-resize;

			& .znpb-element-toolbox__resize-value {
				bottom: 0;
				left: 0;
				width: 100%;
			}

			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) & .znpb-element-toolbox__resize-value {
				min-height: 10px;
			}
		}

		&--paddingRight {
			top: 0;
			right: 0;
			height: 100%;
			cursor: e-resize;

			& .znpb-element-toolbox__resize-value {
				top: 0;
				right: 0;
				height: 100%;
			}

			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) & .znpb-element-toolbox__resize-value {
				min-width: 10px;
			}
		}

		&--paddingLeft {
			top: 0;
			left: 0;
			height: 100%;
			cursor: e-resize;

			& .znpb-element-toolbox__resize-value {
				top: 0;
				left: 0;
				height: 100%;
			}
			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) & .znpb-element-toolbox__resize-value {
				min-width: 10px;
			}
		}

		&--marginTop {
			bottom: 100%;
			left: 0;
			width: 100%;
			cursor: n-resize;

			& .znpb-element-toolbox__resize-value {
				top: 0;
				left: 0;
				width: 100%;
			}

			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) & .znpb-element-toolbox__resize-value {
				min-height: 10px;
			}
		}

		&--marginBottom {
			top: 100%;
			left: 0;
			width: 100%;
			cursor: n-resize;

			& .znpb-element-toolbox__resize-value {
				top: 0;
				left: 0;
				width: 100%;
			}

			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) & .znpb-element-toolbox__resize-value {
				min-height: 10px;
			}
		}

		&--marginRight {
			top: 0;
			left: 100%;
			height: 100%;
			cursor: e-resize;

			& .znpb-element-toolbox__resize-value {
				top: 0;
				right: 0;
				height: 100%;
			}

			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) & .znpb-element-toolbox__resize-value {
				min-width: 10px;
			}
		}

		&--marginLeft {
			top: 0;
			right: 100%;
			height: 100%;
			cursor: e-resize;

			& .znpb-element-toolbox__resize-value {
				top: 0;
				left: 0;
				height: 100%;
			}
			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) & .znpb-element-toolbox__resize-value {
				min-width: 10px;
			}
		}

		&-padding {
			& .znpb-element-toolbox__resize-value {
				display: flex;
				justify-content: center;
				align-items: center;
				color: #fff;
				text-decoration: none;
				text-shadow: none;
				text-transform: none;
				background-color: rgba(6, 190, 225, 0.2);

				span {
					background-color: #06bee1;
				}
			}

			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) &:hover,
			&-Top--dragging &--top,
			&-Bottom--dragging &--bottom,
			&-Right--dragging &--right,
			&-Left--dragging &--left {
				z-index: 1000;
				opacity: 1;
				visibility: visible;
			}
		}

		&-margin {
			& .znpb-element-toolbox__resize-value {
				display: flex;
				justify-content: center;
				align-items: center;
				color: #fff;
				background-color: rgba(249, 149, 45, 0.2);

				span {
					background-color: #f9952d;
				}
			}

			.znpb-element-toolbox:not(.znpb-element-toolbox--dragging) &:hover,
			&-Top--dragging &--top,
			&-Bottom--dragging &--bottom,
			&-Right--dragging &--right,
			&-Left--dragging &--left {
				z-index: 1;
				opacity: 1;
				visibility: visible;
			}
		}
	}

	&--loopProvider {
		outline-color: #14ae5c;

		& .znpb-element-toolbox__titleWrapper {
			background-color: #14ae5c;
		}

		& .znpb-element-toolbox__add-element-button::before {
			background-color: #14ae5c;
		}
	}

	&--loopConsumer {
		outline-color: #eda926;

		& .znpb-element-toolbox__titleWrapper {
			background-color: #eda926;
		}

		& .znpb-element-toolbox__add-element-button::before {
			background-color: #eda926;
		}
	}
}

.znpb-sizing-label {
	padding: 4px;
	color: #464646;
	font-size: 11px;
	font-weight: 700;
	line-height: 1;
	background-color: #fff;
	box-shadow: 0 2px 15px 0 rgba(0, 0, 0, 0.1);
	border-color: #f1f1f1;
}
</style>
