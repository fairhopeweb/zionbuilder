import { getImage } from '/@/common/utils';
import { applyFilters } from '/@/common/modules/hooks';
import { cloneDeep, forEach, get } from 'lodash-es';
import { useResponsiveDevices } from '/@/common/composables';

/**
 * Will parse the option schema in order to get the render attributes
 * and custom css
 */
export default class Options {
	constructor(schema, model, selector: string, options, element = null) {
		this.model = JSON.parse(JSON.stringify(model));
		this.schema = schema;
		this.selector = selector;
		this.options = options;
		this.element = element;
		this.serverRequester = element ? element.serverRequester : window.zb.editor.serverRequest;

		const { responsiveDevicesAsIdWidth } = useResponsiveDevices();
		const devices = {};

		Object.keys(responsiveDevicesAsIdWidth.value).forEach(device => {
			devices[device] = {};
		});

		this.customCSS = devices;

		this.renderAttributes = {};
	}

	startLoading() {
		if (typeof this.options.onLoadingStart === 'function') {
			this.options.onLoadingStart();
		}
	}

	endLoading() {
		if (typeof this.options.onLoadingEnd === 'function') {
			this.options.onLoadingEnd();
		}
	}

	parseData() {
		// Allow external data modification
		const options = this.model;

		// Set defaults and extract render attributes and custom css
		this.parseOptions(this.schema, options);

		return {
			options: applyFilters('zionbuilder/options/model', options, this),
			renderAttributes: this.renderAttributes,
			customCSS: this.getCustomCSS(),
		};
	}

	parseOptions(schema, model, index = null) {
		model = null === model ? {} : model;
		Object.keys(schema).forEach(optionId => {
			const singleOptionSchema = schema[optionId];
			const dependencyPassed = this.checkDependency(singleOptionSchema, model);

			if (!dependencyPassed) {
				return false;
			}

			if (typeof singleOptionSchema.is_layout !== 'undefined' && singleOptionSchema.is_layout) {
				if (singleOptionSchema.child_options) {
					this.parseOptions(singleOptionSchema.child_options, model);
				}
			} else {
				if (typeof model[optionId] !== 'undefined') {
					// Check for images
					this.setPropperImage(optionId, singleOptionSchema, model);

					// Get render attributes
					this.setRenderAttributes(singleOptionSchema, model[optionId], index);

					// Get custom css
					this.setCustomCSS(singleOptionSchema, model[optionId], index);
				} else if (typeof singleOptionSchema.default !== 'undefined') {
					model[optionId] = cloneDeep(singleOptionSchema.default);
				}

				if (singleOptionSchema.child_options) {
					if (singleOptionSchema.type === 'repeater') {
						if (typeof model[optionId] !== 'undefined' && Array.isArray(model[optionId])) {
							model[optionId].forEach((optionValue, index) => {
								this.parseOptions(singleOptionSchema.child_options, optionValue, index);
							});
						}
					} else {
						const savedValue =
							typeof model[optionId] !== 'undefined' && model[optionId] !== null ? model[optionId] : {};
						this.parseOptions(singleOptionSchema.child_options, savedValue);

						if (Object.keys(savedValue).length > 0) {
							model[optionId] = savedValue;
						}
					}
				}
			}
		});

		return model;
	}

	setPropperImage(optionId, schema, model) {
		if (schema.type === 'image' && schema.show_size === true && model[optionId]) {
			const imageConfig = model[optionId];

			// Only start loading if we need to fetch the image from server
			if (imageConfig && imageConfig.image && imageConfig.image_size && imageConfig.image_size !== 'full') {
				this.startLoading();
				getImage(model[optionId], this.serverRequester)
					.then(image => {
						if (image) {
							this.setImage(model, optionId, image);
						}
					})
					.finally(() => {
						this.endLoading();
					});
			}
		}
	}

	setImage(optionsModel, optionId, newValue) {
		const oldImage = (optionsModel[optionId] || {}).image;
		if (oldImage === newValue) {
			return;
		}

		const newValues = {
			...optionsModel[optionId],
			image: newValue,
		};

		optionsModel[optionId] = newValues;
	}

	addRenderAttribute(tagId, attribute, value, replace = false) {
		if (!this.renderAttributes[tagId]) {
			this.renderAttributes[tagId] = {};
		}

		const currentAttributes = this.renderAttributes[tagId];

		if (!currentAttributes[attribute]) {
			currentAttributes[attribute] = [];
		}

		if (replace) {
			currentAttributes[attribute] = [value];
		} else {
			currentAttributes[attribute].push(value);
		}
	}

