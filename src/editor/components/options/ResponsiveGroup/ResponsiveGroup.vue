<template>
	<OptionsForm
		v-model="computedModelValue"
		class="znpb-option--responsive-group"
		:schema="computedChildOptionsSchema"
	/>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, computed } from 'vue';
import { useResponsiveDevices, usePseudoSelectors } from '/@/common/composables';
import { get } from 'lodash-es';

const {
	activeResponsiveDeviceInfo,
	setActiveResponsiveOptions,
	removeActiveResponsiveOptions,
	orderedResponsiveDevices,
} = useResponsiveDevices();

const { activePseudoSelector } = usePseudoSelectors();

// Props
const props = defineProps<{
	modelValue?: Record<string, unknown>;
	// eslint-disable-next-line vue/prop-name-casing -- This comes form PHP and cannot be changed to camelCase
	child_options?: Record<string, unknown>;
}>();

// Emits
const emit = defineEmits(['update:modelValue']);

const computedChildOptionsSchema = computed(() => {
	if (activeResponsiveDeviceInfo.value.id !== 'default') {
		return applyPlaceholders(JSON.parse(JSON.stringify(props.child_options)));
	} else {
		return props.child_options;
	}
});

function applyPlaceholders(schema, existingPath = '') {
	const newSchema = {};

	Object.keys(schema).forEach(singleOptionId => {
		const singleOptionSchema = schema[singleOptionId];
		let newPath = existingPath;

		if (singleOptionSchema.child_options) {
			singleOptionSchema.child_options = applyPlaceholders(singleOptionSchema.child_options, newPath);
		}

		if (!singleOptionSchema.is_layout) {
			newPath = existingPath ? existingPath + '.' + singleOptionSchema.id : singleOptionId;
			const higherValue = getHigherResponsiveDeviceValue(newPath);

			if (higherValue !== null) {
				singleOptionSchema.placeholder = higherValue;
			}
		} else {
			const higherValue = getHigherResponsiveDeviceValue(existingPath, true);

			if (higherValue !== null) {
				singleOptionSchema.placeholder = higherValue;
			}
		}

		newSchema[singleOptionId] = singleOptionSchema;
	});

	return newSchema;
}

function getHigherResponsiveDeviceValue(schemaPath, isLayout = false) {
	let newValue = null;
	let oldValue = {};

	Object.keys(orderedResponsiveDevices.value).forEach(index => {
		const deviceInfo = orderedResponsiveDevices.value[index];
		let fullPath;

		if (schemaPath.length > 0) {
			fullPath = `${deviceInfo.id}.${activePseudoSelector.value.id}.${schemaPath}`;
		} else {
			fullPath = `${deviceInfo.id}.${activePseudoSelector.value.id}`;
		}
		if (deviceInfo.id === 'default' || deviceInfo.width > activeResponsiveDeviceInfo.value.width) {
			const tempNewValue = get(props.modelValue, fullPath, null);

			if (tempNewValue !== null) {
				if (isLayout) {
					newValue = Object.assign({}, oldValue, tempNewValue || {});
				} else {
					newValue = tempNewValue;
				}
			}

			oldValue = newValue;
		}
	});

	return newValue;
}

const computedModelValue = computed({
	get() {
		return (props.modelValue || {})[activeResponsiveDeviceInfo.value.id] || {};
	},
	set(newValue) {
		const clonedValue = { ...props.modelValue };
		// Check if we actually need to delete the option
		if (newValue === null && typeof clonedValue[activeResponsiveDeviceInfo.value.id]) {
			// If this is used as layout, we need to delete the active pseudo selector
			delete clonedValue[activeResponsiveDeviceInfo.value.id];
		} else {
			clonedValue[activeResponsiveDeviceInfo.value.id] = newValue;
		}

		// Send the updated value back
		emit('update:modelValue', clonedValue);
	},
});

function removeDeviceStyles(deviceID: string) {
	const clonedValues = { ...props.modelValue };
	delete clonedValues[deviceID];

	emit('update:modelValue', clonedValues);
}

const computedAllModelValue = computed(() => props.modelValue);

// Lifecycle
onMounted(() =>
	setActiveResponsiveOptions({
		modelValue: computedAllModelValue,
		removeDeviceStyles,
	}),
);

onBeforeUnmount(() => removeActiveResponsiveOptions());
</script>
<style lang="scss">
.znpb-options-form-wrapper.znpb-option--responsive-group {
	flex: 1;
	padding: 0;
}
</style>
