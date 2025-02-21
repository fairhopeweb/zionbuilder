<template>
	<div
		ref="editorHeaderRef"
		class="znpb-editor-header"
		:class="{
			'znpb-editor-panel__container--dragging': UIStore.mainBar.isDragging,
			[`znpb-editor-header--${UIStore.mainBar.position}`]: UIStore.mainBar.position,
			[`znpb-editor-header--hide-${UIStore.mainBar.position}`]: UIStore.isPreviewMode,
		}"
		:style="panelStyles"
		@mousedown.stop="startBarDrag"
	>
		<!-- first part -->
		<div class="znpb-editor-header__first">
			<!-- treeview -->
			<div
				v-znpb-tooltip:[tooltipsPosition]="$translate('tree_view')"
				class="znpb-editor-header__menu_button znpb-editor-header__menu_button--treeview"
				:class="{
					active: UIStore.openPanelsIDs.includes('panel-tree'),
				}"
				@mousedown.stop.prevent="UIStore.togglePanel('panel-tree')"
			>
				<Icon icon="layout"></Icon>
			</div>
			<!-- libary -->
			<div
				v-if="!userStore.permissions.only_content"
				v-znpb-tooltip:[tooltipsPosition]="$translate('library')"
				:class="{
					active: UIStore.isLibraryOpen,
				}"
				class="znpb-editor-header__menu_button"
				@mousedown.stop="UIStore.toggleLibrary"
			>
				<Icon icon="lib"></Icon>
			</div>
			<!-- history -->
			<div
				v-znpb-tooltip:[tooltipsPosition]="$translate('history_panel')"
				class="znpb-editor-header__menu_button znpb-editor-header__menu_button--history"
				:class="{
					active: UIStore.openPanelsIDs.includes('panel-history'),
				}"
				@mousedown.stop.prevent="UIStore.togglePanel('panel-history')"
			>
				<Icon icon="history"></Icon>
			</div>
		</div>
		<!-- center part -->
		<!-- last part -->
		<div class="znpb-editor-header__last">
			<!-- devices -->
			<ResponsiveDevices />

			<!-- options -->
			<div
				v-if="!userStore.permissions.only_content"
				v-znpb-tooltip:[tooltipsPosition]="$translate('page_options')"
				class="znpb-editor-header__menu_button"
				:class="{
					active: UIStore.openPanelsIDs.includes('panel-global-settings'),
				}"
				@mousedown.stop="UIStore.togglePanel('panel-global-settings')"
			>
				<Icon icon="sliders" />
			</div>

			<!-- help section -->
			<FlyoutWrapper class="znpb-editor-header__page-save-wrapper">
				<template #panel-icon>
					<Icon icon="info" />
				</template>
				<FlyoutMenuItem v-for="(menuItem, i) in helpMenuItems" :key="i">
					<a :href="menuItem.url" :target="menuItem.target" @mousedown.prevent.stop="menuItem.action">
						<span>{{ menuItem.title }}</span>
					</a>
				</FlyoutMenuItem>
			</FlyoutWrapper>

			<!-- Getting started video -->
			<Modal
				v-if="showGettingStartedVideo && gettingStartedVideoURL"
				v-model:show="showGettingStartedVideo"
				:width="840"
				:title="$translate('getting_started')"
				append-to="#znpb-main-wrapper"
				class="znpb-helpmodal-wrapper"
			>
				<iframe
					width="840"
					height="100%"
					:src="gettingStartedVideoURL"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</Modal>
			<!-- key shortcuts modal -->
			<Modal
				v-if="shortcutsModalVisibility"
				v-model:show="shortcutsModalVisibility"
				:width="560"
				:title="$translate('key_shortcuts')"
				append-to="#znpb-main-wrapper"
			>
				<keyShortcuts />
			</Modal>
			<!-- show about -->
			<Modal
				v-if="aboutModalVisibility"
				v-model:show="aboutModalVisibility"
				:width="580"
				:title="$translate('about_zion_builder')"
				:show-maximize="false"
				append-to="#znpb-main-wrapper"
			>
				<aboutModal />
			</Modal>
			<!-- save -->

			<FlyoutWrapper
				class="znpb-editor-header__page-save-wrapper znpb-editor-header__page-save-wrapper--save"
				@mousedown="savePage"
			>
				<template #panel-icon>
					<Icon v-if="!isSavePageLoading" icon="check" @mousedown.stop="savePage" />

					<Loader v-else :size="12" />
				</template>
				<FlyoutMenuItem v-for="(menuItem, i) in saveActions" :key="i">
					<a href="#" @mousedown.stop="menuItem.action">
						<span>{{ menuItem.title }}</span>
					</a>
				</FlyoutMenuItem>
			</FlyoutWrapper>
		</div>
		<!-- end last part -->
		<!-- helper -->
	</div>
