<template>
	<Tabs tab-style="group" class="znpb-background-option-tabs" title-position="center">
		<Tab name="background-color" tooltip-title="Background color">
			<template #title>
				<Icon icon="drop" />
			</template>
			<!-- <InputBackgroundColor
				:modelValue="valueModel['background-color']"
				:delete-value="onDeleteOption"
				@update:modelValue="onOptionUpdate('background-color', $event)"
			/> -->

			<OptionWrapper
				:schema="bgColorSchema"
				:option-id="bgColorSchema.id"
				:modelValue="valueModel['background-color']"
				:delete-value="onDeleteOption"
				@update:modelValue="onOptionUpdate(...$event)"
			/>
		</Tab>
		<Tab name="background-gradient" tooltip-title="Background gradient">
			<template #title>
				<Icon icon="gradient" />
			</template>
			<OptionWrapper
				:schema="bgGradientSchema"
				:option-id="bgGradientSchema.id"
				:modelValue="valueModel['background-gradient']"
				:delete-value="onDeleteOption"
				@update:modelValue="onOptionUpdate(...$event)"
			/>
		</Tab>
		<Tab name="background-image" tooltip-title="Background image">
			<template #title>
				<Icon icon="picture" />
			</template>
			<InputBackgroundImage
				class="znpb-input__background-image"
				:modelValue="valueModel"
				@update:modelValue="onOptionUpdate(false, $event)"
			/>
		</Tab>
		<Tab v-if="canShowBackground" name="background-video" tooltip-title="Background video">
			<template #title>
				<Icon icon="video" />
			</template>
			<InputBackgroundVideo
				class="znpb-input__background-video"
				:modelValue="valueModel['background-video']"
				@update:modelValue="onOptionUpdate('background-video', $event)"
			/>
		</Tab>
	</Tabs>
</template>

<script>
import { computed } from 'vue';
import { useResponsiveDevices, usePseudoSelectors } from '/@/common/composables';

// Components
import { BackgroundColor as InputBackgroundColor } from '../BackgroundColor';

export default {
	name: 'Background',
	components: {
		InputBackgroundColor,
	},
	inject: {
		panel: {
			default: null,
		},
	},
	props: {
		modelValue: {},
		placeholder: {
			type: Object,
			required: false,
			default: {},
		},
	},
	setup(props, { emit }) {
		const { activeResponsiveDeviceInfo } = useResponsiveDevices();
		const { activePseudoSelector } = usePseudoSelectors();

		const valueModel = computed({
			get() {
				return props.modelValue || {};
			},
			set(newValue) {
				emit('update:modelValue', newValue);
			},
		});

		const canShowBackground = computed(
			() => activeResponsiveDeviceInfo.value.id === 'default' && activePseudoSelector.value.id === 'default',
		);

		const bgColorSchema = computed(() => {
			return {
				id: 'background-color',
				type: 'background_color',
				placeholder: props.placeholder ? props.placeholder['background-color'] : null,
			};
		});

		return {
			activeResponsiveDeviceInfo,
			activePseudoSelector,
			valueModel,
			canShowBackground,
			bgColorSchema,
		};
	},

	data() {
		return {
			bgGradientSchema: {
				id: 'background-gradient',
				type: 'background_gradient',
			},
		};
	},
	methods: {
		onDeleteOption(optionId) {
			const newValues = {
				...this.modelValue,
			};

			delete newValues[optionId];
			this.valueModel = newValues;
		},
		onOptionUpdate(optionId, newValue) {
			const clonedValue = { ...this.modelValue };
			if (optionId) {
				if (newValue === null) {
					// If this is used as layout, we need to delete the active pseudo selector
					delete clonedValue[optionId];
				} else {
					clonedValue[optionId] = newValue;
				}

				this.valueModel = clonedValue;
			} else {
				if (newValue === null) {
					this.$emit('update:modelValue', null);
				} else {
					this.valueModel = newValue;
				}
			}
		},
	},
};
</script>

<style lang="scss">
.znpb-background-option-tabs {
	margin-left: 5px;
	margin-right: 5px;

	.znpb-tabs__header {
		&-item {
			display: flex;
			justify-content: center;
			align-items: center;
			flex-grow: 1;

			&--active {
				color: var(--zb-secondary-text-color);
				background: var(--zb-secondary-color);
			}
		}
	}
	.znpb-input__background-image {
		.znpb-forms-input-wrapper {
			padding: 0;
		}
	}
	.znpb-input__background-video {
		.znpb-forms-input-wrapper {
			padding: 0;
		}
	}

	.znpb-input-type--background_gradient,
	.znpb-input-type--background_color {
		padding-left: 0;
		padding-right: 0;
	}
}

.znpb-input-type--background {
	padding: 0;
}
</style>