	setRenderAttributes(schema, model, index = null) {
		const CSSDeviceMap = {
			default: '',
			laptop: '--lg',
			tablet: '--md',
			mobile: '--sm',
		};

		if (schema.render_attribute) {
			schema.render_attribute.forEach(config => {
				// create render attribute for tag id if doesn't exists
				let tagId = config.tag_id || 'wrapper';
				tagId = index === null ? tagId : `${tagId}${index}`;
				const attribute = config.attribute || 'class';
				let attributeValue = config.value || '';

				if (schema.responsive_options && model !== null) {
					// Check to see if the option is saved as string
					if (model && typeof model !== 'object') {
						model = {
							default: model,
						};
					}

					Object.keys(model).forEach(deviceId => {
						// Don't proceed if we do not have a value
						if (!model[deviceId] || typeof CSSDeviceMap[deviceId] === 'undefined') {
							return;
						}

						const deviceSavedValue = model[deviceId];
						attributeValue = config.value || '';
						attributeValue = attributeValue.replace('{{RESPONSIVE_DEVICE_CSS}}', CSSDeviceMap[deviceId]);
						attributeValue = attributeValue.replace('{{VALUE}}', deviceSavedValue) || deviceSavedValue;

						this.addRenderAttribute(tagId, attribute, attributeValue);
					});
				} else {
					// Don't proceed if we do not have a value
					if (!model) {
						return;
					}

					attributeValue = attributeValue.replace('{{VALUE}}', model) || model;
					this.addRenderAttribute(tagId, attribute, attributeValue);
				}
			});
		}
	}

	setCustomCSS(schema, model, index = null) {
		if (schema.css_style && Array.isArray(schema.css_style)) {
			schema.css_style.forEach(cssStyleConfig => {
				if (schema.responsive_options && typeof model === 'object' && model !== null) {
					this.extractResponsiveCSSRules(schema.type, cssStyleConfig, model, index);
				} else {
					this.extractCSSRule('default', schema.type, cssStyleConfig, model, index);
				}
			});
		} else {
			if (schema.type === 'shape_dividers') {
				if (typeof model === 'object') {
					forEach(model, (maskConfig, position) => {
						let { shape, height } = maskConfig;
						if (shape && height) {
							const selector = `zb-mask-pos--${position}`;

							// Normalize height
							if (typeof height === 'string') {
								height = {
									default: height,
								};
							}
							this.extractResponsiveCSSRules(
								schema.type,
								{
									selector: `${this.selector} .${selector}`,
									value: 'height: {{VALUE}}',
								},
								height,
								index,
							);
						}
					});
				}
			}
		}
	}

	extractResponsiveCSSRules(optionType, cssStyleConfig, model, index) {
		if (typeof model !== 'object' || model === null) {
			return '';
		}

		Object.keys(model).forEach(device => {
			const deviceValue = model[device];
			this.extractCSSRule(device, optionType, cssStyleConfig, deviceValue, index);
		});
	}

	extractCSSRule(device, optionType, cssStyleConfig, model, index) {
		let { selector, value } = cssStyleConfig;

		if (!selector || !value) {
			return;
		}

		selector = selector.replace('{{ELEMENT}}', this.selector);
		value = value.replace('{{VALUE}}', model);

		if (index !== null) {
			selector = selector.replace('{{INDEX}}', index);
		}

		if (optionType === 'element_styles') {
			const mediaStyles = optionValue.styles || {};
			// TODO: check if this is actually used. getStyles is not loaded
			const styles = getStyles(formattedSelector, mediaStyles);

			if (styles) {
				this.addCustomCSS(device, selector, styles);
			}
		} else {
			if (model !== false) {
				this.addCustomCSS(device, selector, value);
			}
		}
	}

	addCustomCSS(device: string, selector: string, css: string) {
		if (typeof this.customCSS[device] === 'undefined') {
			return;
		}

		this.customCSS[device][selector] = this.customCSS[device][selector] || [];
		this.customCSS[device][selector].push(css);
	}

	getCustomCSS() {
		const { responsiveDevicesAsIdWidth } = useResponsiveDevices();
		let returnedCSS = '';

		Object.keys(this.customCSS).forEach(device => {
			const deviceSelectors = this.customCSS[device];
			const extractedCSS = this.extractStyles(deviceSelectors);

			if (extractedCSS.length === 0) {
				return;
			}

			if (device === 'default') {
				returnedCSS += extractedCSS;
			} else {
				if (!responsiveDevicesAsIdWidth.value[device]) {
					return;
				}

				const deviceWidth = responsiveDevicesAsIdWidth.value[device];
				returnedCSS += `@media(max-width: ${deviceWidth}px) { ${extractedCSS} } `;
			}
		});

		return returnedCSS;
	}

	extractStyles(stylesData) {
		let returnedStyles = '';
		if (typeof stylesData === 'object' && stylesData !== null) {
			Object.keys(stylesData).forEach(selector => {
				const styleCSSArray = stylesData[selector];
				returnedStyles += `${selector} { ${styleCSSArray.join(';')} } `;
			});
		}

		return returnedStyles;
	}

	checkDependency(optionSchema, model) {
		let passedDependency = true;

		if (optionSchema.dependency) {
			optionSchema.dependency.forEach(dependencyConfig => {
				if (!passedDependency) {
					return;
				}

				passedDependency = this.checkSingleDependency(dependencyConfig, model);
			});
		}

		return passedDependency;
	}

	checkSingleDependency(dependencyConfig, model) {
		const { type = 'includes', option, option_path: optionPath, value: searchValue } = dependencyConfig;
		let optionValue = null;

		if (option) {
			optionValue = typeof model[option] !== 'undefined' ? model[option] : null;
		} else if (optionPath) {
			optionValue = get(this.model, optionPath);
		}

		if (type === 'includes' && searchValue.includes(optionValue)) {
			return true;
		} else if (type === 'not_in' && !searchValue.includes(optionValue)) {
			return true;
		}

		return false;
	}

	getValue(optionPath, defaultValue) {
		return get(this.model, optionPath, defaultValue);
	}
}
