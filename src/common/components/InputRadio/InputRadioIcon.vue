<template>
	<label
		class="znpb-radio-icon-item"
		:class="{
			'znpb-radio-icon-item--active': isSelected
		}"
	>
		<input
			v-model="radioButtonValue"
			:modelValue="optionValue"
			type="radio"
			class="znpb-form__input-toggle"
		>
		<Icon
			v-if="icon"
			:icon="icon"
			:bg-size="bgSize"
			class="znpb-radio-icon-item__icon"
		/>
		{{label}}
	</label>
</template>

<script>
import { Icon } from '../Icon'

export default {
	name: 'InputRadioIcon',
	components: {
		Icon
	},
	props: {
		/**
		 * Value of the radio input
		 */
		modelValue: {
			type: String,
			required: false
		},
		/**
		 * Label for each radio
		 */
		label: {
			type: String,
			required: false
		},
		/**
		 * Value received
		 */
		optionValue: {
			type: String,
			required: true
		},
		/**
		 * Icon name
		 */
		icon: {
			type: String,
			required: false
		},
		bgSize: {
			type: Number,
			required: false,
			default: 32
		}
	},
	data () {
		return {
			checked: ''
		}
	},
	computed: {
		radioButtonValue: {
			get: function () {
				return this.modelValue
			},
			set: function () {
				/**
				 * Emits new radio
				 */
				this.$emit('update:modelValue', this.optionValue)
			}
		},
		isSelected () {
			return this.modelValue === this.optionValue
		}
	},
	methods: {

	}
}
</script>
<style lang="scss">
.znpb-radio-icon-item {
	display: flex;
	justify-content: center;
	align-items: center;
	color: var(--zb-surface-icon-color);
	background-color: var(--zb-surface-lighter-color);
	transition: all 0.3s;
	cursor: pointer;

	fill: var(--zb-surface-icon-color);

	&:first-child {
		border-bottom-left-radius: 3px;
		border-top-left-radius: 3px;
	}

	&:last-child {
		border-top-right-radius: 3px;
		border-bottom-right-radius: 3px;
	}

	&--active,
	&:hover {
		background-color: var(--zb-secondary-color);

		.znpb-radio-icon-item__icon {
			color: var(--zb-secondary-text-color);
		}
	}

	input {
		display: none;
		padding: 0;
		margin: 0;

		-webkit-appearance: none;
	}
}
</style>
