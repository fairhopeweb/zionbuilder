<template>
	<router-link
		class="znpb-admin-side-menu__item"
		:class="{'znpb-admin__side-menu-item--active': isActive}"
		:to="`${basePath}/${menuItem.path}`"
	>
		<slot></slot>
		<SideMenu
			v-if="menuItem.children && isActive"
			:menu-items="menuItem.children"
			:animate="true"
			:base-path="`${basePath}/${menuItem.path}`"
		></SideMenu>
	</router-link>
</template>

<script>
export default {
	name: 'SideMenuItem',
	props: {
		menuItem: {
			type: Object,
			required: true
		},
		basePath: {
			type: String,
			required: false
		}
	},
	computed: {
		isActive () {
			const routerPath = this.$route.path
			return routerPath.indexOf(this.menuItem.path) !== -1
		}
	}
}
</script>

<style lang="scss">
.znpb-admin__wrapper {
	a.znpb-admin-side-menu__item {
		color: var(--zb-surface-text-color);
	}
}

.znpb-admin-side-menu {
	& & {
		padding-top: 15px;
	}

	&__item {
		position: relative;
		display: block;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		padding: 24px 30px;
		margin: 0;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;

		.znpb-label--warning {
			position: absolute;
			right: 35px;
		}
	}

	& & &__item {
		&::before {
			content: "";
			display: inline-block;
			width: 10px;
			height: 2px;
			margin-right: 5px;
			background: var(--zb-surface-border-color);
		}

		&:last-child {
			margin-bottom: 0;
		}

		.znpb-label--pro {
			right: 0;
		}
	}

	&-trigger {
		display: none;
		color: #bbb;
		cursor: pointer;
		padding: 10px;
		margin-top: 10px;
		transition: color 0.25s;

		&:hover {
			color: #858585;
		}

		@media (max-width: 1399px) {
			display: block;
		}

		> span {
			width: 20px;
			height: 14px;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;

			> span {
				display: block;
			}

			> span,
			> span::before,
			> span::after {
				width: 100%;
				height: 2px;
				background: currentColor;
			}

			> span::before,
			> span::after {
				content: "";
				position: absolute;
				left: 0;
			}

			> span::before {
				top: 0;
			}

			> span::after {
				bottom: 0;
			}
		}
	}
}

.znpb-admin-content > .znpb-admin-side-menu > .znpb-admin-side-menu__item {
	font-size: 14px;
	border-bottom: 1px solid var(--zb-surface-lighter-color);

	&::after {
		content: "";
		position: absolute;
		top: 28px;
		right: 20px;
		width: 5px;
		height: 5px;
		margin-left: auto;
		border: 2px solid var(--zb-surface-icon-color);
		border-top: 0;
		border-left: 0;
		transform: rotate(-45deg);
	}

	&.znpb-admin__side-menu-item--active::after,
	&:hover::after {
		border-color: var(--zb-surface-text-color);
	}
}

a.znpb-admin-side-menu__item {
	&.router-link-active,
	&--active,
	&:hover {
		color: var(--zb-surface-text-active-color);
		background: var(--zb-surface-color);
	}

	& & {
		padding: 15px 0 10px;
		margin-bottom: 5px;
		color: var(--zb-surface-text-color);
		font-weight: 500;

		&.router-link-active,
		&:hover {
			color: var(--zb-surface-text-active-color);
		}
	}
}
</style>
