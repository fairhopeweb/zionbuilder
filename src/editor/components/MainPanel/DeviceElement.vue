<template>
	<a
		class="znpb-device__item"
		:class="{ 'znpb-device__item--active': isActiveDevice }"
		@click.stop="changeDevice"
		@mousedown.stop=""
	>
		<div class="znpb-device__item-content">
			<Icon :icon="deviceConfig.icon" class="znpb-device__item-icon"></Icon>
			<span class="znpb-device__item-name">
				<template v-if="deviceConfig.name"> {{ deviceConfig.name }} - </template>

				<template v-if="deviceConfig.id === 'default'"> ({{ translate('all_devices') }}) </template>

				<template v-else>
					{{ translate('max') }}
					<span class="znpb-device__itemValue">
						<template v-if="isEdited">
							<span class="znpb-device__itemValue-inner">
								<input
									ref="widthInput"
									type="number"
									class="znpb-device__itemValueInput"
									:value="deviceConfig.width"
									@keydown.enter="updateWidth"
									@blur="updateWidth"
								/>
								px
							</span>
						</template>
						<template v-else> {{ deviceConfig.width }}px </template>
					</span>
				</template>
			</span>
			<ChangesBullet
				v-if="hasChanges && !allowEdit"
				:discard-changes-title="discardChangesTitle"
				@remove-styles="removeStylesGroup"
			/>

			<div v-if="allowEdit" class="znpb-device__item-actions">
				<template v-if="isEdited">
					<Icon
						v-znpb-tooltip="translate('save')"
						icon="check"
						class="znpb-device__item-action"
						@click.stop="updateWidth"
					/>
					<Icon
						v-znpb-tooltip="translate('cancel')"
						icon="close"
						class="znpb-device__item-action"
						@click.stop="$emit('edit-breakpoint', null)"
					/>
				</template>
				<template v-else>
					<Icon
						v-if="!deviceConfig.isDefault"
						v-znpb-tooltip="translate('edit_breakpoint')"
						icon="edit"
						class="znpb-device__item-action"
						@click.stop="$emit('edit-breakpoint', deviceConfig)"
					/>
					<Icon
						v-if="!deviceConfig.builtIn"
						v-znpb-tooltip="translate('delete_breakpoint')"
						icon="delete"
						class="znpb-device__item-action"
						@click.stop="deleteBreakpoint(deviceConfig.id)"
					/>
				</template>
			</div>
		</div>
	</a>
</template>

<script lang="ts" setup>
import { computed, ref, nextTick, watch } from 'vue';
import { useResponsiveDevices, type ResponsiveDevice } from '/@/common/composables';
import { doAction } from '/@/common/modules/hooks';
import { translate } from '/@/common/modules/i18n';

const props = withDefaults(
	defineProps<{
		deviceConfig: ResponsiveDevice;
		allowEdit: boolean;
		editedBreakpoint?: ResponsiveDevice | null;
	}>(),
	{
		editedBreakpoint: () => {
			return null;
		},
	},
);

const emit = defineEmits(['edit-breakpoint']);

const {
	activeResponsiveDeviceInfo,
	setActiveResponsiveDeviceId,
	getActiveResponsiveOptions,
	deleteBreakpoint,
	updateBreakpoint,
} = useResponsiveDevices();
const isEdited = computed(() => {
	return props.editedBreakpoint === props.deviceConfig;
});

const widthInput = ref<HTMLInputElement | null>(null);

const discardChangesTitle = computed(() => {
	return translate('discard_changes_for') + ' ' + props.deviceConfig.name;
});

const isActiveDevice = computed(() => {
	return props.deviceConfig.id === activeResponsiveDeviceInfo.value.id;
});

const hasChanges = computed(() => {
	const activeDeviceConfig = getActiveResponsiveOptions();

	if (!activeDeviceConfig) {
		return false;
	}

	const modelValue = activeDeviceConfig.modelValue;

	return (modelValue && modelValue && modelValue[props.deviceConfig.id]) || false;
});

function changeDevice() {
	if (activeResponsiveDeviceInfo.value.id !== props.deviceConfig.id) {
		// Set a new active device
		setActiveResponsiveDeviceId(props.deviceConfig.id);
	}
}
function removeStylesGroup() {
	const activeDeviceConfig = getActiveResponsiveOptions();
	if (activeDeviceConfig) {
		activeDeviceConfig.removeDeviceStyles(props.deviceConfig.id);
	}
}

watch(isEdited, newValue => {
	if (newValue) {
		nextTick(() => {
			if (widthInput.value) {
				widthInput.value.focus();
				widthInput.value.select();
			}
		});
	}
});

function updateWidth() {
	const oldValue = props.deviceConfig.width;
	if (!widthInput.value) {
		return;
	}
	const newValue = parseInt(widthInput.value.value) < 240 ? 240 : parseInt(widthInput.value.value);
	// Don't allow values lower than 240px
	updateBreakpoint(props.deviceConfig, newValue);

	// Close edit mode
	emit('edit-breakpoint', null);
	doAction('zionbuilder/responsive/change_device_width', props.deviceConfig, newValue, oldValue);
}
</script>

<style lang="scss">
.znpb-device__item {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	&-name {
		margin-top: -1px;
		margin-right: auto;
	}
	&Value {
		position: relative;

		&-inner {
			position: absolute;
			margin-top: -7px;
			margin-left: 4px;
		}

		&Input {
			max-width: 55px;
			padding: 4.5px 8px;
			color: var(--zb-input-text-color);
			font-family: var(--zb-font-stack);
			font-size: 13px;
			font-weight: 500;
			line-height: 1;
			background-color: var(--zb-input-bg-color);
			border: 2px solid var(--zb-input-border-color);
			border-radius: 3px;

			-moz-appearance: textfield;
			appearance: textfield;

			&::-webkit-inner-spin-button,
			&::-webkit-outer-spin-button {
				-webkit-appearance: none;
				appearance: none;
			}

			&:focus {
				outline: 0;
			}
		}
	}
	&-content {
		display: flex;
		align-items: center;
		min-height: 20px;
		transition: all 0.3s;
	}
	&-icon {
		margin-right: 5px;
	}
	&-has-changes {
		display: flex;
		align-items: center;
		margin-left: 5px;
		.znpb-options-has-changes-wrapper {
			&__delete {
				font-size: 7px !important;
			}
		}
	}

	&--active {
		span {
			color: var(--zb-surface-text-active-color);
		}
	}

	&-actions {
		display: flex;
	}

	&-action {
		margin-left: 8px;
		font-size: 12px;
		opacity: 0.5;

		&:hover {
			opacity: 1;
		}
	}
}
</style>
