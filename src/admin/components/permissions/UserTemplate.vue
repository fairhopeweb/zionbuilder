<template>
	<div class="znpb-single-role">
		<h3 class="znpb-single-role__item">
			<slot></slot>
		</h3>
		<div class="znpb-single-role__permission">
			<h4 class="znpb-single-role-permission-subtitle">{{ permission }} {{ $translate('permissions') }}</h4>
		</div>
		<div class="znpb-single-role__actions">
			<Icon
				v-znpb-tooltip="$translate('customize_permissions_for_user')"
				class="znpb-edit-icon-pop"
				icon="edit"
				@click="$emit('edit-permission')"
			/>

			<Icon
				v-if="hasDelete"
				v-znpb-tooltip="$translate('delete_permissions_for_user')"
				icon="delete"
				@click="$emit('delete-permission')"
			/>
		</div>
	</div>
</template>

<script>
export default {
	name: 'UserTemplate',
	props: {
		permission: {
			type: Number,
			required: true,
		},
		hasDelete: {
			type: Boolean,
			required: false,
		},
	},
};
</script>
<style lang="scss">
@import "/@/common/scss/_mixins.scss";
.znpb-admin__wrapper {
	.znpb-single-role {
		@extend %list-item-helper;
		padding: 17px 20px;

		@media (max-width: 767px) {
			flex-direction: column;
			align-items: flex-start;

			&__item, &__permission {
				margin-bottom: 10px !important;
			}
		}

		&__permission {
			display: flex;
			justify-content: space-between;
			flex-grow: 1;
		}
		&__actions {
			display: flex;
			font-size: 14px;
			& > .znpb-edit-icon-pop {
				margin-right: 7px;

				&:last-of-type {
					margin-right: 0;
				}
			}
			.znpb-editor-icon-wrapper {
				display: block;
				align-self: center;
				box-sizing: content-box;
				width: 15px;
				padding: 5px;
				margin-right: 10px;
				cursor: pointer;
				&:last-child {
					margin-right: 0;
				}
				&:hover {
					color: var(--zb-surface-text-hover-color);
				}
				&.znpb-edit-icon-pop {
					margin-right: 10px;
				}
			}
		}
	}
	h3.znpb-single-role__item {
		flex-basis: 0;
		flex-grow: 2;
		margin: 0;
		color: var(--zb-surface-text-active-color);
		font-size: 13px;
		font-weight: 500;
		line-height: 1;
	}
	.znpb-single-role-permission-subtitle {
		margin: 0;
		color: var(--zb-surface-text-color);
		font-size: 13px;
		font-weight: 400;
	}
}
</style>