</template>

<script>
import { ref, computed, onBeforeUnmount } from 'vue';
import keyShortcuts from './key-shortcuts/keyShortcuts.vue';
import aboutModal from './aboutModal.vue';
import { useSavePage, useEditorData, useSaveTemplate } from '../composables';
import { translate } from '/@/common/modules/i18n';
import { useBuilderOptionsStore } from '/@/common/store';
import { ResponsiveDevices, FlyoutWrapper, FlyoutMenuItem } from './MainPanel';
import { useUIStore, useUserStore } from '../store';

export default {
	name: 'ZnpbPanelMain',
	components: {
		FlyoutWrapper,
		FlyoutMenuItem,
		keyShortcuts,
		aboutModal,
		ResponsiveDevices,
		//
	},
	setup() {
		// Stores
		const UIStore = useUIStore();
		const userStore = useUserStore();
		const { saveDraft, savePage, isSavePageLoading, openPreviewPage } = useSavePage();

		// Composables
		const { editorData } = useEditorData();
		const { showSaveElement } = useSaveTemplate();
		const { getOptionValue } = useBuilderOptionsStore();

		// Reactive data
		const editorHeaderRef = ref(null);
		const showGettingStartedVideo = ref(false);

		// Help menu
		const aboutModalVisibility = ref(false);
		const shortcutsModalVisibility = ref(false);
		const top = ref(null);
		const left = ref(null);
		const draggingPosition = ref(null);
		const userSel = ref(null);
		const gettingStartedVideoURL = window.ZnPbInitialData.urls.getting_started_video;

		// Computed
		const tooltipsPosition = computed(() => {
			if (UIStore.mainBar.position === 'top') {
				return 'bottom';
			} else if (UIStore.mainBar.position === 'left') {
				return 'right';
			} else if (UIStore.mainBar.position === 'right') {
				return 'left';
			} else if (UIStore.mainBar.position === 'bottom') {
				return 'top';
			}

			return 'top';
		});

		let isPro = editorData.value.plugin_info.is_pro_active;
		const hasWhiteLabel = computed(() => {
			return isPro && getOptionValue('white_label') !== null && getOptionValue('white_label').plugin_title
				? true
				: false;
		});

		const helpMenuItems = computed(() => {
			let helpArray = [
				{
					title: translate('tour'),
					action: doShowGettingStartedVideo,
					canShow: isPro && gettingStartedVideoURL.length > 0,
				},
				{
					title: translate('key_shortcuts'),
					action: () => (shortcutsModalVisibility.value = true),
				},
				{
					title: translate('about_zion_builder'),
					action: () => (aboutModalVisibility.value = true),
					canShow: !hasWhiteLabel.value,
				},
				{
					title: translate('back_to_zion_dashboard'),
					url: editorData.value.urls.zion_admin,
					action: () => {},
				},
				{
					title: translate('back_to_wp_dashboard'),
					url: editorData.value.urls.edit_page,
					action: () => {},
				},
				{
					title: translate('view_post'),
					action: openPreviewPage,
				},
			];

			return helpArray.filter(item => item.canShow !== false);
		});

		const panelStyles = computed(() => {
			return {
				userSelect: userSel.value,
				pointerEvents: UIStore.mainBar.isDragging || UIStore.mainBar.pointerEvents ? 'none' : null,
			};
		});

		function saveTemplate() {
			showSaveElement(null);
		}

		const saveActions = [
			{
				icon: 'save-template',
				title: translate('save_template'),
				action: saveTemplate,
			},
			{
				icon: 'save-draft',
				title: translate('save_draft'),
				action: saveDraft,
			},
			{
				icon: 'save-page',
				title: translate('save_page'),
				action: savePage,
			},
		];

		// Show/Hide getting started video
		if (null === localStorage.getItem('zion_builder_guided_tour_done')) {
			doShowGettingStartedVideo();
		}

		// Methods
		function doShowGettingStartedVideo() {
			showGettingStartedVideo.value = true;
			localStorage.setItem('zion_builder_guided_tour_done', true);
		}

		function startBarDrag() {
			window.addEventListener('mousemove', movePanel);
			window.addEventListener('mouseup', disablePanelMove);
		}

		function movePanel(event) {
			document.body.style.cursor = 'grabbing';

			let newLeft = event.clientX - 30;
			let newTop = event.clientY;

			// Set placeholder position
			UIStore.mainBarDraggingPlaceholder.top = event.clientY;
			UIStore.mainBarDraggingPlaceholder.left = event.clientX;

			// Set a flag so we know that we are dragging
			if (!UIStore.mainBar.isDragging) {
				UIStore.mainBar.isDragging = true;
			}

			// disable pointer events on iframe
			UIStore.setIframePointerEvents(true);
			userSel.value = 'none';

			// Calculate horizontal move
			const maxLeft = window.innerWidth - 60;
			newLeft = newLeft <= 0 ? 0 : newLeft;
			left.value = newLeft > maxLeft ? maxLeft : newLeft;
			top.value = newTop;

			const positions = {
				top: (window.innerHeight * 30) / 100 - event.clientY,
				right: event.clientX - (window.innerWidth * 70) / 100,
				bottom: event.clientY - (window.innerHeight * 70) / 100,
				left: (window.innerWidth * 30) / 100 - event.clientX,
			};

			// get all positive values
			const availablePositions = Object.keys(positions).filter(position => {
				return positions[position] > 0;
			});

			if (availablePositions.length === 0) {
				return;
			}

			const closestPosition = availablePositions.reduce((highest, current) => {
				return positions[highest] > positions[current] ? highest : current;
			});

			if (closestPosition) {
				draggingPosition.value = closestPosition;
				UIStore.mainBar.draggingPosition = closestPosition;
			}
		}

		function disablePanelMove() {
			window.removeEventListener('mousemove', movePanel);
			window.removeEventListener('mouseup', disablePanelMove);

			// Save the position
			if (draggingPosition.value) {
				UIStore.setMainBarPosition(draggingPosition.value);
				draggingPosition.value = null;
			}

			UIStore.setIframePointerEvents(false);
			userSel.value = null;
			document.body.style.cursor = null;
			UIStore.mainBar.isDragging = false;
		}

		function onAfterLeave() {
			const el = document.querySelector('iframe');
			el.style.transform = 'translateZ(0)';
		}

		function onAfterEnter() {
			const el = document.querySelector('iframe');
			el.style.transform = null;
		}

		// Lifecycle
		onBeforeUnmount(() => {
			window.removeEventListener('mousemove', movePanel);
			window.removeEventListener('mouseup', disablePanelMove);
		});

		return {
			// Vars
			gettingStartedVideoURL,
			// Refs
			showGettingStartedVideo,
			editorHeaderRef,
			aboutModalVisibility,
			shortcutsModalVisibility,
			draggingPosition,
			UIStore,
			userStore,

			// Computed
			helpMenuItems,
			panelStyles,
			tooltipsPosition,

			// Methods
			saveActions,
			isSavePageLoading,
			savePage,
			startBarDrag,
			onAfterLeave,
			onAfterEnter,
		};
	},
};
</script>
<style lang="scss">
.znpb-editor-header {
	position: relative;
	z-index: 10;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 60px;
	color: var(--zb-primary-text-color);
	background: var(--zb-primary-color);
	transition: margin 0.3s ease-out;
	cursor: move;

	// Bar positions
	&--right {
		order: 9999;
	}

	&--top {
		top: 0;
		left: 0;
		flex-direction: row;
		order: 0;
		width: 100%;
		height: 60px;

		& .znpb-editor-header__first,
		& .znpb-editor-header__last {
			flex-direction: row;
		}
	}

	&__first {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex: 2;
	}

	&__center {
		display: flex;
		align-items: center;
		flex: 1;
	}

	&__last {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		align-items: center;
		flex: 2;
		.znpb-admin-small-loader {
			top: calc(50% - 2px);
			left: calc(50% - 2px);
			width: 18px;
			height: 18px;
		}
	}

	&__menu_button {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 60px;
		height: 60px;
		color: var(--zb-primary-text-color);
		font-size: 16px;
		transition: background-color 0.15s ease;
		cursor: pointer;

		&:hover,
		&:focus,
		&:active {
			background-color: var(--zb-primary-hover-color);
		}

		&.active {
			background-color: var(--zb-primary-hover-color);
		}
		.znpb-editor-icon-wrapper {
			font-size: 16px;
		}

		&.center-button {
			width: 44px;
			height: 44px;
			margin: 0 auto;
			color: var(--zb-primary-text-color);
			background-color: transparent;

			.znpb-editor-icon-wrapper {
				position: relative;
				transition: transform 0.2s ease;
			}

			&:before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				background: var(--zb-primary-hover-color);
				border-radius: 50%;
				transition: transform 0.2s ease;
			}

			&:hover:before {
				transform: scale(1.1);
			}
		}
		&.center-button.active {
			background-color: transparent;

			.znpb-editor-icon-wrapper {
				transform: rotate(45deg);
			}
		}

		.znpb-loader {
			top: -3px;
			&::before,
			&::after {
				border-color: transparent;
			}
			&::after {
				border-right-color: #fff;
				border-bottom-color: #fff;
			}
		}
	}
	&.znpb-editor-panel__container--dragging {
		z-index: 1000;
		opacity: 0.5;
	}
}
.znpb-editor-header__helper {
	position: absolute;
	z-index: 11;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 44px;
	height: 44px;
	background: var(--zb-primary-color);
	border-radius: 50%;
	opacity: 1;
}

