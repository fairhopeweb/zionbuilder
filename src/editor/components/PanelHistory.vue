<template>
	<BasePanel :panel-name="translate('history_panel')" panel-id="panel-history" :show-expand="false" :panel="panel">
		<div class="znpb-panel__history_panel_wrapper">
			<div ref="historyPanelWrapper" class="znpb-history-wrapper znpb-fancy-scrollbar">
				<div v-if="historyStore.state.length === 0" class="znpb-panel__history_panel_wrapper--noItemsContainer">
					<svg viewBox="0 0 72 72" fill="black" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M43.7 40.9L36.35 48.25L32.15 44.05L37.7 38.5V25.9H43.7V40.9ZM38 13C31.1 13 24.8 16 20.3 20.8L16.4 16.9L14 31.9L29.15 29.5L24.65 25C27.95 21.25 32.75 19 38 19C47.9 19 56 27.1 56 37C56 46.9 47.9 55 38 55C32.75 55 27.95 52.75 24.65 49L20.15 53.05C24.65 57.85 30.95 61 38 61C51.2 61 62 50.2 62 37C62 23.8 51.2 13 38 13Z"
						/>
						<path
							d="M72 15C72 16.6569 70.6569 18 69 18C67.3431 18 66 16.6569 66 15C66 13.3431 67.3431 12 69 12C70.6569 12 72 13.3431 72 15Z"
							opacity="0.6"
						/>
						<path
							d="M4 51.5C4 52.3284 3.32843 53 2.5 53C1.67157 53 1 52.3284 1 51.5C1 50.6716 1.67157 50 2.5 50C3.32843 50 4 50.6716 4 51.5Z"
							opacity="0.6"
						/>
						<path
							d="M4.99683 16.1946C4.27812 16.002 3.53938 16.4285 3.3468 17.1472L3.17241 17.798L2.52177 17.6237C1.80306 17.4311 1.06432 17.8576 0.871741 18.5763C0.679164 19.2951 1.10568 20.0338 1.82439 20.2264L2.47503 20.4007L2.30072 21.0512C2.10815 21.7699 2.53466 22.5087 3.25337 22.7012C3.97208 22.8938 4.71082 22.4673 4.9034 21.7486L5.0777 21.0981L5.7284 21.2725C6.44711 21.465 7.18586 21.0385 7.37843 20.3198C7.57101 19.6011 7.1445 18.8624 6.42579 18.6698L5.77509 18.4954L5.94948 17.8446C6.14206 17.1259 5.71554 16.3871 4.99683 16.1946Z"
							opacity="0.6"
						/>
						<path
							d="M65.7664 52.8525C66.1566 52.9231 66.5302 52.6641 66.6008 52.2738L66.6648 51.9206L67.018 51.9845C67.4083 52.0552 67.7819 51.7961 67.8525 51.4058C67.9231 51.0156 67.664 50.642 67.2738 50.5714L66.9205 50.5075L66.9844 50.1541C67.055 49.7639 66.7959 49.3903 66.4057 49.3197C66.0155 49.2491 65.6419 49.5082 65.5713 49.8984L65.5073 50.2518L65.1541 50.1878C64.7638 50.1172 64.3903 50.3763 64.3196 50.7665C64.249 51.1568 64.5081 51.5303 64.8983 51.601L65.2516 51.6649L65.1877 52.0181C65.1171 52.4083 65.3762 52.7819 65.7664 52.8525Z"
							opacity="0.6"
						/>
					</svg>

					<div class="znpb-panel__history_panel-emptyTitle">
						{{ translate('history_panel_empty_title') }}
					</div>
					<div class="znpb-panel__history_panel-emptyDesc">
						{{ translate('history_panel_empty_desc') }}
					</div>
				</div>
				<ul v-else class="znpb-history-actions">
					<li
						v-for="(item, index) in historyStore.state"
						:key="index"
						:title="item.title"
						:class="{ 'znpb-history-action--active': historyStore.activeHistoryIndex === index }"
						@click="historyStore.restoreHistoryToIndex(index)"
					>
						<!-- <span class="znpb-action-time">{{ item.time }}</span> -->
						<span class="znpb-action-element">{{ item.title }}</span>
						<span class="znpb-action-subtitle">{{ item.subtitle }}</span>
						<span class="znpb-action-name">{{ item.action }}</span>
						<span v-if="historyStore.activeHistoryIndex === index" class="znpb-action-active">{{
							translate('history_now')
						}}</span>
						<Icon v-else icon="history"></Icon>
					</li>
				</ul>
			</div>
			<div class="znpb-history__action-wrapper">
				<div
					class="znpb-history__action"
					:class="{ 'znpb-history__action--inactive': !historyStore.canUndo }"
					@click="doUndo"
				>
					<Icon icon="undo"></Icon>
				</div>
				<div
					class="znpb-history__action"
					:class="{ 'znpb-history__action--inactive': !historyStore.canRedo }"
					@click="doRedo"
				>
					<Icon icon="redo"></Icon>
				</div>
			</div>
		</div>
	</BasePanel>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref, nextTick, computed } from 'vue';
