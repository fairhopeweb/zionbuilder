<template>
	<div class="znpb-column-size">
		<div class="znpb-column-size-options">
			<div
				v-for="(option, index) in options"
				:key="index"
				class="znpb-column-size__option"
				:style="{ flex: option.name === 'auto' ? `0 0 ${100}%` : 1 }"
				:class="{
					'znpb-column-size__option--active': option.id === valueModel,
				}"
				@click="valueModel = option.id"
			>
				{{ option.name }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ColumnSize',
	props: {
		options: {
			type: Array,
		},
		modelValue: {
			type: [String, Number],
			required: false,
		},
	},
	computed: {
		valueModel: {
			get() {
				return this.modelValue;
			},
			set(newValue) {
				this.$emit('update:modelValue', newValue);
			},
		},
	},
	methods: {},
};
</script>

<style lang="scss">
.znpb-column-size-options {
	display: flex;
	flex-wrap: wrap;
	overflow: hidden;
	padding: 3px;
	background-color: var(--zb-surface-lighter-color);
	border-radius: 3px;
}
.znpb-column-size__option {
	padding: 15px 0;
	font-size: 13px;
	font-weight: 500;
	text-align: center;
	border-radius: 2px;
	cursor: pointer;

	&:hover {
		color: var(--zb-surface-text-active-color);
		background-color: var(--zb-surface-lightest-color);
	}
}
.znpb-column-size__option--active {
	color: var(--zb-secondary-text-color);
	background-color: var(--zb-secondary-color);

	&:hover {
		color: var(--zb-secondary-text-color);
		background-color: var(--zb-secondary-color);
	}
}
</style>
