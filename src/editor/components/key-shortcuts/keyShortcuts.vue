<template>
	<div class="znpb-key-shortcuts-modal znpb-fancy-scrollbar">
		<div class="znpb-key-shortcuts-modal__content">
			<keyShortcutsItem
				v-for="(schema, i) in schemaDescriptionFirst"
				:key="i + schema.description"
				:keyshortcut="schema.keyshortcut"
				:description="schema.description"
			>
				<pre v-if="schema.details" class="znpb-key-shortcuts-modal__item-details">{{ schema.details }}</pre>
			</keyShortcutsItem>
		</div>
	</div>
</template>

<script>
import keyShortcutsItem from './keyShortcutsItem.vue';
import { Environment } from '/@/common/utils';

export default {
	name: 'KeyShortcutsModal',
	components: {
		keyShortcutsItem,
	},
	data() {
		const controlKey = Environment.isMac ? '⌘' : '⌃';
		return {
			schemaDescriptionFirst: [
				{
					keyshortcut: [controlKey, 'S'],
					description: this.$translate('save_changes'),
				},
				{
					keyshortcut: [controlKey, 'C'],
					description: this.$translate('copy_element'),
				},
				{
					keyshortcut: [controlKey, 'V'],
					description: this.$translate('paste_element'),
				},
				{
					keyshortcut: [controlKey, 'X'],
					description: this.$translate('cut_element'),
				},
				{
					keyshortcut: [controlKey, 'D'],
					description: this.$translate('duplicate_element'),
				},
				{
					keyshortcut: [controlKey, '⇧', 'C'],
					description: this.$translate('copy_element_styles'),
				},
				{
					keyshortcut: [controlKey, '⇧', 'V'],
					description: this.$translate('paste_element_styles'),
				},
				{
					keyshortcut: [controlKey, 'Z'],
					description: this.$translate('undo'),
				},
				{
					keyshortcut: [controlKey, 'Y'],
					description: this.$translate('redo'),
				},
				{
					keyshortcut: [controlKey, '⇧', 'Y'],
					description: this.$translate('redo'),
				},
				{
					keyshortcut: [controlKey, 'H'],
					description: this.$translate('hide_element'),
				},
				{
					keyshortcut: [controlKey, 'P'],
					description: this.$translate('toggle_preview'),
				},
				{
					keyshortcut: ['⇧', 'T'],
					description: this.$translate('toggle_tree_view_panel'),
				},
				{
					keyshortcut: ['⇧', 'L'],
					description: this.$translate('toggle_library'),
				},
				{
					keyshortcut: ['⇧', 'O'],
					description: this.$translate('toggle_page_options'),
				},
				{
					keyshortcut: ['DRAG', controlKey],
					description: this.$translate('duplicate_element_in_place'),
					details: this.$translate('when_dragging_element'),
				},
				{
					keyshortcut: [controlKey, 'DRAG'],
					description: this.$translate('set_even_values'),
					details: this.$translate('when_dragging_toolbox'),
				},
				{
					keyshortcut: [controlKey, '⇧', 'DRAG'],
					description: this.$translate('set_even_incremental_value'),
				},
				{
					keyshortcut: [controlKey, '⇧', 'D'],
					description: this.$translate('back_to_wp_dashboard'),
				},
				{
					keyshortcut: ['⇧', 'DRAG'],
					description: this.$translate('set_incremental_value'),
					details: this.$translate('when_dragging_input_number'),
				},
				{
					keyshortcut: ['⇧', 'ARROWS'],
					description: this.$translate('set_incremental_value'),
				},
				{
					keyshortcut: ['ALT'],
					description: 'Toggle Link',
					details: this.$translate('on_input_number_link'),
				},
			],
		};
	},
};
</script>

<style lang="scss">
.znpb-key-shortcuts-modal {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 30px;
	&__item-details {
		margin-top: 0;
		margin-bottom: 20px;
		text-align: center;
	}
	&__content {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}
}
</style>