.znpb-editorHeaderPosition--bottom,
.znpb-editorHeaderPosition--top {
	.znpb-editor-header {
		flex-direction: row;
		align-items: center;
		width: 100%;
		height: 60px;

		&__first {
			flex-direction: row;
		}
		&__center {
			flex-direction: row;
		}
		&__last {
			flex-direction: row;
		}
	}
}

.znpb-editorHeaderPosition--bottom .znpb-editor-header {
	order: 2;
}

// Hide animation
.znpb-editor-header--hide {
	&-left {
		margin-left: -60px;
	}

	&-right {
		margin-right: -60px;
	}

	&-top {
		margin-top: -60px;
	}

	&-bottom {
		margin-bottom: -60px;
	}
}

// Dragging helpers
.znpb-main-wrapper--mainBarPlaceholder {
	position: absolute;
	z-index: 999999;
	overflow: hidden;

	.znpb-main-wrapper--mainBarPlaceholderInner {
		width: 100%;
		height: 100%;
		background: var(--zb-secondary-color);
	}
}
.znpb-main-wrapper--mainBarPlaceholder--top {
	top: 0;
	left: 0;
	width: 100%;
	height: 5px;

	.znpb-main-wrapper--mainBarPlaceholderInner {
		animation: 0.3s ease-out 0s 1 slideInFromTop;
	}
}

