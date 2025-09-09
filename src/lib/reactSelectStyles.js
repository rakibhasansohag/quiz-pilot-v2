export const getReactSelectStyles = (isDark = false) => {
	const bg = isDark ? '#0b1220' : '#ffffff';
	const controlBg = isDark ? '#1f2937' : '#ffffff'; // slate-800 vs white
	const border = isDark ? '#374151' : '#d1d5db'; // slate-700 vs gray-300
	const text = isDark ? '#f9fafb' : '#111827';
	const placeholder = isDark ? '#9ca3af' : '#6b7280';
	const optionHoverBg = isDark ? '#374151' : '#f3f4f6';
	const MENU_PORTAL_Z = 2147483647; // very high z-index to beat overlays

	return {
		control: (provided, state) => ({
			...provided,
			backgroundColor: controlBg,
			borderColor: state.isFocused ? (isDark ? '#4b5563' : '#9ca3af') : border,
			color: text,
			minHeight: '36px',
			boxShadow: 'none',
			transition: 'border-color 120ms ease, box-shadow 120ms ease',

			padding: '0 8px',
		}),

		// value / placeholder
		singleValue: (provided) => ({ ...provided, color: text }),
		placeholder: (provided) => ({ ...provided, color: placeholder }),

		// menu (the container)
		menu: (provided) => ({
			...provided,
			backgroundColor: bg,
			color: text,
			zIndex: MENU_PORTAL_Z,
			boxShadow: '0 8px 24px rgba(2,6,23,0.35)',
		}),

		// portal target (when using menuPortalTarget)
		menuPortal: (provided) => ({
			...provided,
			zIndex: MENU_PORTAL_Z,
			pointerEvents: 'auto',
		}),

		// scrollable list in menu
		menuList: (provided) => ({
			...provided,
			maxHeight: '320px',
			WebkitOverflowScrolling: 'touch',
			padding: 0,
		}),

		// each option
		option: (provided, state) => ({
			...provided,
			backgroundColor: state.isFocused ? optionHoverBg : 'transparent',
			color: text,
			cursor: 'pointer',
			padding: '8px 12px',
			// highlight selected
			fontWeight: state.isSelected ? 600 : 400,
		}),

		// clear / dropdown indicator container
		indicatorsContainer: (provided) => ({
			...provided,
			color: placeholder,
		}),
		dropdownIndicator: (provided, state) => ({
			...provided,
			transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'none',
			transition: 'transform 120ms ease',
			padding: '4px',
		}),
		clearIndicator: (provided) => ({ ...provided, padding: '4px' }),

		// input text
		input: (provided) => ({ ...provided, color: text }),
		// group heading, etc. if you use groups
		groupHeading: (provided) => ({
			...provided,
			color: text,
			fontSize: 12,
			padding: '6px 12px',
		}),
	};
};
