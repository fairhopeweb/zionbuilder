<!-- Not used component -->
<template>
	<div class="znpb-input-border-radius-tabs-wrapper">
		<Tabs tab-style="group" class="znpb-input-border-radius-tabs">
			<Tab v-for="(tab, index) in borderRadiusTabs" :key="index" :name="tab.name">
				<!-- @slot title for Radius -->
				<template #title>
					<div>
						<!-- <template v-slot:reference>
							<Icon
								:icon="tab.icon"
							/>
						</template> -->
					</div>
				</template>
				<InputBorderRadius
					:title="tab.name"
					:modelValue="computedValue[tab.id] || null"
					@update:modelValue="onValueUpdated(tab.id, $event)"
				>
				</InputBorderRadius>
			</Tab>
		</Tabs>
	</div>
</template>
<script>
import Icon from '../Icon/Icon.vue';
import InputBorderRadius from './InputBorderRadius.vue';

export default {
	name: 'InputBorderRadiusTabs',
	components: {
		InputBorderRadius,
		Icon,
	},
	props: {
		/**
		 * v-model/modelValue for border radius
		 */
		modelValue: {
			default() {
				return {};
			},
			type: Object,
			required: false,
		},
	},
	data() {
		return {
			borderRadiusTabs: {
				all: {
					name: 'all borders',
					icon: 'all-corners',
					id: 'all-borders-radius',
					description: 'All borders',
				},
				topLeft: {
					name: 'top left',
					icon: 't-l-corner',
					id: 'border-top-left-radius',
					description: 'Top Left Border',
				},
				topRight: {
					name: 'top right',
					icon: 't-r-corner',
					id: 'border-top-right-radius',
					description: 'Top Right Border',
				},
				bottomRight: {
					name: 'bottom right',
					icon: 'b-r-corner',
					id: 'border-bottom-right-radius',
					description: 'Bottom Right Border',
				},
				bottomLeft: {
					name: 'bottom left',
					icon: 't-l-corner',
					id: 'border-bottom-left-radius',
					description: 'Bottom Left Border',
				},
			},
		};
	},

	computed: {
		computedValue() {
			return this.modelValue || {};
		},
	},
	methods: {
		onValueUpdated(position, newValue) {
			/**
			 * emits new object with new value of borders
			 */
			this.$emit('update:modelValue', {
				...this.modelValue,
				[position]: newValue,
			});
		},
	},
};
</script>
<style lang="scss">
.znpb-input-border-radius-tabs > .znpb-tabs__content {
	padding-top: 15px;
}
</style>
