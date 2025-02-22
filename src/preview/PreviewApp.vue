<template>
	<div class="zb" :class="previewAppClasses">
		<SortableContent v-if="element" class="znpb-preview-page-wrapper" :element="element" />

		<PageStyles
			:css-classes="cssClasses.CSSClasses"
			:page-settings-model="pageSettings.settings"
			:page-settings-schema="getSchema('pageSettingsSchema')"
		/>

		<ElementStyles :styles="pageSettings.settings._custom_css || ''" />
	</div>
</template>
<script lang="ts" setup>
import { computed, watch } from 'vue';
import PageStyles from './components/PageStyles.vue';
import ElementStyles from './components/ElementStyles.vue';
import SortableContent from './components/SortableContent.vue';
import { useOptionsSchemas } from '/@/common/composables';
import { doAction, applyFilters } from '/@/common/modules/hooks';

import { useUIStore, usePageSettingsStore, useCSSClassesStore, useContentStore } from '../editor/store';

const { getSchema } = useOptionsSchemas();
const cssClasses = useCSSClassesStore();
const UIStore = useUIStore();
const elementsStore = useContentStore();
const pageSettings = usePageSettingsStore();

const element = computed(() => {
	return elementsStore.getElement(window.ZnPbInitialData.page_id);
});

watch(
	() => UIStore.isPreviewMode,
	newValue => {
		if (newValue) {
			window.document.body.classList.add('znpb-editor-preview--active');
		} else {
			window.document.body.classList.remove('znpb-editor-preview--active');
		}
	},
);

// Allow other to hook into setup
doAction('zionbuilder/preview/app/setup');

const previewAppClasses = computed(() => {
	return applyFilters('zionbuilder/preview/app/css_classes', window.ZnPbInitialData?.preview_app_css_classes);
});
</script>

<style lang="scss">
// @import "@/scss/preview.scss";
.znpb-editor-preview {
	overflow-x: hidden;
}

.znpb-editor-preview--active {
	& .zb-element,
	& .zb-element:hover {
		cursor: initial;
	}
}

.hg-popper {
	ul {
		// padding: 0;
		margin: 0;
		list-style-type: none;
		li {
			margin: 0;
			line-height: 1;
		}
	}
}

.zion-tour {
	position: relative;
	&:after {
		content: '' !important;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 9999999;
		display: block !important;
		width: 100%;
		height: 100%;
		border: 3px solid var(--zb-surface-color);
		animation-duration: 1.5s;
		animation-iteration-count: infinite;
		animation-name: scaleInfinit;
		animation-timing-function: ease;
	}
	&.znpb-columns-templates__icons--full {
		&:after {
			border-color: var(--zb-secondary-color);
		}
	}
	&.znpb-element__wrapper {
		&:after {
			display: block;
			border-color: var(--zb-secondary-color);
		}
	}
	&.znpb-empty-placeholder__tour-icon {
		&:after {
			border-color: var(--zb-secondary-color);
			border-radius: 50%;
		}
	}
	&.znpb-empty-placeholder {
		&:after {
			border-color: var(--zb-secondary-color);
		}
	}
	&.znpb-tabs__header-item--library,
	&.znpb-tabs__header-item--elements,
	&.znpb-tabs__header-item--columns {
		&:after {
			border-color: var(--zb-secondary-color);
		}
	}
}
@keyframes scaleInfinit {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.3);
	}
	100% {
		transform: scale(1);
	}
}
</style>