import { useHistoryStore } from '/@/editor/store';
import { translate } from '/@/common/modules/i18n';

// Components
import BasePanel from './BasePanel.vue';

defineProps<{
	panel: ZionPanel;
}>();

const historyPanelWrapper = ref(null);
const historyStore = useHistoryStore();

watch(historyStore.state, newValue => {
	nextTick(() => {
		historyPanelWrapper.value.scrollTop = 0;
	});
});

function doUndo() {
	if (historyStore.canUndo) {
		historyStore.undo();
	}
}
function doRedo() {
	if (historyStore.canRedo) {
		historyStore.redo();
	}
}
</script>
<style lang="scss">
/* vars */

.znpb-panel__history_panel_wrapper {
	display: flex;
	flex-direction: column;
	height: 100%;
	min-height: 0;
	color: var(--zb-surface-text-color);
}

.znpb-history-wrapper {
	flex-grow: 1;
	overflow-y: auto;
	padding-top: 20px;
}

.znpb-history-actions {
	position: relative;
	display: flex;
	flex-direction: column-reverse;

	li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		min-height: 48px;
		padding: 15px;
		margin: 0 20px 5px;
		background-color: var(--zb-surface-lighter-color);
		border-radius: 3px;

		.znpb-action-element {
			flex-shrink: 0;
			overflow: hidden;
			color: var(--zb-surface-text-active-color);
			font-weight: 500;
			text-overflow: ellipsis;
			white-space: nowrap;
			padding: 2px 0;
		}

		.znpb-action-name {
			font-size: 10px;
			text-transform: uppercase;
			opacity: 0.6;
			margin-left: 8px;
		}

		.znpb-action-time {
			margin-right: 13px;
		}

		.znpb-action-active,
		.znpb-editor-icon-wrapper {
			margin-left: auto;
		}

		&:hover {
			background-color: var(--zb-surface-lightest-color);
			cursor: pointer;
		}

		&.znpb-history-action--active {
			color: var(--zb-secondary-text-color);
			background-color: var(--zb-secondary-color);

			.znpb-action-name,
			.znpb-action-element {
				color: var(--zb-primary-text-color);
			}
		}
	}
}
.znpb-history__action {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-grow: 1;
	padding: 15px 0;
	margin-right: 5px;
	background: var(--zb-surface-lighter-color);
	border-radius: 3px;
	transition: color linear 0.3s;
	cursor: pointer;
	&-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		padding: 20px;
	}
	&--inactive {
		opacity: 0.6;
	}
	&:last-child {
		margin-right: 0;
	}

	&:hover {
		color: var(--zb-surface-text-hover-color);
	}

	// &--inactive, &--inactive:hover {
	// 	.zion-icon.zion-svg-inline {
	// 		color: var(--zb-surface-text-hover-color);
	// 	}
	// }

	span {
		margin-right: 7px;

		&:last-child {
			margin-right: 0;
		}
	}
}

// Empty history
.znpb-panel__history_panel_wrapper--noItemsContainer {
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100%;
}

.znpb-panel__history_panel_wrapper--noItemsContainer svg {
	max-width: 75px;
	fill: currentColor;
}

.znpb-panel__history_panel-emptyTitle {
	font-size: 16px;
	font-weight: 600;
	line-height: 25px;
	color: var(--zb-surface-text-hover-color);
	margin-bottom: 7px;
	text-align: center;
}

.znpb-panel__history_panel-emptyDesc {
	font-size: 13px;
	line-height: 22px;
	padding: 0 50px;
	text-align: center;
}
</style>
