<template>
	<Tooltip
		:key="UIStore.activeElementMenu.rand"
		tooltip-class="hg-popper--big-arrows znpb-rightClickMenu__Tooltip"
		placement="auto"
		:show="true"
		append-to="body"
		trigger="click"
		:close-on-outside-click="true"
		:close-on-escape="true"
		:popper-ref="UIStore.activeElementMenu.selector"
		@hide="UIStore.hideElementMenu"
	>
		<template #content>
			<Menu :actions="elementActions" @action="UIStore.hideElementMenu" />
		</template>
	</Tooltip>
</template>

<script lang="ts" setup>
import { watch, computed } from 'vue';
import { get } from 'lodash-es';
import { translate } from '/@/common/modules/i18n';

import { Environment } from '/@/common/utils';
import { useContentStore, useUIStore, useUserStore } from '/@/editor/store';
import { useWindows, useElementActions, useLocalStorage, useSaveTemplate } from '../../composables';

const UIStore = useUIStore();
const userStore = useUserStore();
const { addEventListener, removeEventListener } = useWindows();
const { getData } = useLocalStorage();

const controlKey = Environment.isMac ? '⌘' : '⌃';

const { copyElement, pasteElement, copiedElement, pasteElementStyles, pasteElementClasses } = useElementActions();

// Computed
const elementActions = computed(() => {
	const element = UIStore.activeElementMenu.element;
	const contentStore = useContentStore();
	const isElementVisible = contentStore.getElementValue(element.uid, 'options._isVisible', true);

	return [
		{
			title: `${translate('action_edit')} ${contentStore.getElementName(element)}`,
			icon: 'edit',
			action: () => {
				UIStore.editElement(element);
			},
			cssClasses: 'znpb-menu-item--separator-bottom',
		},
		{
			title: `${translate('duplicate_element')}`,
			icon: 'copy',
			action: () => {
				element.duplicate();
			},
			append: `${controlKey}+D`,
			disabled: !userStore.permissions.only_content,
		},
		{
			title: `${translate('copy_element')}`,
			icon: 'copy',
			action: () => {
				copyElement(element);
			},
			append: `${controlKey}+C`,
			disabled: !userStore.permissions.only_content,
		},
		{
			title: `${translate('cut_element')}`,
			icon: 'close',
			action: () => {
				copyElement(element, 'cut');
			},
			append: `${controlKey}+X`,
			disabled: !userStore.permissions.only_content,
		},
		{
			title: `${translate('paste_element')}`,
			icon: 'paste',
			action: () => {
				pasteElement(element);
			},
			append: `${controlKey}+V`,
			show: hasCopiedElement.value,
			disabled: !userStore.permissions.only_content,
		},
		{
			title: translate('paste_element_styles'),
			icon: 'drop',
			action: () => {
				pasteElementStyles(element);
			},
			append: `${controlKey}+⇧+V`,
			show: hasCopiedElementStyles.value,
			disabled: !userStore.permissions.only_content,
		},
		{
			title: translate('paste_classes'),
			icon: 'braces',
			action: () => {
				pasteElementClasses(element);
			},
			show: hasCopiedElementClasses.value,
			disabled: !userStore.permissions.only_content,
		},
		{
			title: translate('save_element'),
			icon: 'check',
			action: () => {
				saveElement(element);
			},
			disabled: !userStore.permissions.only_content,
		},
		{
			title: isElementVisible ? translate('visible_element') : translate('show_element'),
			icon: 'eye',
			action: () => {
				element.isVisible = !isElementVisible;
			},
			append: `${controlKey}+H`,
			cssClasses: 'znpb-menu-item--separator-bottom',
			disabled: !userStore.permissions.only_content,
		},
		{
			title: translate('wrap_with_container'),
			icon: 'eye',
			action: () => {
				element.wrapIn();
			},
			append: `${controlKey}+H`,
			cssClasses: 'znpb-menu-item--separator-bottom',
			disabled: !userStore.permissions.only_content,
		},
		{
			title: translate('discard_element_styles'),
			icon: 'drop',
			action: () => {
				discardElementStyles(element);
			},
			show: element && Object.keys(get(element.options, '_styles', {})).length > 0,
			disabled: !userStore.permissions.only_content,
		},
		{
			title: translate('delete_element'),
			icon: 'delete',
			action: () => element.delete(),
			append: `⌦`,
			disabled: !userStore.permissions.only_content,
		},
	];
});

watch(UIStore.activeElementMenu, newValue => {
	if (newValue) {
		addEventListener('scroll', UIStore.hideElementMenu);
	} else {
		removeEventListener('scroll', UIStore.hideElementMenu);
	}
});

function discardElementStyles(element) {
	window.zb.run('editor/elements/discard-element-styles', {
		element,
	});
}

function saveElement(element) {
	const { showSaveElement } = useSaveTemplate();

	showSaveElement(element, 'block');
}

const hasCopiedElement = computed(() => {
	return !!(copiedElement.value.element || getData('copiedElement'));
});

const hasCopiedElementClasses = computed(() => {
	return !!getData('copiedElementClasses');
});

const hasCopiedElementStyles = computed(() => {
	return !!getData('copiedElementStyles');
});
</script>
<style lang="scss">
.znpb-element-options {
	&__dropdown-icon {
		padding: 15px;
	}

	&__options-container {
		position: relative;
		position: absolute;
		top: 100%;
		right: 0;
		z-index: 9999;
		width: 172px;
		padding: 12px 0;
		margin-top: -1px;
		text-align: left;
		list-style-type: none;
		background: var(--zb-surface-color);
		box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.08);
		border-radius: 3px;
		transition: all 0.5s;
		user-select: none;

		li {
			min-width: 172px;
			padding: 12px 29px;
			color: var(--zb-surface-text-color);
			font-size: 12px;
			line-height: 14px;
			transition: color 0.2s ease;
			&:hover {
				color: var(--zb-surface-text-active-color);
				cursor: pointer;
			}
		}
	}
}

.list-enter-to,
.list-leave-from {
	transition: all 0.2s;
}

.list-enter-from,
.list-leave-to {
	transform: translateY(10%);
	opacity: 0;
}

.znpb-rightClickMenu__Tooltip {
	padding: 0;
}
</style>
