<template>
	<div class="znpb-option__upgrade-to-pro">
		<div class="znpb-option__upgrade-to-pro-container">
			<Label :text="$translate('pro')" type="warning" class="znpb-option__upgrade-to-pro-label" />

			<h4>
				{{ message_title }}
			</h4>

			<p>
				{{ message_description }}
			</p>

			<a v-if="info_text" :href="info_link" target="_blank">
				{{ info_text }}
			</a>

			<div>
				<a
					href="https://zionbuilder.io/"
					target="_blank"
					class="znpb-button znpb-get-pro__cta znpb-button--secondary znpb-option__upgrade-to-pro-button"
				>
					{{ $translate('upgrade_to_pro') }}
				</a>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default {
	name: 'UpgradeToPro',
};
</script>
<script lang="ts" setup>
import Label from '../Label/Label.vue';
withDefaults(
	defineProps<{
		// eslint-disable-next-line vue/prop-name-casing
		message_title?: string;
		// eslint-disable-next-line vue/prop-name-casing
		message_description?: string;
		// eslint-disable-next-line vue/prop-name-casing
		info_text?: string;
		// eslint-disable-next-line vue/prop-name-casing
		info_link?: string;
	}>(),
	{
		info_link: 'https://zionbuilder.io/documentation/pro-version/',
		message_title: '',
		message_description: '',
		info_text: '',
	},
);
</script>
<style lang="scss">
.znpb-option__upgrade-to-pro {
	text-align: center;

	&-container {
		padding: 20px;
		border: 2px solid var(--zb-surface-border-color);
		border-radius: 3px;
	}

	.znpb-option__upgrade-to-pro-container {
		& > h4 {
			margin-bottom: 15px;
			color: var(--zb-surface-text-active-color);
			font-size: 14px;
			font-weight: 500;
			text-transform: capitalize;
		}

		& > p {
			margin-bottom: 20px;
		}

		& > a {
			display: inline-block;
			padding-bottom: 5px;
			margin-bottom: 20px;
			color: var(--zb-surface-text-active-color);
			font-weight: 500;
			border-bottom: 1px solid var(--zb-surface-border-color);
			transition: color 0.15s;

			&:hover {
				color: var(--zb-surface-text-hover-color);
			}

			&:last-child {
				padding-bottom: 13.5px;
				color: #fff;
			}
		}
	}

	&-label {
		margin-bottom: 20px;
		text-transform: uppercase;
	}

	.zion-quality {
		transition: all 0.3s;
	}

	&-button:hover .zion-quality {
		color: #e8d568;
	}
}
</style>
