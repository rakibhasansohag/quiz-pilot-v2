export const getReactSelectStyles = (isDark) => ({
	control: (provided) => ({
		...provided,
		backgroundColor: isDark ? '#1f2937' : '#fff', // slate-800 vs white
		borderColor: isDark ? '#374151' : '#d1d5db', // slate-700 vs gray-300
		color: isDark ? '#f9fafb' : '#111827',
		minHeight: '36px',
		boxShadow: 'none',
		':hover': {
			borderColor: isDark ? '#4b5563' : '#9ca3af',
		},
	}),
	menu: (provided) => ({
		...provided,
		backgroundColor: isDark ? '#1f2937' : '#fff',
		color: isDark ? '#f9fafb' : '#111827',
		zIndex: 50,
	}),
	option: (provided, state) => ({
		...provided,
		backgroundColor: state.isFocused
			? isDark
				? '#374151'
				: '#f3f4f6'
			: 'transparent',
		color: isDark ? '#f9fafb' : '#111827',
		cursor: 'pointer',
	}),
	singleValue: (provided) => ({
		...provided,
		color: isDark ? '#f9fafb' : '#111827',
	}),
	placeholder: (provided) => ({
		...provided,
		color: isDark ? '#9ca3af' : '#6b7280',
	}),
});
