<template>
	<Modal
		v-if="UserStore.isPostLocked"
		:show="true"
		:width="570"
		append-to="body"
		:show-maximize="false"
		:show-close="false"
	>
		<div class="znpb-post-lock-modal">
			<div class="znpb-post-lock-modal__avatar">
				<img :src="UserStore.lockedUserInfo.avatar" />
			</div>
			<div class="znpb-post-lock-modal__content">
				<div class="znpb-post-lock-modal__content-text">
					<p v-if="showError" class="znpb-post-lock-modal__error-message">
						{{ translate('post_could_not_lock') }}
					</p>
					<p>{{ UserStore.lockedUserInfo.message }}</p>
				</div>
				<div class="znpb-post-lock-modal__content-buttons">
					<Button type="gray">
						<a :href="urls.preview_url">{{ translate('post_preview') }}</a>
					</Button>
					<Button type="gray">
						<a :href="urls.all_pages_url">{{ translate('post_go_back') }}</a>
					</Button>
					<Button type="gray" @click.prevent="lockPages">
						<a href="">{{ translate('post_take_over') }}</a>
					</Button>
				</div>
			</div>
			<div v-if="showLoader" class="znpb-post-lock-modal__loader-wrapper">
				<span class="znpb-post-lock-modal__loader"> </span>
			</div>
		</div>
	</Modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { translate } from '/@/common/modules/i18n';
import { lockPage } from '/@/common/api';
import { useUserStore } from '/@/editor/store';

// Stores
const UserStore = useUserStore();

// Refs
const showLoader = ref(false);
const showError = ref(false);

const pageId = window.ZnPbInitialData.page_id;
const urls = window.ZnPbInitialData.urls;

function lockPages() {
	showLoader.value = true;
	lockPage(pageId)
		.then(result => {
			if (result.status === 200) {
				UserStore.takeOverPost();
			} else if (result.status === 500) {
				showError.value = true;
				// eslint-disable-next-line
					console.error(translate('post_could_not_lock'))
			}
		})
		.finally(() => {
			showLoader.value = false;
		});
}
</script>

<style lang="scss">
.znpb-post-lock-modal {
	display: flex;
	padding: 40px;
	&__error-message {
		color: var(--zb-error-color);
	}
	&__loader-wrapper {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		background: var(--zb-surface-color);
	}
	&__loader {
		position: absolute;
		display: block;
		width: 35px;
		height: 35px;
		border: 0.2em solid var(--zb-surface-border-color);
		border-bottom-color: transparent;
		border-radius: 50%;
		animation: 1s loader-animation linear infinite;
	}
	&__avatar {
		display: flex;
		align-content: center;
		align-items: center;
		margin-right: 30px;
	}
	&__content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		&-text {
			color: var(--zb-surface-text-color);

			p {
				margin-bottom: 15px;
			}
		}
		&-buttons {
			display: flex;
			.znpb-button {
				padding: 0;
				margin-right: 5px;
				a {
					display: block;
					padding: 16px 30px;
					color: var(--zb-surface-text-color);
					text-decoration: none;
					border-radius: 3px;
					transition: all 0.2s ease;
					&:hover {
						color: var(--zb-secondary-text-color);
						background-color: var(--zb-secondary-color) !important;
					}
				}
			}
		}
	}
	@keyframes loader-animation {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
}
</style>
