<template>
	<ModalTemplateSaveButton :disabled="!canAdd" @save-modal="$emit('save-template', localTemplate)">
		<div class="znpb-admin-title-block znpb-admin-title-block--heading">
			<h4 class="znpb-admin-modal-title-block__title">{{ $translate('add_new_template') }}</h4>
			<p class="znpb-admin-modal-title-block__desc">{{ $translate('create_new_modal_template') }}</p>
		</div>
		<ModalTwoColTemplate :title="$translate('template_type')" :desc="$translate('select_template')">
			<InputSelect
				v-model="localTemplate.template_type"
				:placeholder="$translate('select_type')"
				:options="templates"
				class="znpb-admin-add-template-select"
			/>
		</ModalTwoColTemplate>
		<ModalTwoColTemplate :title="$translate('template_name')" :desc="$translate('type_name')">
			<BaseInput
				v-model="localTemplate.title"
				:placeholder="$translate('enter_name_for_template')"
				class="znpb-admin-add-template-input"
			/>
		</ModalTwoColTemplate>
	</ModalTemplateSaveButton>
</template>

<script>
export default {
	name: 'ModalAddNewTemplate',
	props: {
		templateType: {
			type: String,
			required: false,
			default: 'templates',
		},
	},
	data: function () {
		return {
			localTemplate: {
				title: '',
				template_type: this.templateType,
			},
		};
	},
	computed: {
		templates() {
			const templateTypes = [];
			window.ZnPbAdminPageData.template_types.forEach(element => {
				templateTypes.push({
					id: element.id,
					name: element.singular_name,
				});
			});

			return templateTypes;
		},
		canAdd() {
			const { template_type: templateType, title } = this.localTemplate;
			return templateType.length > 0 && title.length > 0;
		},
	},
};
</script>

<style lang="scss">
.znpb-admin-title-block--heading {
	padding: 35px 30px;
	text-align: center;
	border-bottom: 1px solid var(--zb-surface-border-color);
	h4 {
		font-size: 20px;
	}
	.znpb-admin-modal-title-block__desc {
		width: 60%;
		margin: 0 auto;
		color: var(--zb-surface-text-color);
		font-size: 14px;
		line-height: 26px;
	}
}
</style>