.znpb-main-wrapper--mainBarPlaceholder--left {
	top: 0;
	left: 0;
	width: 5px;
	height: 100%;

	.znpb-main-wrapper--mainBarPlaceholderInner {
		animation: 0.3s ease-out 0s 1 slideInFromLeft;
	}
}

.znpb-main-wrapper--mainBarPlaceholder--right {
	top: 0;
	right: 0;
	width: 5px;
	height: 100%;

	.znpb-main-wrapper--mainBarPlaceholderInner {
		animation: 0.3s ease-out 0s 1 slideInFromRight;
	}
}

.znpb-main-wrapper--mainBarPlaceholder--bottom {
	bottom: 0;
	left: 0;
	width: 100%;
	height: 5px;

	.znpb-main-wrapper--mainBarPlaceholderInner {
		animation: 0.3s ease-out 0s 1 slideInFromBottom;
	}
}

@keyframes slideInFromLeft {
	0% {
		transform: translateX(-100%);
	}
	100% {
		transform: translateX(0);
	}
}
@keyframes slideInFromRight {
	0% {
		transform: translateX(100%);
	}
	100% {
		transform: translateX(0);
	}
}
@keyframes slideInFromTop {
	0% {
		transform: translateY(-100%);
	}
	100% {
		transform: translateY(0);
	}
}
@keyframes slideInFromBottom {
	0% {
		transform: translateY(100%);
	}
	100% {
		transform: translateY(0);
	}
}

.znpb-helpmodal-wrapper .znpb-modal__wrapper,
.znpb-helpmodal-wrapper .znpb-modal__content {
	height: 100%;
	max-height: 560px;
}

.znpb-helpmodal-wrapper .znpb-modal__wrapper--full-size .znpb-modal__wrapper,
.znpb-helpmodal-wrapper .znpb-modal__wrapper--full-size .znpb-modal__content,
.znpb-helpmodal-wrapper .znpb-modal__wrapper--full-size .znpb-help-modal {
	height: 100%;
	max-height: none;
}

.znpb-help-modal {
	display: flex;
	max-height: 100%;
}
</style>
